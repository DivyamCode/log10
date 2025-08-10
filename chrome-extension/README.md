# Console Log Forwarder - Chrome Extension

A powerful Chrome extension that captures console logs from web pages and forwards them to your backend server in real-time. Perfect for debugging, monitoring, and logging web applications.

## 🚀 Features

- **Real-time Log Capture**: Intercepts all console methods (log, error, warn, info, debug, etc.)
- **Automatic Session Tracking**: Generates unique session IDs for each page load
- **Comprehensive Error Handling**: Captures uncaught errors and unhandled promise rejections
- **Flexible Configuration**: Easy setup for target URLs and backend endpoints
- **Non-intrusive**: Maintains original console functionality while adding forwarding
- **Modern UI**: Clean, responsive popup interface
- **Persistent State**: Remembers configuration across browser sessions

## 📋 Requirements

- Chrome browser (version 88+)
- Backend server with the following API endpoints:
  - `POST /log` - Receive new logs
  - `GET /logs` - Return latest logs  
  - `GET /logs/:session` - Filter by session

## 🛠️ Installation

### 1. Download the Extension

Clone or download this repository to your local machine.

### 2. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load Unpacked"**
4. Select the `chrome-extension` folder from this repository
5. The extension should now appear in your extensions list

### 3. Configure the Extension

1. Click the extension icon in your Chrome toolbar
2. Enter the **Target URL** (e.g., `http://localhost:3000`) - the website you want to monitor
3. Enter the **Backend Server URL** (e.g., `http://localhost:4000`) - your logging server
4. Click **"Start Logging"**

## 📖 Usage

### Starting Log Monitoring

1. **Configure URLs**: Set both target and backend URLs in the popup
2. **Start Logging**: Click "Start Logging" to begin monitoring
3. **Navigate to Target**: Visit the target URL in any tab
4. **Automatic Injection**: The extension automatically injects monitoring scripts
5. **Real-time Forwarding**: All console logs are captured and sent to your backend

### Stopping Log Monitoring

- Click **"Stop Logging"** in the extension popup
- This will stop monitoring on all tabs

### What Gets Captured

The extension captures:

- **Console Methods**: `console.log()`, `console.error()`, `console.warn()`, `console.info()`, `console.debug()`
- **Timing Methods**: `console.time()`, `console.timeEnd()`
- **Grouping Methods**: `console.group()`, `console.groupEnd()`
- **Error Events**: Uncaught JavaScript errors
- **Promise Rejections**: Unhandled promise rejections
- **Page Events**: Page load events with session tracking

### Log Data Structure

Each captured log includes:

```json
{
  "level": "log",
  "message": "User clicked submit button",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "sessionId": "session_1705312200000_abc123def",
  "pageUrl": "http://localhost:3000/dashboard",
  "pageTitle": "Dashboard - My App",
  "userAgent": "Mozilla/5.0...",
  "referrer": "http://localhost:3000/login",
  "stackTrace": "Error stack trace...",
  "logLevel": "log",
  "extensionId": "extension_id_here"
}
```

## 🔧 Configuration

### Backend API Endpoints

Your backend should implement these endpoints:

#### `POST /log`
Receives individual log entries.

**Request Body:**
```json
{
  "level": "error",
  "message": "API request failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "sessionId": "session_1705312200000_abc123def",
  "pageUrl": "http://localhost:3000/api/users",
  "pageTitle": "User Management",
  "userAgent": "Mozilla/5.0...",
  "referrer": "http://localhost:3000/dashboard",
  "stackTrace": "Error: Request failed...",
  "logLevel": "error"
}
```

**Response:** HTTP 200 OK

#### `GET /logs`
Returns the latest logs (optional pagination).

**Query Parameters:**
- `limit` (optional): Number of logs to return
- `level` (optional): Filter by log level
- `sessionId` (optional): Filter by session

**Response:**
```json
{
  "logs": [...],
  "total": 150,
  "hasMore": true
}
```

#### `GET /logs/:session`
Returns logs for a specific session.

**Response:**
```json
{
  "sessionId": "session_1705312200000_abc123def",
  "logs": [...],
  "total": 25,
  "startTime": "2024-01-15T10:30:00.000Z",
  "endTime": "2024-01-15T10:45:00.000Z"
}
```

## 🏗️ Architecture

### File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.js              # Popup logic
├── background.js         # Background service worker
├── content.js            # Content script (injected into pages)
├── icons/                # Extension icons
└── README.md             # This file
```

### Component Overview

1. **Popup (`popup.html` + `popup.js`)**
   - User interface for configuration
   - Start/stop logging controls
   - Configuration persistence

2. **Background Script (`background.js`)**
   - Service worker for background tasks
   - Tab management and script injection
   - Communication with backend server
   - State management

3. **Content Script (`content.js`)**
   - Injected into monitored web pages
   - Console method interception
   - Log capture and forwarding
   - Error event handling

### Data Flow

```
Web Page → Content Script → Background Script → Backend Server
    ↓              ↓              ↓              ↓
Console Log → Intercept → Process & Format → HTTP POST
```

## 🧪 Testing

### Manual Testing

1. **Load Extension**: Follow installation steps above
2. **Configure URLs**: Set target and backend URLs
3. **Start Logging**: Click "Start Logging"
4. **Test Console**: Open target URL and use console methods
5. **Verify Backend**: Check your backend for received logs

### Test Console Commands

```javascript
// Basic logging
console.log('Hello World');
console.error('This is an error');
console.warn('This is a warning');

// Objects and arrays
console.log({ user: 'John', age: 30 });
console.table(['apple', 'banana', 'orange']);

// Timing
console.time('api-call');
setTimeout(() => console.timeEnd('api-call'), 1000);

// Groups
console.group('User Actions');
console.log('User clicked button');
console.log('Form submitted');
console.groupEnd();
```

## 🚨 Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Ensure Developer Mode is enabled
   - Check for syntax errors in console
   - Verify all files are present

2. **Logs Not Being Captured**
   - Check if logging is started
   - Verify target URL matches current page
   - Check browser console for errors

3. **Backend Not Receiving Logs**
   - Verify backend URL is correct
   - Check CORS settings on backend
   - Ensure backend endpoints are working

4. **Performance Issues**
   - Check if multiple instances are running
   - Monitor network tab for failed requests
   - Consider rate limiting on backend

### Debug Mode

Enable debug logging by checking the browser console:
- Background script logs appear in extension page console
- Content script logs appear in the monitored page console

## 🔒 Security Considerations

- **Permissions**: Extension requires broad permissions for functionality
- **Data Privacy**: Logs may contain sensitive information
- **CORS**: Backend must allow requests from extension
- **Rate Limiting**: Consider implementing rate limiting on backend

## 📝 Development

### Building from Source

1. Clone the repository
2. Make changes to source files
3. Reload extension in Chrome
4. Test changes

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

For issues, questions, or contributions:

1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information
4. Include browser version, extension version, and error messages

## 🔄 Version History

- **v1.0.0**: Initial release with basic console log forwarding
- Comprehensive console method coverage
- Session tracking and error handling
- Modern UI and configuration management

---

**Happy Logging! 🎉** 