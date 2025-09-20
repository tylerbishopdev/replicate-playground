/**
 * Model Card Component
 * Displays a single model in the catalog
 */

import Image from 'next/image';
import Link from 'next/link';
import { ReplicateModel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Eye, Github, FileText, Play } from 'lucide-react';

interface ModelCardProps {
  model: ReplicateModel;
  className?: string;
}

export function ModelCard({ model, className }: ModelCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-lg border p-4 shadow-sm transition-all hover:shadow-md da',
        className
      )}
    >
      <Link
        href={`/models/${model.owner}/${model.name}`}
        className="block"
      >
        {/* Model Image */}
        {model.cover_image_url && (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
            <Image
              src={model.cover_image_url}
              alt={model.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Model Info */}
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white">
            {model.name}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            by {model.owner}
          </p>

          {model.description && (
            <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
              {model.description}
            </p>
          )}
        </div>
      </Link>

      {/* Metadata - Outside the main link */}
      <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 dark:text-gray-400">
        {model.run_count && (
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            {model.run_count.toLocaleString()} runs
          </span>
        )}

        {model.github_url && (
          <a
            href={model.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Github className="h-3 w-3" />
            Code
          </a>
        )}

        {model.paper_url && (
          <a
            href={model.paper_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FileText className="h-3 w-3" />
            Paper
          </a>
        )}
      </div>
    </div>
  );
}