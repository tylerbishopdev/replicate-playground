/**
 * API Route: /api/models/[owner]/[name]
 * Fetches a specific model and its latest version
 */

import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/replicate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  try {
    const { owner, name } = await params;
    const model = await getModel(owner, name);

    return NextResponse.json(model);
  } catch (error) {
    console.error('Error in /api/models/[owner]/[name]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}