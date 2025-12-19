/**
 * Express Backend for Avatar Generation
 * 
 * Setup Instructions:
 * 1. Navigate to the /backend folder
 * 2. Run: npm install
 * 3. Run: node server.js
 * 
 * No external API keys required!
 */

const express = require('express');
const cors = require('cors');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add white background to image
async function addWhiteBackground(imageBase64) {
  console.log('Adding white background...');
  
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Load the image
  const image = await loadImage(buffer);
  
  // Create canvas with white background
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  // Fill with white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw the image on top
  ctx.drawImage(image, 0, 0);
  
  // Return as base64
  return canvas.toDataURL('image/png');
}

// Avatar generation endpoint
app.post('/generate-avatar', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Processing avatar...');

    // Add white background
    const processedImage = await addWhiteBackground(image);
    console.log('Avatar processed successfully');

    res.json({ 
      avatarUrl: processedImage,
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
  POST /generate-avatar  - Generate avatar from base64 image

No API keys required! Just run: node server.js
  `);
});
