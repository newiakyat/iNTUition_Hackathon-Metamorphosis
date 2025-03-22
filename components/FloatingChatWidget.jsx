'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from "@/lib/AuthContext";

// Use environment variable with fallback for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FloatingChatWidget({ isAdminMode = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAuth();
  const iframeRef = useRef(null);
  
  // Automatically use admin widget for admin users unless explicitly set to user mode
  const widgetType = (isAdminMode === false && isAdmin === true) ? 'admin' : (isAdminMode ? 'admin' : 'user');
  
  // Debug log
  useEffect(() => {
    console.log("Floating chat widget state:", { isAdmin, widgetType, isAdminMode });
  }, [isAdmin, widgetType, isAdminMode]);
  
  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };
  
  useEffect(() => {
    // Set up message event listener for streamed responses from the iframe
    const handleIframeMessages = (event) => {
      // Only process messages from our chat widget
      if (event.origin === API_URL) {
        const { type, data } = event.data || {};
        
        if (type === 'STREAM_RESPONSE') {
          // Widget already handles streaming internally
          console.log('Floating widget received streamed chunk:', data);
        }
      }
    };
    
    window.addEventListener('message', handleIframeMessages);
    
    return () => {
      window.removeEventListener('message', handleIframeMessages);
    };
  }, []);
  
  // Initialize the widget when it's loaded
  const handleIframeLoad = () => {
    if (iframeRef.current && isOpen) {
      // Send initialization message to the iframe
      iframeRef.current.contentWindow.postMessage({
        type: 'INIT_WIDGET',
        data: {
          streamResponses: true,
          theme: 'light', // Can be dynamically set
          adminMode: widgetType === 'admin',
          floating: true,
          assistantType: widgetType === 'admin' ? 'changePlanning' : 'changeManagement',
        }
      }, API_URL);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-background rounded-lg shadow-xl overflow-hidden w-[350px] h-[500px] flex flex-col border border-border">
          <div className="bg-primary p-2 flex justify-between items-center">
            <h3 className="text-primary-foreground font-medium">
              {widgetType === 'admin' ? 'Change Planning Assistant' : 'Change Management Assistant'}
            </h3>
            <button 
              onClick={toggleWidget} 
              className="text-primary-foreground hover:bg-primary/80 rounded-full p-1"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1">
            <iframe 
              ref={iframeRef}
              src={`${API_URL}/widgets/${widgetType}-widget.html?stream=true&floating=true&assistantType=${widgetType === 'admin' ? 'changePlanning' : 'changeManagement'}`}
              className="w-full h-full border-none"
              title={`${widgetType === 'admin' ? 'Change Planning' : 'Change Management'} Assistant`}
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      ) : (
        <button 
          onClick={toggleWidget}
          className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
} 