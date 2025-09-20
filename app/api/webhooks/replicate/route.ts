/**
 * API Route: /api/webhooks/replicate
 * Handles webhook events from Replicate
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSignature } from '@/lib/replicate';
import { WebhookPayloadSchema } from '@/lib/types';

// Store for server-sent events
const predictionUpdates = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('webhook-signature') || '';
    const secret = process.env.WEBHOOK_SECRET || '';

    // Validate webhook signature if secret is configured
    if (secret && !validateWebhookSignature(body, signature, secret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse and validate webhook payload
    const payload = JSON.parse(body);
    const validated = WebhookPayloadSchema.parse(payload);

    // Store update for SSE delivery
    const updates = predictionUpdates.get(validated.id) || [];
    updates.push({
      timestamp: Date.now(),
      data: validated,
    });
    predictionUpdates.set(validated.id, updates);

    // Clean up old updates after 5 minutes
    setTimeout(() => {
      const currentUpdates = predictionUpdates.get(validated.id);
      if (currentUpdates) {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const recentUpdates = currentUpdates.filter(
          (update) => update.timestamp > fiveMinutesAgo
        );
        if (recentUpdates.length > 0) {
          predictionUpdates.set(validated.id, recentUpdates);
        } else {
          predictionUpdates.delete(validated.id);
        }
      }
    }, 5 * 60 * 1000);

    console.log(`Webhook received for prediction ${validated.id}:`, validated.status);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error in webhook handler:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Export the updates store for SSE endpoint
export { predictionUpdates };