/**
 * Utilities for handling Replicate API responses
 */

import { getModelConfig } from './model-configs';

/**
 * Process Replicate output based on model type
 * Handles different output formats (single URL, array of URLs, objects with URLs)
 */
export function processReplicateOutput(
  output: any,
  owner?: string,
  name?: string
): any {
  if (!output) return null;

  // Get model config if available
  const modelConfig = owner && name ? getModelConfig(owner, name) : undefined;
  const outputType = modelConfig?.outputType;

  // Handle array of outputs (common for image models)
  if (Array.isArray(output)) {
    return output.map(item => processOutputItem(item, outputType));
  }

  // Handle single output
  return processOutputItem(output, outputType);
}

/**
 * Process individual output item
 */
function processOutputItem(item: any, outputType?: string): any {
  // If it's already a string URL, return as-is
  if (typeof item === 'string') {
    return item;
  }

  // If it's an object with a URL method (Replicate file proxy)
  if (item && typeof item.url === 'function') {
    return item.url();
  }

  // If it's an object with a url property
  if (item && typeof item.url === 'string') {
    return item.url;
  }

  // For complex objects, return as-is
  return item;
}

/**
 * Format prediction for client display
 */
export function formatPredictionForClient(prediction: any): any {
  const formatted = { ...prediction };

  // Process output if present
  if (formatted.output) {
    // Extract owner/name from version if available
    let owner: string | undefined;
    let name: string | undefined;

    if (formatted.version && typeof formatted.version === 'string') {
      const parts = formatted.version.split(':')[0].split('/');
      if (parts.length === 2) {
        [owner, name] = parts;
      }
    }

    formatted.output = processReplicateOutput(formatted.output, owner, name);
  }

  // Ensure proper status values
  if (formatted.status) {
    formatted.status = formatted.status.toLowerCase();
  }

  return formatted;
}

/**
 * Extract model info from version string
 */
export function parseModelVersion(version: string): {
  owner: string;
  name: string;
  versionId?: string;
} | null {
  try {
    const parts = version.split(':');
    const [owner, name] = parts[0].split('/');

    if (!owner || !name) return null;

    return {
      owner,
      name,
      versionId: parts[1]
    };
  } catch {
    return null;
  }
}

/**
 * Check if output is ready
 */
export function isOutputReady(prediction: any): boolean {
  return (
    prediction?.status === 'succeeded' &&
    prediction?.output !== null &&
    prediction?.output !== undefined
  );
}

/**
 * Check if prediction is in terminal state
 */
export function isPredictionComplete(status: string): boolean {
  return ['succeeded', 'failed', 'canceled'].includes(status.toLowerCase());
}

/**
 * Get human-readable status message
 */
export function getStatusMessage(status: string): string {
  const statusMap: Record<string, string> = {
    starting: 'Starting up...',
    processing: 'Processing...',
    succeeded: 'Completed',
    failed: 'Failed',
    canceled: 'Canceled'
  };

  return statusMap[status.toLowerCase()] || status;
}

/**
 * Get estimated time for prediction
 */
export function getEstimatedTime(model: string): string {
  const config = model.split('/').length === 2
    ? getModelConfig(model.split('/')[0], model.split('/')[1])
    : undefined;

  if (!config) return '~30s';

  // Estimate based on model category
  switch (config.category) {
    case 'image':
      return '5-30s';
    case 'video':
      return '1-5min';
    case '3d':
      return '2-10min';
    case 'audio':
      return '30s-2min';
    default:
      return '~30s';
  }
}