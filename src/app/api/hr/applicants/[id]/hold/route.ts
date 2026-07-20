import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// POST /api/hr/applicants/[id]/hold
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { id } = await params;

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
      .update({ status: 'on_hold', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('hr_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await supabase.from('status_history').insert({
      applicant_id: id,
      old_status: current.status,
      new_status: 'on_hold',
      changed_by: user.id,
    });

    return NextResponse.json({ success: true, message: 'Applicant moved to On Hold.' });
  } catch (err) {
    console.error('POST /api/hr/applicants/[id]/hold error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
