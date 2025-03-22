'use client';

import { useEffect, useRef, useState } from 'react';

// Use environment variable with fallback for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminChatWidget() {
  const iframeRef = useRef(null);
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxRetries = 3;
  
  useEffect(() => {
    // Check if the server is available
    const checkServerAvailability = async () => {
      try {
        console.log(`Checking server availability at ${API_URL}/api/status`);
        const response = await fetch(`${API_URL}/api/status`, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000) 
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Server connection successful:', data);
          setIsServerAvailable(true);
        } else {
          console.error(`Server returned status: ${response.status}`);
          setIsServerAvailable(false);
          
          // Retry connection if we haven't exceeded max retries
          if (connectionAttempts < maxRetries) {
            setTimeout(() => {
              setConnectionAttempts(prev => prev + 1);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking server availability:', error);
        setIsServerAvailable(false);
        
        // Retry connection if we haven't exceeded max retries
        if (connectionAttempts < maxRetries) {
          setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkServerAvailability();
    
    // Set up message event listener for streamed responses from the iframe
    const handleIframeMessages = (event) => {
      // Check if the message is from our domain or the API domain
      if (event.origin === API_URL || event.origin === window.location.origin) {
        const { type, data } = event.data || {};
        
        if (type === 'STREAM_RESPONSE') {
          // Handle streamed response chunk here
          console.log('Received streamed admin chunk:', data);
        } else if (type === 'CONNECTION_ERROR') {
          console.error('Connection error from admin widget:', data);
          setIsServerAvailable(false);
        }
      }
    };
    
    window.addEventListener('message', handleIframeMessages);
    
    return () => {
      window.removeEventListener('message', handleIframeMessages);
    };
  }, [connectionAttempts]);
  
  // Function to initialize the widget once loaded
  const handleIframeLoad = () => {
    if (iframeRef.current && isServerAvailable) {
      // Send initialization message to the iframe
      const initData = {
        type: 'INIT_WIDGET',
        data: {
          streamResponses: true,
          theme: 'light',
          adminMode: true,
          assistantType: 'changePlanning', // Now properly supported by the backend
        }
      };
      
      // Send initialization message to the iframe
      iframeRef.current.contentWindow.postMessage(initData, '*');
    }
  };
  
  if (isLoading) {
    return (
      <div className="chat-widget-container flex justify-center items-center" style={{ width: '100%', height: '500px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading Change Planning Assistant...</p>
        </div>
      </div>
    );
  }
  
  if (!isServerAvailable) {
    return (
      <div className="chat-widget-container flex justify-center items-center" style={{ width: '100%', height: '500px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="font-medium text-lg mb-2">Cannot connect to Change Planning Assistant</h3>
          <p className="text-muted-foreground mb-4">The Change Planning Assistant is currently unavailable. Please try again later.</p>
          <button 
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => window.location.reload(), 500);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Set up iframe source
  const iframeSrc = `${API_URL}/widgets/admin-widget.html?stream=true&assistantType=changePlanning`;
  
  return (
    <div className="chat-widget-container" style={{ width: '100%', height: '500px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <iframe 
        ref={iframeRef}
        src={iframeSrc}
        width="100%" 
        height="100%" 
        frameBorder="0"
        title="Change Planning Assistant"
        style={{ border: 'none' }}
        onLoad={handleIframeLoad}
        onError={() => setIsServerAvailable(false)}
      />
    </div>
  );
} 