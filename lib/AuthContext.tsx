'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';

// Department type
export type Department = 'RD' | 'IT' | 'SALES' | 'MARKETING' | 'ENGINEERING' | 'SUPPLY' | 'MANUFACTURING' | 'HR';

// Extended User type with department
export type ExtendedUser = User & {
  department?: Department;
};

// Auth context type
type AuthContextType = {
  user: ExtendedUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  updateUserDepartment: (department: Department) => Promise<{ error: any }>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  updateUserDepartment: async () => ({ error: null }),
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  // For development/debugging purposes - create a mock user
  // Comment this out in production
  useEffect(() => {
    // This creates a mock user without actually connecting to Supabase
    console.log("Creating mock user for development");
    
    // Mock authentication after a short delay
    const timer = setTimeout(() => {
      const mockUser = {
        id: '123456',
        email: 'admin@admin.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2023-09-15T00:00:00.000Z',
        department: 'IT' as Department
      } as ExtendedUser;
      
      setUser(mockUser);
      setIsAdmin(true);
      setIsLoading(false);
      console.log("Mock user created:", mockUser);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Use the new createBrowserClient instead of createClientComponentClient
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if the user is admin based on user metadata or a specific role
  const checkUserRole = async (user: User) => {
    console.log("Checking user role for:", user.email);
    
    // In a real app, you would check user metadata or a roles table
    // For demo purposes, we'll consider users with specific emails as admins
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, department')
        .eq('user_id', user.id)
        .single();
  
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
        console.log("User is admin based on role table:", data.role === 'admin');
        
        // Set department from the database
        const extendedUser = { 
          ...user, 
          department: data.department as Department 
        };
        setUser(extendedUser);
      } else {
        // Fallback for demo: consider specific email domains as admins
        const isAdminEmail = user.email?.endsWith('@admin.com') || false;
        setIsAdmin(isAdminEmail);
        console.log("User admin status based on email:", isAdminEmail);
        
        // Assign a default department based on email
        let department: Department = 'IT';
        if (user.email?.includes('hr')) {
          department = 'HR';
        } else if (user.email?.includes('rd') || user.email?.includes('research')) {
          department = 'RD';
        } else if (user.email?.includes('sales')) {
          department = 'SALES';
        } else if (user.email?.includes('market')) {
          department = 'MARKETING';
        } else if (user.email?.includes('eng')) {
          department = 'ENGINEERING';
        } else if (user.email?.includes('supply') || user.email?.includes('chain')) {
          department = 'SUPPLY';
        } else if (user.email?.includes('manu') || user.email?.includes('factory')) {
          department = 'MANUFACTURING';
        }
        
        const extendedUser = { ...user, department };
        setUser(extendedUser);
      }
    } catch (err) {
      console.error("Error checking user role:", err);
      // Fallback
      setIsAdmin(user.email?.endsWith('@admin.com') || false);
      
      // Default department
      const extendedUser = { ...user, department: 'IT' as Department };
      setUser(extendedUser);
    }
  };

  // We're using the mock user, so we don't need this Supabase auth code
  // Keeping it commented for reference
  /*
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        console.log("Getting session from Supabase");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found:", session);
          setSession(session);
          setUser(session.user);
          await checkUserRole(session.user);
        } else {
          console.log("No session found");
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
        console.log("Auth loading complete");
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await checkUserRole(session.user);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);
  */

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log("Signing in with:", email);
    setIsLoading(true);
    
    try {
      // For mock auth in development
      if (email === 'admin@admin.com') {
        console.log("Using mock authentication");
        const mockUser = {
          id: '123456',
          email: 'admin@admin.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: '2023-09-15T00:00:00.000Z',
          department: 'IT' as Department
        } as ExtendedUser;
        
        setUser(mockUser);
        setIsAdmin(true);
        setIsLoading(false);
        return { error: null };
      }
      
      // Determine department from email pattern for demo purposes
      let department: Department = 'IT';
      if (email.includes('hr')) {
        department = 'HR';
      } else if (email.includes('rd') || email.includes('research')) {
        department = 'RD';
      } else if (email.includes('sales')) {
        department = 'SALES';
      } else if (email.includes('market')) {
        department = 'MARKETING';
      } else if (email.includes('eng')) {
        department = 'ENGINEERING';
      } else if (email.includes('supply') || email.includes('chain')) {
        department = 'SUPPLY';
      } else if (email.includes('manu') || email.includes('factory')) {
        department = 'MANUFACTURING';
      }
      
      // Real Supabase auth for production
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        setIsLoading(false);
        return { error };
      }

      if (data.user) {
        console.log("User signed in:", data.user);
        const extendedUser = { ...data.user, department };
        setUser(extendedUser);
        await checkUserRole(data.user);
        router.refresh();
      }
      
      setIsLoading(false);
      return { error: null };
    } catch (error) {
      console.error("Exception during sign in:", error);
      setIsLoading(false);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      setIsLoading(false);
      return { data, error };
    } catch (error) {
      setIsLoading(false);
      return { error, data: null };
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    
    // For mock auth
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    
    router.refresh();
    setIsLoading(false);
  };

  // Update user department function
  const updateUserDepartment = async (department: Department) => {
    if (!user) {
      console.error("Update department failed: No user is signed in");
      return { error: 'No user is signed in' };
    }
    
    setIsLoading(true);
    try {
      // In a real application, you would update the user's department in your database
      console.log(`Updating user department to: ${department} for user:`, user.email);
      
      // For the mock user implementation, just update the local state
      // Since we're using a mock user in development, skip the actual Supabase call
      if (user.email === 'admin@admin.com') {
        console.log("Using mock user, updating department locally");
        // Update local state for mock user
        const updatedUser = { ...user, department };
        setUser(updatedUser);
        
        setIsLoading(false);
        return { error: null };
      }
      
      // For a real Supabase implementation:
      if (user.id) {
        try {
          console.log("Attempting to update department in Supabase:", {
            user_id: user.id,
            department,
            role: isAdmin ? 'admin' : 'user'
          });
          
          const { error } = await supabase
            .from('user_roles')
            .upsert({ 
              user_id: user.id,
              department,
              // Keep existing role (we don't want to change admin status)
              role: isAdmin ? 'admin' : 'user',
              updated_at: new Date().toISOString()
            });
            
          if (error) {
            console.error("Supabase error updating department:", error);
            setIsLoading(false);
            return { error: error.message };
          }
          
          console.log("Department updated successfully in Supabase");
        } catch (err) {
          console.error("Exception updating department in database:", err);
          // Continue to update local state even if database update fails
        }
      }
      
      // Update local state regardless of Supabase success
      console.log("Updating user state with new department");
      const updatedUser = { ...user, department };
      setUser(updatedUser);
      
      setIsLoading(false);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Exception during department update:", errorMessage);
      setIsLoading(false);
      return { error: errorMessage };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateUserDepartment,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 