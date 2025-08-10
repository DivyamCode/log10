/**
 * Console Log Forwarder - Content Script
 * 
 * This file is injected into web pages to capture console logs and forward
 * them to the background script, which then sends them to the backend server.
 * 
 * The script overrides the console methods to intercept all log calls and
 * maintains the original console functionality while adding forwarding capabilities.
 */

(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.logForwarderInjected) {
    console.log('Console Log Forwarder already injected, skipping...');
    return;
  }
  
  // Mark as injected
  window.logForwarderInjected = true;
  
  // Configuration and state
  let config = {
    targetUrl: null,
    backendUrl: null,
    isActive: false,
    sessionId: generateSessionId(),
    pageLoadTime: new Date().toISOString()
  };
  
  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    trace: console.trace,
    group: console.group,
    groupEnd: console.groupEnd,
    groupCollapsed: console.groupCollapsed,
    time: console.time,
    timeEnd: console.timeEnd,
    timeLog: console.timeLog,
    count: console.count,
    countReset: console.countReset,
    clear: console.clear,
    dir: console.dir,
    dirxml: console.dirxml,
    table: console.table,
    assert: console.assert
  };
  
  /**
   * Generate a unique session ID for this page load
   * @returns {string} A unique session identifier
   */
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Initialize the content script by loading configuration
   */
  async function initialize() {
    try {
      // Get configuration from background script
      const response = await chrome.runtime.sendMessage({
        action: 'getLoggingStatus'
      });
      
      if (response && response.isLogging) {
        config.targetUrl = response.targetUrl;
        config.backendUrl = response.backendUrl;
        config.isActive = true;
        
        console.log('Console Log Forwarder initialized successfully');
        console.log('Target URL:', config.targetUrl);
        console.log('Session ID:', config.sessionId);
        
        // Start monitoring
        startMonitoring();
      } else {
        console.log('Console Log Forwarder: Logging not active');
      }
      
    } catch (error) {
      console.error('Failed to initialize Console Log Forwarder:', error);
    }
  }
  
  /**
   * Start monitoring console logs
   */
  function startMonitoring() {
    if (!config.isActive) {
      return;
    }
    
    // Override console methods
    overrideConsoleMethods();
    
    // Capture uncaught errors
    captureUncaughtErrors();
    
    // Capture unhandled promise rejections
    captureUnhandledRejections();
    
    // Log page load event
    capturePageLoadEvent();
    
    console.log('Console Log Forwarder: Monitoring started');
  }
  
  /**
   * Override console methods to capture logs
   */
  function overrideConsoleMethods() {
    // Override basic logging methods
    console.log = function(...args) {
      captureLog('log', args);
      originalConsole.log.apply(console, args);
    };
    
    console.error = function(...args) {
      captureLog('error', args);
      originalConsole.error.apply(console, args);
    };
    
    console.warn = function(...args) {
      captureLog('warn', args);
      originalConsole.warn.apply(console, args);
    };
    
    console.info = function(...args) {
      captureLog('info', args);
      originalConsole.info.apply(console, args);
    };
    
    console.debug = function(...args) {
      captureLog('debug', args);
      originalConsole.debug.apply(console, args);
    };
    
    // Override timing methods
    console.time = function(label) {
      captureLog('time', [label]);
      originalConsole.time.apply(console, arguments);
    };
    
    console.timeEnd = function(label) {
      captureLog('timeEnd', [label]);
      originalConsole.timeEnd.apply(console, arguments);
    };
    
    // Override grouping methods
    console.group = function(...args) {
      captureLog('group', args);
      originalConsole.group.apply(console, args);
    };
    
    console.groupEnd = function() {
      captureLog('groupEnd', []);
      originalConsole.groupEnd.apply(console, arguments);
    };
    
    // Override other methods that might be useful
    console.trace = function(...args) {
      captureLog('trace', args);
      originalConsole.trace.apply(console, args);
    };
    
    console.assert = function(condition, ...args) {
      if (!condition) {
        captureLog('assert', args);
      }
      originalConsole.assert.apply(console, arguments);
    };
  }
  
  /**
   * Capture console log calls and forward them
   * @param {string} level - The log level (log, error, warn, info, debug, etc.)
   * @param {Array} args - The arguments passed to the console method
   */
  function captureLog(level, args) {
    if (!config.isActive) {
      return;
    }
    
    try {
      // Create log data object
      const logData = {
        level: level,
        message: serializeArguments(args),
        timestamp: new Date().toISOString(),
        sessionId: config.sessionId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        stackTrace: getStackTrace(),
        logLevel: level
      };
      
      // Forward to background script
      forwardLogToBackground(logData);
      
    } catch (error) {
      // Fallback to original console to avoid infinite loops
      originalConsole.error('Console Log Forwarder: Failed to capture log:', error);
    }
  }
  
  /**
   * Serialize console arguments to a readable string
   * @param {Array} args - The arguments to serialize
   * @returns {string} Serialized arguments as a string
   */
  function serializeArguments(args) {
    try {
      return args.map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        
        if (typeof arg === 'object') {
          try {
            // Try to stringify with circular reference handling
            return JSON.stringify(arg, getCircularReplacer());
          } catch {
            // Fallback to toString or object representation
            return arg.toString ? arg.toString() : '[Object]';
          }
        }
        
        return String(arg);
      }).join(' ');
    } catch (error) {
      return '[Error serializing arguments]';
    }
  }
  
  /**
   * Get a circular reference replacer for JSON.stringify
   * @returns {Function} A replacer function that handles circular references
   */
  function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    };
  }
  
  /**
   * Get current stack trace
   * @returns {string} Current stack trace or empty string
   */
  function getStackTrace() {
    try {
      const error = new Error();
      return error.stack || '';
    } catch {
      return '';
    }
  }
  
  /**
   * Forward log data to the background script
   * @param {Object} logData - The log data to forward
   */
  function forwardLogToBackground(logData) {
    try {
      chrome.runtime.sendMessage({
        action: 'logCaptured',
        logData: logData
      }).catch(error => {
        // Silently handle errors to avoid console spam
        console.debug('Console Log Forwarder: Failed to forward log:', error);
      });
    } catch (error) {
      // Fallback for when chrome.runtime is not available
      console.debug('Console Log Forwarder: Runtime not available for forwarding');
    }
  }
  
  /**
   * Capture uncaught errors
   */
  function captureUncaughtErrors() {
    window.addEventListener('error', (event) => {
      const logData = {
        level: 'error',
        message: `Uncaught Error: ${event.message}`,
        timestamp: new Date().toISOString(),
        sessionId: config.sessionId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        stackTrace: event.error?.stack || '',
        logLevel: 'error',
        errorType: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      };
      
      forwardLogToBackground(logData);
    });
  }
  
  /**
   * Capture unhandled promise rejections
   */
  function captureUnhandledRejections() {
    window.addEventListener('unhandledrejection', (event) => {
      const logData = {
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        sessionId: config.sessionId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        stackTrace: event.reason?.stack || '',
        logLevel: 'error',
        errorType: 'unhandledRejection',
        promise: event.promise
      };
      
      forwardLogToBackground(logData);
    });
  }
  
  /**
   * Capture page load event
   */
  function capturePageLoadEvent() {
    const logData = {
      level: 'info',
      message: 'Page loaded - Console Log Forwarder active',
      timestamp: new Date().toISOString(),
      sessionId: config.sessionId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      logLevel: 'info',
      eventType: 'pageLoad'
    };
    
    forwardLogToBackground(logData);
  }
  
  /**
   * Cleanup function to restore original console methods
   */
  function cleanup() {
    // Restore original console methods
    Object.keys(originalConsole).forEach(key => {
      if (console[key] !== originalConsole[key]) {
        console[key] = originalConsole[key];
      }
    });
    
    // Remove event listeners
    window.removeEventListener('error', captureUncaughtErrors);
    window.removeEventListener('unhandledrejection', captureUnhandledRejections);
    
    config.isActive = false;
    console.log('Console Log Forwarder: Cleanup completed');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
  
  // Expose cleanup function globally for manual cleanup if needed
  window.logForwarderCleanup = cleanup;
  
  // Log successful injection
  console.log('Console Log Forwarder content script injected successfully');
  
})(); 