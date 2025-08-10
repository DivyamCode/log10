# 🚀 Build and Run Guide - Console Log Forwarder

This guide will walk you through building, installing, and running your Chrome extension step by step.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Google Chrome** browser (version 88 or higher)
- ✅ **Backend server** running with the required API endpoints
- ✅ **Basic understanding** of Chrome extensions
- ✅ **Text editor** (VS Code, Sublime Text, etc.)

## 🛠️ Building the Extension

### Step 1: Verify File Structure

Ensure your `chrome-extension` folder contains all required files:

```bash
chrome-extension/
├── manifest.json          # ✅ Extension configuration
├── popup.html            # ✅ Popup interface
├── popup.js              # ✅ Popup logic
├── background.js         # ✅ Background service worker
├── content.js            # ✅ Content script
├── icons/
│   └── icon.svg          # ✅ Extension icon
├── test-page.html        # ✅ Test page
├── README.md             # ✅ Documentation
└── package.json          # ✅ Project metadata
```

### Step 2: Generate PNG Icons (Optional but Recommended)

The extension currently uses SVG icons, but Chrome prefers PNG icons for better compatibility. You can convert the SVG to PNG using online tools or create your own:

**Option A: Online SVG to PNG Converter**
1. Go to [convertio.co/svg-png](https://convertio.co/svg-png/) or similar
2. Upload `icons/icon.svg`
3. Convert to PNG at these sizes: 16x16, 32x32, 48x48, 128x128
4. Save as `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` in the `icons/` folder

**Option B: Manual Icon Creation**
Create simple PNG icons using any image editor (GIMP, Photoshop, etc.)

### Step 3: Update Manifest for PNG Icons (if using PNG)

If you created PNG icons, update `manifest.json`:

```json
{
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

## 🚀 Installing the Extension

### Method 1: Load Unpacked (Development)

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Navigate to your `chrome-extension` folder
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - The extension should appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

### Method 2: Package and Install (Production)

1. **Create ZIP Package**
   ```bash
   cd chrome-extension
   zip -r console-log-forwarder.zip . -x "*.git*" "node_modules/*" "*.zip"
   ```

2. **Install from ZIP**
   - Go to `chrome://extensions/`
   - Enable Developer Mode
   - Drag and drop the ZIP file onto the extensions page

## 🧪 Testing the Extension

### Step 1: Start Your Backend Server

Ensure your backend server is running with these endpoints:

```bash
# Example using Node.js/Express
POST /log          # Receive logs
GET  /logs         # Get all logs
GET  /logs/:session # Get logs by session
```

### Step 2: Configure the Extension

1. **Click Extension Icon**
   - Click the extension icon in your Chrome toolbar

2. **Enter Configuration**
   - **Target URL**: `http://localhost:3000` (or your test page URL)
   - **Backend URL**: `http://localhost:4000` (or your backend URL)

3. **Start Logging**
   - Click "Start Logging"
   - You should see a success message

### Step 3: Test Console Log Capture

1. **Open Test Page**
   - Navigate to `chrome-extension/test-page.html`
   - Or any page matching your target URL

2. **Generate Logs**
   - Use the test buttons on the page
   - Or manually use console methods in browser DevTools

3. **Verify Backend Reception**
   - Check your backend server logs
   - Verify log data is being received

## 🔧 Development Workflow

### Making Changes

1. **Edit Files**
   - Modify any extension files as needed
   - Save your changes

2. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension
   - Or click "Reload" button

3. **Test Changes**
   - Navigate to a test page
   - Verify your changes work as expected

### Debugging

1. **Background Script Debugging**
   - Go to `chrome://extensions/`
   - Click "service worker" link under your extension
   - Use the DevTools console for debugging

2. **Content Script Debugging**
   - Open the page where content script is injected
   - Use regular DevTools console
   - Look for logs prefixed with "Console Log Forwarder"

3. **Popup Debugging**
   - Right-click extension icon
   - Click "Inspect popup"
   - Use DevTools for debugging

## 🚨 Common Issues and Solutions

### Issue 1: Extension Won't Load

**Symptoms:**
- Extension appears but shows errors
- Extension doesn't appear at all

**Solutions:**
```bash
# Check manifest.json syntax
# Ensure all required files exist
# Check Chrome console for errors
# Verify Chrome version compatibility
```

### Issue 2: Content Script Not Injecting

**Symptoms:**
- Console logs not being captured
- No "Console Log Forwarder" messages in console

**Solutions:**
```bash
# Verify target URL matches current page
# Check if logging is started
# Reload the extension
# Check background script console for errors
```

### Issue 3: Backend Not Receiving Logs

**Symptoms:**
- Extension shows "Logging started" but no logs arrive

**Solutions:**
```bash
# Verify backend URL is correct
# Check backend server is running
# Verify CORS settings on backend
# Check network tab for failed requests
```

### Issue 4: Permission Errors

**Symptoms:**
- Extension shows permission denied errors
- Cannot access certain websites

**Solutions:**
```bash
# Check manifest.json permissions
# Verify host_permissions include target URLs
# Reload extension after permission changes
```

## 📱 Testing on Different Sites

### Local Development
```bash
# Test on localhost
http://localhost:3000
http://127.0.0.1:8000
```

### Production Sites
```bash
# Test on live websites
https://example.com
https://yourdomain.com
```

**Note:** Some sites may have Content Security Policy (CSP) that blocks content scripts.

## 🔄 Updating the Extension

### Development Updates
1. Make code changes
2. Save files
3. Reload extension in `chrome://extensions/`
4. Test changes

### Production Updates
1. Make code changes
2. Update version in `manifest.json`
3. Create new ZIP package
4. Users need to manually update or reinstall

## 📊 Performance Monitoring

### Monitor Extension Performance
1. **Memory Usage**
   - Check `chrome://extensions/` for memory usage
   - Monitor for memory leaks

2. **Network Requests**
   - Check Network tab for failed requests
   - Monitor request frequency

3. **Console Spam**
   - Ensure extension doesn't create infinite loops
   - Check for circular references in logged objects

## 🧹 Cleanup and Maintenance

### Regular Maintenance
1. **Clear Old Logs**
   - Monitor backend storage
   - Implement log rotation

2. **Update Dependencies**
   - Keep Chrome browser updated
   - Monitor for security updates

3. **Performance Optimization**
   - Monitor extension performance
   - Optimize log forwarding frequency

## 🚀 Production Deployment

### Before Going Live
1. **Test Thoroughly**
   - Test on multiple websites
   - Test with different log types
   - Test error scenarios

2. **Security Review**
   - Review permissions
   - Ensure no sensitive data leakage
   - Implement rate limiting

3. **Documentation**
   - Update user documentation
   - Provide support contact
   - Create troubleshooting guide

### Distribution Options
1. **Chrome Web Store** (Recommended)
   - Submit for review
   - Automatic updates
   - User trust

2. **Direct Distribution**
   - Provide ZIP files
   - Manual installation required
   - More control over updates

## 📚 Additional Resources

### Chrome Extension Documentation
- [Chrome Extensions Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts Guide](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

### Testing Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Extension Test Page](chrome-extension/test-page.html)
- [Chrome Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

### Backend Integration Examples
- [Node.js/Express Example](https://expressjs.com/)
- [Python/Flask Example](https://flask.palletsprojects.com/)
- [Go Example](https://golang.org/)

---

## 🎯 Quick Start Checklist

- [ ] All files present in `chrome-extension/` folder
- [ ] Backend server running with required endpoints
- [ ] Extension loaded in Chrome (`chrome://extensions/`)
- [ ] Extension configured with target and backend URLs
- [ ] Logging started successfully
- [ ] Test page loads and generates logs
- [ ] Backend receives log data
- [ ] Extension icon visible in toolbar

**🎉 Congratulations! Your Chrome extension is now running and capturing console logs!**

---

*Need help? Check the troubleshooting section above or refer to the main README.md file.* 