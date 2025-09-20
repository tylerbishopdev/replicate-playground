/**
 * API Route: /api/generations
 * Handles CRUD operations for image generations
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/generations - Get all generations or filter by model
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelOwner = searchParams.get('modelOwner');
    const modelName = searchParams.get('modelName');
    const limit = searchParams.get('limit');

    let generations;

    if (modelOwner && modelName) {
      // Get generations for specific model
      generations = await db.getGenerationsForModel(modelOwner, modelName);
    } else {
      // Get recent generations
      const limitNum = limit ? parseInt(limit) : 10;
      generations = await db.getRecentGenerations(limitNum);
    }

    return NextResponse.json({
      success: true,
      data: generations,
    });
  } catch (error) {
    console.error('Failed to get generations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get generations' },
      { status: 500 }
    );
  }
}

// POST /api/generations - Create a new generation record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelOwner, modelName, modelVersion, prompt, parameters, replicateId } = body;

    if (!modelOwner || !modelName || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: modelOwner, modelName, prompt' },
        { status: 400 }
      );
    }

    const generation = await db.createGeneration({
      modelOwner,
      modelName,
      modelVersion,
      prompt,
      parameters,
      replicateId,
    });

    return NextResponse.json({
      success: true,
      data: generation,
    });
  } catch (error) {
    console.error('Failed to create generation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create generation' },
      { status: 500 }
    );
  }
}