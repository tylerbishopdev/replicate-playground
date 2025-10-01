/**
 * Replicate API client wrapper
 * Handles all interactions with the Replicate API
 */

import Replicate from "replicate";
import {
  ReplicateModel,
  ModelVersion,
  Prediction,
  PaginatedResponse,
} from "./types";

// Initialize Replicate client with validation
if (!process.env.REPLICATE_API_TOKEN) {
  console.error(
    "⚠️  REPLICATE_API_TOKEN is not configured in environment variables"
  );
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

/**
 * Search for public models on Replicate
 */
export async function searchModels(
  query?: string,
  cursor?: string
): Promise<PaginatedResponse<ReplicateModel>> {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/models${
        query ? `?query=${encodeURIComponent(query)}` : ""
      }${cursor ? `&cursor=${cursor}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      next: data.next,
      previous: data.previous,
    };
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
}

/**
 * Get a specific model by owner and name
 */
export async function getModel(
  owner: string,
  name: string
): Promise<ReplicateModel> {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/models/${owner}/${name}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching model:", error);
    throw error;
  }
}

/**
 * Get a specific model version
 */
export async function getModelVersion(
  owner: string,
  name: string,
  versionId: string
): Promise<ModelVersion> {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/models/${owner}/${name}/versions/${versionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch model version: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching model version:", error);
    throw error;
  }
}

/**
 * Create a new prediction
 */
export async function createPrediction(
  version: string,
  input: Record<string, any>,
  webhook?: string,
  webhook_events_filter?: string[],
  stream?: boolean
): Promise<Prediction> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  try {
    const body: any = {
      version,
      input,
    };

    if (webhook) {
      body.webhook = webhook;
      body.webhook_events_filter = webhook_events_filter || ["completed"];
    }

    if (stream) {
      body.stream = true;
    }

    console.log("Creating prediction with:", {
      version,
      input,
      webhook: webhook ? "configured" : "none",
      stream,
    });

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: response.statusText }));
      const errorMessage =
        error.detail ||
        error.message ||
        `Failed to create prediction: ${response.statusText}`;
      console.error(
        "Replicate API error response:",
        response.status,
        response.statusText
      );
      console.error("Replicate API error details:", error);
      console.error("Request was:", { version, input });
      throw new Error(errorMessage);
    }

    const prediction = await response.json();
    console.log("Prediction created:", prediction.id, prediction.status);
    return prediction;
  } catch (error) {
    console.error("Error creating prediction:", error);
    throw error;
  }
}

/**
 * Get prediction status
 */
export async function getPrediction(id: string): Promise<Prediction> {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch prediction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching prediction:", error);
    throw error;
  }
}

/**
 * Cancel a running prediction
 */
export async function cancelPrediction(id: string): Promise<void> {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${id}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel prediction: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error canceling prediction:", error);
    throw error;
  }
}

/**
 * Validate webhook signature from Replicate
 * Replicate uses a different format: webhook-signature header contains the signature directly
 */
export function validateWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");

  // Replicate sends the signature in the format "sha256=<signature>"
  // Extract the actual signature if it has the prefix
  let actualSignature = signature;
  if (signature.startsWith("sha256=")) {
    actualSignature = signature.substring(7);
  }

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Compare signatures
  return actualSignature === expectedSignature;
}
