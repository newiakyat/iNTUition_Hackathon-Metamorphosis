"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
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
  ChevronLeft,
  ChevronRight,
  Box,
  Code,
  Cog,
  FileX,
  FolderKanban,
  LineChart,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
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
      href: '/project',
      title: 'Projects',
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      href: '/reports',
      title: 'Reports',
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      href: '/stakeholders',
      title: 'Stakeholders',
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: '/documents',
      title: 'Documents',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: '/chatbot',
      title: 'AI Assistant',
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      href: '/admin',
      title: 'Admin Panel',
      icon: <ShieldCheck className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      href: '/settings',
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <div 
      className={cn(
        "bg-card border-r border-border h-screen transition-all duration-300 overflow-hidden relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full py-4">
        {/* Header */}
        <div className={cn(
          "px-4 py-2 flex items-center", 
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && <h1 className="font-semibold text-lg">Change Mgmt</h1>}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-2">
          {navItems.map((item) => {
            // Skip admin-only links if user is not an admin
            if (item.adminOnly && !isAdmin) {
              return null;
            }

            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link href={item.href} key={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start mb-1',
                    collapsed ? 'px-2' : 'px-3',
                    isActive && 'bg-muted font-medium'
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-2 border-t pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="mb-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user && (
            <div>
              {!collapsed && (
                <div className="px-2 py-2 text-xs text-muted-foreground mb-2">
                  <div className="font-medium truncate">{user.email}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
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
              )}
              
              <Button
                variant="ghost"
                className={cn(
                  'w-full mb-2', 
                  collapsed ? 'justify-center px-2' : 'justify-start px-3'
                )}
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Sign out</span>}
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