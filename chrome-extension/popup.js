/**
 * Console Log Forwarder - Popup Logic
 * 
 * This file handles the popup interface logic for the Chrome extension.
 * It manages user input, configuration storage, and communication with
 * background scripts to start/stop log monitoring.
 */

// DOM Elements
const targetUrlInput = document.getElementById('targetUrl');
const backendUrlInput = document.getElementById('backendUrl');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');

/**
 * Utility function to show status messages to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of status (success, error, info)
 * @param {number} duration - How long to show the message (in ms)
 */
function showStatus(message, type = 'info', duration = 3000) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  if (duration > 0) {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, duration);
  }
}

/**
 * Utility function to validate URLs
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load saved configuration from Chrome storage
 */
async function loadConfiguration() {
  try {
    const result = await chrome.storage.local.get(['targetUrl', 'backendUrl', 'isLogging']);
    
    if (result.targetUrl) {
      targetUrlInput.value = result.targetUrl;
    }
    
    if (result.backendUrl) {
      backendUrlInput.value = result.backendUrl;
    }
    
    // Update button states based on current logging status
    updateButtonStates(result.isLogging || false);
  } catch (error) {
    console.error('Failed to load configuration:', error);
    showStatus('Failed to load saved configuration', 'error');
  }
}

/**
 * Save configuration to Chrome storage
 * @param {Object} config - Configuration object to save
 */
async function saveConfiguration(config) {
  try {
    await chrome.storage.local.set(config);
  } catch (error) {
    console.error('Failed to save configuration:', error);
    throw error;
  }
}

/**
 * Update button states based on logging status
 * @param {boolean} isLogging - Whether logging is currently active
 */
function updateButtonStates(isLogging) {
  if (isLogging) {
    startBtn.disabled = true;
    startBtn.textContent = 'Logging Active';
    stopBtn.disabled = false;
    stopBtn.textContent = 'Stop Logging';
  } else {
    startBtn.disabled = false;
    startBtn.textContent = 'Start Logging';
    stopBtn.disabled = true;
    stopBtn.textContent = 'Stop Logging';
  }
}

/**
 * Start logging on the current active tab
 */
async function startLogging() {
  const targetUrl = targetUrlInput.value.trim();
  const backendUrl = backendUrlInput.value.trim();
  
  // Validate inputs
  if (!targetUrl || !backendUrl) {
    showStatus('Please enter both target URL and backend URL', 'error');
    return;
  }
  
  if (!isValidUrl(targetUrl)) {
    showStatus('Please enter a valid target URL', 'error');
    return;
  }
  
  if (!isValidUrl(backendUrl)) {
    showStatus('Please enter a valid backend URL', 'error');
    return;
  }
  
  try {
    // Save configuration
    await saveConfiguration({ targetUrl, backendUrl, isLogging: true });
    
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Send message to background script to start logging
    await chrome.runtime.sendMessage({
      action: 'startLogging',
      tabId: tab.id,
      targetUrl,
      backendUrl
    });
    
    showStatus('Logging started successfully!', 'success');
    updateButtonStates(true);
    
    // Close popup after successful start
    setTimeout(() => {
      window.close();
    }, 1000);
    
  } catch (error) {
    console.error('Failed to start logging:', error);
    showStatus('Failed to start logging: ' + error.message, 'error');
  }
}

/**
 * Stop logging on all tabs
 */
async function stopLogging() {
  try {
    // Send message to background script to stop logging
    await chrome.runtime.sendMessage({
      action: 'stopLogging'
    });
    
    // Update local storage
    await saveConfiguration({ isLogging: false });
    
    showStatus('Logging stopped successfully!', 'success');
    updateButtonStates(false);
    
  } catch (error) {
    console.error('Failed to stop logging:', error);
    showStatus('Failed to stop logging: ' + error.message, 'error');
  }
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
  event.preventDefault();
  startLogging();
}

/**
 * Initialize the popup when it loads
 */
async function initialize() {
  try {
    // Load saved configuration
    await loadConfiguration();
    
    // Add event listeners
    startBtn.addEventListener('click', startLogging);
    stopBtn.addEventListener('click', stopLogging);
    
    // Handle form submission (Enter key)
    targetUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        startLogging();
      }
    });
    
    backendUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        startLogging();
      }
    });
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'loggingStatus') {
        updateButtonStates(message.isLogging);
      }
    });
    
    // Request current logging status from background script
    chrome.runtime.sendMessage({ action: 'getLoggingStatus' });
    
  } catch (error) {
    console.error('Failed to initialize popup:', error);
    showStatus('Failed to initialize popup', 'error');
  }
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startLogging,
    stopLogging,
    isValidUrl,
    showStatus
  };
} 