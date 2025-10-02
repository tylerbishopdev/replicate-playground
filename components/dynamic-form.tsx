/**
 * Dynamic Form Component
 * Generates form fields from OpenAPI schema
 */

'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, unknown>) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function DynamicForm({
  fields,
  onSubmit,
  isSubmitting,
  className,
}: DynamicFormProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  // Generate Zod schema from fields
  const schema = generateZodSchema(fields);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: getDefaultValues(fields),
  });

  // Handle file upload
  const handleFileUpload = async (field: FormField, file: File) => {
    setUploadingFiles((prev) => ({ ...prev, [field.name]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setFileUrls((prev) => ({ ...prev, [field.name]: data.url }));
      setValue(field.name, data.url);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      alert(`Failed to upload file: ${errorMessage}`);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [field.name]: false }));
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.name];
    const isUploading = uploadingFiles[field.name];

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...register(field.name)}
            type="text"
            placeholder={field.description}
            disabled={isSubmitting}
            className={error ? "border-primary" : ""}
          />
        );

      case 'number':
        return (
          <Input
            {...register(field.name, {
              setValueAs: (value) => {
                if (value === '' || value === null || value === undefined) {
                  return undefined;
                }
                const num = Number(value);
                return isNaN(num) ? undefined : num;
              }
            })}
            type="number"
            min={field.min}
            max={field.max}
            step="any"
            placeholder={field.description}
            disabled={isSubmitting}
            className={error ? "border-primary" : ""}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2 ">
            <Checkbox
              {...register(field.name)}
              disabled={isSubmitting}
            />
            <Label className="text-sm">
              {field.description || 'Enable'}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(field.name, value)} disabled={isSubmitting}>
            <SelectTrigger className={error ? "border-primary " : ""}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <div className="space-y-2 ">
            <input
              ref={(el) => {
                if (el) fileInputRefs.current[field.name] = el;
              }}
              type="file"
              accept={field.accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(field, file);
                }
              }}
              className="hidden"
              disabled={isSubmitting || isUploading}
            />

            {fileUrls[field.name] ? (
              <div className="flex items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2">
                <span className="text-sm truncate">
                  {fileUrls[field.name]}
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setFileUrls((prev) => {
                      const updated = { ...prev };
                      delete updated[field.name];
                      return updated;
                    });
                    setValue(field.name, '');
                  }}
                  className="h-auto p-1 hover:text-destructive  bg-background/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"

                onClick={() => fileInputRefs.current[field.name]?.click()}
                disabled={isSubmitting || isUploading}
                className={cn(
                  'w-full border-dashed',
                  error && 'border-destructive'
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose file or drag and drop
                  </>
                )}
              </Button>
            )}

            <Input
              {...register(field.name)}
              type="url"
              placeholder="Or paste a URL"
              disabled={isSubmitting || isUploading}
              className={error ? "border-primary" : ""}
            />
          </div>
        );

      case 'array':
      case 'json':
        return (
          <Textarea
            {...register(field.name)}
            rows={4}
            placeholder={
              field.type === 'array'
                ? 'Enter values separated by commas or as JSON array'
                : 'Enter JSON object'
            }
            disabled={isSubmitting}
            className={cn(
              'font-mono',
              error && 'border-destructive'
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4 bg-gradient-to-tr from-accent/10 via-primary/15 to-primary/15 p-3 rounded-md', className)}
    >
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {field.description && (
            <p className="text-[9px] font-tiposka text-muted/50">{field.description}</p>
          )}

          {renderField(field)}

          {errors[field.name] && (
            <div className="flex items-center text-xs text-destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              {String(errors[field.name]?.message)}
            </div>
          )}
        </div>
      ))}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Prediction...
          </>
        ) : (
          'Run Prediction'
        )}
      </Button>
    </form>
  );
}

// Helper functions
function generateZodSchema(fields: FormField[]): z.ZodSchema<Record<string, any>> {
  const shape: Record<string, z.ZodSchema> = {};

  fields.forEach((field) => {
    let schema: z.ZodSchema;

    switch (field.type) {
      case 'number':
        // Handle number fields properly - allow empty strings for optional fields
        if (field.required) {
          schema = z.number();
        } else {
          schema = z.union([
            z.number(),
            z.string().length(0).transform(() => undefined),
            z.literal("").transform(() => undefined),
            z.undefined()
          ]);
        }
        if (field.min !== undefined && field.required) {
          schema = (schema as z.ZodNumber).min(field.min);
        }
        if (field.max !== undefined && field.required) {
          schema = (schema as z.ZodNumber).max(field.max);
        }
        break;

      case 'boolean':
        schema = z.boolean();
        break;

      case 'select':
        schema = z.enum(field.options as [string, ...string[]]);
        break;

      case 'file':
        schema = z.string().url().or(z.string().length(0));
        break;

      case 'array':
        schema = z.string().transform((val) => {
          try {
            return JSON.parse(val);
          } catch {
            return val.split(',').map((s) => s.trim());
          }
        });
        break;

      case 'json':
        schema = z.string().transform((val) => {
          try {
            return JSON.parse(val);
          } catch {
            throw new Error('Invalid JSON');
          }
        });
        break;

      default:
        schema = z.string();
    }

    if (!field.required) {
      schema = schema.optional();
    }

    shape[field.name] = schema;
  });

  return z.object(shape);
}

function getDefaultValues(fields: FormField[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue;
    }
  });

  return defaults;
}