# 🚀 Rivomind HR Automation Platform — Project Report & Documentation

> **Status:** Phase 1 Complete (Supabase Auth, Full REST APIs, File Storage, Admin & HR Modules, Document Verification, and UI Components)  
> **Version:** `v0.1.0` | **Branch:** `hr-automation-v1`

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Accomplished Milestones (Phase 1)](#accomplished-milestones-phase-1)
- [System Architecture & Tech Stack](#system-architecture--tech-stack)
- [Database Schema Overview](#database-schema-overview)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Next Steps & Roadmap (Phase 2)](#next-steps--roadmap-phase-2)

---

## 🌐 Project Overview

The **Rivomind HR Automation Platform** is a full-stack, enterprise-grade Web Application designed to streamline, automate, and centralize the recruitment lifecycle and intern onboarding process for Rivomind.

### Key Objectives
* **Eliminate Manual Overhead:** Centralize applicant tracking, status progression, interview scheduling, document collection, and onboarding workspace setup.
* **Role-Based Security:** Provide distinct, secure portals for **Administrators** (managing HR accounts and access) and **HR Recruiters** (managing candidates and workflows).
* **Self-Service Candidate Portal:** Enable candidates to securely upload onboarding documents without requiring full user accounts.
* **Auditability & Visibility:** Maintain a complete history trail of status changes, interview logs, and verification states for every applicant.

---

## ✅ Accomplished Milestones (Phase 1)

### 1. 🔑 Authentication & Authorization Engine
- **Supabase SSR Integration:** Built complete auth flows utilizing `@supabase/ssr` with cookie-based session management across Server and Client Components.
- **Role-Based Access Control (RBAC):** Distinct permissions enforced for `admin` and `hr` roles.
- **Middleware Guard (`src/middleware.ts`):** Edge-level route protection protecting `/admin/*` and `/hr/*` routes based on user role and session validity.
- **Access Request Flow:** Guests can request access or password resets via an interactive modal; Admins can review, approve, or reject requests.

### 2. 🛡️ Admin Management Portal
- **HR Account Management:** Full CRUD interfaces to add new HR members, edit user details, toggle account activation status (with confirmation modal), and reset passwords (`/admin/hrs`).
- **Access Requests Management:** Real-time request dashboard (`/admin/requests`) for approving/rejecting account registration and password reset tickets.
- **Admin Dashboard:** High-level metrics tracking active HR users, pending requests, and system health (`/admin/dashboard`).

### 3. 💼 HR Recruitment & Applicant Tracking System (ATS)
- **11-Stage Applicant Pipeline State Machine:**
  - `pending` → `on_hold` → `accepted` → `interview_scheduled` → `interview_completed` → `selected` → `document_collection` → `documents_received` → `documents_verified` → `workspace_created` / `rejected`.
- **Applicant Directory (`/hr/applicants`):** Filterable, searchable, and paginated table with real-time status badges.
- **Applicant Detail View (`/hr/applicants/[id]`):** In-depth view featuring candidate details, resume preview link, and a visual **Status Timeline Audit Trail**.
- **Action Handlers:** Dedicated API endpoints for candidate state transitions (`accept`, `hold`, `reject`, `select`, `schedule-interview`).

### 4. 📅 Interview Scheduling & Management
- **Schedule Interview Modal:** Dynamic date/time picker with automated Google Meet link association.
- **Interviews Dashboard (`/hr/interviews`):** Overview of upcoming, completed, and cancelled interviews.
- **Interview Lifecycle API:** Endpoint `/api/hr/interviews/[id]/complete` to record outcomes and progress candidate status automatically.

### 5. 📄 Secure Document Collection & Verification System
- **Public Token Upload Route (`/upload/[token]`):** Secure, candidate-facing upload portal accessible via unique expiration-valid tokens.
- **Multi-Document Support:** Collects required onboarding files (Aadhaar Card, Agreement Letter, Marksheet/Certificates).
- **Supabase Storage Buckets:** Integrated file upload handlers for `avatars` and `documents` buckets (`src/app/api/upload/*`).
- **Document Verification Workbench (`/hr/documents`):** HR portal to inspect candidate documents, approve files, or reject files with specific feedback reasons.

### 6. 🧑‍🎓 Intern Onboarding & Management
- **Intern Directory (`/hr/interns`):** Dedicated tracking for candidates who have successfully completed document verification and moved to workspace onboarding.

### 7. 🔔 Real-Time Notification Framework
- **In-App Notifications:** API routes (`/api/notifications/*`) and UI components for fetching, marking read, and categorizing system alerts (interviews, document uploads, account approvals).

### 8. 🗄️ Database & Schema Infrastructure
- **5 Supabase Migration Scripts:**
  1. `000_drop_all.sql` — Clean slate reset utility.
  2. `001_full_schema.sql` — Core tables (`roles`, `profiles`, `hr_requests`, `applicants`, `interviews`, `documents`, `workspaces`, `notifications`, `status_history`, `sync_logs`).
  3. `002_upload_tokens.sql` — Secure token generation & expiration schema for candidate file uploads.
  4. `003_add_email_to_profiles.sql` — Extended profile email fields.
  5. `004_add_avatar_url_to_profiles.sql` — Profile picture avatar integration.
- **PostgreSQL Enum Types & Triggers:** Robust data integrity with strict enum state definitions and automated `updated_at` timestamps.

### 9. 🎨 Modern UI Design System
- **Tailwind CSS v4 Integration:** Modern dark/light UI palette, responsive layouts, subtle micro-animations, and glassmorphism styling.
- **Reusable Component Library:** Modular UI primitives (`Button`, `Card`, `Modal`, `Select`, `Input`, `Badge`, `Avatar`, `Spinner`, `Pagination`, `ConfirmDialog`, `ProfileModal`, `EmptyState`, `ErrorBoundary`, `StatusTimeline`).

### 10. 📚 Comprehensive Architecture Documentation
- Created **11 in-depth technical documents** in `/docs` covering SRS specifications, database design, RBAC matrices, state machine definitions, Google Workspace integration architecture, and page routing maps.

---

## 🛠️ System Architecture & Tech Stack

```mermaid
graph TD
    Client[Next.js Client Components] --> Middleware[Next.js Edge Middleware]
    Middleware --> AuthGuard{Session & Role Guard}
    AuthGuard -->|Admin Role| AdminRoutes[/admin/*]
    AuthGuard -->|HR Role| HRRoutes[/hr/*]
    AuthGuard -->|Public Token| UploadRoutes[/upload/[token]]
    
    AdminRoutes --> REST_APIs[Next.js App Router API Routes]
    HRRoutes --> REST_APIs
    UploadRoutes --> REST_APIs
    
    REST_APIs --> SupabaseAuth[Supabase Auth Engine]
    REST_APIs --> SupabaseDB[(Supabase PostgreSQL Database)]
    REST_APIs --> SupabaseStorage[Supabase Object Storage]
```

### Stack Breakdown
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, React 19)
* **Language:** [TypeScript 5](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Row Level Security)
* **Auth & Security:** `@supabase/ssr`, HttpOnly Cookies, Middleware Guard
* **Storage:** Supabase Object Storage (`avatars`, `documents`)

---

## 🗃️ Database Schema Overview

```
+----------------+       +-------------------+       +-------------------+
|     roles      | 1---N |     profiles      | 1---N |    applicants     |
+----------------+       +-------------------+       +-------------------+
| id             |       | id (UUID)         |       | id (UUID)         |
| name           |       | username          |       | hr_id (FK)        |
| description    |       | role_id (FK)      |       | full_name, email  |
+----------------+       | full_name, email  |       | status (ENUM)     |
                         | is_active         |       +-------------------+
                         +-------------------+                 |
                                   |                           | 1---N
                                   | 1---N                     +-------------------+
                         +-------------------+                 |    interviews     |
                         |    hr_requests    |                 +-------------------+
                         +-------------------+                 |    documents      |
                         | request_type      |                 +-------------------+
                         | status            |                 |   upload_tokens   |
                         +-------------------+                 +-------------------+
```

---

## 📁 Project Directory Structure

```
hr-automation-frontend-share/
├── docs/                        # 11 Technical Specification & Architecture Documents
├── public/                      # Static assets & icons
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard, HR management, & request portals
│   │   ├── api/                 # REST API endpoints (Admin, HR, Upload, Notifications)
│   │   ├── hr/                  # HR ATS dashboard, applicants, interviews, documents
│   │   ├── sign-in/             # Custom Authentication login & access request page
│   │   ├── upload/[token]/      # Public candidate document upload portal
│   │   ├── globals.css          # Tailwind CSS v4 design system tokens
│   │   ├── layout.tsx           # Root Application Layout & Providers
│   │   └── page.tsx             # Root redirect landing page
│   ├── components/
│   │   ├── admin/               # HR forms, tables, & request lists
│   │   ├── auth/                # Sign-in form & request access modal
│   │   ├── hr/                  # Applicant tables, cards, interview modals
│   │   ├── layout/              # Sidebar & TopBar navigation headers
│   │   ├── shared/              # Status timeline, confirm dialogs, pagination, profile modal
│   │   └── ui/                  # Atom UI library (Buttons, Modals, Cards, Inputs)
│   ├── lib/
│   │   ├── auth.ts              # Authentication helpers & session utilities
│   │   ├── supabase.ts          # Supabase client instantiation (Client/Server/Admin)
│   │   ├── types.ts             # TypeScript definitions & state enums
│   │   └── utils.ts             # Helper functions (class merging, date formatting)
│   ├── middleware.ts            # Next.js App Router RBAC route guard
│   └── providers.tsx            # Global Context & State Providers
├── supabase/
│   └── migrations/              # SQL Migration scripts (000 - 004)
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Getting Started & Local Setup

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher
* **Supabase Instance**: Active project on Supabase Cloud or Local Supabase Docker instance

### 1. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Database Migration
1. Navigate to your **Supabase Dashboard** → **SQL Editor**.
2. Run the migration scripts in order from `supabase/migrations/`:
   * `001_full_schema.sql`
   * `002_upload_tokens.sql`
   * `003_add_email_to_profiles.sql`
   * `004_add_avatar_url_to_profiles.sql`

### 3. Install Dependencies & Run Server
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Next Steps & Roadmap (Phase 2)

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Google Sheets Sync Engine** | Automated webhook/cron sync with recruitment Google Sheets | ⏳ Planned |
| **Google Calendar Integration** | Automatic Google Calendar event generation & Meet creation | ⏳ Planned |
| **Automated Google Drive Workspace Setup** | Auto-provisioning intern onboarding folders and workspace documents | ⏳ Planned |
| **Email & SMS Notifications** | Automated email dispatch (Resend/Nodemailer) for candidate reminders | ⏳ Planned |
| **Advanced Analytics & Export** | PDF/CSV reporting export for HR metrics and performance | ⏳ Planned |

---

*Report prepared for **Rivomind HR Automation Platform**.*  
*Maintained by Full-Stack Engineering Team.*

