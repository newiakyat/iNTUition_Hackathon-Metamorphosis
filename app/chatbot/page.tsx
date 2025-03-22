'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import UserChatWidget from '@/components/UserChatWidget';
import AdminChatWidget from '@/components/AdminChatWidget';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/sidebar';
import { useAuth } from "@/lib/AuthContext";
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import Link from 'next/link';

export default function ChatbotPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('user');
  
  // Set the active tab to 'admin' automatically when the user is an admin
  useEffect(() => {
    if (isAdmin) {
      console.log("User is admin, automatically selecting admin tab");
      setActiveTab('admin');
    }
  }, [isAdmin]);
  
  // Debug log to verify admin status
  useEffect(() => {
    console.log("Auth status in chatbot page:", { isAdmin, activeTab });
  }, [isAdmin, activeTab]);
  
  // Handle tab change
  const handleTabChange = (value) => {
    console.log(`Tab changing from ${activeTab} to ${value}`);
    setActiveTab(value);
  };
  
  return (
    <ProtectedRoute bypassAuthForAdmins={true}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">AI Assistants</h1>
            {isAdmin && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                Admin Mode: {isAdmin ? "Enabled" : "Disabled"}
              </div>
            )}
          </div>
          
          <Tabs 
            defaultValue={isAdmin ? "admin" : "user"} 
            value={activeTab}
            className="space-y-4"
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value="user">Change Management</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin">Change Planning</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="user">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Change Management Assistant</CardTitle>
                      <CardDescription>
                        Get help with managing change processes and implementation.
                      </CardDescription>
                    </div>
                    <Link href="/chatbot/fullscreen?mode=user">
                      <Button variant="outline" size="sm">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Full Screen
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <UserChatWidget key="user-widget" />
                </CardContent>
              </Card>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="admin">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Change Planning Assistant</CardTitle>
                        <CardDescription>
                          Advanced planning tools for organizational change management.
                        </CardDescription>
                      </div>
                      <Link href="/chatbot/fullscreen?mode=admin">
                        <Button variant="outline" size="sm">
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Full Screen
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AdminChatWidget key="admin-widget" />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
} 