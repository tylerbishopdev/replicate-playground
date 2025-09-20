/**
 * API Route: /api/predictions/[id]
 * Gets prediction status and cancels predictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrediction, cancelPrediction } from '@/lib/replicate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prediction = await getPrediction(id);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error in GET /api/predictions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await cancelPrediction(id);

    return NextResponse.json({ message: 'Prediction canceled' });
  } catch (error) {
    console.error('Error in DELETE /api/predictions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to cancel prediction' },
      { status: 500 }
    );
  }
}