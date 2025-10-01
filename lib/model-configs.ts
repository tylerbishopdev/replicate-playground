/**
 * Model Configurations
 * Complete API configurations for all Replicate models with correct parameters
 */

export interface ModelConfig {
  id: string;
  owner: string;
  name: string;
  fullVersionId: string;
  description: string;
  coverImageUrl?: string;
  inputSchema: {
    [key: string]: {
      type: string;
      default?: any;
      description?: string;
      enum?: any[];
      minimum?: number;
      maximum?: number;
      required?: boolean;
    };
  };
  outputType: "image" | "video" | "audio" | "text" | "json" | "file";
  outputFormat?: string;
  category: "image" | "video" | "3d" | "audio" | "text";
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "tylerbishopdev/tyler": {
    id: "tylerbishopdev/tyler:01ce0a0fdc7a46ec74a3c093f6163c5a5f633297a06514229e8775c877507643",
    owner: "tylerbishopdev",
    name: "tyler",
    fullVersionId:
      "01ce0a0fdc7a46ec74a3c093f6163c5a5f633297a06514229e8775c877507643",
    description: "Tyler model for advanced generation with LoRA support",
    outputType: "image",
    outputFormat: "webp",
    category: "image",
    inputSchema: {
      prompt: {
        type: "string",
        required: true,
        description: "Input prompt for image generation",
      },
      model: {
        type: "string",
        default: "dev",
        enum: ["dev", "schnell"],
        description: "Model variant to use",
      },
      aspect_ratio: {
        type: "string",
        default: "1:1",
        enum: [
          "1:1",
          "16:9",
          "21:9",
          "3:2",
          "2:3",
          "4:5",
          "5:4",
          "9:16",
          "9:21",
        ],
        description: "Aspect ratio for generated image",
      },
      num_outputs: {
        type: "integer",
        default: 1,
        minimum: 1,
        maximum: 4,
        description: "Number of images to generate",
      },
      num_inference_steps: {
        type: "integer",
        default: 28,
        minimum: 1,
        maximum: 50,
        description: "Number of denoising steps",
      },
      guidance_scale: {
        type: "number",
        default: 3,
        minimum: 0,
        maximum: 10,
        description: "Guidance scale for generation",
      },
      prompt_strength: {
        type: "number",
        default: 0.8,
        minimum: 0,
        maximum: 1,
        description: "Prompt strength when using image input",
      },
      seed: {
        type: "integer",
        description: "Random seed for reproducible generation",
      },
      go_fast: {
        type: "boolean",
        default: false,
        description: "Enable fast generation mode",
      },
      megapixels: {
        type: "string",
        default: "1",
        enum: ["0.25", "0.5", "1", "2"],
        description: "Resolution in megapixels",
      },
      output_format: {
        type: "string",
        default: "webp",
        enum: ["webp", "jpg", "png"],
        description: "Output image format",
      },
      output_quality: {
        type: "integer",
        default: 80,
        minimum: 0,
        maximum: 100,
        description: "Output quality (0-100)",
      },
      lora_scale: {
        type: "number",
        default: 1,
        minimum: 0,
        maximum: 2,
        description: "LoRA weight scale",
      },
      extra_lora_scale: {
        type: "number",
        default: 1,
        minimum: 0,
        maximum: 2,
        description: "Extra LoRA weight scale",
      },
    },
  },

