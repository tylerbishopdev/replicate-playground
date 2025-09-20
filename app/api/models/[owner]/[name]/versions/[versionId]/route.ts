/**
 * API Route: /api/models/[owner]/[name]/versions/[versionId]
 * Fetches a specific model version with OpenAPI schema
 */

import { NextRequest, NextResponse } from 'next/server';
import { getModelVersion } from '@/lib/replicate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string; versionId: string }> }
) {
  try {
    const { owner, name, versionId } = await params;
    const version = await getModelVersion(owner, name, versionId);

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error in /api/models/[owner]/[name]/versions/[versionId]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model version' },
      { status: 500 }
    );
  }
}