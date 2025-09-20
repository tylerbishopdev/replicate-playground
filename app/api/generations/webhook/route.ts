/**
 * API Route: /api/generations/webhook
 * Webhook endpoint to receive updates from Replicate
 */

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';

// POST /api/generations/webhook - Handle Replicate webhook
export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();
    const { id: replicateId, status, output, error } = webhook;

    if (!replicateId) {
      return NextResponse.json(
        { success: false, error: 'Missing Replicate ID' },
        { status: 400 }
      );
    }

    // Find the generation record
    const generation = await db.getGenerationByReplicateId(replicateId);
    if (!generation) {
      console.warn(`Generation not found for Replicate ID: ${replicateId}`);
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: status.toUpperCase(),
      output,
    };

    if (error) {
      updateData.error = error;
    }

    // If completed, calculate duration
    if (status === 'succeeded' || status === 'failed') {
      updateData.completedAt = new Date();
      if (generation.startedAt) {
        updateData.duration = updateData.completedAt.getTime() - generation.startedAt.getTime();
      }
    }

    // If successful and has output, store images to blob storage
    if (status === 'succeeded' && output) {
      const imageUrls: string[] = [];
      const blobUrls: string[] = [];

      // Handle different output formats
      let urls: string[] = [];
      if (Array.isArray(output)) {
        urls = output;
      } else if (typeof output === 'string') {
        urls = [output];
      } else if (output.output && Array.isArray(output.output)) {
        urls = output.output;
      }

      // Store each image to blob storage
      for (const [index, url] of urls.entries()) {
        try {
          // Download image
          const response = await fetch(url);
          if (!response.ok) continue;

          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Generate filename
          const timestamp = Date.now();
          const filename = `generations/${generation.id}/image-${index}-${timestamp}.png`;

          // Upload to blob storage
          const blob = await put(filename, buffer, {
            access: 'public',
          });

          imageUrls.push(url);
          blobUrls.push(blob.url);
        } catch (error) {
          console.error(`Failed to store image ${index}:`, error);
          // Continue with other images even if one fails
        }
      }

      updateData.imageUrls = imageUrls;
      updateData.blobUrls = blobUrls;
    }

    // Update the generation record
    await db.updateGenerationByReplicateId(replicateId, updateData);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Failed to process webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}