// Convert OG Image SVG to PNG
// Run with: node scripts/convert-og-image.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/og-image.svg');
const pngPath = path.join(__dirname, '../public/og-image.png');

async function convertSvgToPng() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png({ quality: 100 })
      .toFile(pngPath);
    
    console.log('✅ OG Image converted successfully!');
    console.log(`📁 Saved to: ${pngPath}`);
    console.log('📐 Dimensions: 1200 x 630 pixels');
  } catch (error) {
    console.error('❌ Error converting image:', error.message);
  }
}

convertSvgToPng();
