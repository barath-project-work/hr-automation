# 02 — System Architecture & Tech Stack Decisions

> **Document Purpose:** Define the high-level system architecture, justify technology choices, and document all system components and their interactions.

---

## 2.1 Architecture Philosophy

The HR Automation platform follows a **modular, event-driven architecture** with clear separation of concerns:

1. **Presentation Layer** — Next.js App Router (React Server Components + Client Components)
2. **Application Layer** — Next.js API Routes / Server Actions
3. **Data Layer** — Supabase (PostgreSQL + Auth + Storage)
4. **Automation Layer** — Google Workspace APIs (Gmail, Drive, Calendar, Sheets)

The architecture is designed to be:
- **Scalable** — Horizontally scalable via Vercel's edge network and Supabase's managed Postgres
- **Maintainable** — Clear module boundaries, typed interfaces, and consistent patterns
- **Secure** — Row-Level Security (RLS) at the database level, role-based access at the application level
- **Extensible** — Future modules (analytics, payroll, etc.) can be added without refactoring core flows

---

## 2.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────────────┐   │
│  │  Public      │  │  Admin      │  │  HR Dashboard             │   │
│  │  Pages      │  │  Dashboard  │  │  - Applicant List         │   │
│  │  - Sign In  │  │  - HR Mgmt  │  │  - Accept/Reject/Hold     │   │
│  │  - Request  │  │  - Requests │  │  - Interview Scheduler    │   │
│  └─────────────┘  └─────────────┘  │  - Document Review        │   │
│                                     │  - Notifications          │   │
│                                     └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER (Next.js)                     │
│                                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │
│  │  Auth      │  │  HR       │  │  Applicant│  │  Automation   │   │
│  │  API       │  │  API      │  │  API      │  │  Engine       │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────────┘   │
│                                                     │              │
│                                        ┌────────────┴──────────┐   │
│                                        │  Background Workers   │   │
│                                        │  (Cron / Webhooks)    │   │
│                                        └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌──────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│  SUPABASE    │    │  GOOGLE WORKSPACE     │    │  CANDIDATE       │
│              │    │  APIs                 │    │                  │
│  ┌────────┐  │    │  ┌────────┐          │    │  ┌────────────┐  │
│  │Postgres│  │    │  │ Gmail  │          │    │  │ Upload     │  │
│  │        │  │    │  └────────┘          │    │  │ Portal     │  │
│  │ • Users│  │    │  ┌────────┐          │    │  └────────────┘  │
│  │ • HRs  │  │    │  │ Drive  │          │    └──────────────────┘
│  │ • Apps │  │    │  └────────┘          │
│  │ • Docs │  │    │  ┌────────┐          │
│  │ • etc  │  │    │  │Calendar│          │
│  └────────┘  │    │  └────────┘          │
│  ┌────────┐  │    │  ┌────────┐          │
│  │ Auth   │  │    │  │ Sheets │          │
│  └────────┘  │    │  └────────┘          │
│  ┌────────┐  │    └──────────────────────┘
│  │Storage │  │
│  └────────┘  │
└──────────────┘
```

---

## 2.3 Technology Stack — Detailed Rationale

### 2.3.1 Frontend & Backend Framework: Next.js (App Router)

**Selected Version:** Next.js 14+ with App Router

| Feature | How We Use It |
|---------|---------------|
| React Server Components (RSC) | Data-fetching pages (applicant list, HR list) render on the server; reduce client JS |
| Server Actions | Form submissions (Accept/Reject, HR creation) mutate data without building API routes |
| API Routes | Background operations (webhooks, Google API callbacks) |
| Middleware | Route protection, role-based redirects |
| Route Groups | Organize dashboard pages: `(admin)/`, `(hr)/` |

**Why Next.js over alternatives:**

| Criteria | Next.js | Plain React | Remix | Express + React |
|----------|---------|-------------|-------|-----------------|
| API Layer built-in | ✅ | ❌ | ✅ | ❌ |
| Server Components | ✅ | ❌ (partial in RSC) | ❌ | ❌ |
| File-based routing | ✅ | ❌ | ✅ | ❌ |
| Edge deployment | ✅ (Vercel) | Limited | ✅ | ❌ |
| Learning curve | Moderate | Low | Moderate | High |
| Community & ecosystem | Large | Largest | Growing | Fragmented |

### 2.3.2 Database & Backend-as-a-Service: Supabase

**Why Supabase:**

| Requirement | Supabase Solution |
|-------------|-------------------|
| Relational data with complex queries | PostgreSQL with full SQL support |
| Real-time notifications | Supabase Realtime (WebSocket-based) |
| File uploads (candidate docs) | Supabase Storage with RLS |
| Authentication | Supabase Auth (built-in) |
| Row-level security | PostgreSQL RLS policies |
| Edge functions | Supabase Edge Functions (future use) |
| Cost-effective free tier | 500 MB database, 1 GB storage, 50k monthly active users |

Supabase was chosen over alternatives:

| Criteria | Supabase | Firebase | Direct Postgres |
|----------|----------|----------|-----------------|
| Relational database | ✅ PostgreSQL | ❌ Firestore (NoSQL) | ✅ |
| SQL queries | ✅ Full SQL | ❌ Limited | ✅ |
| RLS | ✅ | ✅ (Firestore rules) | ❌ Manual |
| Auth | ✅ Built-in | ✅ Built-in | ❌ Custom |
| Storage | ✅ S3-compatible | ✅ | ❌ |
| Real-time | ✅ | ✅ | ❌ |
| Cost at scale | Predictable | Can be high | Variable |
| Self-hostable | ✅ | ❌ | ✅ |

### 2.3.3 Automation Layer: Google Workspace APIs

**APIs Used:**

| API | Purpose | Key Operations |
|-----|---------|----------------|
| Gmail API | Sending automated emails | `users.messages.send()` with base64-encoded email |
| Google Drive API | Folder/file management | `files.create()`, `files.update()`, `permissions.create()` |
| Google Calendar API | Creating interview events | `events.insert()` with `conferenceData` for Meet |
| Google Sheets API | Reading applicant data | `spreadsheets.values.get()`, `spreadsheets.values.append()` |

**Authentication:** Google Service Account with domain-wide delegation (for G Suite / Google Workspace accounts).

### 2.3.4 Deployment: Vercel

**Why Vercel:**
- First-class Next.js support (zero-config deployment)
- Edge Functions for low-latency API responses
- Automatic HTTPS, CDN, and caching
- Serverless architecture — no server management
- Preview deployments for each branch
- Environment variable management

### 2.3.5 Additional Dependencies

| Package | Purpose | Justification |
|---------|---------|---------------|
| `@googleapis/gmail` | Gmail API client | Official Google SDK |
| `@googleapis/drive` | Google Drive API client | Official Google SDK |
| `@googleapis/calendar` | Google Calendar API client | Official Google SDK |
| `@googleapis/sheets` | Google Sheets API client | Official Google SDK |
| `google-auth-library` | OAuth2 / JWT authentication | Required for service account auth |
| `@supabase/supabase-js` | Supabase client | Official Supabase SDK |
| `@supabase/ssr` | Supabase Next.js SSR helpers | Secure session handling |
| `react-hot-toast` | In-app notifications | Lightweight, customizable toast library |
| `date-fns` | Date formatting & manipulation | Tree-shakeable, immutable |
| `zod` | Schema validation | TypeScript-first validation for API inputs |
| `react-hook-form` | Form management | Performant, minimal re-renders |
| `lucide-react` | Icons | Clean, consistent icon set |
| `tailwindcss` | Styling | Utility-first, rapid development |

---

## 2.4 Module Architecture

Each module follows a consistent folder structure:

```
modules/
├── auth/
│   ├── components/       # Login form, RequestAccessForm
│   ├── actions.ts        # Server actions (login, request, approve)
│   ├── schema.ts         # Zod validation schemas
│   └── types.ts          # TypeScript types
├── hr/
│   ├── components/       # HRList, HRCard, HRForm
│   ├── actions.ts
│   ├── schema.ts
│   └── types.ts
├── applicants/
│   ├── components/       # ApplicantTable, ApplicantCard, Actions
│   ├── actions.ts
│   ├── schema.ts
│   └── types.ts
├── interviews/
│   ├── components/       # ScheduleModal, InterviewList
│   ├── actions.ts
│   ├── schema.ts
│   └── types.ts
├── documents/
│   ├── components/       # UploadPortal, DocumentReview
│   ├── actions.ts
│   ├── schema.ts
│   └── types.ts
├── workspace/
│   ├── components/       # WorkspaceStatus, WorkspaceActions
│   ├── actions.ts
│   ├── schema.ts
│   └── types.ts
└── tasks/
    ├── components/       # TaskTable, ProofReview
    ├── actions.ts
    ├── schema.ts
    └── types.ts
