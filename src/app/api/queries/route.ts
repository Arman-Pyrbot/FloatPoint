import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Fetch user's query history
    const { data: queries, error } = await supabase
      .from('queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 queries
    
    if (error) {
      console.error('Error fetching queries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch query history' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      queries: queries || [],
      count: queries?.length || 0
    });
    
  } catch (error) {
    console.error('Query history API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch query history'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Get query ID from URL search params
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');
    
    if (!queryId) {
      return NextResponse.json(
        { error: 'Query ID required' },
        { status: 400 }
      );
    }
    
    // Delete the specific query (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('queries')
      .delete()
      .eq('id', queryId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting query:', error);
      return NextResponse.json(
        { error: 'Failed to delete query' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Query deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete query API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete query'
      },
      { status: 500 }
    );
  }
}
