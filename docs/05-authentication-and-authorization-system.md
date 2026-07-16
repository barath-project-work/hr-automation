# 05 — Authentication & Authorization System

> **Document Purpose:** Define the complete authentication flow, role-based access control (RBAC), session management, and the HR account request/approval system.

---

## 5.1 Authentication Philosophy

The platform uses a **single sign-in page** that serves both Admin and HR users. The system determines the user's role from their credentials and redirects them to the appropriate dashboard.

```
┌──────────────────────────────────────────┐
│              SINGLE SIGN-IN              │
│                                          │
│  Username:  [________________]           │
│  Password:  [________________]           │
│                                          │
│  [Sign In]           [Request]           │
│                                          │
│  ─────────────────────────────────────── │
│  "Request" = For new HR accounts or      │
│               password resets            │
└──────────────────────────────────────────┘
```

---

## 5.2 Authentication Flow

### 5.2.1 Sign-In Process (Detailed)

```
User visits /sign-in
         │
         ▼
User enters Username + Password
         │
         ▼
Client-side validation (Zod schema):
  - Username: required, 3-100 chars
  - Password: required, 8+ chars
         │
         ▼
Server Action: signIn(formData)
         │
         ├─► 1. Look up user by username in profiles table
         │        └─► If not found → return error: "Invalid username or password"
         │
         ├─► 2. Verify password using Supabase Auth
         │        └─► If invalid → return error: "Invalid username or password"
         │
         ├─► 3. Check if user is active
         │        └─► If inactive → return error: "Account is deactivated. Contact admin."
         │
         ├─► 4. Create session (Supabase Auth session)
         │
         ├─► 5. Determine role from profiles.role_id
         │
         └─► 6. Redirect:
                ├─► role = 'admin' → /admin/dashboard
                └─► role = 'hr'    → /hr/dashboard
```

### 5.2.2 Session Management

| Aspect | Implementation |
|--------|---------------|
| Session Storage | Supabase Auth stores session in HTTP-only cookie (via `@supabase/ssr`) |
| Session Duration | 24 hours (configurable in Supabase Auth settings) |
| Token Refresh | Automatic — `@supabase/ssr` refreshes JWT before expiry |
| Logout | Server Action clears session cookie, redirects to `/sign-in` |
| Middleware | Next.js Middleware checks session on every request, redirects unauthenticated users |

### 5.2.3 Middleware Route Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to sign-in
  if (!session && !request.nextUrl.pathname.startsWith('/sign-in')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If signed in and on sign-in page, redirect to dashboard
  if (session && request.nextUrl.pathname === '/sign-in') {
    const role = await getUserRole(session.user.id);
    return NextResponse.redirect(
      new URL(role === 'admin' ? '/admin/dashboard' : '/hr/dashboard', request.url)
    );
  }

  // Role-based route protection
  if (session) {
    const role = await getUserRole(session.user.id);

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/hr/dashboard', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/hr') && role !== 'hr') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 5.3 Role-Based Access Control (RBAC)

### 5.3.1 Role Definitions

| Role | Permissions | Dashboard Route |
|------|------------|-----------------|
| **Admin** | Full system access: manage HR accounts, view all data, approve requests, system configuration | `/admin/dashboard` |
| **HR** | Limited to own applicants: view, accept/reject/hold, schedule interviews, review documents | `/hr/dashboard` |

### 5.3.2 Permission Matrix

| Feature | Admin | HR | Unauthenticated |
|---------|-------|----|-----------------|
| Sign In | ✅ | ✅ | ✅ (to sign in) |
| Create HR Account | ✅ | ❌ | ❌ |
| Edit HR Account | ✅ | ❌ | ❌ |
| Reset HR Password | ✅ | ❌ | ❌ |
| Deactivate HR | ✅ | ❌ | ❌ |
| View All Applicants | ✅ | (own only) | ❌ |
| Accept/Reject/Hold | ❌ | ✅ (own) | ❌ |
| Schedule Interview | ❌ | ✅ (own) | ❌ |
| Send Automated Emails | ❌ | ✅ (own) | ❌ |
| View Documents | ✅ | ✅ (own) | ❌ (except upload portal) |
| Verify Documents | ❌ | ✅ (own) | ❌ |
| Create Workspace | ❌ | ✅ (own, auto) | ❌ |
| View Requests | ✅ | ❌ | ❌ |
| Create Request | ❌ | ❌ | ✅ (anyone) |
| Upload Documents | ❌ | ❌ | ✅ (via secure portal) |