  "tylerbishopdev/dotmatrix": {
    id: "tylerbishopdev/dotmatrix",
    owner: "tylerbishopdev",
    name: "dotmatrix",
    fullVersionId: "",
    description: "Dot matrix style generation model",
    outputType: "image",
    category: "image",
    inputSchema: {
      prompt: {
        type: "string",
        required: true,
        description: "Input prompt for image generation",
      },
      model: {
        type: "string",
        default: "dev",
        enum: ["dev", "schnell"],
        description: "Model variant to use",
      },
      aspect_ratio: {
        type: "string",
        default: "1:1",
        enum: [
          "1:1",
          "16:9",
          "21:9",
          "3:2",
          "2:3",
          "4:5",
          "5:4",
          "9:16",
          "9:21",
        ],
        description: "Aspect ratio for generated image",
      },
      num_outputs: {
        type: "integer",
        default: 1,
        minimum: 1,
        maximum: 4,
        description: "Number of images to generate",
      },
      num_inference_steps: {
        type: "integer",
        default: 28,
        minimum: 1,
        maximum: 50,
        description: "Number of denoising steps",
      },
      guidance_scale: {
        type: "number",
        default: 3,
        minimum: 0,
        maximum: 10,
        description: "Guidance scale for generation",
      },
      prompt_strength: {
        type: "number",
        default: 0.8,
        minimum: 0,
        maximum: 1,
        description: "Prompt strength when using image input",
      },
      seed: {
        type: "integer",
        description: "Random seed for reproducible generation",
      },
      go_fast: {
        type: "boolean",
        default: false,
        description: "Enable fast generation mode",
      },
      megapixels: {
        type: "string",
        default: "1",
        enum: ["0.25", "0.5", "1", "2"],
        description: "Resolution in megapixels",
      },
      output_format: {
        type: "string",
        default: "webp",
        enum: ["webp", "jpg", "png"],
        description: "Output image format",
      },
      output_quality: {
        type: "integer",
        default: 80,
        minimum: 0,
        maximum: 100,
        description: "Output quality (0-100)",
      },
      lora_scale: {
        type: "number",
        default: 1,
        minimum: 0,
        maximum: 2,
        description: "LoRA weight scale",
      },
      extra_lora_scale: {
        type: "number",
        default: 1,
        minimum: 0,
        maximum: 2,
        description: "Extra LoRA weight scale",
      },
    },
  },

  "black-forest-labs/flux-1.1-pro": {
    id: "black-forest-labs/flux-1.1-pro",
    owner: "black-forest-labs",
    name: "flux-1.1-pro",
    fullVersionId: "black-forest-labs/flux-1.1-pro",
    description: "FLUX 1.1 Professional - State-of-the-art image generation",
    outputType: "image",
    outputFormat: "webp",
    category: "image",
    inputSchema: {
      prompt: {
        type: "string",
        required: true,
        description: "Text prompt for image generation",
      },
      aspect_ratio: {
        type: "string",
        default: "1:1",
        enum: [
          "1:1",
          "16:9",
          "21:9",
          "2:3",
          "3:2",
          "4:5",
          "5:4",
          "9:16",
          "9:21",
        ],
        description: "Aspect ratio of the generated image",
      },
      width: {
        type: "integer",
        description: "Width of generated image (overrides aspect_ratio)",
        required: false,
      },
      height: {
        type: "integer",
        description: "Height of generated image (overrides aspect_ratio)",
        required: false,
      },
      num_outputs: {
        type: "integer",
        default: 1,
        minimum: 1,
        maximum: 4,
        description: "Number of images to generate",
      },
      seed: {
        type: "integer",
        description: "Random seed for reproducible generation",
      },
      output_format: {
        type: "string",
        default: "webp",
        enum: ["webp", "jpg", "png"],
        description: "Format of the output images",
      },
      output_quality: {
        type: "integer",
        default: 80,
        minimum: 0,
        maximum: 100,
        description: "Quality of the output images (0-100)",
      },
      safety_tolerance: {
        type: "integer",
        default: 2,
        minimum: 1,
        maximum: 5,
        description: "Safety filter tolerance (1=strict, 5=permissive)",
      },
      prompt_upsampling: {
        type: "boolean",
        default: true,
        description: "Enable prompt upsampling for better results",
      },
    },
  },

