import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

// GET /api/upload/[token] — validate token and return applicant info for the upload page
// POST /api/upload/[token] — upload documents (multipart/form-data)

// Helper: validate and fetch token row
async function validateToken(token: string) {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from('upload_tokens')
    .select('id, applicant_id, is_used, expires_at')
    .eq('token', token)
    .single();

  if (error || !data) return { valid: false, error: 'Invalid upload link.' };
  if (data.is_used) return { valid: false, error: 'This upload link has already been used.' };
  if (new Date(data.expires_at) < new Date()) return { valid: false, error: 'This upload link has expired. Please contact your HR.' };

  return { valid: true, tokenRow: data };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Fetch applicant name for greeting
    const adminClient = getSupabaseAdminClient();
    const { data: applicant } = await adminClient
      .from('applicants')
      .select('full_name')
      .eq('id', validation.tokenRow!.applicant_id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        applicant_name: applicant?.full_name ?? 'Candidate',
        expires_at: validation.tokenRow!.expires_at,
      },
    });
  } catch (err) {
    console.error('GET /api/upload/[token] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const { applicant_id } = validation.tokenRow!;
    const adminClient = getSupabaseAdminClient();

    // Parse multipart form data
    const formData = await request.formData();
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    // Map of document type names to their DB IDs (matches seed data in schema)
    const docTypeMap: Record<string, number> = {
      agreement_letter: 1,
      aadhaar_card: 2,
      marksheet: 3,
    };

    const uploadedDocs: { document_type_id: number; file_path: string; file_name: string; file_size: number; mime_type: string }[] = [];

    for (const [fieldName, docTypeId] of Object.entries(docTypeMap)) {
      const file = formData.get(fieldName) as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: `Missing required document: ${fieldName}` },
          { status: 400 }
        );
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type for ${fieldName}. Only PDF, JPG, PNG accepted.` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds 10 MB limit.` },
          { status: 400 }
        );
      }

      // Upload to Supabase Storage: documents/<applicant_id>/<fieldName>_<timestamp>.<ext>
      const ext = file.name.split('.').pop() ?? 'bin';
      const storagePath = `${applicant_id}/${fieldName}_${Date.now()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: storageError } = await adminClient.storage
        .from('documents')
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (storageError) {
        console.error('Storage upload error:', storageError);
        return NextResponse.json(
          { success: false, error: `Failed to upload ${fieldName}. Please try again.` },
          { status: 500 }
        );
      }

      uploadedDocs.push({
        document_type_id: docTypeId,
        file_path:  storagePath,
        file_name:  file.name,
        file_size:  file.size,
        mime_type:  file.type,
      });
    }

    // Insert document records
    const { error: dbError } = await adminClient
      .from('documents')
      .insert(
        uploadedDocs.map((d) => ({
          applicant_id,
          ...d,
          status: 'received',
        }))
      );

    if (dbError) {
      return NextResponse.json({ success: false, error: 'Failed to save document records.' }, { status: 500 });
    }

    // Mark token as used
    await adminClient
      .from('upload_tokens')
      .update({ is_used: true })
      .eq('applicant_id', applicant_id);

    // Update applicant status to documents_received
    const { data: applicant } = await adminClient
      .from('applicants')
      .select('status, full_name, hr_id')
      .eq('id', applicant_id)
      .single();

    await adminClient
      .from('applicants')
      .update({ status: 'documents_received', updated_at: new Date().toISOString() })
      .eq('id', applicant_id);

    // Log status history
    await adminClient.from('status_history').insert({
      applicant_id,
      old_status: applicant?.status ?? 'selected',
      new_status: 'documents_received',
      changed_by: applicant_id, // candidate — no user account, use applicant_id as ref
      notes: 'Candidate uploaded onboarding documents',
    });

    // Notify the HR
    if (applicant?.hr_id) {
      await adminClient.from('notifications').insert({
        user_id:           applicant.hr_id,
        notification_type: 'documents_received',
        title:             'New Documents Received',
        message:           `${applicant.full_name} has uploaded their onboarding documents.`,
        link:              `/hr/documents`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully. Your HR will review them shortly.',
    });
  } catch (err) {
    console.error('POST /api/upload/[token] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
