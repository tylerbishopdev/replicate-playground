/**
 * API Route: /api/predictions/[id]/stream
 * Server-sent events endpoint for real-time prediction updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { predictionUpdates } from '@/app/api/webhooks/replicate/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      let lastUpdateIndex = 0;

      const interval = setInterval(() => {
        const updates = predictionUpdates.get(id) || [];

        if (updates.length > lastUpdateIndex) {
          // Send new updates
          const newUpdates = updates.slice(lastUpdateIndex);
          lastUpdateIndex = updates.length;

          newUpdates.forEach((update) => {
            const data = `data: ${JSON.stringify(update.data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          });

          // Check if prediction is completed
          const lastUpdate = updates[updates.length - 1];
          if (
            lastUpdate &&
            ['succeeded', 'failed', 'canceled'].includes(lastUpdate.data.status)
          ) {
            clearInterval(interval);
            controller.close();
          }
        }
      }, 1000);

      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, { headers });
}