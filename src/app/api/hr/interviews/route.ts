import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET /api/hr/interviews — list interviews for logged-in HR
// Query params: ?status=scheduled|completed|cancelled|all
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? 'scheduled';

    let query = supabase
      .from('interviews')
      .select(`
        *,
        applicants(full_name, email, phone)
      `)
      .eq('hr_id', user.id)
      .order('interview_date', { ascending: true })
      .order('interview_time', { ascending: true });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Flatten the join for easier consumption
    const interviews = (data ?? []).map((i) => ({
      ...i,
      applicant_name:  (i.applicants as { full_name?: string } | null)?.full_name ?? 'Unknown',
      applicant_email: (i.applicants as { email?: string } | null)?.email ?? '',
      applicant_phone: (i.applicants as { phone?: string } | null)?.phone ?? '',
    }));

    return NextResponse.json({ success: true, data: interviews });
  } catch (err) {
    console.error('GET /api/hr/interviews error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
