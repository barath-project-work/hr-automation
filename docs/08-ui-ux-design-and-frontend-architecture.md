# 08 — UI/UX Design & Frontend Architecture

> **Document Purpose:** Define the frontend architecture in Next.js, page structure, component hierarchy, design system, and UX flow for all user types.

---

## 8.1 Design Principles

1. **Clarity Over Complexity** — Each screen has one primary action. Secondary actions are visually de-emphasized.
2. **Status Visibility** — Every applicant's current status is immediately visible through color-coded badges and a progress timeline.
3. **Feedback First** — Every user action triggers immediate visual feedback (toast, status change, loading state).
4. **Progressive Disclosure** — Show summary first, details on demand. Don't overwhelm the dashboard.
5. **Mobile Considerate** — While primarily a desktop dashboard, critical actions (viewing applicants, notifications) work on tablets.

---

## 8.2 Page Structure & Routing

### 8.2.1 Route Map

```
/
├── /sign-in                           # Single sign-in page (public)
│
├── /admin                             # Admin routes (protected, role: admin)
│   ├── /admin/dashboard               # Admin overview with stats
│   ├── /admin/hrs                     # HR account management
│   ├── /admin/hrs/new                 # Create new HR account
│   ├── /admin/hrs/[id]/edit           # Edit HR account
│   ├── /admin/requests                # View & manage HR requests
│   └── /admin/settings                # System settings (future)
│
├── /hr                                # HR routes (protected, role: hr)
│   ├── /hr/dashboard                  # HR main dashboard
│   ├── /hr/applicants                 # All applicants (filtered)
│   ├── /hr/applicants/[id]            # Applicant detail + actions
│   ├── /hr/interviews                 # Upcoming/completed interviews
│   ├── /hr/documents                  # Pending document verifications
│   ├── /hr/interns                    # Active interns with workspaces
│   └── /hr/settings                   # HR profile settings
│
└── /upload                            # Candidate upload portal (public with token)
    └── /upload/[token]                # Secure document upload page
```

### 8.2.2 Next.js Route Groups

```
app/
├── (auth)/
│   └── sign-in/
│       └── page.tsx
│
├── (dashboard)/
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── hrs/
│   │   │   ├── page.tsx         # HR list
│   │   │   ├── new/page.tsx     # Create HR
│   │   │   └── [id]/edit/page.tsx
│   │   └── requests/page.tsx
│   │
│   └── hr/
│       ├── dashboard/page.tsx
│       ├── applicants/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── interviews/page.tsx
│       ├── documents/page.tsx
│       └── interns/page.tsx
│
├── upload/
│   └── [token]/page.tsx
│
├── (marketing)/                     # Future: landing page
│
├── layout.tsx                       # Root layout
├── middleware.ts                    # Auth protection
└── providers.tsx                    # Supabase + Toast providers
```

---

## 8.3 Dashboard Layouts

### 8.3.1 Admin Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Rivo Logo]                        🔔 [3]    👤 Admin Name  │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  Navigation  │   ┌───────────────────────────────────────┐   │
│              │   │  Welcome back, Admin!                 │   │
│  📊 Dashboard│   │                                       │   │
│  👥 HRs      │   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  📋 Requests │   │  │12    │ │10    │ │3     │ │245   │ │   │
│  ⚙️ Settings │   │  │Total │ │Active│ │Pending│ │Total │ │   │
│              │   │  │HRs   │ │HRs   │ │Req.  │ │Apps  │ │   │
│              │   │  └──────┘ └──────┘ └──────┘ └──────┘ │   │
│              │   │                                       │   │
│              │   │  ┌────────────────────────────────────┐│   │
│              │   │  │ Recent Requests                    ││   │
│              │   │  │ ┌─────┬──────┬────────┬──────────┐││   │
│              │   │  │ │User │Type  │Date    │Actions   │││   │
│              │   │  │ ├─────┼──────┼────────┼──────────┤││   │
│              │   │  │ │john │Reset │16 Jul  │[Approve] │││   │
│              │   │  │ │sara │New   │16 Jul  │[Approve] │││   │
│              │   │  │ └─────┴──────┴────────┴──────────┘││   │
│              │   │  └────────────────────────────────────┘│   │
│              │   └───────────────────────────────────────┘   │
└──────────────┴───────────────────────────────────────────────┘
```

### 8.3.2 HR Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Rivo Logo]                        🔔 [5]    👤 HR Name     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  📊 Dashboard│   ┌───────────────────────────────────────┐   │
│  👤 Applicants│   │  Good morning, Sarah!                │   │
│  📅 Interviews│   │                                       │   │
│  📄 Documents │   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │   │
│  🚀 Interns  │   │  │180   │ │25    │ │8     │ │2     │ │   │
│              │   │  │Pending│ │On    │ │Inter- │ │Docs  │ │   │
│              │   │  │      │ │Hold  │ │views  │ │Verify│ │   │
│              │   │  └──────┘ └──────┘ └──────┘ └──────┘ │   │
│              │   │                                       │   │
│              │   │  ┌────────────────────────────────────┐│   │
│              │   │  │ Applicants (Showing 1-10 of 180)  ││   │
│              │   │  │ ┌─────┬──────┬─────┬──────┬─────┐││   │
│              │   │  │ │Name │Email │Date │Status│ Act │││   │
│              │   │  │ ├─────┼──────┼─────┼──────┼─────┤││   │
│              │   │  │ │Barat│b@g..│7/16 │🟡    │A|R|H│││   │
│              │   │  │ │Rahul│r@g..│7/16 │🟢    │A|R|H│││   │
│              │   │  │ │Priya│p@g..│7/15 │🔵    │A|R  │││   │
│              │   │  │ │...  │ ... │ ... │ ...  │ ... │││   │
│              │   │  │ └─────┴──────┴─────┴──────┴─────┘││   │
│              │   │  └────────────────────────────────────┘│   │
│              │   └───────────────────────────────────────┘   │
└──────────────┴───────────────────────────────────────────────┘
```

