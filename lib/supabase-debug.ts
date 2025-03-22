import { supabase } from './supabase';
import { getAuthenticatedClient } from './auth-bridge';

export const checkSupabaseAuth = async () => {
  try {
    // Get the standard client and authenticated client
    const standardClient = supabase;
    const authClient = getAuthenticatedClient();
    
    // Check session with standard client
    const { data: sessionData, error: sessionError } = await standardClient.auth.getSession();
    
    // Check user with standard client
    const { data: userData, error: userError } = await standardClient.auth.getUser();
    
    // Try a query with standard client
    const standardQuery = await standardClient
      .from('project_risk_reports')
      .select('id')
      .limit(1);
    
    // Try a query with authenticated client
    const authQuery = await authClient
      .from('project_risk_reports')
      .select('id')
      .limit(1);
    
    return {
      standardClient: {
        isAuthenticated: !!sessionData?.session,
        sessionError: sessionError?.message,
        user: userData?.user,
        userError: userError?.message,
        query: {
          success: !standardQuery.error,
          error: standardQuery.error?.message,
          code: standardQuery.error?.code,
          data: standardQuery.data
        }
      },
      authClient: {
        query: {
          success: !authQuery.error,
          error: authQuery.error?.message,
          code: authQuery.error?.code,
          data: authQuery.data
        }
      },
      timestamp: new Date().toISOString(),
      note: "The authClient is used for database operations with mock authentication"
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

// Add this to your RiskReportModal component to debug auth issues
export const debugSupabaseAuth = async () => {
  const status = await checkSupabaseAuth();
  console.log('Supabase Auth Debug:', status);
  return status;
}; 