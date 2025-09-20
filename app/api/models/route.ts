/**
 * API Route: /api/models
 * Fetches and searches Replicate models
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchModels } from '@/lib/replicate';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;
    const cursor = searchParams.get('cursor') || undefined;

    const models = await searchModels(query, cursor);

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error in /api/models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}