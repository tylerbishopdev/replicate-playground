/**
 * useGenerations Hook
 * React hook for managing image generations
 */

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { createGeneration, getGenerationStatus, formatGeneration } from '@/lib/generation-utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GenerationParams {
  modelOwner: string;
  modelName: string;
  modelVersion?: string;
  prompt: string;
  parameters?: any;
}

export function useGenerations(modelOwner?: string, modelName?: string) {
  // Fetch generations
  const { data, error, mutate } = useSWR(
    modelOwner && modelName
      ? `/api/generations?modelOwner=${modelOwner}&modelName=${modelName}`
      : '/api/generations',
    fetcher
  );

  const generations = data?.success ? data.data.map(formatGeneration) : [];
  const isLoading = !data && !error;

  return {
    generations,
    isLoading,
    error: error || (data && !data.success ? data.error : null),
    refresh: mutate,
  };
}

export function useGeneration(generationId: string) {
  const [generation, setGeneration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneration = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/generations/${generationId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setGeneration(formatGeneration(result.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch generation');
    } finally {
      setIsLoading(false);
    }
  }, [generationId]);

  useEffect(() => {
    fetchGeneration();
  }, [fetchGeneration]);

  // Auto-refresh if generation is still processing
  useEffect(() => {
    if (!generation || generation.status === 'SUCCEEDED' || generation.status === 'FAILED') {
      return;
    }

    const interval = setInterval(fetchGeneration, 5000);
    return () => clearInterval(interval);
  }, [generation, fetchGeneration]);

  return {
    generation,
    isLoading,
    error,
    refresh: fetchGeneration,
  };
}

export function useCreateGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (params: GenerationParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const generation = await createGeneration(params);
      return generation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create generation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    isLoading,
    error,
  };
}

export function useGenerationStats() {
  const { data, error } = useSWR('/api/generations/stats', fetcher);

  return {
    stats: data?.success ? data.data : null,
    isLoading: !data && !error,
    error: error || (data && !data.success ? data.error : null),
  };
}