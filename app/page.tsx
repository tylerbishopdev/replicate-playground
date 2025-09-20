/**
 * Home Page - Model Catalog
 * Browse and search Replicate models
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { ModelCard } from '@/components/model-card';
import { ReplicateModel } from '@/lib/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DEFAULT_MODELS } from '@/lib/default-models';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredModels, setFilteredModels] = useState<ReplicateModel[]>(DEFAULT_MODELS);

  // Filter models based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredModels(DEFAULT_MODELS);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = DEFAULT_MODELS.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.owner.toLowerCase().includes(query) ||
          (model.description && model.description.toLowerCase().includes(query))
      );
      setFilteredModels(filtered);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen 0">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-medium mx-auto text-center">
              <Image src="/logo12.png" alt="A_TY(l@r)" width={200} height={200} className="mx-auto rounded-full py-4" />
              <h1 className="text-3xl font-mono ">
                tylers.wtf
              </h1>
              <p className="mt-1 0 font-mono text-xs">
                Explore and run custom AI models easily with dynamic interfaces
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex rounded-md border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-l-md px-3 py-2',
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-r-md px-3 py-2',
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search models..."
                className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary "
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm ">
          {filteredModels.length} models found
        </div>

        <div
          className={cn(
            'gap-6',
            viewMode === 'grid'
              ? 'grid sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          )}
        >
          {filteredModels.map((model) => (
            <ModelCard
              key={`${model.owner}/${model.name}`}
              model={model}
              className={viewMode === 'list' ? 'flex gap-4' : ''}
            />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <div className="">
              <Search className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No models found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
