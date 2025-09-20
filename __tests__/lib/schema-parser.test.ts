/**
 * Tests for OpenAPI schema parser
 */

import { parseOpenAPISchema, validateInput, prepareInput } from '@/lib/schema-parser';
import { OpenAPISchema, FormField } from '@/lib/types';

describe('Schema Parser', () => {
  const mockSchema: OpenAPISchema = {
    openapi: '3.0.0',
    info: {
      title: 'Test Model',
      version: '1.0.0',
    },
    components: {
      schemas: {
        Input: {
          type: 'object',
          title: 'Input',
          required: ['prompt'],
          properties: {
            prompt: {
              type: 'string',
              title: 'Prompt',
              description: 'Text prompt for the model',
              'x-order': 0,
            },
            image: {
              type: 'string',
              format: 'uri',
              title: 'Input Image',
              description: 'Upload an image',
              'x-order': 1,
            },
            temperature: {
              type: 'number',
              title: 'Temperature',
              description: 'Sampling temperature',
              default: 0.7,
              minimum: 0,
              maximum: 2,
              'x-order': 2,
            },
            style: {
              type: 'string',
              title: 'Style',
              enum: ['realistic', 'cartoon', 'abstract'],
              default: 'realistic',
              'x-order': 3,
            },
          },
        },
      },
    },
  };

  describe('parseOpenAPISchema', () => {
    it('should parse schema correctly', () => {
      const fields = parseOpenAPISchema(mockSchema);

      expect(fields).toHaveLength(4);
      expect(fields[0]).toMatchObject({
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
        order: 0,
      });
    });

    it('should handle file inputs', () => {
      const fields = parseOpenAPISchema(mockSchema);
      const imageField = fields.find(f => f.name === 'image');

      expect(imageField).toMatchObject({
        name: 'image',
        type: 'file',
        accept: 'image/*',
        required: false,
      });
    });

    it('should handle enum select fields', () => {
      const fields = parseOpenAPISchema(mockSchema);
      const styleField = fields.find(f => f.name === 'style');

      expect(styleField).toMatchObject({
        name: 'style',
        type: 'select',
        options: ['realistic', 'cartoon', 'abstract'],
        defaultValue: 'realistic',
      });
    });

    it('should sort fields by order', () => {
      const fields = parseOpenAPISchema(mockSchema);
      const orders = fields.map(f => f.order);

      expect(orders).toEqual([0, 1, 2, 3]);
    });
  });

  describe('validateInput', () => {
    const fields: FormField[] = [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        min: 0,
        max: 2,
      },
    ];

    it('should validate required fields', () => {
      const result = validateInput('', fields[0]);
      expect(result).toEqual({
        valid: false,
        error: 'Prompt is required',
      });
    });

    it('should validate number ranges', () => {
      const result = validateInput(3, fields[1]);
      expect(result).toEqual({
        valid: false,
        error: 'Temperature must be at most 2',
      });
    });

    it('should pass valid input', () => {
      const result = validateInput('test prompt', fields[0]);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('prepareInput', () => {
    const fields: FormField[] = [
      {
        name: 'prompt',
        type: 'text',
        label: 'Prompt',
        required: true,
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        required: false,
        defaultValue: 0.7,
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: 'Enabled',
        required: false,
      },
    ];

    it('should prepare input correctly', () => {
      const values = {
        prompt: 'test prompt',
        temperature: '1.5',
        enabled: true,
      };

      const result = prepareInput(values, fields);

      expect(result).toEqual({
        prompt: 'test prompt',
        temperature: 1.5,
        enabled: true,
      });
    });

    it('should use default values', () => {
      const values = { prompt: 'test' };
      const result = prepareInput(values, fields);

      expect(result).toEqual({
        prompt: 'test',
        temperature: 0.7,
      });
    });
  });
});