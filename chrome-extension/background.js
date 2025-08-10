/**
 * Console Log Forwarder - Background Service Worker
 * 
 * This file serves as the background service worker for the Chrome extension.
 * It manages tab injection, content script communication, and maintains
 * the global state of the logging system.
 */

// Global state to track logging status and active tabs
let loggingState = {
  isLogging: false,
  targetUrl: null,
  backendUrl: null,
  activeTabs: new Set() // Track tabs where logging is active
};

/**
 * Initialize the extension when it's installed or updated
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Console Log Forwarder extension installed:', details.reason);
  
  // Load saved configuration
  chrome.storage.local.get(['isLogging', 'targetUrl', 'backendUrl'], (result) => {
    if (result.isLogging) {
      loggingState.isLogging = result.isLogging;
      loggingState.targetUrl = result.targetUrl;
      loggingState.backendUrl = result.backendUrl;
    }
  });
});

/**
 * Handle messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  
  switch (message.action) {
    case 'startLogging':
      handleStartLogging(message, sender, sendResponse);
      return true; // Indicates async response
      
    case 'stopLogging':
      handleStopLogging(message, sender, sendResponse);
      return true;
      
    case 'getLoggingStatus':
      handleGetLoggingStatus(message, sender, sendResponse);
      return false; // Synchronous response
      
    case 'logCaptured':
      handleLogCaptured(message, sender, sendResponse);
      return false;
      
    default:
      console.warn('Unknown message action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
      return false;
  }
});

/**
 * Handle starting logging on a specific tab
 * @param {Object} message - Message containing tabId, targetUrl, and backendUrl
 * @param {Object} sender - Information about the message sender
 * @param {Function} sendResponse - Function to send response back
 */
async function handleStartLogging(message, sender, sendResponse) {
  try {
    const { tabId, targetUrl, backendUrl } = message;
    
    // Update global state
    loggingState.isLogging = true;
    loggingState.targetUrl = targetUrl;
    loggingState.backendUrl = backendUrl;
    
    // Save configuration to storage
    await chrome.storage.local.set({
      isLogging: true,
      targetUrl,
      backendUrl
    });
    
    // Inject content script into the tab
    await injectContentScript(tabId);
    
    // Track the active tab
    loggingState.activeTabs.add(tabId);
    
    console.log(`Logging started on tab ${tabId} for URL: ${targetUrl}`);
    
    sendResponse({ success: true, message: 'Logging started successfully' });
    
  } catch (error) {
    console.error('Failed to start logging:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle stopping logging on all tabs
 * @param {Object} message - Message containing stop request
 * @param {Object} sender - Information about the message sender
 * @param {Function} sendResponse - Function to send response back
 */
async function handleStopLogging(message, sender, sendResponse) {
  try {
    // Update global state
    loggingState.isLogging = false;
    loggingState.targetUrl = null;
    loggingState.backendUrl = null;
    
    // Save configuration to storage
    await chrome.storage.local.set({ isLogging: false });
    
    // Clear active tabs tracking
    loggingState.activeTabs.clear();
    
    console.log('Logging stopped on all tabs');
    
    sendResponse({ success: true, message: 'Logging stopped successfully' });
    
  } catch (error) {
    console.error('Failed to stop logging:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle getting current logging status
 * @param {Object} message - Message requesting status
 * @param {Object} sender - Information about the message sender
 * @param {Function} sendResponse - Function to send response back
 */
function handleGetLoggingStatus(message, sender, sendResponse) {
  sendResponse({
    isLogging: loggingState.isLogging,
    targetUrl: loggingState.targetUrl,
    backendUrl: loggingState.backendUrl,
    activeTabsCount: loggingState.activeTabs.size
  });
}

/**
 * Handle logs captured from content scripts
 * @param {Object} message - Message containing captured log data
 * @param {Object} sender - Information about the message sender
 * @param {Function} sendResponse - Function to send response back
 */
async function handleLogCaptured(message, sender, sendResponse) {
  try {
    const { logData } = message;
    
    // Forward the log to the backend server
    await forwardLogToBackend(logData);
    
    sendResponse({ success: true, message: 'Log forwarded successfully' });
    
  } catch (error) {
    console.error('Failed to forward log:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Inject content script into a specific tab
 * @param {number} tabId - The ID of the tab to inject into
 */
async function injectContentScript(tabId) {
  try {
    // Check if content script is already injected
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => window.logForwarderInjected
    });
    
    if (results[0]?.result) {
      console.log(`Content script already injected in tab ${tabId}`);
      return;
    }
    
    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    
    console.log(`Content script injected into tab ${tabId}`);
    
  } catch (error) {
    console.error(`Failed to inject content script into tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * Forward captured log data to the backend server
 * @param {Object} logData - The log data to forward
 */
async function forwardLogToBackend(logData) {
  if (!loggingState.backendUrl) {
    throw new Error('Backend URL not configured');
  }
  
  try {
    const response = await fetch(`${loggingState.backendUrl}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...logData,
        timestamp: new Date().toISOString(),
        extensionId: chrome.runtime.id
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('Log forwarded to backend successfully');
    
  } catch (error) {
    console.error('Failed to forward log to backend:', error);
    throw error;
  }
}

/**
 * Handle tab updates to automatically inject content scripts when needed
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only proceed if logging is active and the tab is loading
  if (!loggingState.isLogging || changeInfo.status !== 'complete') {
    return;
  }
  
  // Check if this tab matches our target URL
  if (loggingState.targetUrl && tab.url && tab.url.startsWith(loggingState.targetUrl)) {
    console.log(`Tab ${tabId} updated and matches target URL, injecting content script`);
    
    // Inject content script with a small delay to ensure page is fully loaded
    setTimeout(() => {
      injectContentScript(tabId).catch(error => {
        console.error(`Failed to inject content script on tab update:`, error);
      });
    }, 1000);
  }
});

/**
 * Handle tab removal to clean up tracking
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  if (loggingState.activeTabs.has(tabId)) {
    loggingState.activeTabs.delete(tabId);
    console.log(`Tab ${tabId} removed from active tabs tracking`);
  }
});

/**
 * Handle extension startup to restore state
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started, restoring logging state');
  
  // Load saved configuration
  chrome.storage.local.get(['isLogging', 'targetUrl', 'backendUrl'], (result) => {
    if (result.isLogging) {
      loggingState.isLogging = result.isLogging;
      loggingState.targetUrl = result.targetUrl;
      loggingState.backendUrl = result.backendUrl;
      console.log('Logging state restored:', loggingState);
    }
  });
});

// Log that background script is running
console.log('Console Log Forwarder background script loaded and running'); 