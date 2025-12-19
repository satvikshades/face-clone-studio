/**
 * Express Backend for Avatar Generation
 * 
 * Setup Instructions:
 * 1. Navigate to the /backend folder
 * 2. Run: npm init -y
 * 3. Run: npm install express cors dotenv replicate
 * 4. Create a .env file with: REPLICATE_API_TOKEN=your_token_here
 * 5. Run: node server.js
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

// Avatar generation endpoint
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

    console.log('Starting avatar generation with InstantID...');

    const avatarPrompt = "a lovable, warm, friendly portrait with a gentle smile and soft eyes, realistic skin texture, accurate facial identity, PURE WHITE BACKGROUND (#FFFFFF), clean studio lighting with no shadows behind the subject, centered composition, soft diffused light, smooth complexion, approachable and cute expression, 4k hyper-realistic quality professional headshot";

    // Using InstantID for identity-preserving portrait generation
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "1a4c182872b82fdac5d6f4938897e5b45fc5517fcd80e44f8c9984955ff8fe67",
        input: {
          image: image,
          prompt: avatarPrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, bad proportions, shadows behind subject, dark background, gray background",
          num_inference_steps: 30,
          guidance_scale: 5,
          ip_adapter_scale: 0.8,
          controlnet_conditioning_scale: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Replicate API error:', errorData);
      throw new Error('Replicate API request failed: ' + errorData);
    }

    const prediction = await response.json();
    
    // Poll for the result
    const result = await pollForResult(prediction.urls.get, REPLICATE_API_TOKEN);
    
    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed');
    }

    const avatarUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    console.log('Avatar generated successfully:', avatarUrl);
    res.json({ avatarUrl });

  } catch (error) {
    console.error('Error generating avatar:', error);
    res.status(500).json({ error: error.message || 'Failed to generate avatar' });
  }
});

// Helper function to poll for prediction result
async function pollForResult(url, token, maxAttempts = 60) {
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

app.listen(PORT, () => {
  console.log(`
🚀 Avatar Generator Backend running on http://localhost:${PORT}

Endpoints:
  GET  /health           - Health check
  POST /generate-avatar  - Generate avatar from base64 image

Make sure to:
1. Set REPLICATE_API_TOKEN in your .env file
2. Get your token at: https://replicate.com/account/api-tokens
  `);
});
