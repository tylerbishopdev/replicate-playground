/**
 * Custom hook for handling Server-Sent Events
 * Used for real-time prediction updates
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface UseStreamOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: Event) => void;
}

export function useStream(url: string | null, options: UseStreamOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = (event) => {
      setIsConnected(true);
      setError(null);
      options.onOpen?.(event);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        options.onMessage?.(data);
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      setError('Connection error');
      options.onError?.(event);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url, options.onMessage, options.onError, options.onOpen]);

  const close = () => {
    eventSourceRef.current?.close();
    setIsConnected(false);
  };

  return {
    isConnected,
    error,
    close,
  };
}