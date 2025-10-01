/**
 * OpenAPI Schema Parser
 * Converts Replicate model schemas to form field definitions
 */

import { FormField, OpenAPISchema, SchemaProperty } from "./types";
import { getModelConfig, ModelConfig } from "./model-configs";

/**
 * Parse OpenAPI schema to generate form fields
 */
export function parseOpenAPISchema(schema: OpenAPISchema): FormField[] {
  const fields: FormField[] = [];

  if (!schema?.components?.schemas?.Input?.properties) {
    return fields;
  }

  const inputSchema = schema.components.schemas.Input;
  const properties = inputSchema.properties;
  const required = inputSchema.required || [];

  Object.entries(properties || {}).forEach(([name, property]) => {
    const field = parseSchemaProperty(name, property, required.includes(name));
    if (field) {
      fields.push(field);
    }
  });

  // Sort fields by x-order if present
  fields.sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  return fields;
}

/**
 * Enhanced form field generation that combines OpenAPI schema with model configurations
 */
export function parseOpenAPISchemaWithModelConfig(
  schema: OpenAPISchema,
  owner: string,
  name: string
): FormField[] {
  // Start with basic OpenAPI schema parsing
  const baseFields = parseOpenAPISchema(schema);

  // Get model configuration if available
  const modelConfig = getModelConfig(owner, name);

  if (!modelConfig) {
    // Even without model config, apply common field improvements
    return applyCommonFieldEnhancements(baseFields);
  }

  // Enhance fields with model configuration
  const enhancedFields = baseFields.map((field) => {
    const configField = modelConfig.inputSchema[field.name];

    if (!configField) {
      return applyCommonFieldEnhancement(field);
    }

    return {
      ...field,
      // Apply model config defaults
      defaultValue:
        configField.default !== undefined
          ? configField.default
          : field.defaultValue,
      // Override required status from model config (default to false if not specified)
      required: configField.required === true,
      // Use model config description if available
      description: configField.description || field.description,
      // Apply constraints from model config
      min: configField.minimum !== undefined ? configField.minimum : field.min,
      max: configField.maximum !== undefined ? configField.maximum : field.max,
      // Apply enum options from model config
      options: configField.enum || field.options,
      // Update field type if needed
      type: field.type === "select" && configField.enum ? "select" : field.type,
    };
  });

  // Add any missing fields from model config that aren't in OpenAPI schema
  Object.entries(modelConfig.inputSchema).forEach(([name, configField]) => {
    if (!enhancedFields.find((field) => field.name === name)) {
      enhancedFields.push({
        name,
        type: getFieldTypeFromConfig(configField),
        label: formatLabel(name),
        description: configField.description,
        required: configField.required || false,
        defaultValue: configField.default,
        min: configField.minimum,
        max: configField.maximum,
        options: configField.enum,
        order: 999, // Put new fields at the end
      });
    }
  });

  // Sort fields by order again
  enhancedFields.sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  return enhancedFields;
}

/**
 * Apply common field enhancements for fields without specific model config
 */
function applyCommonFieldEnhancements(fields: FormField[]): FormField[] {
  return fields.map((field) => applyCommonFieldEnhancement(field));
}

/**
 * Apply common field enhancement for a single field
 */
function applyCommonFieldEnhancement(field: FormField): FormField {
  // Common field improvements
  const commonOptionalFields = [
    "seed",
    "guidance_scale",
    "num_inference_steps",
    "output_quality",
    "output_format",
    "width",
    "height",
    "safety_tolerance",
    "prompt_upsampling",
  ];

  // Make commonly optional fields optional
  if (commonOptionalFields.includes(field.name)) {
    field = { ...field, required: false };
  }

  // Apply common defaults
  const commonDefaults: Record<string, any> = {
    num_outputs: 1,
    aspect_ratio: "1:1",
    output_format: "webp",
    output_quality: 80,
    guidance_scale: 3.5,
    num_inference_steps: 28,
  };

  if (field.name in commonDefaults && field.defaultValue === undefined) {
    field = { ...field, defaultValue: commonDefaults[field.name] };
  }

  return field;
}

/**
 * Parse individual schema property to form field
 */
function parseSchemaProperty(
  name: string,
  property: SchemaProperty,
  required: boolean
): FormField | null {
  // Handle allOf references
  if (property.allOf) {
    const merged = mergeAllOf(property.allOf);
    return parseSchemaProperty(name, merged, required);
  }

  const field: FormField = {
    name,
    type: getFieldType(property),
    label: property.title || formatLabel(name),
    description: property.description,
    required,
    defaultValue: property.default,
    order: property["x-order"],
  };

  // Handle enum values for select fields
  if (property.enum) {
    field.type = "select";
    field.options = property.enum;
  }

  // Handle numeric constraints
  if (property.type === "number" || property.type === "integer") {
    field.min = property.minimum;
    field.max = property.maximum;
  }

  // Handle file inputs - be very specific about when to treat as file
  if (property.format === "uri" && isFileType(property)) {
    field.type = "file";
    field.accept = getAcceptType(property);
  } else if (property.format === "uri") {
    // If it's URI format but not explicitly a file input, treat as text
    field.type = "text";
  }

  // Handle array inputs
  if (property.type === "array") {
    field.type = "array";
    field.multiple = true;
  }

  return field;
}

