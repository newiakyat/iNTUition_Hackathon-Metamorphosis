/**
 * Widget Initialization Script
 * This script preloads and initializes all widget-related resources
 * during server startup to reduce user-facing load times.
 */

// The API_URL might be different during initialization vs runtime
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Cache to store preloaded content
let widgetCache = {
  user: null,
  admin: null,
  initialized: false,
  lastUpdated: null
};

/**
 * Preloads widget HTML content and caches it
 */
async function preloadWidgetContent() {
  console.log('Preloading widget content from API server...');
  
  try {
    // First, check if the server is available
    const statusResponse = await fetch(`${API_URL}/api/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!statusResponse.ok) {
      console.error('API server is not available, cannot preload widgets');
      return false;
    }
    
    // Preload user widget with change management type
    const userWidgetResponse = await fetch(`${API_URL}/widgets/user-widget.html?assistantType=changeManagement`);
    if (userWidgetResponse.ok) {
      widgetCache.user = await userWidgetResponse.text();
    } else {
      console.error('Failed to preload change management assistant widget');
    }
    
    // Preload admin widget with change planning type
    const adminWidgetResponse = await fetch(`${API_URL}/widgets/admin-widget.html?assistantType=changePlanning`);
    if (adminWidgetResponse.ok) {
      widgetCache.admin = await adminWidgetResponse.text();
    } else {
      console.error('Failed to preload change planning assistant widget');
    }
    
    // Warm up the LLM by sending a simple query
    await fetch(`${API_URL}/api/warmup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        action: 'warmup',
        assistantTypes: ['changeManagement', 'changePlanning']
      })
    });
    
    widgetCache.initialized = true;
    widgetCache.lastUpdated = new Date();
    
    console.log('Widget content preloaded successfully');
    return true;
  } catch (error) {
    console.error('Error preloading widget content:', error);
    return false;
  }
}

/**
 * Returns the cached widget content or null if not available
 */
function getCachedWidget(type) {
  if (!widgetCache.initialized) return null;
  
  return type === 'admin' ? widgetCache.admin : widgetCache.user;
}

/**
 * Initializes widgets and returns the cache status
 */
async function initializeWidgets() {
  // Only initialize once
  if (!widgetCache.initialized) {
    await preloadWidgetContent();
  }
  
  return {
    initialized: widgetCache.initialized,
    lastUpdated: widgetCache.lastUpdated
  };
}

/**
 * Refreshes the widget cache
 */
async function refreshWidgetCache() {
  await preloadWidgetContent();
  return widgetCache.initialized;
}

export {
  initializeWidgets,
  getCachedWidget,
  refreshWidgetCache
}; 