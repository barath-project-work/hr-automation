import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET /api/hr/applicants/[id] — single applicant with status history
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch applicant — RLS ensures this HR owns it
    const { data: applicant, error: appError } = await supabase
      .from('applicants')
      .select('*')
      .eq('id', id)
      .eq('hr_id', user.id)
      .single();

    if (appError || !applicant) {
      return NextResponse.json({ success: false, error: 'Applicant not found.' }, { status: 404 });
    }

    // Fetch status history
    const { data: history } = await supabase
      .from('status_history')
      .select('*, profiles(full_name)')
      .eq('applicant_id', id)
      .order('created_at', { ascending: false });

    // Fetch documents if any
    const { data: documents } = await supabase
      .from('documents')
      .select('*, document_types(name, description)')
      .eq('applicant_id', id);

    return NextResponse.json({
      success: true,
      data: {
        ...applicant,
        status_history: (history ?? []).map((h) => ({
          ...h,
          changed_by_name: (h.profiles as { full_name?: string } | null)?.full_name ?? 'Unknown',
        })),
        documents: documents ?? [],
      },
    });
  } catch (err) {
    console.error('GET /api/hr/applicants/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
