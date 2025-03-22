import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Test RLS with a direct query
    const { data: testData, error: testError } = await supabase
      .from('project_risk_reports')
      .select('id')
      .limit(1);
    
    // Try an insert operation
    const testInsert = session ? await supabase
      .from('project_risk_reports')
      .insert({
        project_id: 1,
        risk_score: 99,
        full_report: 'Test report',
        mitigation_measures: ['Test measure'],
        created_by: session?.user?.email || 'test@example.com',
      })
      .select()
      .single() : { error: 'No session' };
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user || null,
      select: {
        success: !testError,
        error: testError,
        data: testData,
      },
      insert: {
        success: !testInsert.error,
        error: testInsert.error,
        data: testInsert.data,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 