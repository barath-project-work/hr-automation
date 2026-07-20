import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET /api/hr/documents — applicants who have uploaded documents pending verification
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    // Get applicants in documents_received status for this HR
    const { data: applicants, error: appError } = await supabase
      .from('applicants')
      .select('id, full_name, updated_at')
      .eq('hr_id', user.id)
      .eq('status', 'documents_received')
      .order('updated_at', { ascending: false });

    if (appError) {
      return NextResponse.json({ success: false, error: appError.message }, { status: 500 });
    }

    if (!applicants || applicants.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // For each applicant, fetch their documents
    const applicantIds = applicants.map((a) => a.id);
    const { data: documents } = await supabase
      .from('documents')
      .select('*, document_types(name, description)')
      .in('applicant_id', applicantIds);

    // Group documents by applicant
    const docsByApplicant = (documents ?? []).reduce<Record<string, typeof documents>>((acc, doc) => {
      if (!acc[doc.applicant_id]) acc[doc.applicant_id] = [];
      acc[doc.applicant_id]!.push(doc);
      return acc;
    }, {});

    const result = applicants.map((a) => ({
      applicant_id:   a.id,
      applicant_name: a.full_name,
      submitted_at:   a.updated_at,
      documents: (docsByApplicant[a.id] ?? []).map((d) => ({
        id:     d.id,
        name:   (d.document_types as { name?: string } | null)?.name ?? 'Document',
        type:   (d.document_types as { name?: string } | null)?.name ?? 'unknown',
        status: d.status,
        file_path: d.file_path,
        file_name: d.file_name,
      })),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('GET /api/hr/documents error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
