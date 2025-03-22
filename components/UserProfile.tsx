'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, ChevronDown, Briefcase } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

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

export default function UserProfile() {
  const { user, isAdmin, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.push('/auth/login');
    setIsLoggingOut(false);
  };

  // Get the user's initials for the avatar
  const getInitials = () => {
    const email = user.email || '';
    return email.substring(0, 2).toUpperCase();
  };

  // Get department full name
  const getDepartmentName = () => {
    return user.department ? departmentNames[user.department] : 'No Department';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <div className="flex flex-col mt-1 gap-1">
              {isAdmin ? (
                <Badge variant="outline" className="text-xs">Admin</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">User</Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                <span>{getDepartmentName()}</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 