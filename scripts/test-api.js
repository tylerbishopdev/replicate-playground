/**
 * Test script for Replicate API integration
 * Run with: node scripts/test-api.js
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const API_TOKEN = process.env.REPLICATE_API_TOKEN;
const BASE_URL = 'http://localhost:3000';

// Test models
const TEST_MODELS = [
  {
    name: 'Tyler Model',
    id: 'tylerbishopdev/tyler:01ce0a0fdc7a46ec74a3c093f6163c5a5f633297a06514229e8775c877507643',
    input: {
      prompt: 'A beautiful landscape painting in the style of Bob Ross',
      model: 'dev',
      aspect_ratio: '16:9',
      num_outputs: 1,
      num_inference_steps: 28,
      guidance_scale: 3,
      output_format: 'webp',
      output_quality: 80
    }
  },
  {
    name: 'FLUX Schnell',
    id: 'black-forest-labs/flux-schnell',
    input: {
      prompt: 'A futuristic cityscape at sunset',
      aspect_ratio: '16:9',
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 80
    }
  }
];

async function testPrediction(model) {
  console.log(`\\n🔄 Testing ${model.name}...`);
  console.log(`   Model ID: ${model.id}`);

  try {
    // Create prediction
    const createResponse = await fetch(`${BASE_URL}/api/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: model.id,
        input: model.input
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Failed to create prediction: ${JSON.stringify(error)}`);
    }

    const prediction = await createResponse.json();
    console.log(`   ✅ Prediction created: ${prediction.id}`);
    console.log(`   Status: ${prediction.status}`);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 1 minute timeout
    let finalPrediction = prediction;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(`${BASE_URL}/api/predictions/${prediction.id}`);
      if (!statusResponse.ok) {
        throw new Error('Failed to fetch prediction status');
      }

      finalPrediction = await statusResponse.json();
      console.log(`   Status: ${finalPrediction.status}`);

      if (['succeeded', 'failed', 'canceled'].includes(finalPrediction.status)) {
        break;
      }

      attempts++;
    }

    if (finalPrediction.status === 'succeeded') {
      console.log(`   ✅ Prediction succeeded!`);
      if (finalPrediction.output) {
        console.log(`   Output:`, finalPrediction.output);
      }
    } else if (finalPrediction.status === 'failed') {
      console.log(`   ❌ Prediction failed:`, finalPrediction.error);
    } else {
      console.log(`   ⏱️  Prediction timed out (status: ${finalPrediction.status})`);
    }

    return finalPrediction;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return null;
  }
}

async function testDirectAPI() {
  console.log('\\n🔄 Testing direct Replicate API...');

  try {
    const response = await fetch('https://api.replicate.com/v1/models/tylerbishopdev/tyler', {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${error}`);
    }

    const model = await response.json();
    console.log('   ✅ Direct API call succeeded');
    console.log(`   Model: ${model.owner}/${model.name}`);
    console.log(`   Latest version: ${model.latest_version?.id}`);
  } catch (error) {
    console.error('   ❌ Direct API error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Replicate API Tests');
  console.log('================================');

  // Test direct API access first
  await testDirectAPI();

  // Test predictions through our API
  for (const model of TEST_MODELS) {
    await testPrediction(model);
  }

  console.log('\\n✅ Tests completed!');
}

// Run tests
main().catch(console.error);