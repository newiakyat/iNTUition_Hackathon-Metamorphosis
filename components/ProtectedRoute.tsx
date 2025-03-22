'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Add debugging logs
  useEffect(() => {
    console.log("ProtectedRoute state:", { 
      user, 
      isAdmin, 
      isLoading, 
      initialCheckDone, 
      isAuthorized 
    });
  }, [user, isAdmin, isLoading, initialCheckDone, isAuthorized]);

  useEffect(() => {
    // Only perform the check once we're sure the loading state is complete
    if (!isLoading) {
      console.log("Auth loading complete, checking authorization");
      setInitialCheckDone(true);
      
      if (!user) {
        console.log("No user found, redirecting to login");
        router.push('/auth/login');
      } else if (adminOnly && !isAdmin) {
        console.log("User not admin, redirecting to unauthorized");
        router.push('/unauthorized');
      } else {
        console.log("User authorized");
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, isAdmin, adminOnly, router]);

  // Force the component to render content after a timeout to prevent infinite loading
  useEffect(() => {
    // Safety timeout - if still loading after 5 seconds, show an error
    const timeoutId = setTimeout(() => {
      if (isLoading && !initialCheckDone) {
        console.error("Auth checking timed out after 5 seconds");
        setInitialCheckDone(true);
        
        // You can either force redirect to login or show error
        router.push('/auth/login');
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, initialCheckDone, router]);

  // Show custom loading state until auth check completes
  if (isLoading || !initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          <p className="mt-2 text-xs text-muted-foreground">Auth state: {isLoading ? "Loading" : "Complete"}</p>
        </div>
      </div>
    );
  }

  // Show authorized content
  return isAuthorized ? <>{children}</> : null;
} 