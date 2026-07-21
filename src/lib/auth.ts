'use server';

import { cache } from 'react';
import type {
  ApiResponse,
  Profile,
  SignInFormData,
  CreateHRFormData,
  EditHRFormData,
  HRRequest,
  RequestAccessFormData,
} from './types';
import { getSupabaseServerClient, getSupabaseAdminClient } from './supabase';

// ─────────────────────────────────────────────────────────────
// Helper: get the placeholder email Supabase stores internally
// We use username-based auth on the UI, but Supabase Auth
// requires an email. We map: username → username@rivo.internal
// ─────────────────────────────────────────────────────────────
function toInternalEmail(username: string): string {
  return `${username.toLowerCase().trim()}@rivo.internal`;
}

// ─────────────────────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────────────────────

/**
 * Sign in with username + password.
 * Looks up the username in the profiles table, resolves the internal
 * email, then authenticates with Supabase Auth.
 */
export async function signIn(
  data: SignInFormData
): Promise<ApiResponse<{ role: string; redirect: string }>> {
  if (!data.username?.trim() || !data.password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const username = data.username.trim().toLowerCase();

  // Step 1: Use admin client to look up the profile by username.
  // We MUST use admin client here because the user is not yet authenticated,
  // so RLS would block any read on the profiles table with the anon client.
  const adminClient = getSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, role_id, is_active')
    .eq('username', username)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Invalid username or password.' };
  }

  if (!profile.is_active) {
    return {
      success: false,
      error: 'Your account has been deactivated. Please contact your admin.',
    };
  }

  // Step 2: Authenticate with Supabase using the internal email + password.
  // Use the server client here so the session cookie is written to the response.
  const supabase = await getSupabaseServerClient();
  const email = toInternalEmail(username);
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: data.password,
  });

  if (authError) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Step 3: Determine role using role_id directly (1 = admin, 2 = hr)
  // Avoid the PostgREST foreign key join which can return null unexpectedly.
  const roleName = profile.role_id === 1 ? 'admin' : 'hr';
  const redirect = roleName === 'admin' ? '/admin/dashboard' : '/hr/dashboard';

  return { success: true, data: { role: roleName, redirect } };
}

/**
 * Sign out the current user and clear the session cookie.
 */
export async function signOut(): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Get the currently signed-in user's full profile.
 */
export const getCurrentUser = cache(async (): Promise<ApiResponse<Profile>> => {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return { success: false, error: 'Not authenticated.' };
  }

  const adminClient = getSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Profile not found.' };
  }

  const roleName = profile.role_id === 1 ? 'admin' : 'hr';

  return {
    success: true,
    data: {
      ...profile,
      role: roleName,
    } as Profile,
  };
});

// ─────────────────────────────────────────────────────────────
// HR MANAGEMENT (Admin only — uses admin client)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new HR account.
 * 1. Creates an auth user (with internal placeholder email)
 * 2. Inserts a profile row linked to the auth user
 */
