# Fix Chrome Extension Icon Loading Issue

## Problem
The Chrome extension is failing to load because it's missing the required PNG icon files. The manifest.json expects:
- `icons/icon16.png` (16x16)
- `icons/icon32.png` (32x32) 
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

But only `icons/icon.svg` exists.

## Solution Options

### Option 1: Use Node.js Script (Recommended)
1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate PNG icons:
   ```bash
   npm run generate-icons
   ```

3. The script will create all required PNG files in the `icons/` folder.

### Option 2: Use HTML Converter Tool
1. Open `convert-icons.html` in your browser
2. Click "Convert Icons" to generate previews
3. Click "Download All" to download all PNG files
4. Place the downloaded files in the `icons/` folder

### Option 3: Manual Conversion
1. Use any image editing tool (GIMP, Photoshop, etc.)
2. Open `icons/icon.svg`
3. Export to PNG at the required sizes: 16x16, 32x32, 48x48, 128x128
4. Save as `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

## After Fixing
Once you have all the PNG icon files in the `icons/` folder, the Chrome extension should load successfully without the "Could not load icon" error.

## File Structure
Your `icons/` folder should contain:
```
icons/
├── icon.svg          (original SVG file)
├── icon16.png        (16x16 PNG)
├── icon32.png        (32x32 PNG)
├── icon48.png        (48x48 PNG)
└── icon128.png       (128x128 PNG)
```

## Testing
After adding the icons, try loading the extension again in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now load without errors 