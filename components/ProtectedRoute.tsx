'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  bypassAuthForAdmins?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  bypassAuthForAdmins = true 
}: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // IMMEDIATE AUTHORIZATION FOR ADMINS
  // This effect runs first and immediately authorizes admins without waiting for other checks
  useEffect(() => {
    if (isAdmin && bypassAuthForAdmins) {
      console.log("ADMIN DETECTED - Immediate authorization granted");
      setIsAuthorized(true);
      setInitialCheckDone(true);
    }
  }, [isAdmin, bypassAuthForAdmins]);
  
  // Add debugging logs
  useEffect(() => {
    console.log("ProtectedRoute state:", { 
      user, 
      isAdmin, 
      isLoading, 
      initialCheckDone, 
      isAuthorized,
      bypassAuthForAdmins
    });
  }, [user, isAdmin, isLoading, initialCheckDone, isAuthorized, bypassAuthForAdmins]);

  // Check for previously stored admin authentication
  useEffect(() => {
    // Skip if already authorized or if bypassAuthForAdmins is false
    if (!bypassAuthForAdmins || isAuthorized) return;

    try {
      // Check localStorage for admin status
      const storedAuthData = localStorage.getItem('ieee_auth_state');
      if (storedAuthData) {
        const authData = JSON.parse(storedAuthData);
        if (authData && authData.isAdmin === true) {
          console.log("Admin detected from localStorage, bypassing authentication");
          setIsAuthorized(true);
          setInitialCheckDone(true);
        }
      }
    } catch (error) {
      console.error("Error checking stored admin status:", error);
    }
  }, [bypassAuthForAdmins, isAuthorized]);

  useEffect(() => {
    // Skip if already authorized (either from isAdmin check or localStorage)
    if (isAuthorized) {
      console.log("Already authorized - skipping regular auth check");
      return;
    }
    
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
        
        // Store admin status in localStorage for future quick access
        if (isAdmin) {
          try {
            // We're only updating the value if it exists
            const storedAuthData = localStorage.getItem('ieee_auth_state');
            if (storedAuthData) {
              const authData = JSON.parse(storedAuthData);
              authData.isAdmin = true;
              localStorage.setItem('ieee_auth_state', JSON.stringify(authData));
            }
          } catch (error) {
            console.error("Error storing admin status:", error);
          }
        }
      }
    }
  }, [user, isLoading, isAdmin, adminOnly, router, isAuthorized]);

  // Force the component to render content after a timeout to prevent infinite loading
  useEffect(() => {
    // Skip timeout if already authorized through the admin bypass
    if (isAuthorized) return;
    
    // Safety timeout - if still loading after 3 seconds, show an error
    const timeoutId = setTimeout(() => {
      if (isLoading && !initialCheckDone) {
        console.error("Auth checking timed out after 3 seconds");
        setInitialCheckDone(true);
        
        // Try admin bypass one more time before redirecting
        if (bypassAuthForAdmins) {
          try {
            const storedAuthData = localStorage.getItem('ieee_auth_state');
            if (storedAuthData) {
              const authData = JSON.parse(storedAuthData);
              if (authData && authData.isAdmin === true) {
                console.log("Last attempt: Admin detected from localStorage, bypassing authentication");
                setIsAuthorized(true);
                return;
              }
            }
          } catch (error) {
            console.error("Error in final admin bypass check:", error);
          }
        }
        
        // Redirect to login if admin bypass fails
        router.push('/auth/login');
      }
    }, 3000); // Reduced to 3 seconds for quicker feedback
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, initialCheckDone, router, bypassAuthForAdmins, isAuthorized]);

  // IMPORTANT: Directly return children if user is admin and bypassAuthForAdmins is true
  // This is the most aggressive bypass - it doesn't wait for state updates or effects
  if (isAdmin && bypassAuthForAdmins) {
    console.log("FAST PATH: Admin detected, rendering children immediately");
    return <>{children}</>;
  }

  // Show custom loading state until auth check completes
  if (!isAuthorized && (isLoading || !initialCheckDone)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {isAdmin ? "Admin detected - authorizing..." : "Auth state: " + (isLoading ? "Loading" : "Complete")}
          </p>
        </div>
      </div>
    );
  }

  // Show authorized content
  return isAuthorized ? <>{children}</> : null;
} 