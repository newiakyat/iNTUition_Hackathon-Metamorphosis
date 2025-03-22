'use client';

import { useEffect, useState } from 'react';
import { initializeWidgets } from '@/utils/initializeWidgets';

// This is a hidden component that initializes widgets during app startup
export default function WidgetInitializer() {
  const [initStatus, setInitStatus] = useState({
    initialized: false,
    error: null,
    startTime: Date.now(),
  });

  useEffect(() => {
    // Flag to prevent double initialization
    let isMounted = true;
    
    async function initialize() {
      try {
        // Wait for the page to be fully loaded
        if (typeof window !== 'undefined' && document.readyState === 'complete') {
          runInitialization();
        } else {
          // If the page isn't fully loaded, wait for the load event
          window.addEventListener('load', runInitialization, { once: true });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error initializing widgets:', error);
          setInitStatus(prev => ({ ...prev, error: error.message }));
        }
      }
    }
    
    async function runInitialization() {
      if (!isMounted) return;
      
      console.log('Starting widget initialization...');
      try {
        // Perform the actual initialization
        const result = await initializeWidgets();
        
        if (isMounted) {
          const duration = Date.now() - initStatus.startTime;
          console.log(`Widget initialization completed in ${duration}ms`);
          setInitStatus(prev => ({ 
            ...prev, 
            initialized: result.initialized,
            duration
          }));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error during widget initialization:', error);
          setInitStatus(prev => ({ ...prev, error: error.message }));
        }
      }
    }
    
    // Start initialization
    initialize();
    
    // Cleanup function to prevent memory leaks and double initialization
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', runInitialization);
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
} 