/**
 * Determine form field type from schema property
 */
function getFieldType(property: SchemaProperty): FormField["type"] {
  if (property.enum) return "select";
  if (property.format === "uri" && isFileType(property)) return "file";
  if (property.type === "array") return "array";
  if (property.type === "object") return "json";
  if (property.type === "boolean") return "boolean";
  if (property.type === "number" || property.type === "integer")
    return "number";
  return "text";
}

/**
 * Determine form field type from model config field
 */
function getFieldTypeFromConfig(configField: any): FormField["type"] {
  if (configField.enum) return "select";
  if (configField.type === "boolean") return "boolean";
  if (configField.type === "number" || configField.type === "integer")
    return "number";
  if (configField.type === "array") return "array";
  if (configField.type === "object") return "json";
  return "text";
}

/**
 * Check if property represents a file input
 */
function isFileType(property: SchemaProperty): boolean {
  const description = property.description?.toLowerCase() || "";
  const title = property.title?.toLowerCase() || "";
  const name = property.title?.toLowerCase() || "";

  // Only treat as file if it's explicitly about uploading/inputting files
  const uploadKeywords = [
    "upload",
    "file upload",
    "input image",
    "input audio",
    "input video",
    "path to image",
    "path to audio",
    "path to video",
    "path to file",
    "url to image",
    "url to audio",
    "url to video",
    "url to file",
    "image file",
    "audio file",
    "video file",
    "image url",
    "audio url",
    "video url",
  ];

  // Check for explicit upload/input patterns
  const hasUploadPattern = uploadKeywords.some(
    (keyword) => description.includes(keyword) || title.includes(keyword)
  );

  // Also check if the field name suggests it's a file input
  const fileInputNames = [
    "image",
    "audio",
    "video",
    "file",
    "upload",
    "input_image",
    "input_audio",
    "input_video",
  ];
  const hasFileInputName = fileInputNames.some(
    (name) => property.title?.toLowerCase() === name
  );

  return hasUploadPattern || hasFileInputName;
}

/**
 * Get accept attribute for file inputs
 */
function getAcceptType(property: SchemaProperty): string {
  const description = property.description?.toLowerCase() || "";
  const title = property.title?.toLowerCase() || "";
  const combined = description + " " + title;

  if (combined.includes("image")) return "image/*";
  if (combined.includes("audio")) return "audio/*";
  if (combined.includes("video")) return "video/*";
  if (combined.includes("pdf")) return ".pdf";
  if (combined.includes("text")) return "text/*";

  return "*/*";
}

/**
 * Format property name to human-readable label
 */
function formatLabel(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Merge allOf schemas
 */
function mergeAllOf(allOf: any[]): SchemaProperty {
  const merged: SchemaProperty = {};

  allOf.forEach((schema) => {
    Object.assign(merged, schema);
  });

  return merged;
}

/**
 * Validate form input against schema
 */
export function validateInput(
  value: any,
  field: FormField
): { valid: boolean; error?: string } {
  // Required field validation
  if (
    field.required &&
    (value === undefined || value === null || value === "")
  ) {
    return { valid: false, error: `${field.label} is required` };
  }

  // Type-specific validation
  switch (field.type) {
    case "number":
      if (value !== undefined && value !== "") {
        const num = Number(value);
        if (isNaN(num)) {
          return { valid: false, error: `${field.label} must be a number` };
        }
        if (field.min !== undefined && num < field.min) {
          return {
            valid: false,
            error: `${field.label} must be at least ${field.min}`,
          };
        }
        if (field.max !== undefined && num > field.max) {
          return {
            valid: false,
            error: `${field.label} must be at most ${field.max}`,
          };
        }
      }
      break;

    case "file":
      if (field.required && !value) {
        return { valid: false, error: `${field.label} is required` };
      }
      break;

    case "select":
      if (value && field.options && !field.options.includes(value)) {
        return { valid: false, error: `Invalid option for ${field.label}` };
      }
      break;

    case "array":
      if (field.required && (!Array.isArray(value) || value.length === 0)) {
        return {
          valid: false,
          error: `${field.label} must have at least one item`,
        };
      }
      break;
  }

  return { valid: true };
}

/**
 * Convert form values to API input format
 */
export function prepareInput(
  values: Record<string, any>,
  fields: FormField[]
): Record<string, any> {
  const input: Record<string, any> = {};

  fields.forEach((field) => {
    const value = values[field.name];

    // Skip undefined/null/empty values for optional fields
    if (value === undefined || value === null || value === "") {
      if (field.defaultValue !== undefined) {
        input[field.name] = field.defaultValue;
      }
      // Skip optional fields with no value
      return;
    }

    // Convert based on field type
    switch (field.type) {
      case "number":
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          input[field.name] = numValue;
        }
        break;

      case "boolean":
        input[field.name] = Boolean(value);
        break;

      case "array":
        input[field.name] = Array.isArray(value) ? value : [value];
        break;

      case "json":
        try {
          input[field.name] =
            typeof value === "string" ? JSON.parse(value) : value;
        } catch {
          input[field.name] = value;
        }
        break;

      default:
        if (value !== "") {
          input[field.name] = value;
        }
    }
  });

  return input;
}
