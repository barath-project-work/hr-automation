import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

// POST /api/upload/avatar — Upload a direct profile picture (JPG/PNG/WebP)
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
    let avatarUrl = '';

    // Convert to Data URL (Base64) as reliable primary/fallback format so uploads work instantly
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `avatars/${targetUserId}_${Date.now()}.${ext}`;

      let bucketName = 'avatars';
      let { error: uploadError } = await adminClient.storage
        .from(bucketName)
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError && (uploadError.message.includes('not found') || uploadError.message.includes('Bucket'))) {
        bucketName = 'documents';
        const fallbackResult = await adminClient.storage
          .from(bucketName)
          .upload(filePath, arrayBuffer, {
            contentType: file.type,
            upsert: true,
          });
        uploadError = fallbackResult.error;
      }

      if (!uploadError) {
        const { data: publicUrlData } = adminClient.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          avatarUrl = publicUrlData.publicUrl;
        }
      }
    } catch {
      // Storage upload error — fallback to dataUrl
    }

    // Use dataUrl if storage URL wasn't generated
    if (!avatarUrl) {
      avatarUrl = dataUrl;
    }

    // Update profile table in Supabase
    const { error: dbError } = await adminClient
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    if (dbError) {
      console.error('Database error updating avatar_url:', dbError);
      if (dbError.message.includes('avatar_url')) {
        return NextResponse.json({
          success: false,
          error: 'Missing avatar_url column in database. Please run migration 004_add_avatar_url_to_profiles.sql in Supabase SQL Editor.',
        }, { status: 400 });
      }
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
