/**
 * Express Backend for Avatar Generation with 3D Model
 * 
 * Setup Instructions:
 * 1. Navigate to the /backend folder
 * 2. Run: npm install
 * 3. Create a .env file with: REPLICATE_API_TOKEN=your_token_here
 * 4. Run: node server.js
 * 
 * Get your Replicate API token at: https://replicate.com/account/api-tokens
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Helper function to poll for prediction result
async function pollForResult(url, token, maxAttempts = 120) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (result.status === 'succeeded' || result.status === 'failed') {
      return result;
    }
    
    console.log(`Polling attempt ${i + 1}/${maxAttempts}, status: ${result.status}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Timeout waiting for prediction result');
}

// Step 1: Remove background and add white background
async function removeBackground(imageBase64, token) {
  console.log('Step 1: Removing background...');
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // rembg model for background removal
      version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      input: {
        image: imageBase64,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Background removal failed: ' + await response.text());
  }

  const prediction = await response.json();
  const result = await pollForResult(prediction.urls.get, token);
  
  if (result.status === 'failed') {
    throw new Error(result.error || 'Background removal failed');
  }

  return result.output;
}

// Step 2: Enhance face with GFPGAN
async function enhanceFace(imageUrl, token) {
  console.log('Step 2: Enhancing face...');
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
      input: {
        img: imageUrl,
        version: "v1.4",
        scale: 2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Face enhancement failed: ' + await response.text());
  }

  const prediction = await response.json();
  const result = await pollForResult(prediction.urls.get, token);
  
  if (result.status === 'failed') {
    throw new Error(result.error || 'Face enhancement failed');
  }

  return Array.isArray(result.output) ? result.output[0] : result.output;
}

// Step 3: Generate 3D model with TripoSR
async function generate3DModel(imageUrl, token) {
  console.log('Step 3: Generating 3D model with TripoSR...');
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // TripoSR - fast image to 3D model
      version: "d44396e5ab7e0e4ee4f363f67be5e9c5d65d31f2583c7b6f70f1f94b9eb0dc56",
      input: {
        image: imageUrl,
        mc_resolution: 256,
        foreground_ratio: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('3D generation failed: ' + await response.text());
  }

  const prediction = await response.json();
  const result = await pollForResult(prediction.urls.get, token, 180); // Longer timeout for 3D
  
  if (result.status === 'failed') {
    throw new Error(result.error || '3D generation failed');
  }

  return result.output;
}

// Avatar generation endpoint with 3D model
app.post('/generate-avatar', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    
    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({ 
        error: 'REPLICATE_API_TOKEN not configured. Add it to your .env file.' 
      });
    }

    console.log('Starting avatar generation pipeline...');

    // Step 1: Remove background
    const noBgImage = await removeBackground(image, REPLICATE_API_TOKEN);
    console.log('Background removed:', noBgImage);

    // Step 2: Enhance face
    const enhancedImage = await enhanceFace(noBgImage, REPLICATE_API_TOKEN);
    console.log('Face enhanced:', enhancedImage);

    // Step 3: Generate 3D model
    const model3dUrl = await generate3DModel(noBgImage, REPLICATE_API_TOKEN);
    console.log('3D model generated:', model3dUrl);

    res.json({ 
      avatarUrl: enhancedImage,
      modelUrl: model3dUrl,
    });

  } catch (error) {
    console.error('Error generating avatar:', error);
    res.status(500).json({ error: error.message || 'Failed to generate avatar' });
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 Avatar Generator Backend running on http://localhost:${PORT}

Endpoints:
  GET  /health           - Health check
  POST /generate-avatar  - Generate avatar + 3D model from base64 image

Pipeline:
  1. Remove background (rembg)
  2. Enhance face (GFPGAN)
  3. Generate 3D model (TripoSR)

Make sure to:
1. Set REPLICATE_API_TOKEN in your .env file
2. Get your token at: https://replicate.com/account/api-tokens
  `);
});