  "black-forest-labs/flux-dev": {
    id: "black-forest-labs/flux-dev",
    owner: "black-forest-labs",
    name: "flux-dev",
    fullVersionId: "black-forest-labs/flux-dev",
    description: "FLUX Development - Open-weight model for experimentation",
    outputType: "image",
    outputFormat: "webp",
    category: "image",
    inputSchema: {
      prompt: {
        type: "string",
        required: true,
        description: "Input prompt for image generation",
      },
      aspect_ratio: {
        type: "string",
        default: "1:1",
        enum: [
          "1:1",
          "16:9",
          "21:9",
          "2:3",
          "3:2",
          "4:5",
          "5:4",
          "9:16",
          "9:21",
        ],
        description: "Aspect ratio of generated image",
      },
      num_outputs: {
        type: "integer",
        default: 1,
        minimum: 1,
        maximum: 4,
        description: "Number of outputs",
      },
      num_inference_steps: {
        type: "integer",
        default: 28,
        minimum: 1,
        maximum: 50,
        description: "Number of denoising steps",
      },
      guidance_scale: {
        type: "number",
        default: 3.5,
        minimum: 0,
        maximum: 10,
        description: "Guidance scale for generation",
      },
      seed: {
        type: "integer",
        description: "Random seed",
      },
      output_format: {
        type: "string",
        default: "webp",
        enum: ["webp", "jpg", "png"],
        description: "Output format",
      },
      output_quality: {
        type: "integer",
        default: 80,
        minimum: 0,
        maximum: 100,
        description: "Output quality",
      },
    },
  },

  "black-forest-labs/flux-schnell": {
    id: "black-forest-labs/flux-schnell",
    owner: "black-forest-labs",
    name: "flux-schnell",
    fullVersionId: "black-forest-labs/flux-schnell",
    description: "FLUX Schnell - Fast high-quality image generation",
    outputType: "image",
    outputFormat: "webp",
    category: "image",
    inputSchema: {
      prompt: {
        type: "string",
        required: true,
        description: "Input prompt",
      },
      aspect_ratio: {
        type: "string",
        default: "1:1",
        enum: [
          "1:1",
          "16:9",
          "21:9",
          "2:3",
          "3:2",
          "4:5",
          "5:4",
          "9:16",
          "9:21",
        ],
        description: "Aspect ratio",
      },
      num_outputs: {
        type: "integer",
        default: 1,
        minimum: 1,
        maximum: 4,
        description: "Number of outputs",
      },
      seed: {
        type: "integer",
        description: "Random seed",
      },
      output_format: {
        type: "string",
        default: "webp",
        enum: ["webp", "jpg", "png"],
        description: "Output format",
      },
      output_quality: {
        type: "integer",
        default: 80,
        minimum: 0,
        maximum: 100,
        description: "Output quality (0-100)",
      },
      disable_safety_checker: {
        type: "boolean",
        default: false,
        description: "Disable safety checker",
      },
    },
  },

  "meta/sam-2-video": {
    id: "meta/sam-2-video",
    owner: "meta",
    name: "sam-2-video",
    fullVersionId: "",
    description: "Segment Anything Model 2 for video segmentation",
    outputType: "video",
    category: "video",
    inputSchema: {
      video_url: {
        type: "string",
        required: true,
        description: "URL of the video to segment",
      },
      points: {
        type: "array",
        description: "Points for segmentation [[x, y], ...]",
      },
      labels: {
        type: "array",
        description: "Labels for points (1 for object, 0 for background)",
      },
      box: {
        type: "array",
        description: "Bounding box [x1, y1, x2, y2]",
      },
    },
  },

  "runwayml/gen4-turbo": {
    id: "runwayml/gen4-turbo",
    owner: "runwayml",
    name: "gen4-turbo",
    fullVersionId: "",
    description: "Fast video generation with Gen4 Turbo",
    outputType: "video",
    category: "video",
    inputSchema: {
      prompt: {
        type: "string",
        required: true,
        description: "Text prompt for video generation",
      },
      duration: {
        type: "integer",
        default: 5,
        minimum: 1,
        maximum: 10,
        description: "Video duration in seconds",
      },
      fps: {
        type: "integer",
        default: 24,
        enum: [24, 30],
        description: "Frames per second",
      },
    },
  },

  "tencent/hunyuan3d-2mv": {
    id: "tencent/hunyuan3d-2mv",
    owner: "tencent",
    name: "hunyuan3d-2mv",
    fullVersionId: "",
    description: "3D generation from 2 multi-view images",
    outputType: "file",
    category: "3d",
    inputSchema: {
      image_url: {
        type: "string",
        required: true,
        description: "URL of the input image",
      },
      guidance_scale: {
        type: "number",
        default: 7.5,
        minimum: 0,
        maximum: 20,
        description: "Guidance scale",
      },
      num_inference_steps: {
        type: "integer",
        default: 50,
        minimum: 1,
        maximum: 100,
        description: "Number of inference steps",
      },
    },
  },

