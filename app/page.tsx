/**
 * Home Page - Model Catalog
 * Browse and search Replicate models
 */

'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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
    <div>
      {/* Header */}
      <header className="" >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-4 flex-row items-center justify-between">
            <div className="font-medium mx-auto text-center flex items-center">
              <Image src="/logowtf.png" alt="A_TY(l@r)" width={270} height={270} className="mx-auto rounded-full py-4" />
              <div className="flex flex-col text-left justify-center px-4">

              </div>
            </div>

            <div className="flex items-center gap-2 text-xs bg-background/50 text-accent/70 font-mono border p-2 rounded-full px-3">
              {/* View Mode Toggle */}
              grid
              <label
                className="cursor-pointer relative h-[1.2em] w-[2.6em] rounded-full bg-primary/30 "
              >
                <span
                  className="absolute inset-[0.1em] rounded-full  "
                ></span>
                <div
                  className="absolute left-[0.5em] top-1/2 flex h-[2em] w-[2em] -translate-y-1/2 items-center justify-center rounded-full;"
                >
                  <div
                    className="h-[1em] w-[1em] rounded-full b"
                  ></div>
                </div>
                <div
                  className="absolute right-[0.5em] top-1/2 h-[0.25em] w-[1.5em] -translate-y-1/2 rounded-full  "
                ></div>
                <input className="peer h-[.25em] w-[.25em] opacity-0" id="" name="" type="checkbox" onChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                />
                <span
                  className="absolute left-[0.15em] top-1/2 flex h-[1.45em] w-[1.45em] -translate-y-1/2 items-center justify-center rounded-full bg-primary/80 duration-300 peer-checked:left-[calc(120%-2em)]"
                >
                  <span className="relative h-full w-full rounded-full">
                    <span
                      className="absolute inset-[0.1em] rounded-full"
                    ></span>
                  </span>
                </span>
              </label>
              <span className="text-xs text-accent/80 font-mono">not</span>

            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="flex bg-gradient-to-tr from-background/20 via-primary/5 to-background/15 backdrop-blur-lg  border border-primary/50 text-foreground rounded-md shadow text-sm">
              <div aria-disabled="true" className="w-10 grid place-content-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search models..."
                className="bg-transparent py-1.5 outline-none placeholder:text-foreground  font-mono text-xs  transition-all"
              />
            </div>
          </div>
        </div>
      </header >

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" >
        <div className="mb-6 text-sm text-white/80">
          {filteredModels.length} models found
        </div>

        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-6'
          )}
        >
          {filteredModels.map((model) => (
            <ModelCard
              key={`${model.owner}/${model.name}`}
              model={model}
            />
          ))}
        </div>

        {
          filteredModels.length === 0 && (
            <div className="text-center py-12">
              <div className="backdrop-blur-sm bg-background/20 rounded-lg p-8 border border-white/20">
                <Search className="mx-auto h-12 w-12 mb-4 text-white/60" />
                <h3 className="text-lg font-medium mb-2 text-white">No models found</h3>
                <p className="text-white/80">Try adjusting your search criteria</p>
              </div>
            </div>
          )
        }
      </main >
    </div>
  );
}
