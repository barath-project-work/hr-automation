import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// POST /api/hr/applicants/[id]/reject
// Body: { reason?: string }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason: string | undefined = body.reason;

    const { data: current } = await supabase
      .from('applicants')
      .select('status')
      .eq('id', id)
      .eq('hr_id', user.id)
      .single();

    if (!current) {
      return NextResponse.json({ success: false, error: 'Applicant not found.' }, { status: 404 });
    }

    const { error } = await supabase
      .from('applicants')
      .update({ status: 'rejected', notes: reason ?? null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('hr_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await supabase.from('status_history').insert({
      applicant_id: id,
      old_status: current.status,
      new_status: 'rejected',
      changed_by: user.id,
      notes: reason ?? null,
    });

    return NextResponse.json({ success: true, message: 'Applicant has been rejected.' });
  } catch (err) {
    console.error('POST /api/hr/applicants/[id]/reject error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
