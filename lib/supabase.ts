import { createClient } from '@supabase/supabase-js';

// This is for client-side usage where public environment variables are accessible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get the user's current session
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Function to check if the current user is an admin
export const isUserAdmin = async () => {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // Fetch user's role from the 'profiles' table
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error || !data) return false;
  
  return data.role === 'admin';
}; 