```

---

## 2.5 Data Flow Diagrams

### 2.5.1 Google Form → Google Sheet → Platform Sync

```
Google Form (LinkedIn)
        │
        ▼
Google Sheet
        │
        ▼ (Polling every N minutes OR Google Apps Script webhook)
Next.js API Route (/api/sync-applicants)
        │
        ▼
Supabase: applicants table
        │
        ▼
HR Dashboard (Server Component renders fresh data)
```

### 2.5.2 Accept Applicant → Interview Automation

```
HR clicks "Accept" on applicant
        │
        ▼
Modal: Select Date & Time → Confirm
        │
        ▼
Server Action: handleAcceptApplicant()
        │
        ├─► Supabase: update applicant status → "interview_scheduled"
        │
        ├─► Google Calendar API: create event with Meet conferencing
        │     └─► Returns unique Google Meet link
        │
        ├─► Supabase: save interview record (date, time, meetLink)
        │
        ├─► Gmail API: send interview invitation email
        │     ├─► To: candidate's email
        │     ├─► Subject: "Shortlisted for Interview — Rivo"
        │     └─► Body: includes date, time, and Google Meet link
        │
        └─► Return success → UI shows "Interview Scheduled"
```

### 2.5.3 Document Upload → Verification → Workspace Creation

```
HR selects candidate → Accept (post-interview)
        │
        ▼
