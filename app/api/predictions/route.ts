/**
 * API Route: /api/predictions
 * Creates new predictions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPrediction } from '@/lib/replicate';
import { PredictionCreateSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = PredictionCreateSchema.parse(body);

    // Add webhook URL if not provided
    const webhookUrl = validated.webhook || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`;

    const prediction = await createPrediction(
      validated.version,
      validated.input,
      webhookUrl,
      validated.webhook_events_filter || ['start', 'output', 'logs', 'completed'],
      validated.stream
    );

    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error('Error in /api/predictions:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create prediction' },
      { status: 500 }
    );
  }
}