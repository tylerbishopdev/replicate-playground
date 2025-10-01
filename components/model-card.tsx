/**
 * Model Card Component
 * Displays a single model in the catalog
 */

import Image from 'next/image';
import Link from 'next/link';
import { ReplicateModel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Github, FileText, Play, Terminal } from 'lucide-react';

interface ModelCardProps {
  model: ReplicateModel;
  className?: string;
}

export function ModelCard({ model, className }: ModelCardProps) {
  return (
    <div className={cn('group relative', className)}>
      {/* Glowing background gradient */}
      <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-primary via-accent to-primary opacity-20 blur-xl transition-all duration-500group-hover:opacity-50 group-hover:blur-2xl" />

      {/* Main card container */}
      <div className="relative overflow-hidden rounded-md border border-primary/50 bg-background/10 shadow-lg">
        <Link href={`/models/${model.owner}/${model.name}`} className="block">
          {/* Model Image */}
          {model.cover_image_url && (
            <div className="relative aspect-video overflow-hidden bg-background/10">
              <Image
                src={model.cover_image_url}
                alt={model.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-background via-primary/40 to-transparent opacity-60" />
            </div>
          )}

          {/* Content section with inner glow */}
          <div className="relative p-4">
            {/* Inner glow container */}
            <div className="rounded-lg p-4 ">
              {/* Icon with glow effect */}
              <div className="mb-3 flex items-start justify-between">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg  transition-all duration-300 group-hover:bg-primary/30 group-hover:blur-sm" />
                  <div className="relative  p-2">
                    <Terminal className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-200 shadow-lg shadow-accent/50" />
                  <span className="text-xs font-semibold text-foreground/70">READY</span>
                </div>
              </div>

              {/* Model name and owner */}
              <div className="mb-3 space-y-1">
                <h3 className="line-clamp-1 text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                  {model.name}
                </h3>
                <p className="text-sm font-medium text-foreground/60">
                  by {model.owner}
                </p>
              </div>

              {/* Description */}
              {model.description && (
                <p className="line-clamp-2 text-sm text-foreground/70 transition-colors duration-300 group-hover:text-foreground/90">
                  {model.description}
                </p>
              )}
            </div>

            {/* Metadata footer */}
            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-foreground/50">
              <div className="flex items-center gap-3">
                {model.run_count && (
                  <span className="flex items-center gap-1 transition-colors duration-300 hover:text-accent">
                    <Play className="h-3 w-3" />
                    {model.run_count.toLocaleString()}
                  </span>
                )}

                {model.github_url && (
                  <a
                    href={model.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 transition-colors duration-300 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="h-3 w-3" />
                  </a>
                )}

                {model.paper_url && (
                  <a
                    href={model.paper_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 transition-colors duration-300 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Top and bottom gradient lines on hover */}
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </div>
  );
}