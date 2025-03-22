import { createClient } from '@supabase/supabase-js';

// This is for client-side usage where public environment variables are accessible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log Supabase configuration status at initialization (without exposing values)
console.log('Supabase configuration at initialization:');
console.log('URL available:', !!supabaseUrl);
console.log('Anon key available:', !!supabaseAnonKey);
console.log('Client will be created with valid credentials:', !!(supabaseUrl && supabaseAnonKey));

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validate the Supabase connection
export const validateSupabaseConnection = async () => {
  try {
    // A simple query to check if the connection works
    const { data, error } = await supabase.from('project_announcements').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
    
    return {
      connected: true,
      data
    };
  } catch (error) {
    console.error('Exception while validating Supabase connection:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

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