  "zsxkib/create-rvc-dataset": {
    id: "zsxkib/create-rvc-dataset",
    owner: "zsxkib",
    name: "create-rvc-dataset",
    fullVersionId: "",
    description: "Create RVC datasets for voice conversion",
    outputType: "file",
    category: "audio",
    inputSchema: {
      audio_url: {
        type: "string",
        required: true,
        description: "URL of the audio file",
      },
      sample_rate: {
        type: "integer",
        default: 40000,
        enum: [32000, 40000, 48000],
        description: "Sample rate",
      },
    },
  },
};

/**
 * Get model configuration by owner and name
 */
export function getModelConfig(
  owner: string,
  name: string
): ModelConfig | undefined {
  const key = `${owner}/${name}`;
  return MODEL_CONFIGS[key];
}

/**
 * Format model ID for Replicate API calls
 */
export function formatModelId(
  owner: string,
  name: string,
  versionId?: string
): string {
  if (versionId) {
    return `${owner}/${name}:${versionId}`;
  }
  const config = getModelConfig(owner, name);
  return config?.id || `${owner}/${name}`;
}

/**
 * Format model ID for Replicate API calls with async version fetching
 */
export async function formatModelIdAsync(
  owner: string,
  name: string,
  versionId?: string
): Promise<string> {
  if (versionId) {
    return `${owner}/${name}:${versionId}`;
  }

  // Always fetch the latest version
  console.log(`Fetching model info for ${owner}/${name}`);
  const response = await fetch(
    `https://api.replicate.com/v1/models/${owner}/${name}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Model ${owner}/${name} not found: ${response.statusText}`);
  }

  const model = await response.json();
  console.log(`Fetched model info:`, {
    owner: model.owner,
    name: model.name,
    latest_version_id: model.latest_version?.id,
  });

  if (model.latest_version?.id) {
    return `${owner}/${name}:${model.latest_version.id}`;
  }

  throw new Error(`No latest version found for model ${owner}/${name}`);
}

/**
 * Validate and prepare input for API call
 */
export function validateModelInput(
  owner: string,
  name: string,
  input: Record<string, any>
): Record<string, any> {
  const config = getModelConfig(owner, name);
  if (!config) {
    return input;
  }

  const validated: Record<string, any> = {};

  // Process each field according to schema
  for (const [key, value] of Object.entries(input)) {
    const schema = config.inputSchema[key];
    if (!schema) continue;

    // Skip undefined/null values unless required
    if (value === undefined || value === null) {
      if (schema.required) {
        throw new Error(`Required field '${key}' is missing`);
      }
      continue;
    }

    // Type validation and conversion
    switch (schema.type) {
      case "integer":
        validated[key] = parseInt(value);
        if (schema.minimum !== undefined && validated[key] < schema.minimum) {
          validated[key] = schema.minimum;
        }
        if (schema.maximum !== undefined && validated[key] > schema.maximum) {
          validated[key] = schema.maximum;
        }
        break;

      case "number":
        validated[key] = parseFloat(value);
        if (schema.minimum !== undefined && validated[key] < schema.minimum) {
          validated[key] = schema.minimum;
        }
        if (schema.maximum !== undefined && validated[key] > schema.maximum) {
          validated[key] = schema.maximum;
        }
        break;

      case "boolean":
        validated[key] = Boolean(value);
        break;

      case "string":
        validated[key] = String(value);
        if (schema.enum && !schema.enum.includes(validated[key])) {
          validated[key] = schema.default || schema.enum[0];
        }
        break;

      case "array":
        validated[key] = Array.isArray(value) ? value : [value];
        break;

      default:
        validated[key] = value;
    }
  }

  // Add defaults for missing fields
  for (const [key, schema] of Object.entries(config.inputSchema)) {
    if (validated[key] === undefined && schema.default !== undefined) {
      validated[key] = schema.default;
    }
  }

  return validated;
}
