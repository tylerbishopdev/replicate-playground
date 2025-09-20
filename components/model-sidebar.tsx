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
                'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40',
                isCollapsed ? 'w-12' : 'w-80',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                {!isCollapsed && (
                    <>
                        <h2 className="text-lg font-semibold text-foreground">Models</h2>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1 rounded-md hover:bg-accent"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </>
                )}

                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-1 rounded-md hover:bg-accent mx-auto"
                        title="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <>
                    {/* Search */}
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search models..."
                                className="w-full rounded-lg border border-input bg-background pl-10 pr-8 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {owner}
                                        </h3>
                                        <div className="flex-1 h-px bg-border" />
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
                                                        'group flex items-center gap-3 rounded-lg p-2 text-sm transition-colors',
                                                        isActive
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-accent hover:text-accent-foreground'
                                                    )}
                                                >
                                                    {/* Model Icon/Indicator */}
                                                    <div
                                                        className={cn(
                                                            'h-2 w-2 rounded-full flex-shrink-0',
                                                            isActive ? 'bg-primary-foreground' : 'bg-muted-foreground/50'
                                                        )}
                                                    />

                                                    {/* Model Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className={cn(
                                                                'font-medium truncate',
                                                                isActive ? 'text-primary-foreground' : 'text-foreground'
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
                                                                        ? 'text-primary-foreground/70'
                                                                        : 'text-muted-foreground'
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
