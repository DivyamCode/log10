#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if canvas is available, if not, provide instructions
try {
    require('canvas');
} catch (e) {
    console.log('Canvas library not found. Installing...');
    console.log('Please run: npm install canvas');
    console.log('Or use the HTML converter tool: convert-icons.html');
    process.exit(1);
}

const { createCanvas, loadImage } = require('canvas');

const sizes = [16, 32, 48, 128];

// SVG content (same as in the HTML tool)
const svgContent = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="64" cy="64" r="60" fill="#667eea" stroke="#764ba2" stroke-width="4"/>
  
  <!-- Console/terminal icon -->
  <rect x="32" y="40" width="64" height="48" rx="4" fill="white" opacity="0.9"/>
  
  <!-- Terminal window header -->
  <rect x="32" y="40" width="64" height="8" rx="4" fill="#e74c3c"/>
  <circle cx="38" cy="44" r="2" fill="white"/>
  <circle cx="44" cy="44" r="2" fill="white"/>
  <circle cx="50" cy="44" r="2" fill="white"/>
  
  <!-- Console text lines -->
  <rect x="36" y="56" width="24" height="2" fill="#2c3e50"/>
  <rect x="36" y="62" width="32" height="2" fill="#2c3e50"/>
  <rect x="36" y="68" width="28" height="2" fill="#2c3e50"/>
  <rect x="36" y="74" width="20" height="2" fill="#2c3e50"/>
  
  <!-- Log forwarding arrow -->
  <path d="M 80 64 L 100 64 M 100 64 L 95 59 M 100 64 L 95 69" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Data flow dots -->
  <circle cx="88" cy="64" r="2" fill="white" opacity="0.7"/>
  <circle cx="92" cy="64" r="2" fill="white" opacity="0.5"/>
  <circle cx="96" cy="64" r="2" fill="white" opacity="0.3"/>
</svg>`;

async function generateIcons() {
    console.log('Generating PNG icons...');
    
    // Create a temporary SVG file
    const tempSvgPath = path.join(__dirname, 'temp-icon.svg');
    fs.writeFileSync(tempSvgPath, svgContent);
    
    try {
        // Load the SVG image
        const image = await loadImage(tempSvgPath);
        
        // Generate each size
        for (const size of sizes) {
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');
            
            // Draw the image at the specified size
            ctx.drawImage(image, 0, 0, size, size);
            
            // Save as PNG
            const buffer = canvas.toBuffer('image/png');
            const outputPath = path.join(__dirname, 'icons', `icon${size}.png`);
            
            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ Generated icon${size}.png (${size}x${size})`);
        }
        
        console.log('\nAll icons generated successfully!');
        console.log('You can now load the Chrome extension.');
        
    } catch (error) {
        console.error('Error generating icons:', error.message);
        console.log('\nAlternative: Use the HTML converter tool (convert-icons.html)');
    } finally {
        // Clean up temporary file
        if (fs.existsSync(tempSvgPath)) {
            fs.unlinkSync(tempSvgPath);
        }
    }
}

// Run the script
generateIcons(); 