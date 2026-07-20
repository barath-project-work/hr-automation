import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// POST /api/hr/documents/[applicantId]/verify — verify all documents for an applicant
export async function POST(_request: NextRequest, { params }: { params: Promise<{ applicantId: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { applicantId } = await params;

    // Verify applicant belongs to this HR
    const { data: applicant } = await supabase
      .from('applicants')
      .select('status, full_name')
      .eq('id', applicantId)
      .eq('hr_id', user.id)
      .single();

    if (!applicant) {
      return NextResponse.json({ success: false, error: 'Applicant not found.' }, { status: 404 });
    }

    // Mark all documents as verified
    const { error: docsError } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('applicant_id', applicantId);

    if (docsError) {
      return NextResponse.json({ success: false, error: docsError.message }, { status: 500 });
    }

    // Update applicant status
    const { error: updateError } = await supabase
      .from('applicants')
      .update({ status: 'documents_verified', updated_at: new Date().toISOString() })
      .eq('id', applicantId)
      .eq('hr_id', user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Log status history
    await supabase.from('status_history').insert({
      applicant_id: applicantId,
      old_status: applicant.status,
      new_status: 'documents_verified',
      changed_by: user.id,
      notes: 'All documents verified',
    });

    // Create notification for self about workspace pending
    await supabase.from('notifications').insert({
      user_id:           user.id,
      notification_type: 'documents_verified',
      title:             'Documents Verified',
      message:           `Documents for ${applicant.full_name} have been verified. Workspace creation pending.`,
      link:              `/hr/applicants/${applicantId}`,
    });

    return NextResponse.json({
      success: true,
      message: `Documents verified for ${applicant.full_name}. Workspace creation is pending Google integration.`,
    });
  } catch (err) {
    console.error('POST /api/hr/documents/[applicantId]/verify error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
