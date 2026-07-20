import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// GET /api/hr/interns — active interns (applicants with workspace_created status)
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const { data: applicants, error } = await supabase
      .from('applicants')
      .select(`
        id, full_name, email, updated_at, created_at,
        workspaces(folder_url, sheet_url, created_at)
      `)
      .eq('hr_id', user.id)
      .eq('status', 'workspace_created')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const interns = (applicants ?? []).map((a) => {
      const workspace = Array.isArray(a.workspaces)
        ? a.workspaces[0]
        : a.workspaces;
      return {
        id:             a.id,
        name:           a.full_name,
        email:          a.email,
        joined_date:    a.updated_at,
        workspace_url:  (workspace as { folder_url?: string } | null)?.folder_url ?? null,
        tracker_url:    (workspace as { sheet_url?: string } | null)?.sheet_url ?? null,
        workspace_created_at: (workspace as { created_at?: string } | null)?.created_at ?? null,
      };
    });

    return NextResponse.json({ success: true, data: interns });
  } catch (err) {
    console.error('GET /api/hr/interns error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