Server Action: handlePostInterviewAccept()
        │
        ├─► Supabase: update status → "document_collection"
        │
        ├─► Gmail API: send agreement letter with upload portal link
        │
        └─► Candidate receives email with secure upload URL

        ...

Candidate opens upload portal → uploads:
  1. Signed Agreement Letter (PDF)
  2. Aadhaar Card (PDF/Image)
  3. Marksheet (PDF/Image)
        │
        ▼
Server Action: handleDocumentUpload()
        │
        ├─► Supabase Storage: store files per candidate
        ├─► Supabase: update document status
        └─► Create notification for HR

HR reviews documents → clicks "Verify & Approve"
        │
        ▼
Server Action: handleVerifyDocuments()
        │
        ├─► Supabase: update candidate status → "workspace_creation"
        │
        ├─► Google Drive API:
        │     ├─► Create folder named "[Candidate Name]"
        │     ├─► Create subfolder "Daily Tasks"
        │     ├─► Create Google Sheet "Task Tracker" with columns
        │     └─► Set sharing permissions (candidate + HR)
        │
        ├─► Supabase: save workspace folder ID and URL
        │
        ├─► Gmail API: send workspace access email to candidate
        │
        └─► UI: show workspace created successfully
```

---

## 2.6 Component Interaction Matrix

| Component | Reads From | Writes To | Triggers |
|-----------|-----------|-----------|----------|
| Sign In Page | Supabase Auth | Supabase Auth | Redirect based on role |
| Admin Dashboard | `hrs` table | — | — |
| HR Creation Form | — | `hrs` table | Admin action |
| Request Approve | `requests` table | `hrs` table | Admin action |
| HR Dashboard | `applicants` table | — | — |
| Accept Action | — | `applicants`, `interviews` | Google APIs |
| Reject Action | — | `applicants` | — |
| Hold Action | — | `applicants` | — |
| Interview Modal | — | `interviews` | Google Calendar, Gmail |
| Document Upload | Supabase Storage | `documents` table | Notification |
| Document Review | `documents` table | `documents` table | Google Drive |
| Workspace Creator | — | `workspaces` table | Google Drive, Gmail |
| Task Tracker View | `tasks` table | — | — |
| Notification System | `notifications` table | — | UI Toast |
| Interview Reminder | `interviews` table | — | Background cron → Notification |

---

## 2.7 State Management Strategy

| Type | Tool | Use Case |
|------|------|----------|
| Server State | Supabase queries via RSC | Applicant lists, HR lists, dashboard data |
| Server Mutations | Server Actions | All form submissions, accept/reject/hold, etc. |
| Client State | React `useState`/`useReducer` | UI state (modals open/closed, form inputs) |
| Notifications | `react-hot-toast` | Real-time toast notifications |
| Real-time | Supabase Realtime | Document upload notifications, interview countdown |

**No global state management library (Redux, Zustand, etc.) is needed because:**
- Most data comes from the server and is consumed via Server Components.
- Client interactivity is minimal (modals, toasts, forms).
- Supabase Realtime handles push-based updates.

---

## 2.8 Performance Considerations

| Area | Strategy |
|------|----------|
| Database Queries | Indexed columns (email, status, created_at), paginated list queries |
| Image/File Serving | Supabase Storage CDN, pre-signed URLs with expiry |
| API Latency | Next.js serverless functions on Vercel Edge (global regions) |
| Google API Calls | Batch operations where possible, retry with exponential backoff |
| Form Submissions | Optimistic UI updates for accept/reject actions |
| Applicant List | Virtualized list for 10k+ applicants (e.g., `@tanstack/react-virtual`) |

---

## 2.9 Scalability Considerations

| Scale Point | How the Architecture Handles It |
|-------------|-------------------------------|
| 10,000+ applicants | Paginated queries, indexed database, Google Sheets read once per sync |
| 100+ HR accounts | RLS policies ensure HRs only see their own applicants |
| 1,000+ concurrent interviews | Google Meet links are independent per candidate, no contention |
| File uploads | Supabase Storage handles S3-compatible object storage at scale |
| Notification volume | In-app only (MVP), can add email fallback later |
| Google API rate limits | Queued operations with rate limiting per API quota |

---

> **Next Document:** [03 — Complete Requirements Specification (SRS)](./03-complete-requirements-specification-srs.md)
