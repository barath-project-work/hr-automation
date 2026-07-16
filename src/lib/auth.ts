'use server';

import type {
  ApiResponse,
  Profile,
  SignInFormData,
  CreateHRFormData,
  EditHRFormData,
  HRRequest,
  RequestAccessFormData,
} from './types';
import { delay } from './utils';

// ============ Mock Data (will be replaced with real DB calls) ============

// In production, these operations would use Supabase Auth + Database.
// The interfaces remain the same — only the implementation changes.

// ============ Authentication Actions ============

/**
 * Sign in with username and password.
 * In production: calls supabase.auth.signInWithPassword()
 * after resolving username → email mapping.
 */
export async function signIn(data: SignInFormData): Promise<ApiResponse<{ role: string; redirect: string }>> {
  await delay(1200); // Simulate network delay

  // Mock validation - replace with real auth
  if (!data.username || !data.password) {
    return { success: false, error: 'Username and password are required.' };
  }

  if (data.password.length < 8) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Special case: admin login with exact credentials
  if (data.username === 'admin' && data.password === 'Admin@123') {
    return {
      success: true,
      data: { role: 'admin', redirect: '/admin/dashboard' },
    };
  }

  // Mock HR login for any username starting with 'hr_' with correct password
  if (data.username.startsWith('hr_') && data.password.length >= 8) {
    return {
      success: true,
      data: { role: 'hr', redirect: '/hr/dashboard' },
    };
  }

  return { success: false, error: 'Invalid username or password.' };
}

/**
 * Sign out the current user.
 * In production: clears Supabase session.
 */
export async function signOut(): Promise<ApiResponse> {
  await delay(300);
  return { success: true };
}

/**
 * Get the current user's profile.
 * In production: fetches from profiles table using session user ID.
 */
export async function getCurrentUser(): Promise<ApiResponse<Profile>> {
  return {
    success: true,
    data: {
      id: 'mock-user-id',
      username: 'admin',
      full_name: 'Admin User',
      phone: '+91-9876543210',
      role_id: 1,
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

// ============ HR Management Actions ============

/**
 * Create a new HR account.
 * In production: calls supabase.auth.admin.createUser() + inserts into profiles.
 */
export async function createHR(data: CreateHRFormData): Promise<ApiResponse<Profile>> {
  await delay(800);

  // Mock validation
  if (!data.full_name || !data.username || !data.password) {
    return { success: false, error: 'Full name, username, and password are required.' };
  }

  if (data.username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }

  if (data.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  return {
    success: true,
    data: {
      id: `hr-${Date.now()}`,
      username: data.username,
      full_name: data.full_name,
      phone: data.phone,
      role_id: 2,
      role: 'hr',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    message: `HR account "${data.username}" created successfully.`,
  };
}

/**
 * Update an existing HR account.
 */
export async function updateHR(id: string, data: EditHRFormData): Promise<ApiResponse<Profile>> {
  await delay(600);

  return {
    success: true,
    data: {
      id,
      username: data.username,
      full_name: data.full_name,
      phone: data.phone,
      role_id: 2,
      role: 'hr',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    message: 'HR account updated successfully.',
  };
}

/**
 * Reset an HR's password.
 * In production: calls supabase.auth.admin.updateUserById().
 */
export async function resetHRPassword(
  hrId: string,
  newPassword: string
): Promise<ApiResponse<{ newPassword: string }>> {
  await delay(500);

  return {
    success: true,
    data: { newPassword },
    message: 'Password reset successfully.',
  };
}

/**
 * Toggle HR account active/inactive status.
 */
export async function toggleHRActive(hrId: string): Promise<ApiResponse<{ is_active: boolean }>> {
  await delay(400);
  return {
    success: true,
    data: { is_active: true },
    message: 'HR account status updated.',
  };
}

/**
 * Delete (deactivate) an HR account.
 */
export async function deleteHR(hrId: string): Promise<ApiResponse> {
  await delay(500);
  return {
    success: true,
    message: 'HR account deactivated.',
  };
}

// ============ HR Request Actions ============

/**
 * Submit a request for a new account or password reset.
 */
export async function createRequest(
  data: RequestAccessFormData
): Promise<ApiResponse<HRRequest>> {
  await delay(700);

  if (!data.username) {
    return { success: false, error: 'Username is required.' };
  }

  const requestType = data.username.startsWith('hr_') ? 'password_reset' : 'new_account';

  return {
    success: true,
    data: {
      id: `req-${Date.now()}`,
      username: data.username,
      request_type: requestType,
      status: 'pending',
      admin_id: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      resolved_at: null,
    },
    message: 'Your request has been submitted. An admin will review it shortly.',
  };
}

/**
 * Approve an HR request.
 */
export async function approveRequest(
  requestId: string
): Promise<ApiResponse<HRRequest>> {
  await delay(500);

  return {
    success: true,
    data: {
      id: requestId,
      username: 'hr_user',
      request_type: 'new_account',
      status: 'approved',
      admin_id: 'admin-id',
      rejection_reason: null,
      created_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    },
    message: 'Request approved.',
  };
}

/**
 * Reject an HR request.
 */
export async function rejectRequest(
  requestId: string,
  reason?: string
): Promise<ApiResponse<HRRequest>> {
  await delay(500);

  return {
    success: true,
    data: {
      id: requestId,
      username: 'hr_user',
      request_type: 'new_account',
      status: 'rejected',
      admin_id: 'admin-id',
      rejection_reason: reason || null,
      created_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    },
    message: 'Request rejected.',
  };
}

// ============ Applicant Actions ============

/**
 * Accept an applicant and schedule interview.
 * In production: creates Google Meet, sends email, updates DB.
 */
export async function acceptApplicant(
  applicantId: string,
  date: string,
  time: string
): Promise<ApiResponse> {
  await delay(1500);

  return {
    success: true,
    message: `Interview scheduled for ${date} at ${time}. Email sent to candidate.`,
  };
}

/**
 * Reject an applicant with optional reason.
 */
export async function rejectApplicant(
  applicantId: string,
  reason?: string
): Promise<ApiResponse> {
  await delay(500);

  return {
    success: true,
    message: 'Applicant has been rejected.',
  };
}

/**
 * Hold an applicant for later review.
 */
export async function holdApplicant(applicantId: string): Promise<ApiResponse> {
  await delay(400);

  return {
    success: true,
    message: 'Applicant moved to On Hold.',
  };
}

/**
 * Select a candidate post-interview.
 * In production: sends agreement letter email.
 */
export async function selectCandidate(
  applicantId: string,
  notes?: string
): Promise<ApiResponse> {
  await delay(1200);

  return {
    success: true,
    message: 'Candidate selected. Agreement letter sent.',
  };
}

/**
 * Verify candidate documents.
 * In production: triggers workspace creation.
 */
export async function verifyDocuments(applicantId: string): Promise<ApiResponse> {
  await delay(1000);

  return {
    success: true,
    message: 'Documents verified. Workspace is being created...',
  };
}

/**
 * Mark interview as completed.
 */
export async function markInterviewComplete(interviewId: string): Promise<ApiResponse> {
  await delay(400);

  return {
    success: true,
    message: 'Interview marked as completed.',
  };
}
