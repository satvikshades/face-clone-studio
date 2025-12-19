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

    console.log('Starting avatar generation...');

    // Using Toonify model - creates cartoon/animated style avatars like Bitmoji
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Toonify - cartoon style avatar generator
        version: "e1e1a3e4aa3aaef7a52a0203d7c6686d1c2a5b4d7a00a0c47e7f9c22c5c16e5e",
        input: {
          image: image,
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
