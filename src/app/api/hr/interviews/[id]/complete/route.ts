import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// POST /api/hr/interviews/[id]/complete — mark interview as completed
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the interview to get applicant_id
    const { data: interview } = await supabase
      .from('interviews')
      .select('applicant_id, status')
      .eq('id', id)
      .eq('hr_id', user.id)
      .single();

    if (!interview) {
      return NextResponse.json({ success: false, error: 'Interview not found.' }, { status: 404 });
    }

    if (interview.status === 'completed') {
      return NextResponse.json({ success: false, error: 'Interview is already marked as completed.' }, { status: 400 });
    }

    // Update interview
    const { error: interviewError } = await supabase
      .from('interviews')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('hr_id', user.id);

    if (interviewError) {
      return NextResponse.json({ success: false, error: interviewError.message }, { status: 500 });
    }

    // Update applicant status to interview_completed
    const { data: applicant } = await supabase
      .from('applicants')
      .select('status')
      .eq('id', interview.applicant_id)
      .single();

    await supabase
      .from('applicants')
      .update({ status: 'interview_completed', updated_at: new Date().toISOString() })
      .eq('id', interview.applicant_id)
      .eq('hr_id', user.id);

    // Log status history
    await supabase.from('status_history').insert({
      applicant_id: interview.applicant_id,
      old_status: applicant?.status ?? 'interview_scheduled',
      new_status: 'interview_completed',
      changed_by: user.id,
      notes: 'Interview marked as completed',
    });

    return NextResponse.json({ success: true, message: 'Interview marked as completed.' });
  } catch (err) {
    console.error('POST /api/hr/interviews/[id]/complete error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
