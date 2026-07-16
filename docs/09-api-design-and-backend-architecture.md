# 09 — API Design & Backend Architecture

> **Document Purpose:** Define the complete API surface, server action patterns, webhook handlers, background job architecture, and error handling strategy.

---

## 9.1 Backend Architecture Overview

The backend uses **Next.js App Router** with a hybrid approach:

1. **Server Actions** — For form submissions and mutations (Accept/Reject, create HR, etc.)
2. **API Routes** — For webhooks, cron jobs, and external integrations (Google callbacks)
3. **React Server Components** — For data fetching and rendering applicant lists, dashboards
4. **Client Components** — For interactivity (modals, notifications, upload forms)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND ARCHITECTURE                            │
│                                                                     │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐   │
│  │  SERVER COMPONENTS   │  │  SERVER ACTIONS                   │   │
│  │  (Data Fetching)     │  │  (Mutations)                      │   │
│  │                      │  │                                   │   │
│  │  • AdminDashboard    │  │  • signIn(username, password)     │   │
│  │  • HRDashboard       │  │  • createHR(data)                 │   │
│  │  • ApplicantList     │  │  • approveRequest(id)             │   │
│  │  • InterviewList     │  │  • acceptApplicant(id, date,time) │   │
│  │  • NotificationList  │  │  • uploadDocument(token, files)   │   │
│  └──────────────────────┘  │  • verifyDocuments(id)            │   │
│                             │  • ...more actions               │   │
│                             └───────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API ROUTES                                                  │   │
│  │                                                              │   │
│  │  GET    /api/cron/*        (Background jobs)                 │   │
│  │  POST   /api/webhook/*     (Google callbacks)                │   │
│  │  GET    /api/applicants    (Export, search)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SHARED LIBRARIES                                            │   │
│  │                                                              │   │
│  │  /lib/supabase/client.ts    (Server & client clients)        │   │
│  │  /lib/google/auth.ts        (Google auth utilities)          │   │
│  │  /lib/email/*               (Email templates & sending)      │   │
│  │  /lib/drive/*               (Google Drive operations)        │   │
│  │  /lib/calendar/*            (Google Calendar operations)      │   │
│  │  /lib/sheets/*              (Google Sheets operations)        │   │
│  │  /lib/cron/*                (Background job logic)           │   │
│  │  /lib/validations/*         (Zod schemas)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9.2 Server Actions — Complete Reference

### 9.2.1 Authentication Actions

```typescript
// actions/auth.ts
'use server';

export async function signIn(formData: {
  username: string;
  password: string;
}): Promise<{ success: true; role: 'admin' | 'hr' } | { success: false; error: string }> {
  // 1. Validate input with Zod
  // 2. Look up user by username in profiles table
  // 3. Authenticate via Supabase Auth
  // 4. Check if user is active
  // 5. Start session
  // 6. Return role for redirect
}

export async function signOut(): Promise<void> {
  // Clear session cookie
}

export async function createRequest(username: string): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Determine request type (new account vs password reset)
  // 2. Check for existing pending request
  // 3. Insert into hr_requests
  // 4. Notify admin
}
```

### 9.2.2 Admin Actions

```typescript
// actions/admin.ts
'use server';

export async function createHR(data: {
  fullName: string;
  phone: string;
  username: string;
  password: string;
}): Promise<{ success: true; hrId: string } | { success: false; error: string }> {
  // 1. Validate input
  // 2. Check username uniqueness
  // 3. Create auth user via supabase.auth.admin.createUser()
  // 4. Insert into profiles table
  // 5. Return HR ID
}

export async function updateHR(hrId: string, data: {
  fullName?: string;
  phone?: string;
  username?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Validate input
  // 2. Check username uniqueness (if changed)
  // 3. Update profiles table
}

export async function resetHRPassword(hrId: string, newPassword: string): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Call supabase.auth.admin.updateUserById()
  // 2. Log the password reset
}

export async function toggleHRActive(hrId: string): Promise<{ success: true; isActive: boolean } | { success: false; error: string }> {
  // 1. Toggle profiles.is_active
  // 2. If deactivating, revoke sessions (optional)
}

export async function approveRequest(requestId: string): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Update request status to 'approved'
  // 2. If new account: proceed to creation
  // 3. If password reset: allow password reset
}

export async function rejectRequest(requestId: string, reason?: string): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Update request status to 'rejected'
  // 2. Set rejection_reason
}
```

### 9.2.3 HR Applicant Actions

```typescript
// actions/applicants.ts
'use server';

export async function acceptApplicant(
  applicantId: string,
  interviewDate: string,
  interviewTime: string
): Promise<{ success: true; meetLink: string } | { success: false; error: string }> {
  // 1. Validate state transition (must be pending or on_hold)
  // 2. Get applicant + HR details
  // 3. Create Google Calendar event with Meet
  // 4. Save interview record
  // 5. Send interview email via Gmail API
  // 6. Update applicant status → 'interview_scheduled'
  // 7. Log status change
  // 8. Return meet link
}

export async function rejectApplicant(
  applicantId: string,
  reason?: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Validate state transition
  // 2. Update applicant status → 'rejected'
  // 3. Log status change with reason
  // Note: Google Sheet data is NEVER modified
}

export async function holdApplicant(
  applicantId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Validate state transition (must be pending)
  // 2. Update applicant status → 'on_hold'
  // 3. Log status change
}

export async function acceptFromHold(
  applicantId: string,
  interviewDate: string,
  interviewTime: string
): Promise<{ success: true; meetLink: string } | { success: false; error: string }> {
  // Same as acceptApplicant but from 'on_hold' state
}

export async function markInterviewComplete(
  interviewId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Update interview status → 'completed'
  // 2. Update applicant status → 'interview_completed'
  // 3. Log status change
}
```

### 9.2.4 Post-Interview & Document Actions

```typescript
// actions/post-interview.ts
'use server';

export async function selectCandidate(
  applicantId: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Validate applicant in 'interview_completed' state
  // 2. Update applicant status → 'selected'
  // 3. Send agreement letter email with upload portal link
  // 4. Mark applicant status → 'document_collection'
  // 5. Log status change
}

export async function rejectPostInterview(
  applicantId: string,
  reason?: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Update applicant status → 'rejected'
  // 2. Log with post-interview context
}

export async function verifyDocuments(
  applicantId: string
): Promise<{ success: true; workspace: WorkspaceInfo } | { success: false; error: string }> {
  // 1. Verify all 3 documents exist and are valid
  // 2. Update status → 'documents_verified'
  // 3. Create Google Drive workspace (see action below)
  // 4. Update status → 'workspace_created'
  // 5. Send workspace access email
  // 6. Return workspace details
}

export async function rejectDocuments(
  applicantId: string,
  reason: string
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Update document statuses → 'rejected'
  // 2. Update applicant status → 'document_collection' (for resubmission)
  // 3. Send resubmission email to candidate
}

export async function createWorkspace(
  applicantId: string
): Promise<{ success: true; workspace: WorkspaceInfo } | { success: false; error: string }> {
  // 1. Get applicant details
  // 2. Call Google Drive API to create folder structure
  // 3. Create Task Tracker Google Sheet
  // 4. Set sharing permissions for candidate + HR
  // 5. Save workspace record to database
  // 6. Send workspace access email
  // 7. Return workspace folder URL + sheet URL
}
```

### 9.2.5 Candidate Upload Actions

```typescript
// actions/upload.ts
'use server';

export async function uploadDocument(
  token: string,
  documentType: 'agreement_letter' | 'aadhaar_card' | 'marksheet',
  file: File
): Promise<{ success: true } | { success: false; error: string }> {
  // 1. Validate upload token (not expired)
  // 2. Resolve token to applicant
  // 3. Validate file type (PDF, JPG, PNG)
  // 4. Validate file size (max 10 MB)
  // 5. Upload to Supabase Storage
  // 6. Create document record
  // 7. If all 3 documents uploaded:
  //    - Update applicant status → 'documents_received'
  //    - Notify HR
}

export async function getUploadStatus(
  token: string
): Promise<{
  candidateName: string;
  documents: Array<{ type: string; uploaded: boolean; fileName?: string }>;
  allUploaded: boolean;
}> {
  // 1. Validate token
  // 2. Return upload status for each document type
}
```

---

## 9.3 API Routes

### 9.3.1 Cron Job Routes

```typescript
// app/api/cron/sync-applicants/route.ts
export async function GET(request: Request) {
  // Protected by CRON_SECRET
  // Syncs applicants from all HRs' Google Sheets
  // Returns sync summary
}

// app/api/cron/interview-reminders/route.ts
export async function GET(request: Request) {
  // Protected by CRON_SECRET
  // Checks for interviews starting in 20 minutes
  // Creates notifications for HRs
}

// app/api/cron/mark-completed-interviews/route.ts
export async function GET(request: Request) {
  // Protected by CRON_SECRET
  // Marks interviews as 'completed' if past scheduled time
}

// app/api/cron/expire-upload-tokens/route.ts
export async function GET(request: Request) {
  // Protected by CRON_SECRET
  // Disables upload tokens older than 7 days
}
```

### 9.3.2 Webhook Routes

```typescript
// app/api/webhook/sheets-update/route.ts
// Future: Called by Google Apps Script when Google Sheet is updated
// Real-time sync instead of polling
export async function POST(request: Request) {
  // 1. Verify webhook signature
  // 2. Parse updated rows
  // 3. Upsert into applicants table
  // 4. Return 200 OK
}
```

### 9.3.3 Utility Routes

```typescript
// app/api/applicants/export/route.ts
export async function GET(request: Request) {
  // Export filtered applicant list as CSV
  // For HR to download
}

// app/api/health/route.ts
export async function GET() {
  // Health check endpoint
  // Verify Supabase connection, Google API auth
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```

---

## 9.4 Server Action Patterns

### 9.4.1 Standard Action Pattern

Every server action follows this consistent pattern:

```typescript
'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 1. Define Zod schema for input validation
const schema = z.object({
  applicantId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

// 2. Define return type
interface ActionResult {
  success: true;
  data?: Record<string, unknown>;
}

interface ActionError {
  success: false;
  error: string;
  field?: string;  // For field-level form errors
}

type ActionResponse = ActionResult | ActionError;

// 3. Export server action
export async function rejectApplicant(
  prevState: ActionResponse | null,     // For useActionState
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 4. Parse and validate input
    const parsed = schema.parse({
      applicantId: formData.get('applicantId'),
      reason: formData.get('reason'),
    });

    // 5. Create authenticated Supabase client
    const supabase = createServerSupabaseClient();

    // 6. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized', field: 'general' };
    }

    // 7. Check authorization (RLP will also enforce this)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single();

    if (profile?.role_id !== 2) {  // HR role
      return { success: false, error: 'Only HR can reject applicants', field: 'general' };
    }

    // 8. Get current applicant state
    const { data: applicant } = await supabase
      .from('applicants')
      .select('status, hr_id')
      .eq('id', parsed.applicantId)
      .single();

    if (!applicant) {
      return { success: false, error: 'Applicant not found', field: 'general' };
    }

    // 9. Validate state transition
    if (!['pending', 'on_hold', 'interview_completed'].includes(applicant.status)) {
      return { success: false, error: `Cannot reject applicant in '${applicant.status}' state`, field: 'general' };
    }

    // 10. Perform the mutation
    const { error } = await supabase
      .from('applicants')
      .update({ status: 'rejected' })
      .eq('id', parsed.applicantId);

    if (error) throw error;

    // 11. Log status change
    await supabase.from('status_history').insert({
      applicant_id: parsed.applicantId,
      old_status: applicant.status,
      new_status: 'rejected',
      changed_by: user.id,
      notes: parsed.reason || null,
    });

    // 12. Revalidate cache
    revalidatePath('/hr/dashboard');
    revalidatePath('/hr/applicants');

    // 13. Return success
    return { success: true, data: { applicantId: parsed.applicantId } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
        field: firstError.path.join('.'),
      };
    }
    console.error('rejectApplicant error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
```

### 9.4.2 Action Error Handling Strategy

| Error Type | HTTP Analogue | UI Handling |
|------------|---------------|-------------|
| Input validation error | 400 | Show field-level error below the input |
| Unauthorized (no session) | 401 | Redirect to sign-in |
| Forbidden (wrong role) | 403 | Show toast: "You don't have permission" |
| Not found | 404 | Show toast: "Applicant not found" |
| State transition invalid | 409 | Show toast: "Cannot perform this action in current state" |
| Google API error | 502 | Show toast: "Failed to create meeting. Please try again." |
| Supabase error | 500 | Show toast: "Database error. Please contact support." |
| Rate limit | 429 | Show toast: "Too many requests. Please wait a moment." |
| Network error | 0 | Show toast: "Network error. Check your connection." |

---

## 9.5 Data Layer Patterns

### 9.5.1 Supabase Client Helpers

```typescript
// lib/supabase/server.ts
// For use in Server Components and Server Actions
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// lib/supabase/client.ts
// For use in Client Components
import { createBrowserClient } from '@supabase/ssr';

export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 9.5.2 Reusable Queries

```typescript
// data/applicants.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getApplicantsByHR(hrId: string, options: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const supabase = createServerSupabaseClient();
  const query = supabase
    .from('applicants')
    .select('*', { count: 'exact' })
    .eq('hr_id', hrId);

  if (options.status) {
    query.eq('status', options.status);
  }

  if (options.search) {
    query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
  }

  if (options.sortBy) {
    query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
  } else {
    query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const pageSize = options.pageSize || 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query.range(from, to);

  const { data, count, error } = await query;
  return {
    applicants: data || [],
    total: count || 0,
    page: options.page || 1,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
```

---

## 9.6 Validation Schemas

```typescript
// lib/validations/schemas.ts
import { z } from 'zod';

export const signInSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createHRSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().regex(/^\+?[\d\s-]{10,20}$/, 'Invalid phone number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(100)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const scheduleInterviewSchema = z.object({
  applicantId: z.string().uuid(),
  interviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  interviewTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
}).refine((data) => {
  const dateTime = new Date(`${data.interviewDate}T${data.interviewTime}`);
  return dateTime > new Date();
}, { message: 'Interview must be scheduled in the future' });

export const uploadDocumentSchema = z.object({
  token: z.string().min(1),
  documentType: z.enum(['agreement_letter', 'aadhaar_card', 'marksheet']),
  file: z.instanceof(File).refine(
    (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
    'Only PDF, JPG, and PNG files are accepted'
  ).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'File size must be less than 10 MB'
  ),
});
```

---

## 9.7 Background Job Architecture

### 9.7.1 Job Runner

```typescript
// lib/cron/runner.ts
// Each cron job follows this pattern:
interface CronResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  executionTimeMs: number;
}

async function runCronJob(
  name: string,
  handler: () => Promise<CronResult>,
  request: Request
): Promise<Response> {
  const startTime = Date.now();

  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await handler();
    const totalTime = Date.now() - startTime;

    console.log(`[Cron: ${name}] Completed in ${totalTime}ms. Processed: ${result.processedCount}. Errors: ${result.errors.length}`);

    return Response.json({
      job: name,
      ...result,
      executionTimeMs: totalTime,
    });
  } catch (error: any) {
    console.error(`[Cron: ${name}] Failed:`, error);
    return Response.json({
      job: name,
      success: false,
      error: error.message,
      executionTimeMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
```

---

## 9.8 Upload Portal — Token-Based Auth

The upload portal uses **tokens** instead of user accounts for candidate document submission.

### Token Generation

```typescript
// lib/upload/token.ts
import { createHash, randomBytes } from 'crypto';

export function generateUploadToken(applicantId: string): string {
  const raw = `${applicantId}-${randomBytes(16).toString('hex')}-${Date.now()}`;
  return createHash('sha256').update(raw).digest('hex');
}

// Token record stored in a separate table or as a column in applicants
// {
//   upload_token: "a3f8b2c1...",
//   token_expires_at: "2026-07-23T20:00:00Z",  // 7 days from creation
//   token_used: false
// }
```

### Token Verification Middleware

```typescript
// app/upload/[token]/page.tsx
export default async function UploadPage({ params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient();

  // Verify token
  const { data: applicant } = await supabase
    .from('applicants')
    .select('id, full_name, status')
    .eq('upload_token', params.token)
    .gte('token_expires_at', new Date().toISOString())
    .single();

  if (!applicant) {
    return <div>This upload link is invalid or has expired.</div>;
  }

  if (applicant.status !== 'document_collection' && applicant.status !== 'documents_received') {
    return <div>Documents have already been submitted or are not being collected at this stage.</div>;
  }

  return <UploadForm applicantId={applicant.id} candidateName={applicant.full_name} token={params.token} />;
}
```

---

## 9.9 Logging & Monitoring

```typescript
// lib/logging.ts
export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'INFO', message, data, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'WARN', message, data, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      data,
      timestamp: new Date().toISOString(),
    }));
  },
};

// Log all Google API interactions
export async function logGoogleAPICall(apiName: string, operation: string, durationMs: number, success: boolean) {
  await supabase.from('api_logs').insert({
    api_name: apiName,
    operation,
    duration_ms: durationMs,
    success,
    timestamp: new Date().toISOString(),
  });
}
```

---

> **Next Document:** [10 — Deployment, Security, Testing & Roadmap](./10-deployment-security-testing-and-roadmap.md)
