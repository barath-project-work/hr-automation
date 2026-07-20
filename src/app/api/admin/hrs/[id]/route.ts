import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { updateHR, deleteHR } from '@/lib/auth';

// Helper: verify admin and return user or error response
async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 }) };

  const { data: profile } = await supabase
    .from('profiles').select('role_id').eq('id', user.id).single();

  if (!profile || profile.role_id !== 1) {
    return { error: NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 }) };
  }
  return { user };
}

// PUT /api/admin/hrs/[id] — update HR profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const result = await updateHR(id, body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data, message: result.message });
  } catch (err) {
    console.error('PUT /api/admin/hrs/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE /api/admin/hrs/[id] — soft-delete (deactivate) HR
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const result = await deleteHR(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    console.error('DELETE /api/admin/hrs/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
