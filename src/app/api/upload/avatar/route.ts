import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

// POST /api/upload/avatar — Upload a profile picture to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetUserId = (formData.get('userId') as string) || user.id;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided.' }, { status: 400 });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, WebP allowed.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image size must be under 5MB.' }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient();
    const arrayBuffer = await file.arrayBuffer();

    // Use a stable path per user so re-uploads overwrite the old file
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `avatars/${targetUserId}.${ext}`;

    // Upload to Supabase Storage (avatars bucket)
    const { error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true, // overwrite existing avatar for this user
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Storage upload failed: ${uploadError.message}. Make sure the "avatars" bucket exists in Supabase Storage.` },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = adminClient.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData?.publicUrl;

    if (!avatarUrl) {
      return NextResponse.json({ success: false, error: 'Failed to retrieve public URL after upload.' }, { status: 500 });
    }

    // Update the profile row in the database
    const { error: dbError } = await adminClient
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    if (dbError) {
      console.error('Database error updating avatar_url:', dbError);
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
      message: 'Profile picture uploaded successfully.',
    });
  } catch (err) {
    console.error('POST /api/upload/avatar error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE /api/upload/avatar — Remove a profile picture and clear avatar_url in DB
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    // Allow an admin to delete another user's avatar by passing userId in the body
    let targetUserId = user.id;
    try {
      const body = await request.json();
      if (body?.userId) targetUserId = body.userId;
    } catch {
      // no body provided — default to current user
    }

    const adminClient = getSupabaseAdminClient();

    // Attempt to remove all common extension variants from storage (silently ignore misses)
    const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const pathsToRemove = extensions.map((ext) => `avatars/${targetUserId}.${ext}`);
    await adminClient.storage.from('avatars').remove(pathsToRemove);

    // Clear avatar_url in the profiles table
    const { error: dbError } = await adminClient
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    if (dbError) {
      console.error('Database error clearing avatar_url:', dbError);
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed successfully.',
    });
  } catch (err) {
    console.error('DELETE /api/upload/avatar error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
