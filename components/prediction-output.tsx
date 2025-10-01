/**
 * Prediction Output Component
 * Displays prediction results with support for various media types
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Prediction, PredictionStatus } from '@/lib/types';
import { cn, getMediaType, formatDuration } from '@/lib/utils';

import {
  Atom,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Copy,
  Eye,
  EyeOff,
  Terminal,
} from 'lucide-react';


// Type definition for prediction output that covers common use cases
type PredictionOutputItem = string | number | boolean | object | null;

interface PredictionOutputProps {
  prediction: Prediction;
  showLogs?: boolean;
  className?: string;
}

export function PredictionOutput({
  prediction,
  showLogs = false,
  className,
}: PredictionOutputProps) {
  const [showFullLogs, setShowFullLogs] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (url: string, filename?: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'output';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderStatus = () => {
    const statusConfig: Record<PredictionStatus, {
      icon: React.ReactNode;
      text: string;
      color: string;
    }> = {
      starting: {
        icon: <Atom className="h-12 w-12 animate-spin" />,
        text: 'Starting',
        color: 'text-primary',
      },
      processing: {
        icon: <Atom className="h-12 w-12 animate-spin" />,
        text: 'Processing',
        color: 'text-primary',
      },
      succeeded: {
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Succeeded',
        color: 'text-primary',
      },
      failed: {
        icon: <XCircle className="h-4 w-4" />,
        text: 'Failed',
        color: 'text-primary',
      },
      canceled: {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Canceled',
        color: 'text-primary',
      },
    };

    const config = statusConfig[prediction.status];

    return (
      <div className={cn('flex items-center gap-2', config.color)}>
        {config.icon}
        <span className="font-medium">{config.text}</span>
        {prediction.metrics?.predict_time && (
          <span className="text-sm text-gray-500">
            ({formatDuration(prediction.metrics.predict_time)})
          </span>
        )}
      </div>
    );
  };

  const renderOutput = () => {
    if (!prediction.output) {
      return null;
    }

    // Handle array outputs
    if (Array.isArray(prediction.output)) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prediction.output.map((item, index) => (
            <div key={index} className="relative">
              {renderSingleOutput(item, `output-${index}`)}
            </div>
          ))}
        </div>
      );
    }

    // Handle single output
    return renderSingleOutput(prediction.output, 'output');
  };

  const renderSingleOutput = (output: PredictionOutputItem, key?: string) => {
    // Handle string URLs
    if (typeof output === 'string' && output.startsWith('http')) {
      const mediaType = getMediaType(output);

      switch (mediaType) {
        case 'image':
          return (
            <div className="group relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={output}
                alt="Output"
                width={800}
                height={600}
                className="h-auto w-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/api/placeholder/800/600';
                }}
              />
              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => window.open(output, '_blank')}
                  className="rounded "
                  title="View full size"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(output, `${key}.png`)}
                  className="rounded "
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          );

        case 'video':
          return (
            <video
              controls
              className="w-full rounded-lg"
              src={output}
            >
              Your browser does not support the video tag.
            </video>
          );

        case 'audio':
          return (
            <audio
              controls
              className="w-full"
              src={output}
            >
              Your browser does not support the audio tag.
            </audio>
          );

        default:
          return (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
              <a
                href={output}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-primary hover:underline"
              >
                {output}
              </a>
              <button
                onClick={() => handleDownload(output)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          );
      }
    }

    // Handle text output
    if (typeof output === 'string') {
      return (
        <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
          <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          <button
            onClick={() => handleCopy(output)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      );
    }

    // Handle JSON output
    return (
      <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
        <pre className="whitespace-pre-wrap text-sm font-mono">
          {JSON.stringify(output, null, 2)}
        </pre>
        <button
          onClick={() => handleCopy(JSON.stringify(output, null, 2))}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          title="Copy to clipboard"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {renderStatus()}
      </div>

      {/* Error */}
      {prediction.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Error</p>
              <p className="mt-1 text-sm text-destructive/80">{prediction.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {prediction.output && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Output</h3>
          {renderOutput()}
        </div>
      )}

      {/* Logs */}
      {showLogs && prediction.logs && (
        <div className="space-y-2">
          <button
            onClick={() => setShowFullLogs(!showFullLogs)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Terminal className="h-4 w-4" />
            Logs
            {showFullLogs ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>

          {showFullLogs && (
            <div className="relative max-h-64 overflow-auto rounded-lg border border-gray-200 bg-black p-4">
              <pre className="text-xs text-green-400">{prediction.logs}</pre>
              <button
                onClick={() => handleCopy(prediction.logs || '')}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                title="Copy logs"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}