import { createClient } from '@supabase/supabase-js';

// Constants
const AUTH_STORAGE_KEY = 'ieee_auth_state';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create an authenticated Supabase client based on the mock session
export const getAuthenticatedClient = () => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  try {
    // Get auth state from localStorage
    const persistedAuthString = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!persistedAuthString) {
      console.warn('No auth state found in localStorage');
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    
    const persistedAuth = JSON.parse(persistedAuthString);
    
    // If we have mock auth data with session
    if (persistedAuth && persistedAuth.session) {
      // Create client with session
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // For development/mock purposes, we'll simulate having a valid session
      // This bypasses RLS by telling Supabase we have a valid authentication
      supabase.auth.setSession({
        access_token: persistedAuth.session.access_token || 'mock_token_for_development',
        refresh_token: persistedAuth.session.refresh_token || 'mock_refresh_for_development',
      });
      
      return supabase;
    }
  } catch (error) {
    console.error('Error accessing auth state:', error);
  }
  
  // Fallback to unauthenticated client
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}; 