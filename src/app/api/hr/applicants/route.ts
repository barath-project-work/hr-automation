import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET /api/hr/applicants — list applicants for logged-in HR
// Query params: ?status=pending|on_hold|... ?page=1 ?limit=25 ?search=name
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status    = searchParams.get('status');
    const search    = searchParams.get('search');
    const page      = parseInt(searchParams.get('page') ?? '1', 10);
    const limit     = Math.min(parseInt(searchParams.get('limit') ?? '25', 10), 100);
    const offset    = (page - 1) * limit;

    // Build query — RLS ensures hr_id = auth.uid()
    let query = supabase
      .from('applicants')
      .select('*', { count: 'exact' })
      .eq('hr_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count ?? 0) / limit);

    return NextResponse.json({
      success: true,
      data,
      total: count ?? 0,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (err) {
    console.error('GET /api/hr/applicants error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