---

## 8.4 Component Hierarchy

```
app/
└── components/
    ├── ui/                        # Primitive UI components
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── Badge.tsx
    │   ├── Modal.tsx
    │   ├── Toast.tsx
    │   ├── Table.tsx
    │   ├── Input.tsx
    │   ├── Select.tsx
    │   ├── DatePicker.tsx
    │   ├── TimePicker.tsx
    │   ├── Spinner.tsx
    │   ├── Avatar.tsx
    │   └── DropdownMenu.tsx
    │
    ├── layout/                    # Layout components
    │   ├── Sidebar.tsx
    │   ├── TopBar.tsx
    │   ├── NotificationBell.tsx
    │   └── UserMenu.tsx
    │
    ├── auth/                      # Authentication components
    │   ├── SignInForm.tsx
    │   ├── RequestAccessModal.tsx
    │   └── ProtectedRoute.tsx     # (handled by middleware, but useful for client components)
    │
    ├── admin/                     # Admin-specific components
    │   ├── HRTable.tsx
    │   ├── HRCreateForm.tsx
    │   ├── HREditForm.tsx
    │   ├── HRCard.tsx
    │   ├── RequestList.tsx
    │   ├── RequestRow.tsx
    │   ├── ApproveRequestModal.tsx
    │   ├── ResetPasswordModal.tsx
    │   └── AdminStats.tsx
    │
    ├── hr/                        # HR-specific components
    │   ├── ApplicantTable.tsx
    │   ├── ApplicantRow.tsx
    │   ├── ApplicantDetailPanel.tsx
    │   ├── ApplicantStatusBadge.tsx
    │   ├── ApplicantActions.tsx
    │   ├── ScheduleInterviewModal.tsx
    │   ├── PostInterviewActions.tsx
    │   ├── InterviewList.tsx
    │   ├── InterviewCard.tsx
    │   ├── DocumentReview.tsx
    │   ├── DocumentPreview.tsx
    │   ├── DocumentVerificationActions.tsx
    │   ├── InternList.tsx
    │   ├── InternCard.tsx
    │   ├── HrStats.tsx
    │   └── Filters.tsx            # Search, filter by status, sort
    │
    ├── notifications/             # Notification components
    │   ├── NotificationDropdown.tsx
    │   ├── NotificationItem.tsx
    │   └── InterviewReminderToast.tsx
    │
    ├── candidate/                 # Candidate-facing components
    │   ├── UploadForm.tsx
    │   ├── FileUploader.tsx
    │   ├── UploadProgress.tsx
    │   └── UploadConfirmation.tsx
    │
    └── shared/                    # Shared components
        ├── StatusTimeline.tsx      # Vertical timeline showing applicant's journey
        ├── SearchInput.tsx
        ├── Pagination.tsx
        ├── ConfirmDialog.tsx
        ├── EmptyState.tsx
        └── ErrorBoundary.tsx
```

---

## 8.5 Key Components — Detailed Specifications

### 8.5.1 ApplicantStatusBadge

