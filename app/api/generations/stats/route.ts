/**
 * API Route: /api/generations/stats
 * Get generation statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/generations/stats - Get generation statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await db.getGenerationStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to get generation stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get generation stats' },
      { status: 500 }
    );
  }
}