/**
 * API Route: /api/predictions
 * Creates new predictions with proper model configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { createPrediction } from "@/lib/replicate";
import { PredictionCreateSchema } from "@/lib/types";
import { validateModelInput, formatModelIdAsync } from "@/lib/model-configs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Prediction request:", body);

    // Validate input structure
    const validated = PredictionCreateSchema.parse(body);

    // Extract model owner and name from version string
    const modelParts = validated.version.split(/[/:]/);
    const owner = modelParts[0];
    const name = modelParts[1];

    // Get the properly formatted version ID with full hash
    let fullVersionId;
    try {
      fullVersionId = await formatModelIdAsync(owner, name);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown model resolution error";
      return NextResponse.json(
        { error: `Model resolution failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Validate and prepare input using model-specific configuration
    let processedInput;
    try {
      processedInput = validateModelInput(owner, name, validated.input);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown validation error";
      return NextResponse.json(
        { error: `Input validation failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Clean the input data - remove empty values
    const cleanInput = Object.fromEntries(
      Object.entries(processedInput).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    console.log("Creating prediction for model:", fullVersionId);
    console.log("With input:", cleanInput);

    const prediction = await createPrediction(
      fullVersionId,
      cleanInput,
      undefined, // Skip webhook for now to simplify
      ["completed"],
      validated.stream
    );

    console.log("Prediction created successfully:", prediction.id);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error in /api/predictions:", error);

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: "errors" in error ? error.errors : [],
        },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create prediction";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
