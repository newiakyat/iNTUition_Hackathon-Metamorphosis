'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

// Storage key for persisting auth state
const AUTH_STORAGE_KEY = 'ieee_auth_state';

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
  const authInitialized = useRef(false);
  
  // Load persisted auth state from localStorage
  useEffect(() => {
    if (authInitialized.current) return;
    authInitialized.current = true;
    
    try {
      // Only run on client-side
      if (typeof window !== 'undefined') {
        const persistedAuthString = localStorage.getItem(AUTH_STORAGE_KEY);
        
        if (persistedAuthString) {
          try {
            const persistedAuth = JSON.parse(persistedAuthString);
            
            // Check that we have a valid user and the necessary fields
            if (persistedAuth && persistedAuth.user && persistedAuth.user.email) {
              setUser(persistedAuth.user);
              setIsAdmin(persistedAuth.isAdmin);
              setSession(persistedAuth.session);
              setIsLoading(false);
              return; // Exit early after setting persisted state
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY); // Clear invalid data
            }
          } catch (parseError) {
            localStorage.removeItem(AUTH_STORAGE_KEY); // Clear corrupted data
          }
        }
        
        // Only create mock user if no valid persisted state was found
        createMockUser();
      }
    } catch (error) {
      createMockUser();
    }
  }, []);
  
  // Persist auth state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && user) {
      try {
        const authState = {
          user,
          isAdmin,
          session
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      } catch (error) {
        console.error("Error persisting auth state:", error);
      }
    }
  }, [user, isAdmin, session, isLoading]);
  
  // Function to create a mock admin user
  const createMockUser = () => {
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
    
    // Ensure admin status is stored in localStorage for quick access
    try {
      // Store or update admin status in localStorage
      const authState = {
        user: mockUser,
        isAdmin: true,
        session: { 
          access_token: 'mock_access_token_' + Date.now(), 
          expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
          refresh_token: 'mock_refresh_token_' + Date.now()
        }
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      console.log('Stored admin credentials in localStorage for quick access');
    } catch (error) {
      console.error("Error storing admin credentials:", error);
    }
  };
  
  // Use the new createBrowserClient instead of createClientComponentClient
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if the user is admin based on user metadata or a specific role
  const checkUserRole = async (user: User) => {
    // For development purposes, skip the actual Supabase call
    // In a real app, you would check user metadata or a roles table
    
    // Consider specific email domains as admins
    const isAdminEmail = user.email?.endsWith('@admin.com') || false;
    setIsAdmin(isAdminEmail);
    
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
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // For mock auth in development
      if (email === 'admin@admin.com') {
        const mockAdminUser = {
          id: '123456',
          email: 'admin@admin.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: '2023-09-15T00:00:00.000Z',
          department: 'IT' as Department
        } as ExtendedUser;
        
        setUser(mockAdminUser);
        setIsAdmin(true);
        setIsLoading(false);
        return { error: null };
      }
      
      // Handle other mock email addresses for development
      if (email.endsWith('@example.com')) {
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
        
        // Create mock user with department and not an admin
        const mockRegularUser = {
          id: Date.now().toString(),
          email: email,
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          department: department
        } as ExtendedUser;
        
        setUser(mockRegularUser);
        setIsAdmin(false);
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
        setIsLoading(false);
        return { error };
      }

      if (data.user) {
        const extendedUser = { ...data.user, department };
        setUser(extendedUser);
        await checkUserRole(data.user);
        router.refresh();
      }
      
      setIsLoading(false);
      return { error: null };
    } catch (error) {
      setIsLoading(false);
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    
    // Clear auth state
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    
    // Clear persisted auth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Handle error silently
    }
    
    // Explicitly redirect to the login page
    router.push('/auth/login');
    router.refresh();
    setIsLoading(false);
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

  // Update user department function
  const updateUserDepartment = async (department: Department) => {
    if (!user) {
      return { error: 'No user is signed in' };
    }
    
    setIsLoading(true);
    try {
      // Create a completely new user object to ensure reactivity
      const updatedUser = { 
        ...user, 
        department 
      } as ExtendedUser;
      
      // Update the user state
      setUser(updatedUser);
      
      // Update localStorage immediately with new department
      try {
        if (typeof window !== 'undefined') {
          const authState = {
            user: updatedUser,
            isAdmin,
            session
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
        }
      } catch (err) {
        // Handle error silently
      }
      
      setIsLoading(false);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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