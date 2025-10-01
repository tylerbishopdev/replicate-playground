/**
 * Shared store for prediction updates
 * Used for real-time server-sent events (SSE) delivery
 */

// Store for server-sent events
export const predictionUpdates = new Map<string, any[]>();

