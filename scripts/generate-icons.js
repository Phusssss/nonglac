const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '../src/assets/logo.final.nontext.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    console.log('Generating icons from source:', sourceIcon);
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${size}x${size} icon`);
    }

    // Generate favicon sizes
    const faviconSizes = [16, 32];
    for (const size of faviconSizes) {
      const outputPath = path.join(__dirname, `../public/favicon-${size}x${size}.png`);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated favicon ${size}x${size}`);
    }

    // Generate apple-touch-icon
    const appleTouchPath = path.join(__dirname, '../public/apple-touch-icon.png');
    await sharp(sourceIcon)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(appleTouchPath);
    
    console.log('✓ Generated apple-touch-icon');

    // Generate logo192 and logo512 for React
    const logo192Path = path.join(__dirname, '../public/logo192.png');
    await sharp(sourceIcon)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(logo192Path);
    
    console.log('✓ Generated logo192');

    const logo512Path = path.join(__dirname, '../public/logo512.png');
    await sharp(sourceIcon)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(logo512Path);
    
    console.log('✓ Generated logo512');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
