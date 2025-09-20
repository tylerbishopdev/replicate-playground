/**
 * Generation Utilities
 * Helper functions for managing image generations
 */

import { db } from './db';

// Create and start a generation
export async function createGeneration(params: {
  modelOwner: string;
  modelName: string;
  modelVersion?: string;
  prompt: string;
  parameters?: any;
}) {
  try {
    // Create generation record in database
    const generation = await db.createGeneration(params);

    // Start Replicate prediction
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `${params.modelOwner}/${params.modelName}`,
        version: params.modelVersion,
        input: {
          prompt: params.prompt,
          ...params.parameters,
        },
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/generations/webhook`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start prediction');
    }

    const prediction = await response.json();

    // Update generation record with Replicate ID
    await db.updateGeneration(generation.id, {
      replicateId: prediction.id,
      status: 'STARTING',
    });

    return {
      ...generation,
      replicateId: prediction.id,
      status: 'STARTING',
    };
  } catch (error) {
    console.error('Failed to create generation:', error);
    throw error;
  }
}

// Get generation with real-time status
export async function getGenerationStatus(generationId: string) {
  try {
    const generation = await db.getGeneration(generationId);
    if (!generation) {
      throw new Error('Generation not found');
    }

    // If not completed, check Replicate status
    if (generation.replicateId && generation.status !== 'SUCCEEDED' && generation.status !== 'FAILED') {
      const response = await fetch(`/api/predictions/${generation.replicateId}`);
      if (response.ok) {
        const prediction = await response.json();

        // Update local status if different
        if (prediction.status !== generation.status.toLowerCase()) {
          const updateData: any = {
            status: prediction.status.toUpperCase(),
          };

          if (prediction.status === 'succeeded' || prediction.status === 'failed') {
            updateData.completedAt = new Date();
            if (generation.startedAt) {
              updateData.duration = updateData.completedAt.getTime() - generation.startedAt.getTime();
            }
          }

          if (prediction.output) {
            updateData.output = prediction.output;
            updateData.imageUrls = Array.isArray(prediction.output)
              ? prediction.output
              : [prediction.output];
          }

          if (prediction.error) {
            updateData.error = prediction.error;
          }

          await db.updateGeneration(generationId, updateData);
          return { ...generation, ...updateData };
        }
      }
    }

    return generation;
  } catch (error) {
    console.error('Failed to get generation status:', error);
    throw error;
  }
}

// Poll generation status until completion
export async function pollGenerationStatus(
  generationId: string,
  onUpdate?: (generation: any) => void,
  maxAttempts = 60,
  interval = 5000
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const generation = await getGenerationStatus(generationId);

      if (onUpdate) {
        onUpdate(generation);
      }

      // Check if completed
      if (generation.status === 'SUCCEEDED' || generation.status === 'FAILED') {
        return generation;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error('Generation polling timed out');
}

// Helper to format generation for display
export function formatGeneration(generation: any) {
  return {
    id: generation.id,
    model: `${generation.modelOwner}/${generation.modelName}`,
    prompt: generation.prompt,
    status: generation.status,
    imageUrls: generation.blobUrls || generation.imageUrls || [],
    createdAt: generation.createdAt,
    completedAt: generation.completedAt,
    duration: generation.duration,
    error: generation.error,
  };
}