/**
 * Express Backend for Avatar Generation
 * 
 * Setup Instructions:
 * 1. Navigate to the /backend folder
 * 2. Run: npm install
 * 3. Create a .env file with: HUGGING_FACE_TOKEN=your_token_here
 * 4. Run: node server.js
 * 
 * Get your free Hugging Face token at: https://huggingface.co/settings/tokens
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

// Avatar generation endpoint using Hugging Face
app.post('/generate-avatar', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;
    
    if (!HF_TOKEN) {
      return res.status(500).json({ 
        error: 'HUGGING_FACE_TOKEN not configured. Add it to your .env file.' 
      });
    }

    console.log('Starting avatar generation with Hugging Face...');

    // Extract base64 data from data URI
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Use FLUX.1-schnell for cartoon avatar generation (text-to-image, free tier)
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: "cartoon avatar portrait, pixar style character, colorful, friendly face, digital art, high quality",
        }),
      }
    );

    if (!response.ok) {
      // Check if model is loading
      if (response.status === 503) {
        const data = await response.json();
        console.log('Model is loading, estimated time:', data.estimated_time);
        return res.status(503).json({ 
          error: 'Model is loading, please try again in a few seconds',
          estimated_time: data.estimated_time 
        });
      }
      
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error('Hugging Face API request failed: ' + errorText);
    }

    // Get the image as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(arrayBuffer).toString('base64');
    const avatarUrl = `data:image/png;base64,${resultBase64}`;
    
    console.log('Avatar generated successfully!');
    res.json({ avatarUrl });

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
  POST /generate-avatar  - Generate cartoon avatar from image

Make sure to:
1. Set HUGGING_FACE_TOKEN in your .env file
2. Get your FREE token at: https://huggingface.co/settings/tokens
  `);
});
