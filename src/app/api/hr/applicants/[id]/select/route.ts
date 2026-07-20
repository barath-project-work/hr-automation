import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

// POST /api/hr/applicants/[id]/select — select candidate post-interview
// Body: { notes?: string }
// Also generates an upload token and returns the upload URL
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const notes: string | undefined = body.notes;

    // Verify ownership
    const { data: applicant } = await supabase
      .from('applicants')
      .select('status, full_name')
      .eq('id', id)
      .eq('hr_id', user.id)
      .single();

    if (!applicant) {
      return NextResponse.json({ success: false, error: 'Applicant not found.' }, { status: 404 });
    }

    // Update to 'selected' status
    const { error: updateError } = await supabase
      .from('applicants')
      .update({ status: 'selected', notes: notes ?? null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('hr_id', user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Log status history
    await supabase.from('status_history').insert({
      applicant_id: id,
      old_status: applicant.status,
      new_status: 'selected',
      changed_by: user.id,
      notes: notes ?? null,
    });

    // Generate a secure upload token for the candidate
    const adminClient = getSupabaseAdminClient();
    const { data: tokenData, error: tokenError } = await adminClient
      .from('upload_tokens')
      .insert({ applicant_id: id })
      .select('token')
      .single();

    let uploadUrl: string | null = null;
    if (!tokenError && tokenData) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
      uploadUrl = `${baseUrl}/upload/${tokenData.token}`;
    }

    return NextResponse.json({
      success: true,
      message: `${applicant.full_name} selected. Share the upload link with them.`,
      data: { uploadUrl },
    });
  } catch (err) {
    console.error('POST /api/hr/applicants/[id]/select error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