```typescript
// components/hr/ApplicantStatusBadge.tsx
interface Props {
  status: ApplicantStatus;
  size?: 'sm' | 'md' | 'lg';
}

// Color mapping
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:              { bg: 'bg-yellow-50',  text: 'text-yellow-800', dot: 'bg-yellow-400', label: 'Pending Review' },
  on_hold:              { bg: 'bg-blue-50',    text: 'text-blue-800',   dot: 'bg-blue-400',   label: 'On Hold' },
  accepted:             { bg: 'bg-green-50',   text: 'text-green-800',  dot: 'bg-green-400',  label: 'Accepted' },
  interview_scheduled:  { bg: 'bg-purple-50',  text: 'text-purple-800', dot: 'bg-purple-400', label: 'Interview Scheduled' },
  interview_completed:  { bg: 'bg-indigo-50',  text: 'text-indigo-800', dot: 'bg-indigo-400', label: 'Interview Completed' },
  selected:             { bg: 'bg-teal-50',    text: 'text-teal-800',   dot: 'bg-teal-400',   label: 'Selected' },
  document_collection:  { bg: 'bg-orange-50',  text: 'text-orange-800', dot: 'bg-orange-400', label: 'Document Collection' },
  documents_received:   { bg: 'bg-cyan-50',    text: 'text-cyan-800',   dot: 'bg-cyan-400',   label: 'Documents Received' },
  documents_verified:   { bg: 'bg-lime-50',    text: 'text-lime-800',   dot: 'bg-lime-400',   label: 'Documents Verified' },
  workspace_created:    { bg: 'bg-green-50',   text: 'text-green-800',  dot: 'bg-green-500',  label: 'Workspace Created' },
  rejected:             { bg: 'bg-red-50',     text: 'text-red-800',    dot: 'bg-red-400',    label: 'Rejected' },
};

// Renders a badge with a colored dot and label
// <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-800">
//   <span class="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
//   Pending Review
// </span>
```

### 8.5.2 ScheduleInterviewModal

```
┌────────────────────────────────────────────────┐
│  Schedule Interview                        [X]  │
│                                                  │
│  Candidate: Barath G                             │
│  Email: barath@email.com                         │
│                                                  │
│  ───────────────────────────────────────         │
│                                                  │
│  Interview Date:  [ 📅 Select Date ]             │
│                                                  │
│  Interview Time:  [ 🕐 Select Time ]             │
│                                                  │
│  ───────────────────────────────────────         │
│                                                  │
│  Google Meet will be automatically created      │
│  and the candidate will receive an email with    │
│  the meeting link.                               │
│                                                  │
│  [Cancel]              [Schedule & Send Email]   │
└────────────────────────────────────────────────┘
```

Behavior:
- Date picker: Cannot select past dates. Date format: DD/MM/YYYY
- Time picker: 30-minute intervals (10:00, 10:30, 11:00, ... 18:00)
- Both fields required before "Schedule" enables
- On submit: Button shows loading spinner, then success toast
- On error: Error toast with message, form remains open

### 8.5.3 NotificationBell & InterviewReminderToast

```
         ┌───┐
  🔔 ───│ 3 │    ← NotificationBell with unread count
         └───┘
           │
           ▼ (click)
  ┌──────────────────────────────────┐
  │  Notifications                   │
  ├──────────────────────────────────┤
  │ 🔔 Interview Starting Soon      │
  │ Barath G — 3:00 PM              │
  │ [Join Meeting]   2 min ago      │
  ├──────────────────────────────────┤
  │ 📄 New Documents Received       │
  │ Rahul Kumar uploaded documents  │
  │ [Review]         15 min ago     │
  └──────────────────────────────────┘


  ┌──────────────────────────────────────────────┐
  │ 🔔 Interview in 20 minutes                   │
  │ Barath G — 3:00 PM                           │
  │ ┌──────────────┐   ┌──────────┐             │
  │ │  Join Meeting │   │ Dismiss  │             │
  │ └──────────────┘   └──────────┘             │
  └──────────────────────────────────────────────┘
  (Toast appears at top-right, auto-dismisses after 30s)
```

---

## 8.6 Applicant Detail Side Panel

When HR clicks on any applicant row, a sliding side panel opens from the right:

```
┌─────────────────────────────┬─────────────┐
│   Applicant List            │   Barath G  │  ← Slide panel
│     ...                     │  ─────────  │
│     ...                     │             │
│     ...                     │  📧 bar@..  │
│     ...                     │  📞 +91...  │
│                             │  📅 15 Jul  │
│                             │             │
│                             │  Status: 🟡 │
│                             │  Pending    │
│                             │             │
│                             │  ─────────  │
│                             │  Timeline   │
│                             │  ✅ Pending │
│                             │  ☐ Accepted │
│                             │  ☐ Scheduled│
│                             │  ☐ Interview│
│                             │  ☐ Selected │
│                             │  ☐ Docs     │
│                             │  ☐ Verified │
│                             │  ☐ Workspace│
│                             │             │
│                             │  ─────────  │
│                             │             │
│                             │  [Accept]   │
│                             │  [Reject]   │
│                             │  [Hold]     │
│                             └─────────────┘
```

---

## 8.7 UX Flow Diagrams

