# Replicate API Integration Fixes

## Overview
This document outlines all the fixes and improvements made to properly integrate Replicate API with the application.

## Key Issues Fixed

### 1. Model Configuration System
- **Created**: `/lib/model-configs.ts`
- **Purpose**: Centralized configuration for all Replicate models with proper API parameters
- **Features**:
  - Complete input schema for each model
  - Type validation and conversion
  - Default value handling
  - Output type specifications

### 2. API Route Handlers

#### `/api/predictions/route.ts`
- Added model configuration validation
- Improved input parameter processing
- Better error handling with detailed logging

#### `/api/predictions/[id]/route.ts`
- Added output formatting for client display
- Proper handling of Replicate response formats

#### `/api/predictions/[id]/stream/route.ts`
- Added output formatting for SSE events
- Improved real-time update handling

### 3. Webhook System

#### `/api/webhooks/replicate/route.ts`
- Fixed webhook signature validation
- Proper handling of Replicate webhook format
- Improved event storage for SSE delivery

### 4. Replicate Library Enhancements

#### `/lib/replicate.ts`
- Added environment variable validation
- Improved error messages and logging
- Fixed webhook signature validation format

#### `/lib/replicate-utils.ts` (NEW)
- Output processing utilities
- Format conversion for different model types
- Status message helpers
- Prediction state management

### 5. Model Page Integration
- Updated to use correct model IDs from configuration
- Proper version ID handling
- Improved prediction creation flow

## Model Configurations

### Tyler Model
```javascript
{
  id: 'tylerbishopdev/tyler:01ce0a0fdc7a46ec74a3c093f6163c5a5f633297a06514229e8775c877507643',
  inputSchema: {
    prompt: { type: 'string', required: true },
    model: { type: 'string', default: 'dev', enum: ['dev', 'schnell'] },
    aspect_ratio: { type: 'string', default: '1:1' },
    num_outputs: { type: 'integer', default: 1, max: 4 },
    num_inference_steps: { type: 'integer', default: 28 },
    guidance_scale: { type: 'number', default: 3 },
    // ... additional parameters
  }
}
```

### FLUX Models
- flux-1.1-pro
- flux-dev
- flux-schnell
- flux-pro
- flux-fill-pro

Each with appropriate input schemas and validation.

## Testing

### Test Script
- **Location**: `/scripts/test-api.js`
- **Usage**: `node scripts/test-api.js`
- **Tests**:
  - Direct Replicate API access
  - Prediction creation
  - Status polling
  - Output retrieval

## Environment Variables Required

```bash
# .env.local
REPLICATE_API_TOKEN="your_token_here"
WEBHOOK_SECRET="your_webhook_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## API Call Flow

1. **Client Request** → Model page submits form
2. **Validation** → Input validated against model schema
3. **API Call** → Create prediction with Replicate
4. **Webhook/SSE** → Real-time updates via webhooks or polling
5. **Output Processing** → Format output for display
6. **Client Display** → Show results in UI

## Error Handling

- Environment variable validation
- Input parameter validation
- API response error handling
- Webhook signature verification
- Graceful fallbacks for missing configurations

## Next Steps

1. **Run the app**: `npm run dev`
2. **Test API**: `node scripts/test-api.js`
3. **Monitor logs**: Check console for detailed API interaction logs
4. **Verify webhooks**: Ensure webhook URL is accessible from Replicate

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check REPLICATE_API_TOKEN in .env.local
2. **Invalid input**: Verify parameters match model schema
3. **Webhook failures**: Ensure NEXT_PUBLIC_APP_URL is correct
4. **Missing output**: Check output processing in replicate-utils.ts

### Debug Mode

Enable detailed logging by checking console outputs in:
- `/lib/replicate.ts` - API calls
- `/app/api/predictions/route.ts` - Prediction creation
- `/app/api/webhooks/replicate/route.ts` - Webhook events