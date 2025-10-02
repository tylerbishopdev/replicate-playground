/**
 * Model Detail Page
 * View model details and run predictions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import {
  ArrowLeft,
  Play,
  Github,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react';

import { DynamicForm } from '@/components/dynamic-form';
import { PredictionOutput } from '@/components/prediction-output';
import { ModelSidebar } from '@/components/model-sidebar';
import { HolographicLoader } from '@/components/ui/holographic-loader';
import { ReplicateModel, ModelVersion, Prediction, FormField } from '@/lib/types';
import { parseOpenAPISchemaWithModelConfig, prepareInput } from '@/lib/schema-parser';
import { cn } from '@/lib/utils';
import { useGenerations } from '@/hooks/use-generations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
// Removed unused imports

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ModelDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const name = params.name as string;

  const [activeTab, setActiveTab] = useState<'run' | 'docs' | 'history'>('run');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableStreaming, setEnableStreaming] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  // Generation hooks
  const { generations } = useGenerations(owner, name);

  // Fetch model data
  const { data: model, error: modelError, isLoading: modelLoading } = useSWR<ReplicateModel>(
    `/api/models/${owner}/${name}`,
    fetcher
  );

  // Fetch model version (latest)
  const { data: version, error: versionError, isLoading: versionLoading } = useSWR<ModelVersion>(
    model?.latest_version?.id
      ? `/api/models/${owner}/${name}/versions/${model.latest_version.id}`
      : null,
    fetcher
  );

  // Parse OpenAPI schema when version loads
  useEffect(() => {
    if (version?.openapi_schema) {
      const fields = parseOpenAPISchemaWithModelConfig(version.openapi_schema, owner, name);
      setFormFields(fields);
    }
  }, [version, owner, name]);

  // Handle form submission
  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!version || !model) return;

    setIsSubmitting(true);
    try {
      const input = prepareInput(formData, formFields);
      console.log('Form data prepared:', input);

      // Get the correct model ID - use owner/name format that Replicate expects
      const modelId = `${owner}/${name}`;

      console.log('Submitting to model:', modelId);

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: modelId,
          input,
          stream: enableStreaming,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.error || 'Failed to create prediction');
      }

      const newPrediction = await response.json();
      console.log('Prediction created:', newPrediction);
      setPrediction(newPrediction);

      // Poll for updates instead of using SSE for simplicity
      const pollPrediction = async () => {
        try {
          const statusResponse = await fetch(`/api/predictions/${newPrediction.id}`);
          if (statusResponse.ok) {
            const updatedPrediction = await statusResponse.json();
            setPrediction(updatedPrediction);

            // Continue polling if not finished
            if (!['succeeded', 'failed', 'canceled'].includes(updatedPrediction.status)) {
              setTimeout(pollPrediction, 1000);
            }
          }
        } catch (error) {
          console.error('Error polling prediction:', error);
        }
      };

      // Start polling
      setTimeout(pollPrediction, 1000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Prediction error:', error);
      alert(`Failed to run prediction: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (modelError || versionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-semibold  mb-2">
            Model not found
          </h1>
          <p className=" mb-4">
            The model you&apos;re looking for doesn&apos;t exist or is not public.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to models
          </Link>
        </div>
      </div>
    );
  }

  if (modelLoading || (model && !version && !versionError)) {
    return (
      <div className="h-screen w-full object-fill flex items-center justify-center">
        <HolographicLoader />
      </div>
    );
  }

  if (!model || !version) {
    return (
      <div className="h-screen w-full object-fill flex items-center justify-center">
        <HolographicLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <ModelSidebar />

      {/* Main Content - Adjusted for sidebar */}
      <div className="flex-1 ml-12 lg:ml-80 transition-all duration-300">
        {/* Header */}
        <header>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>

              <div className="flex-1">
                <div className="flex items-center gap-4">
                  {model.cover_image_url && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={model.cover_image_url}
                        alt={model.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {model.name}
                    </h1>
                    <p className="text-foreground">
                      by {model.owner}
                    </p>
                  </div>
                </div>

                {model.description && (
                  <p className="mt-4 text-foreground">
                    {model.description}
                  </p>
                )}

                {/* Links */}
                <div className="mt-4 flex items-center gap-6 text-sm">
                  {model.github_url && (
                    <a
                      href={model.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      Code
                    </a>
                  )}

                  {model.paper_url && (
                    <a
                      href={model.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-foreground hover:text-foreground transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Paper
                    </a>
                  )}

                  {model.run_count && (
                    <span className="flex items-center gap-1 text-foreground">
                      <Play className="h-2 w-2" />
                      {model.run_count.toLocaleString()} runs
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-border">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('run')}
                  className={cn(
                    'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
                    activeTab === 'run'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground hover:text-foreground hover:border-muted'
                  )}
                >
                  Run Model
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className={cn(
                    'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
                    activeTab === 'docs'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground hover:text-foreground hover:border-muted'
                  )}
                >
                  Documentation
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    'whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors',
                    activeTab === 'history'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground hover:text-foreground hover:border-muted'
                  )}
                >
                  History ({generations.length})
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div>
              {activeTab === 'run' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between font-tiposka">
                      <CardTitle className="font-tiposka text-md">Input Parameters</CardTitle>
                      {/* Streaming Toggle */}
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-foreground" />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="streaming"
                            checked={enableStreaming}
                            onCheckedChange={(checked) => setEnableStreaming(checked === true)}
                          />
                          <Label htmlFor="streaming" className="text-sm">
                            Enable streaming
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formFields.length > 0 ? (
                      <DynamicForm
                        fields={formFields}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <div className="text-center py-8 text-foreground">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        No input schema available for this model
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'docs' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Model Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <dt className="font-medium text-foreground">Version ID</dt>
                        <dd className="font-mono text-foreground break-all">
                          {version.id}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-foreground">Created</dt>
                        <dd className="text-foreground">
                          {new Date(version.created_at).toLocaleDateString()}
                        </dd>
                      </div>

                      {version.cog_version && (
                        <div>
                          <dt className="font-medium text-foreground">Cog Version</dt>
                          <dd className="text-foreground">
                            {version.cog_version}
                          </dd>
                        </div>
                      )}

                      {version.openapi_schema && (
                        <div>
                          <dt className="font-medium text-foreground">OpenAPI Schema</dt>
                          <dd className="mt-2">
                            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64 text-foreground">
                              {JSON.stringify(version.openapi_schema, null, 2)}
                            </pre>
                          </dd>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'history' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generations.length === 0 ? (
                      <div className="text-center py-8 text-foreground">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>No generations yet</p>
                        <p className="text-sm">Run your first prediction to see it here</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {generations.map((generation: {
                          id: string;
                          prompt: string;
                          createdAt: string;
                          status: string;
                          imageUrls?: string[];
                          error?: string;
                          duration?: number;
                        }) => (
                          <div
                            key={generation.id}
                            className="border border-border rounded-lg p-4 bg-card"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground line-clamp-2">
                                  {generation.prompt}
                                </p>
                                <p className="text-xs text-foreground mt-1">
                                  {new Date(generation.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  generation.status === 'SUCCEEDED'
                                    ? 'default'
                                    : generation.status === 'FAILED'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {generation.status}
                              </Badge>
                            </div>

                            {generation.imageUrls && generation.imageUrls.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                {generation.imageUrls.slice(0, 4).map((url: string, index: number) => (
                                  <div key={index} className="relative aspect-square">
                                    <Image
                                      src={url}
                                      alt={`Generation ${index + 1}`}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  </div>
                                ))}
                                {generation.imageUrls.length > 4 && (
                                  <div className="aspect-square bg-muted rounded flex items-center justify-center">
                                    <span className="text-sm text-foreground">
                                      +{generation.imageUrls.length - 4} more
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {generation.error && (
                              <div className="mt-3 p-2 bg-destructive/5 border border-destructive/20 rounded text-sm text-destructive">
                                {generation.error}
                              </div>
                            )}

                            {generation.duration && (
                              <div className="mt-2 text-xs text-foreground">
                                Duration: {(generation.duration / 1000).toFixed(1)}s
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Output */}
            <div>
              {prediction ? (
                <PredictionOutput
                  prediction={prediction}
                  showLogs={true}
                  className="rounded-lg border"
                />
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Play className="mx-auto h-12 w-12 text-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Ready to run
                    </h3>
                    <p className="text-foreground">
                      Fill in the parameters and click &quot;Run Prediction&quot; to see the output here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}