---

## 5.4 HR Account Management (Admin Panel)

### 5.4.1 Creating a New HR Account

```
Admin navigates to /admin/hrs → clicks "Add HR"
         │
         ▼
Admin fills form:
  - Full Name (required)
  - Phone Number (required)
  - Username (required, unique)
  - Password (required, auto-generated with option to customize)
         │
         ▼
Server Action: createHR(formData)
         │
         ├─► 1. Validate input (Zod schema)
         ├─► 2. Check username uniqueness
         ├─► 3. Call supabase.auth.admin.createUser({
         │        email: null,              // Using username-based auth
         │        password: formData.password,
         │        user_metadata: { username: formData.username }
         │    })
         ├─► 4. Insert into profiles:
         │        id: auth_user.id
         │        username: formData.username
         │        full_name: formData.fullName
         │        phone: formData.phone
         │        role_id: (select id from roles where name = 'hr')
         │        is_active: true
         ├─► 5. Return success with credentials
         │
         └─► Admin shares credentials with HR (outside platform)
```

### 5.4.2 Editing an HR Account

```
Admin navigates to /admin/hrs → clicks edit icon on an HR
         │
         ▼
Pre-filled form with current data
         │
         ▼
Admin edits: Name, Phone, Username
(Password change is a separate action)
         │
         ▼
Server Action: updateHR(hrId, formData)
         │
         ├─► 1. Validate input
         ├─► 2. Check username uniqueness (if changed)
         ├─► 3. Update profiles table
         ├─► 4. Update auth user metadata if needed
         └─► 5. Return success
```

### 5.4.3 Resetting an HR's Password

```
Admin navigates to /admin/hrs → clicks "Reset Password" on an HR
         │
         ▼
Modal: "Enter new password" or "Generate random password"
         │
         ▼
Server Action: resetHRPassword(hrId, newPassword)
         │
         ├─► 1. Call supabase.auth.admin.updateUserById(hrId, { password: newPassword })
         ├─► 2. Log the password reset in audit trail
         └─► 3. Display new password to Admin (one-time view)
              Admin shares with HR outside platform
```

### 5.4.4 Deactivating/Reactivating an HR

```
Admin navigates to /admin/hrs → toggles active/inactive switch
         │
         ▼
Server Action: toggleHRActive(hrId)
         │
         ├─► 1. Update profiles.is_active = NOT is_active
         ├─► 2. If deactivating:
         │      └─► Revoke active sessions (optional)
         └─► 3. Return success
```

---

## 5.5 HR Request System

### 5.5.1 Request Flow Overview

```
HR or External User
         │
         ▼
/sign-in page → clicks "Request"
         │
         ▼
Modal: Enter Username
         │
         ├─► If username exists → Request Type = "Password Reset"
         └─► If username doesn't exist → Request Type = "New Account"
         │
         ▼
Server Action: createRequest(username, type)
         │
         ├─► 1. Check if pending request already exists for this username
         │      └─► If yes → return error: "A request is already pending"
         ├─► 2. Insert into hr_requests table
         ├─► 3. Create notification for all Admins:
         │      "New request from {username}: {request_type}"
         └─► 4. Return success: "Your request has been submitted. An admin will review it."
```

### 5.5.2 Admin Review Process

```
Admin receives notification → clicks to view /admin/requests
         │
         ▼
List of all pending requests:
  ┌────────┬──────────────┬──────────┬─────────────┐
  │ Username│ Request Type │ Date     │ Actions     │
  ├────────┼──────────────┼──────────┼─────────────┤
  │ hr_john│ Password Reset│ 16 Jul  │ [Approve]   │
  │        │              │          │ [Reject]    │
  ├────────┼──────────────┼──────────┼─────────────┤
  │ hr_sara│ New Account  │ 16 Jul  │ [Approve]   │
  │        │              │          │ [Reject]    │
  └────────┴──────────────┴──────────┴─────────────┘
         │
         ▼
Admin clicks "Approve"
         │
         ├─► For "New Account":
         │      └─► Redirect to HR creation form with username pre-filled
         │
         ├─► For "Password Reset":
         │      └─► Modal: Enter new password → Save → Display new password
         │
         └─► Update request status to 'approved', set resolved_at, admin_id

Admin clicks "Reject"
         │
         ├─► Modal: "Reason for rejection (optional): [____]"
         └─► Update request status to 'rejected', set rejection_reason
```