export async function createHR(data: CreateHRFormData): Promise<ApiResponse<Profile>> {
  if (!data.full_name?.trim() || !data.username?.trim() || !data.password) {
    return { success: false, error: 'Full name, username, and password are required.' };
  }
  if (data.username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }
  if (data.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const adminClient = getSupabaseAdminClient();
  const username = data.username.trim().toLowerCase();
  const email    = toInternalEmail(username);

  // Step 1: Create the auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true, // Auto-confirm so no email is needed
    user_metadata: { username, full_name: data.full_name.trim() },
  });

  if (authError) {
    console.error('authError during HR creation:', authError);
    // Friendly error for duplicate username
    if (authError.message.includes('already registered')) {
      return { success: false, error: `Username "${username}" is already taken.` };
    }
    return { success: false, error: authError.message };
  }

  // Step 2: Fetch the HR role ID dynamically
  const { data: roleData, error: roleError } = await adminClient
    .from('roles')
    .select('id')
    .eq('name', 'hr')
    .single();

  if (roleError || !roleData) {
    console.error('roleError during HR creation:', roleError);
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: 'System configuration error: HR role not found.' };
  }

  // Step 3: Insert (or update) the profile row
  // We use upsert here in case a rogue trigger on auth.users already created a row
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id:         authData.user.id,
      username,
      full_name:  data.full_name.trim(),
      email:      data.email?.trim() || null,
      phone:      data.phone?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      role_id:    roleData.id,
      is_active:  true,
    }, { onConflict: 'id' })
    .select()
    .single();

  if (profileError) {
    console.error('profileError during HR creation:', profileError);
    // Roll back: delete the auth user we just created
    await adminClient.auth.admin.deleteUser(authData.user.id);
    if (profileError.message.includes('avatar_url')) {
      return { success: false, error: 'Missing avatar_url column. Please run: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1000); in Supabase SQL Editor.' };
    }
    if (profileError.message.includes('email')) {
      return { success: false, error: 'Missing email column. Please run: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255); in Supabase SQL Editor.' };
    }
    return { success: false, error: `Failed to create HR profile: ${profileError.message}` };
  }

  return {
    success: true,
    data:    { ...profile, role: 'hr' } as Profile,
    message: `HR account "${username}" created successfully.`,
  };
}

/**
 * Update an HR's name, phone, email, avatar, or username.
 */
export async function updateHR(
  id: string,
  data: EditHRFormData
): Promise<ApiResponse<Profile>> {
  const adminClient = getSupabaseAdminClient();
  const username = data.username.trim().toLowerCase();

  // Update profile table
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .update({
      full_name:  data.full_name.trim(),
      email:      data.email?.trim() || null,
      phone:      data.phone?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      username,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (profileError) {
    if (profileError.message.includes('unique')) {
      return { success: false, error: `Username "${username}" is already taken.` };
    }
    if (profileError.message.includes('avatar_url')) {
      return { success: false, error: 'Missing avatar_url column. Please run: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1000); in Supabase SQL Editor.' };
    }
    if (profileError.message.includes('email')) {
      return { success: false, error: 'Missing email column. Please run: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255); in Supabase SQL Editor.' };
    }
    return { success: false, error: profileError.message };
  }

  // Also update the auth user's email to match new username
  await adminClient.auth.admin.updateUserById(id, {
    email: toInternalEmail(username),
    user_metadata: { username, full_name: data.full_name.trim(), email: data.email?.trim() || null },
  });

  return {
    success: true,
    data:    { ...profile, role: 'hr' } as Profile,
    message: 'HR account updated successfully.',
  };
}

/**
 * Reset an HR account's password.
 */
export async function resetHRPassword(
  hrId: string,
  newPassword: string
): Promise<ApiResponse<{ newPassword: string }>> {
  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const adminClient = getSupabaseAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(hrId, {
    password: newPassword,
  });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data:    { newPassword },
    message: 'Password reset successfully.',
  };
}

/**
 * Toggle an HR account's active/inactive status.
 */
export async function toggleHRActive(
  hrId: string
): Promise<ApiResponse<{ is_active: boolean }>> {
  const adminClient = getSupabaseAdminClient();

  // Get current status
  const { data: current, error: fetchError } = await adminClient
    .from('profiles')
    .select('is_active')
    .eq('id', hrId)
    .single();

  if (fetchError || !current) {
    return { success: false, error: 'HR account not found.' };
  }

  const newStatus = !current.is_active;

  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq('id', hrId);

  if (updateError) return { success: false, error: updateError.message };

  return {
    success: true,
    data:    { is_active: newStatus },
    message: `HR account ${newStatus ? 'activated' : 'deactivated'} successfully.`,
  };
}

/**
 * Permanently delete an HR account from profiles and auth.
 */
export async function deleteHR(hrId: string): Promise<ApiResponse> {
  const adminClient = getSupabaseAdminClient();

  // 1. Delete profile row
  const { error: profileError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', hrId);

  if (profileError) return { success: false, error: profileError.message };

  // 2. Delete Supabase Auth user
  await adminClient.auth.admin.deleteUser(hrId);

  return { success: true, message: 'HR account permanently removed.' };
}

// ─────────────────────────────────────────────────────────────
// HR REQUEST SYSTEM
// ─────────────────────────────────────────────────────────────

/**
 * Submit a new account or password reset request.
 * Unauthenticated users can call this (the RLS policy allows it).
 */
export async function createRequest(
  data: RequestAccessFormData
): Promise<ApiResponse<HRRequest>> {
  if (!data.username?.trim()) {
    return { success: false, error: 'Username is required.' };
  }

  const adminClient = getSupabaseAdminClient();
  const username = data.username.trim().toLowerCase();

  // Check if there's already a pending request for this username
  const { data: existing } = await adminClient
    .from('hr_requests')
    .select('id')
    .eq('username', username)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: 'A request is already pending for this username. Please wait for admin review.',
    };
  }

  // Determine request type: if username exists in profiles → password_reset, else → new_account
  const { data: profileExists } = await adminClient
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  const requestType: 'new_account' | 'password_reset' = profileExists
    ? 'password_reset'
    : 'new_account';

  const { data: request, error } = await adminClient
    .from('hr_requests')
    .insert({ username, request_type: requestType })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Notify all admins
  const { data: admins } = await adminClient
    .from('profiles')
    .select('id')
    .eq('role_id', 1)
    .eq('is_active', true);

  if (admins && admins.length > 0) {
    const notifications = admins.map((admin: { id: string }) => ({
      user_id:           admin.id,
      notification_type: 'hr_request_pending' as const,
      title:             'New HR Request',
      message:           `${username} submitted a ${requestType === 'new_account' ? 'new account' : 'password reset'} request.`,
      link:              '/admin/requests',
    }));
    await adminClient.from('notifications').insert(notifications);
  }

  return {
    success: true,
    data:    request as HRRequest,
    message: 'Your request has been submitted. An admin will review it shortly.',
  };
}

