'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Use environment variable with fallback for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FullScreenChatPage() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get('mode') || (isAdmin ? 'admin' : 'user');
  const iframeRef = useRef(null);
  
  // Determine which widget to show
  const [widgetType, setWidgetType] = useState(isAdmin ? 'admin' : 'user');
  
  useEffect(() => {
    console.log("Fullscreen page initialized with:", { isAdmin, requestedMode, widgetType });
    
    // Auto-select admin widget for admin users unless they specifically requested user mode
    if (isAdmin && requestedMode !== 'user') {
      setWidgetType('admin');
    } else if (requestedMode === 'admin' && isAdmin) {
      setWidgetType('admin');
    } else {
      setWidgetType('user');
    }
    
    // Set up message event listener for streamed responses from the iframe
    const handleIframeMessages = (event) => {
      // Only process messages from our chat widget
      if (event.origin === API_URL) {
        const { type, data } = event.data || {};
        
        if (type === 'STREAM_RESPONSE') {
          // Widget already handles streaming internally
          console.log('Fullscreen widget received streamed chunk:', data);
        }
      }
    };
    
    window.addEventListener('message', handleIframeMessages);
    
    return () => {
      window.removeEventListener('message', handleIframeMessages);
    };
  }, [requestedMode, isAdmin]);
  
  // Initialize widget when loaded
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      // Send initialization message to the iframe
      iframeRef.current.contentWindow.postMessage({
        type: 'INIT_WIDGET',
        data: {
          streamResponses: true,
          theme: 'light', // Can be dynamically set
          adminMode: widgetType === 'admin',
          fullscreen: true,
          assistantType: widgetType === 'admin' ? 'changePlanning' : 'changeManagement',
        }
      }, API_URL);
    }
  };
  
  return (
    <ProtectedRoute bypassAuthForAdmins={true}>
      <div className="flex flex-col h-screen bg-background">
        <header className="border-b border-border p-4 flex items-center">
          <Link href="/chatbot">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            {widgetType === 'admin' ? 'Change Planning Assistant' : 'Change Management Assistant'}
          </h1>
          {isAdmin && (
            <div className="ml-auto text-sm text-muted-foreground bg-muted p-2 rounded">
              Admin Mode: Active
            </div>
          )}
        </header>
        <main className="flex-1 overflow-hidden">
          <iframe 
            ref={iframeRef}
            src={`${API_URL}/widgets/${widgetType}-widget.html?stream=true&fullscreen=true&assistantType=${widgetType === 'admin' ? 'changePlanning' : 'changeManagement'}`}
            className="w-full h-full border-none"
            title={`${widgetType === 'admin' ? 'Change Planning' : 'Change Management'} Assistant`}
            onLoad={handleIframeLoad}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
} 