### 5.5.3 Request State Machine

```
                    ┌──────────┐
                    │  Pending │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │Approved│ │Rejected│ │ Expired│ (7 days)
         └────────┘ └────────┘ └────────┘
```

---

## 5.6 Security Considerations

### 5.6.1 Password Policy

| Requirement | Value |
|-------------|-------|
| Minimum Length | 8 characters |
| Must Contain | At least 1 uppercase letter |
| Must Contain | At least 1 lowercase letter |
| Must Contain | At least 1 digit |
| Must Contain | At least 1 special character |
| Password Storage | bcrypt (via Supabase Auth) |
| Session Protection | HTTP-only cookies, SameSite=Lax |

### 5.6.2 Brute Force Protection

```typescript
// Implement rate limiting on sign-in endpoint
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,     // 15 minutes
  maxAttempts: 5,                 // 5 attempts per window
  blockDuration: 30 * 60 * 1000, // 30 minute block
};

// On failed login:
// 1. Increment attempt counter for this IP/username
// 2. If threshold exceeded, block for blockDuration
// 3. Return generic error message (don't reveal if username exists)
```

### 5.6.3 Audit Logging

Every authentication-related event should be logged:

| Event | Logged Data |
|-------|-------------|
| Failed login | IP address, username, timestamp |
| Successful login | User ID, role, IP, timestamp |
| Password change | Admin ID, target HR ID, timestamp |
| Account deactivation | Admin ID, target HR ID, timestamp |
| Request created | Username, request type, timestamp |
| Request approved/rejected | Admin ID, request ID, timestamp |

### 5.6.4 Session Security Checklist

- [ ] HTTP-only cookies prevent XSS access to session tokens
- [ ] SameSite=Lax prevents CSRF from external sites
- [ ] Secure flag ensures cookies only sent over HTTPS
- [ ] Session expires after 24 hours of inactivity
- [ ] JWT tokens auto-refresh before expiry
- [ ] Logout clears both client and server session
- [ ] Middleware checks session on every route change

---

## 5.7 Username-Based Authentication

The platform uses **username + password** authentication instead of email + password because:
1. HR accounts are created internally by Admin — no email verification needed.
2. HR team members are more familiar with usernames than email-based login.
3. Candidates interact with the platform via secure tokens, not user accounts.

### Implementation Detail

Supabase Auth natively supports email + password. To use username-based auth:

```typescript
// When creating an HR account:
const { data, error } = await supabase.auth.admin.createUser({
  email: `${username}@placeholder.rivo.com`,  // Use placeholder email
  password: password,
  user_metadata: { username, role: 'hr' },
  email_confirm: true,                        // Auto-confirm since it's a placeholder
});

// Override the sign-in function to look up by username:
// In profiles table, we store the actual username
// In auth.users, we use a placeholder email format
// The sign-in form sends: username + password
// The action resolves: username → auth.users.email, then calls signInWithPassword
```

---

## 5.8 Authentication UI Components

### 5.8.1 Sign-In Page

```
Route: /sign-in
Components:
├── SignInForm
│   ├── UsernameInput
│   ├── PasswordInput
│   ├── SubmitButton ("Sign In")
│   └── RequestButton ("Request Access / Forgot Password")
└── RequestModal
    ├── UsernameInput
    ├── RequestType (auto-detected)
    └── SubmitButton ("Submit Request")
```

### 5.8.2 Error States

| Scenario | UI Message |
|----------|------------|
| Invalid credentials | "Invalid username or password. Please try again." |
| Account deactivated | "Your account has been deactivated. Please contact your admin." |
| Too many attempts | "Too many login attempts. Please try again in 30 minutes." |
| Network error | "Unable to connect. Please check your internet connection and try again." |
| Session expired | "Your session has expired. Please sign in again." |

---

> **Next Document:** [06 — Applicant Workflow & State Management Pipeline](./06-applicant-workflow-and-state-management-pipeline.md)
