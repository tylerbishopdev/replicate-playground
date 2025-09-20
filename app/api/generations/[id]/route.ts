/**
 * API Route: /api/generations/[id]
 * Handles operations for specific generation records
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/generations/[id] - Get specific generation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const generation = await db.getGeneration(params.id);

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: generation,
    });
  } catch (error) {
    console.error('Failed to get generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get generation' },
      { status: 500 }
    );
  }
}

// PATCH /api/generations/[id] - Update generation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, output, imageUrls, blobUrls, error, completedAt, duration } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (output) updateData.output = output;
    if (imageUrls) updateData.imageUrls = imageUrls;
    if (blobUrls) updateData.blobUrls = blobUrls;
    if (error) updateData.error = error;
    if (completedAt) updateData.completedAt = new Date(completedAt);
    if (duration) updateData.duration = duration;

    const generation = await db.updateGeneration(params.id, updateData);

    return NextResponse.json({
      success: true,
      data: generation,
    });
  } catch (error) {
    console.error('Failed to update generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update generation' },
      { status: 500 }
    );
  }
}