### 8.7.1 HR First Login Flow

```
/sign-in
    │
    ▼
Enter username + password
    │
    ▼
First time? → Show welcome modal:
  "Welcome to Rivo HR Dashboard!
   Start by reviewing pending applicants.
   Click 'Applicants' in the sidebar."
    │
    ▼
/hr/dashboard
    │
    ▼
Summary cards show: 180 Pending, 25 On Hold, etc.
    │
    ▼
Click "Applicants" → See list of all applicants
    │
    ▼
Click on applicant → Side panel opens → View details
    │
    ▼
Click "Accept" → Schedule Interview Modal → Select date/time
    │
    ▼
Confirm → Toast: "Interview scheduled! Email sent to candidate."
```

### 8.7.2 Accept → Interview → Selection → Onboarding Flow

```
Review Applicant
    │
    ▼
┌──────────────────┐
│ Accept Applicant │ ← Click Accept
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ Schedule Interview Modal    │
│ Date: ______ Time: ______   │
│        [Confirm]            │
└────────┬────────────────────┘
         │
         ▼
    [Loading...]
         │
         ├── Google Calendar: Create event + Meet link
         ├── Database: Save interview record
         ├── Gmail API: Send interview email to candidate
         └── UI: Show success toast

         ▼
hr/dashboard → "Interview Scheduled" count increases by 1
         │
         ▼
    20 minutes before interview:
    ┌──────────────────────────────────┐
    │ 🔔 Interview in 20 minutes       │
    │ [Join Meeting]    [Dismiss]      │
    └──────────────────────────────────┘
         │
         ▼
Interview happens (or time passes)
         │
         ▼
hr/interviews → Click "Mark Complete" (or auto-mark)
         │
         ▼
Post-interview: [Accept ✓] [Reject ✗]
         │ (Accept)
         ▼
┌────────────────────────────────────┐
│ ✅ Candidate Selected!              │
│ Agreement letter will be sent.     │
│ [OK]                                │
└────────────────────────────────────┘
         │
         ├── Database: Update status to "selected"
         ├── Gmail API: Send agreement letter email with upload portal link
         └── UI: Show success, move to "Document Collection"

         ▼
hr/documents → "Pending Verification" section
         │
         ▼
(Candidate uploads documents via portal)
         │
         ▼
🔔 "New documents received from Barath G"
         │
         ▼
Click → View documents → [Verify & Approve] [Reject]
         │ (Approve)
         ▼
┌──────────────────────────────────────┐
│ ✅ Documents Verified!                │
│ Creating workspace for Barath G...   │
└──────────────────────────────────────┘
         │
         ├── Google Drive: Create folder + Task Tracker sheet
         ├── Google Drive: Share with candidate
         ├── Database: Save workspace info
         ├── Gmail API: Send workspace access email
         └── UI: Show workspace details

         ▼
hr/interns → Barath G appears in Active Interns list
```

---

## 8.8 Color Palette & Design Tokens

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',    // Main brand color (indigo)
          600: '#4f46e5',
          700: '#4338ca',
        },
        // Status colors
        status: {
          pending: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
          accepted: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
          rejected: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
          hold: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6' },
          interview: { bg: '#faf5ff', text: '#6b21a8', dot: '#a855f7' },
          verified: { bg: '#f0fdf4', text: '#166534', dot: '#16a34a' },
        },
        // Semantic
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
};
```

---

## 8.9 Loading & Empty States

### Loading States

| Component | Loading Behavior |
|-----------|-----------------|
| Applicant Table | Skeleton rows (pulsing gray bars) |
| Summary Cards | Animated pulse placeholders |
| Side Panel | Spinner in panel body |
| Action Buttons | Inline spinner + "Sending..." text |
| Upload Page | Progress bar with percentage |

### Empty States

| Scenario | Display |
|----------|---------|
| No applicants (new HR) | Illustration + "No applicants yet. Your Google Sheet data will appear here once synced." |
| No pending verifications | "All clear! No documents pending verification." |
| No interviews scheduled | "No interviews scheduled. Accept applicants to schedule interviews." |
| No notifications | "No notifications yet. They'll appear here when something needs your attention." |
| No rejected applicants | "No rejected applicants." |
| Search returns no results | "No applicants match your search. Try a different name or email." |

---

## 8.10 Responsive Behavior

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| >= 1280px | Full sidebar + content | Sidebar always visible |
| 1024px - 1279px | Collapsible sidebar | Sidebar collapses to icons only |
| 768px - 1023px | Sidebar as overlay | Hamburger menu toggles sidebar overlay |
| < 768px | Stacked layout | Cards stack vertically, table becomes list cards |

---

> **Next Document:** [09 — API Design & Backend Architecture](./09-api-design-and-backend-architecture.md)
