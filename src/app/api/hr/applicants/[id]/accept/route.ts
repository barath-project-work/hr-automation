import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// POST /api/hr/applicants/[id]/accept — accept applicant & schedule interview
// Body: { date: "YYYY-MM-DD", time: "HH:MM" }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { id } = await params;
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json({ success: false, error: 'Interview date and time are required.' }, { status: 400 });
    }

    // Verify applicant belongs to this HR
    const { data: applicant, error: appError } = await supabase
      .from('applicants')
      .select('status, full_name')
      .eq('id', id)
      .eq('hr_id', user.id)
      .single();

    if (appError || !applicant) {
      return NextResponse.json({ success: false, error: 'Applicant not found.' }, { status: 404 });
    }

    const oldStatus = applicant.status;

    // Update applicant status
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        status: 'interview_scheduled',
        interview_date: date,
        interview_time: time,
        // Meet link placeholder until Google Calendar integration
        meet_link: `https://meet.google.com/placeholder-${id.slice(0, 8)}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('hr_id', user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Insert into interviews table
    const { error: interviewError } = await supabase
      .from('interviews')
      .insert({
        applicant_id: id,
        hr_id: user.id,
        interview_date: date,
        interview_time: time,
        meet_link: `https://meet.google.com/placeholder-${id.slice(0, 8)}`,
        status: 'scheduled',
      });

    if (interviewError) {
      console.error('Interview insert error (non-fatal):', interviewError);
    }

    // Log status history
    await supabase.from('status_history').insert({
      applicant_id: id,
      old_status: oldStatus,
      new_status: 'interview_scheduled',
      changed_by: user.id,
      notes: `Interview scheduled for ${date} at ${time}`,
    });

    return NextResponse.json({
      success: true,
      message: `Interview scheduled for ${date} at ${time}.`,
    });
  } catch (err) {
    console.error('POST /api/hr/applicants/[id]/accept error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
