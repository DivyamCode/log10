#!/bin/bash

# 🚀 Console Log Forwarder - Build Script
# This script automates the build and packaging process for the Chrome extension

set -e  # Exit on any error

echo "🔨 Building Console Log Forwarder Chrome Extension..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    print_error "manifest.json not found! Please run this script from the chrome-extension directory."
    exit 1
fi

# Create build directory
BUILD_DIR="build"
DIST_DIR="dist"

print_status "Cleaning previous builds..."
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# Copy extension files to build directory
print_status "Copying extension files..."
cp -r manifest.json popup.html popup.js background.js content.js icons/ "$BUILD_DIR/"
cp README.md BUILD_AND_RUN.md "$BUILD_DIR/"

# Check if PNG icons exist, if not, warn user
if [ ! -f "icons/icon16.png" ]; then
    print_warning "PNG icons not found. Consider converting SVG to PNG for better compatibility."
    print_status "You can use online converters or image editors to create:"
    echo "  - icons/icon16.png (16x16)"
    echo "  - icons/icon32.png (32x32)"
    echo "  - icons/icon48.png (48x48)"
    echo "  - icons/icon128.png (128x128)"
fi

# Create development package
print_status "Creating development package..."
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/console-log-forwarder-dev.zip" . -x "*.git*" "node_modules/*" "*.zip" "build/*" "dist/*"
cd ..

# Create production package (without dev files)
print_status "Creating production package..."
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/console-log-forwarder-prod.zip" . -x "*.git*" "node_modules/*" "*.zip" "build/*" "dist/*" "BUILD_AND_RUN.md"
cd ..

# Create source package
print_status "Creating source package..."
zip -r "$DIST_DIR/console-log-forwarder-source.zip" . -x "*.git*" "node_modules/*" "*.zip" "build/*" "dist/*"

# Display build results
echo ""
print_success "Build completed successfully!"
echo ""
echo "📦 Generated packages:"
echo "  - $DIST_DIR/console-log-forwarder-dev.zip     (Development with docs)"
echo "  - $DIST_DIR/console-log-forwarder-prod.zip    (Production ready)"
echo "  - $DIST_DIR/console-log-forwarder-source.zip  (Source code)"
echo ""

# Show file sizes
print_status "Package sizes:"
ls -lh "$DIST_DIR"/*.zip

echo ""
print_status "Next steps:"
echo "  1. Go to chrome://extensions/"
echo "  2. Enable Developer Mode"
echo "  3. Load unpacked: select the chrome-extension folder"
echo "  4. Or install from ZIP: drag and drop one of the packages above"
echo ""
print_success "Happy logging! 🎉" 