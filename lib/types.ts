/**
 * Core type definitions for the Replicate Playground
 */

import { z } from 'zod';

// Replicate Model types
export interface ReplicateModel {
  url: string;
  owner: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  github_url?: string;
  paper_url?: string;
  license_url?: string;
  run_count?: number;
  cover_image_url?: string;
  default_example?: any;
  latest_version?: ModelVersion;
}

export interface ModelVersion {
  id: string;
  created_at: string;
  cog_version?: string;
  openapi_schema?: OpenAPISchema;
}

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths?: {
    [key: string]: any;
  };
  components?: {
    schemas?: {
      Input?: {
        type: string;
        title: string;
        required?: string[];
        properties?: {
          [key: string]: SchemaProperty;
        };
      };
      Output?: any;
    };
  };
}

export interface SchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  format?: string;
  items?: any;
  'x-order'?: number;
  allOf?: any[];
}

// Prediction types
export interface Prediction {
  id: string;
  model: string;
  version: string;
  input: Record<string, any>;
  output?: any;
  status: PredictionStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  urls?: {
    get: string;
    cancel: string;
    stream?: string;
  };
  webhook?: string;
  webhook_events_filter?: string[];
}

export type PredictionStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

// Webhook event types
export interface WebhookEvent {
  id: string;
  model: string;
  version: string;
  input: Record<string, any>;
  output?: any;
  status: PredictionStatus;
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  started_at?: string;
  completed_at?: string;
  created_at: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

// Form generation types
export interface FormField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'file' | 'array' | 'json';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: any[];
  min?: number;
  max?: number;
  accept?: string;
  multiple?: boolean;
  order?: number;
}

// Storage types
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  next?: string;
  previous?: string;
  count?: number;
}

// Validation schemas
export const PredictionCreateSchema = z.object({
  version: z.string().min(1),
  input: z.record(z.string(), z.any()),
  webhook: z.string().url().optional(),
  webhook_events_filter: z.array(z.string()).optional(),
  stream: z.boolean().optional(),
});

export const WebhookPayloadSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['starting', 'processing', 'succeeded', 'failed', 'canceled']),
  input: z.record(z.string(), z.any()),
  output: z.any().optional(),
  error: z.string().optional(),
  logs: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  created_at: z.string().min(1),
});

// Provider abstraction for future extensibility
export interface ModelProvider {
  name: string;
  getModels: (query?: string, cursor?: string) => Promise<PaginatedResponse<any>>;
  getModel: (id: string) => Promise<any>;
  createPrediction: (params: any) => Promise<Prediction>;
  getPrediction: (id: string) => Promise<Prediction>;
  cancelPrediction: (id: string) => Promise<void>;
  streamPrediction?: (url: string) => EventSource;
}