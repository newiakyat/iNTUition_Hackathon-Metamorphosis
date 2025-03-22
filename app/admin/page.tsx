'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrowserClient } from '@supabase/ssr';
import { Shield, Users, FileText, BarChart, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // The admin.listUsers API isn't available with the anon key
      // Use fallback mock data instead
      setUsers([
        { id: 1, email: 'user1@example.com', role: 'user', lastLogin: '2023-11-15' },
        { id: 2, email: 'admin@admin.com', role: 'admin', lastLogin: '2023-11-16' },
        { id: 3, email: 'user2@example.com', role: 'user', lastLogin: '2023-11-14' },
      ]);
    } catch (error) {
      console.error('Error:', error);
      // Fallback mock data
      setUsers([
        { id: 1, email: 'user1@example.com', role: 'user', lastLogin: '2023-11-15' },
        { id: 2, email: 'admin@admin.com', role: 'admin', lastLogin: '2023-11-16' },
        { id: 3, email: 'user2@example.com', role: 'user', lastLogin: '2023-11-14' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield size={16} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart size={16} />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and their roles in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={fetchUsers}
                  disabled={loading}
                  className="mb-4"
                >
                  {loading ? 'Loading...' : 'Fetch Users'}
                </Button>
                
                {users.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Last Login
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.role || 'user'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.lastLogin || 'Never'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Dashboard</CardTitle>
                <CardDescription>
                  Monitor system security and access attempts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-500">Secure</p>
                      <p className="text-xs text-muted-foreground">
                        Last scan: 2 hours ago
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        Failed Logins
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-xs text-muted-foreground">
                        Last 24 hours
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        Active Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">
                        Currently online
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Reports</CardTitle>
                <CardDescription>
                  Access and generate system-wide reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    User Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    System Performance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Security Audit Log
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="default">Generate New Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
} 