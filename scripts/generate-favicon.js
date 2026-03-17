const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '../src/assets/logo.final.nontext.png');
const outputPath = path.join(__dirname, '../public/favicon.ico');

async function generateFavicon() {
  try {
    console.log('Generating favicon.ico...');
    
    // Create a 32x32 PNG first, then convert to ICO
    await sharp(sourceIcon)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath.replace('.ico', '.png'));
    
    // For ICO format, we'll use the PNG as fallback since sharp doesn't support ICO directly
    // Most modern browsers support PNG as favicon anyway
    console.log('✓ Generated favicon (PNG format)');
    console.log('✅ Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
