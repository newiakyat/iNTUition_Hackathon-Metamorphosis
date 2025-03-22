"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mail,
  MessageCircle,
  HelpCircle,
  Settings,
  Home,
  LayoutDashboard,
  Users,
  BarChart3,
  ShieldCheck,
  Layers,
  FileText,
  LogOut,
  Box,
  Code,
  Cog,
  FileX,
  FolderKanban,
  LineChart,
  Rocket,
  BookOpen,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from "next/image";

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  
  useEffect(() => {
    if (user && user.department) {
      setUserDepartment(user.department);
    }
  }, [user, user?.department]);

  // Function to get department name from code
  const getDepartmentName = (code: string | null) => {
    if (!code) return "Not assigned";
    
    switch (code) {
      case "engineering":
        return "Engineering";
      case "marketing":
        return "Marketing";
      case "finance":
        return "Finance";
      case "hr":
        return "Human Resources";
      default:
        return code.charAt(0).toUpperCase() + code.slice(1);
    }
  };

  // Define navigation items
  const navItems = [
    {
      href: '/',
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: '/chatbot',
      title: 'AI Assistant',
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: '/quiz',
      title: 'AI Skills Quiz',
      icon: <Brain className="h-5 w-5" />,
      adminHide: true,
    },
    {
      href: '/resources',
      title: 'Resources',
      icon: <BookOpen className="h-5 w-5" />,
      adminHide: true,
    },
    {
      href: '/settings',
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  // Admin-specific navigation items
  const adminNavItems = [
    {
      href: '/admin/resources',
      title: 'Resources',
      icon: <BookOpen className="h-5 w-5" />,
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    // Force navigation to login page after sign out
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <div 
      className="bg-card border-r border-border h-screen w-56 overflow-hidden relative"
    >
      <div className="flex flex-col h-full py-2">
        {/* Header */}
        <div className="flex justify-center items-center">
          <div className="relative h-44 w-44">
            <Image
              src="/images/METAMORPHOSIS.png"
              alt="METAMORPHOSIS Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 px-1">
          {navItems.map((item) => {
            if (item.adminHide && isAdmin) {
              return null;
            }

            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link href={item.href} key={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start mb-3 px-2 py-1 h-auto',
                    isActive && 'bg-muted font-medium'
                  )}
                >
                  {item.icon}
                  <span className="ml-2 text-sm">{item.title}</span>
                </Button>
              </Link>
            );
          })}
          
          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="mt-6 mb-2 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Admin</h3>
              </div>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <Link href={item.href} key={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start mb-3 px-2 py-1 h-auto',
                        isActive && 'bg-muted font-medium'
                      )}
                    >
                      {item.icon}
                      <span className="ml-2 text-sm">{item.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-1 border-t pt-2">
          {user && (
            <div>
              <div className="px-1 py-1 text-xs text-muted-foreground mb-1">
                <div className="font-medium truncate">{user.email}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getDepartmentName(userDepartment)}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full mb-1 justify-start px-2 py-1 h-8"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 text-xs">Sign out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}

function NavItem({ href, icon, active, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center p-2 text-sm rounded-md ${
        active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}