'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Department } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/sidebar';

// Map of department codes to full names
const departmentNames = {
  'RD': 'Research & Development',
  'IT': 'IT & Digital Data',
  'SALES': 'Sales',
  'MARKETING': 'Marketing',
  'ENGINEERING': 'Engineering',
  'SUPPLY': 'Supply Chain',
  'MANUFACTURING': 'Manufacturing',
  'HR': 'Human Resources'
};

export default function SettingsPage() {
  const { user, isAdmin, isLoading, updateUserDepartment } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(
    user?.department
  );
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Update selectedDepartment when user data changes
  useEffect(() => {
    if (user?.department) {
      console.log("User department loaded:", user.department);
      setSelectedDepartment(user.department);
    }
  }, [user]);

  // Get the user's initials for the avatar
  const getInitials = () => {
    const email = user?.email || '';
    return email.substring(0, 2).toUpperCase();
  };

  const handleSaveSettings = async () => {
    if (!selectedDepartment || !user) {
      toast({
        title: "Error",
        description: "Unable to update: No department selected or user not logged in.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Attempting to update department from ${user.department} to ${selectedDepartment}`);
    setIsSaving(true);
    try {
      const result = await updateUserDepartment(selectedDepartment);
      if (result.error) {
        console.error("Error updating department:", result.error);
        toast({
          title: "Update Failed",
          description: `Failed to update department: ${result.error}`,
          variant: "destructive",
        });
      } else {
        console.log("Department updated successfully");
        toast({
          title: "Success",
          description: `Your department has been updated to ${departmentNames[selectedDepartment]}.`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Exception during update:", errorMessage);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading...</p>
              </div>
            ) : (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{user?.email}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {isAdmin ? (
                            <Badge>Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your department and other settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Department</h3>
                      <p className="text-sm text-muted-foreground">
                        Select which department you belong to
                      </p>
                      <Select
                        value={selectedDepartment}
                        onValueChange={(value) => setSelectedDepartment(value as Department)}
                      >
                        <SelectTrigger className="w-full md:w-[280px]">
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Departments</SelectLabel>
                            <SelectItem value="RD">Research & Development</SelectItem>
                            <SelectItem value="IT">IT & Digital Data</SelectItem>
                            <SelectItem value="SALES">Sales</SelectItem>
                            <SelectItem value="MARKETING">Marketing</SelectItem>
                            <SelectItem value="ENGINEERING">Engineering</SelectItem>
                            <SelectItem value="SUPPLY">Supply Chain</SelectItem>
                            <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Account Created</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={handleSaveSettings} 
                      disabled={isSaving || !selectedDepartment || selectedDepartment === user?.department}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 