/**
 * Approve an HR request.
 * For password_reset: updates the HR's password in Supabase Auth and marks request approved.
 * For new_account: marks request approved.
 */
export async function approveRequest(
  requestId: string,
  newPassword?: string
): Promise<ApiResponse<HRRequest>> {
  const adminClient = getSupabaseAdminClient();

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  // Fetch request details first
  const { data: req, error: reqError } = await adminClient
    .from('hr_requests')
    .select('id, username, request_type, status')
    .eq('id', requestId)
    .single();

  if (reqError || !req) {
    return { success: false, error: 'Request not found.' };
  }

  // If password_reset, look up profile by username and update password
  if (req.request_type === 'password_reset') {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'A new password (at least 8 characters) is required to approve a password reset request.' };
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', req.username)
      .single();

    if (!profile) {
      return { success: false, error: `HR account for username "${req.username}" was not found.` };
    }

    // Immediately update password in Supabase Auth
    const { error: authError } = await adminClient.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });

    if (authError) {
      return { success: false, error: `Failed to update password: ${authError.message}` };
    }

    // Ensure account is active
    await adminClient.from('profiles').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', profile.id);
  }

  // Mark request as approved
  const { data: updatedRequest, error } = await adminClient
    .from('hr_requests')
    .update({
      status:      'approved',
      admin_id:    user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: updatedRequest as HRRequest,
    message: req.request_type === 'password_reset'
      ? `Password updated for "${req.username}" and request approved.`
      : `Request for "${req.username}" approved.`,
  };
}

/**
 * Reject an HR request with an optional reason.
 */
