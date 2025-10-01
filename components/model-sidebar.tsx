/**
 * Model Sidebar Component
 * Quick navigation between default models
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { DEFAULT_MODELS, GROUPED_MODELS, getModelDisplayName } from '@/lib/default-models';
import { cn } from '@/lib/utils';

interface ModelSidebarProps {
    className?: string;
}

export function ModelSidebar({ className }: ModelSidebarProps) {
    const params = useParams();
    const currentOwner = params.owner as string;
    const currentName = params.name as string;

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter models based on search
    const filteredModels = DEFAULT_MODELS.filter(
        (model) =>
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Group filtered models by owner
    const filteredGroupedModels = filteredModels.reduce((acc, model) => {
        if (!acc[model.owner]) {
            acc[model.owner] = [];
        }
        acc[model.owner].push(model);
        return acc;
    }, {} as Record<string, typeof DEFAULT_MODELS>);

    const isCurrentModel = (owner: string, name: string) => {
        return owner === currentOwner && name === currentName;
    };

    return (
        <div
            className={cn(
                'absolute left-0 top-0 h-full bg-background/50 border-r border-black/40 transition-all duration-300 z-40',
                isCollapsed ? 'w-12' : 'w-80',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 ">
                {!isCollapsed && (
                    <>
                        <h2 className="text-7xl font-black tracking-tight text-accent/50">Models</h2>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1  hover:bg-accent"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="h-4 w-4 text-black/50 bg-accent/20 rounded-full" />
                        </button>
                    </>
                )}

                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-1  hover:bg-accent mx-auto"
                        title="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4  " />
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <>
                    {/* Search */}
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary bg-accent/30 rounded-full p-1" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search models..."
                                className="w-full  bg-primary/5 border-accent/30 border pl-10 pr-8 py-2 text-xs focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-accent"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-q"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Model List */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-2">
                            {Object.entries(filteredGroupedModels).map(([owner, models]) => (
                                <div key={owner} className="mb-4">
                                    {/* Owner Group Header */}
                                    <div className="flex items-center gap-2 px-2 py-1 mb-2">
                                        <h3 className="text-xs font-medium text-accent uppercase tracking-wider">
                                            {owner}
                                        </h3>
                                        <div className="flex-1 h-px bg-primary/30" />
                                    </div>

                                    {/* Models in Group */}
                                    <div className="space-y-1">
                                        {models.map((model) => {
                                            const isActive = isCurrentModel(model.owner, model.name);
                                            const displayName = getModelDisplayName(model);

                                            return (
                                                <Link
                                                    key={`${model.owner}/${model.name}`}
                                                    href={`/models/${model.owner}/${model.name}`}
                                                    className={cn(
                                                        'group flex items-center gap-3  p-2 text-sm transition-colors',
                                                        isActive
                                                            ? 'bg-primary/30 text-primary'
                                                            : 'hover:bg-accent/30 hover:text-foreground'
                                                    )}
                                                >
                                                    {/* Model Icon/Indicator */}
                                                    <div
                                                        className={cn(
                                                            'h-1 w-1 rounded-full flex-shrink-0',
                                                            isActive ? 'bg-primary' : 'bg-muted-foreground/80'
                                                        )}
                                                    />

                                                    {/* Model Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className={cn(
                                                                'font-bold truncate',
                                                                isActive ? 'text-primary' : 'text-foreground'
                                                            )}
                                                            title={model.name}
                                                        >
                                                            {displayName}
                                                        </div>
                                                        {model.description && (
                                                            <div
                                                                className={cn(
                                                                    'text-xs truncate',
                                                                    isActive
                                                                        ? 'text-primary/90'
                                                                        : 'text-foreground/80 '
                                                                )}
                                                                title={model.description}
                                                            >
                                                                {model.description}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Active Indicator */}
                                                    {isActive && (
                                                        <div className="h-1 w-1 rounded-full bg-primary-foreground flex-shrink-0" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {filteredModels.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="mx-auto h-8 w-8 mb-2" />
                                    <p className="text-sm">No models found</p>
                                    <p className="text-xs">Try adjusting your search</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border p-4">
                        <div className="text-xs text-muted-foreground text-center">
                            {filteredModels.length} models available
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