export async function rejectRequest(
  requestId: string,
  reason?: string
): Promise<ApiResponse<HRRequest>> {
  const adminClient = getSupabaseAdminClient();

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { data: request, error } = await adminClient
    .from('hr_requests')
    .update({
      status:           'rejected',
      admin_id:         user.id,
      rejection_reason: reason || null,
      resolved_at:      new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, data: request as HRRequest, message: 'Request rejected.' };
}

// ─────────────────────────────────────────────────────────────
// APPLICANT ACTIONS (HR only — real DB calls)
// ─────────────────────────────────────────────────────────────

/**
 * Accept an applicant and schedule interview.
 * In production: also creates Google Meet link and sends email.
 */
export async function acceptApplicant(
  applicantId: string,
  date: string,
  time: string
): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  // Update applicant status
  const { error: applicantError } = await supabase
    .from('applicants')
    .update({
      status:         'interview_scheduled',
      interview_date: date,
      interview_time: time,
      updated_at:     new Date().toISOString(),
    })
    .eq('id', applicantId)
    .eq('hr_id', user.id);

  if (applicantError) return { success: false, error: applicantError.message };

  // Log the status change
  await supabase.from('status_history').insert({
    applicant_id: applicantId,
    old_status:   'accepted',
    new_status:   'interview_scheduled',
    changed_by:   user.id,
    notes:        `Interview scheduled for ${date} at ${time}`,
  });

  return {
    success: true,
    message: `Interview scheduled for ${date} at ${time}.`,
  };
}

/**
 * Reject an applicant with an optional reason.
 */
export async function rejectApplicant(
  applicantId: string,
  reason?: string
): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { data: current } = await supabase
    .from('applicants')
    .select('status')
    .eq('id', applicantId)
    .single();

  const { error } = await supabase
    .from('applicants')
    .update({ status: 'rejected', notes: reason || null, updated_at: new Date().toISOString() })
    .eq('id', applicantId)
    .eq('hr_id', user.id);

  if (error) return { success: false, error: error.message };

  await supabase.from('status_history').insert({
    applicant_id: applicantId,
    old_status:   current?.status ?? null,
    new_status:   'rejected',
    changed_by:   user.id,
    notes:        reason || null,
  });

  return { success: true, message: 'Applicant has been rejected.' };
}

/**
 * Put an applicant on hold for later review.
 */
export async function holdApplicant(applicantId: string): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { data: current } = await supabase
    .from('applicants')
    .select('status')
    .eq('id', applicantId)
    .single();

  const { error } = await supabase
    .from('applicants')
    .update({ status: 'on_hold', updated_at: new Date().toISOString() })
    .eq('id', applicantId)
    .eq('hr_id', user.id);

  if (error) return { success: false, error: error.message };

  await supabase.from('status_history').insert({
    applicant_id: applicantId,
    old_status:   current?.status ?? null,
    new_status:   'on_hold',
    changed_by:   user.id,
  });

  return { success: true, message: 'Applicant moved to On Hold.' };
}

/**
 * Select a candidate post-interview.
 * In production: sends agreement letter email.
 */
export async function selectCandidate(
  applicantId: string,
  notes?: string
): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabase
    .from('applicants')
    .update({
      status:     'selected',
      notes:      notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicantId)
    .eq('hr_id', user.id);

  if (error) return { success: false, error: error.message };

  await supabase.from('status_history').insert({
    applicant_id: applicantId,
    old_status:   'interview_completed',
    new_status:   'selected',
    changed_by:   user.id,
    notes:        notes || null,
  });

  return { success: true, message: 'Candidate selected. Agreement letter will be sent.' };
}

/**
 * Verify candidate documents.
 * In production: triggers workspace creation via Google Drive API.
 */
export async function verifyDocuments(applicantId: string): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabase
    .from('applicants')
    .update({ status: 'documents_verified', updated_at: new Date().toISOString() })
    .eq('id', applicantId)
    .eq('hr_id', user.id);

  if (error) return { success: false, error: error.message };

  await supabase.from('status_history').insert({
    applicant_id: applicantId,
    old_status:   'documents_received',
    new_status:   'documents_verified',
    changed_by:   user.id,
  });

  return { success: true, message: 'Documents verified. Workspace is being created...' };
}

/**
 * Mark an interview as completed.
 */
export async function markInterviewComplete(interviewId: string): Promise<ApiResponse> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabase
    .from('interviews')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', interviewId)
    .eq('hr_id', user.id);

  if (error) return { success: false, error: error.message };

  return { success: true, message: 'Interview marked as completed.' };
}
