# 11 — Frontend Page Map & Navigation Architecture

> **Document Purpose:** Provide a complete inventory of every frontend page in the HR Automation platform, detailing the structure, all interactive elements (buttons, links, forms), and their navigation targets. This serves as a frontend navigation blueprint.

---

## 11.1 Page Hierarchy Overview

```
                             ┌─────────────────────────────────────────────────────────────────────┐
                             │                          PUBLIC ROUTES                              │
                             ├─────────────────────────────────────────────────────────────────────┤
                             │                          /sign-in                                   │
                             └────────────────────────────┬────────────────────────────────────────┘
                                                          │
                                                          ▼ (Authenticated)
                             ┌─────────────────────────────────────────────────────────────────────┐
                             │                    MIDDLEWARE — ROLE DETECTION                       │
                             │                                                                     │
                             │                    ┌───────┴───────┐                                │
                             │                    ▼               ▼                                │
                             │              role: admin     role: hr                              │
                             └───────────────────┬────────────────────────────────────────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
                    ▼                             ▼                             ▼
┌────────────────────────────────────┐  ┌────────────────────────────────────┐  ┌──────────────────────────┐
│         ADMIN  ROUTES              │  │          HR  ROUTES                │  │   CANDIDATE (UNAUTHED)    │
│         /admin/*                   │  │          /hr/*                     │  │   /upload/[token]         │
└────────────────────────────────────┘  └────────────────────────────────────┘  └──────────────────────────┘
         │                                       │
         ▼                                       ▼
┌──────────────────────┐               ┌──────────────────────┐
│ /admin/dashboard     │               │ /hr/dashboard        │
│ /admin/hrs           │               │ /hr/applicants       │
│ /admin/hrs/new       │               │ /hr/applicants/[id]  │
│ /admin/hrs/[id]/edit │               │ /hr/interviews       │
│ /admin/requests      │               │ /hr/documents        │
└──────────────────────┘               │ /hr/interns          │
                                       └──────────────────────┘
```

---

## 11.2 Complete Page Inventory

**Total Pages: 13**
**Total Modals/Dialogs: 8**
**Total Navigation Actions: 42**

---

## 11.3 PAGE: /sign-in (Public — Single Sign-In)

### Overview
A single sign-in page for both **Admin** and **HR** users. The system determines the role from credentials and redirects accordingly.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    ┌─────────────────────┐                   │
│                    │                     │                   │
│                    │   🏢 Rivo HR        │                   │
│                    │   Automation        │                   │
│                    │                     │                   │
│                    │   Username          │                   │
│                    │   [______________]  │                   │
│                    │                     │                   │
│                    │   Password          │                   │
│                    │   [______________]  │                   │
│                    │                     │                   │
│                    │  ┌─────────────────┐│                   │
│                    │  │   Sign In       ││                   │
│                    │  └─────────────────┘│                   │
│                    │                     │                   │
│                    │  [Request Access]   │                   │
│                    │  ┌─────────────────┐│                   │
│                    │  │  or Forgot      ││                   │
│                    │  │  Password?      ││                   │
│                    │  └─────────────────┘│                   │
│                    └─────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Username Input** | Text field | — | — |
| **Password Input** | Password field | — | — |
| **"Sign In" Button** | Submit button | Validates credentials via Server Action `signIn()` | ✅ **Success:** Redirects to `/admin/dashboard` (role=admin) or `/hr/dashboard` (role=hr) |
| | | | ❌ **Error:** Shows inline error "Invalid username or password" |
| | | | ❌ **Deactivated:** "Account is deactivated. Contact admin." |
| **"Request Access" Link** | Link/Button | Opens **RequestAccessModal** | Stays on same page, modal opens |
| **"Forgot Password?" Link** | Link/Button | Opens **RequestAccessModal** (pre-filled for password reset) | Stays on same page, modal opens |

### Error States
| State | Visual |
|-------|--------|
| Invalid credentials | Red border on fields + error message below form |
| Account deactivated | Red banner: "Account deactivated. Contact admin." |
| Rate limited | Red banner: "Too many attempts. Try again in 30 min." |
| Network error | Red banner: "Connection error. Check internet." |

---

## 11.4 MODAL: RequestAccessModal (Overlay on /sign-in)

### Overview
Opens as a modal overlay when user clicks "Request Access" or "Forgot Password?" on the sign-in page.

### Layout
```
┌───────────────────────────────────────────────┐
│  Request Access                          [X]  │
│                                                 │
│  Need an account or forgot your password?      │
│                                                 │
│  Username:  [___________________________]       │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Submit Request                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  A request will be sent to the admin for       │
│  approval. You will receive your credentials   │
│  once the admin processes your request.        │
└───────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"X" (Close)** | Icon button | Closes modal | Modal dismissed, stays on `/sign-in` |
| **Username Input** | Text field | — | — |
| **"Submit Request" Button** | Submit button | Server Action `createRequest(username)` | ✅ **Success:** Modal shows confirmation: "Request submitted. Admin will review." |
| | | | ❌ **Error:** "A request is already pending for this username" |
| **Click outside modal** | Backdrop | Closes modal | Modal dismissed |

---

## 11.5 PAGE: /admin/dashboard (Protected — Admin Only)

### Overview
Admin's landing page showing system-wide statistics and recent requests.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    Admin Panel                              🔔 [3]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Welcome back, Admin!      📅 16 July 2026             │
│  Dashboard│                                                       │
│         │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  👥 HRs │  │   12   │ │   10   │ │   3    │ │  245   │          │
│         │  │ Total  │ │ Active │ │Pending │ │ Total  │          │
│  📋     │  │  HRs   │ │  HRs   │ │ Reqs   │ │ Apps   │          │
│  Requests│  └────────┘ └────────┘ └────────┘ └────────┘          │
│         │                                                         │
│  ⚙️     │  ┌────────────────────────────────────────────────────┐│
│  Settings│  │  Recent Requests                        [View All] ││
│         │  │                                                   ││
│         │  │ ┌──────┬────────┬──────────┬──────────┬─────────┐ ││
│         │  │ │User  │ Type   │ Date     │ Status   │ Action  │ ││
│         │  │ ├──────┼────────┼──────────┼──────────┼─────────┤ ││
│         │  │ │john  │ Reset  │ 16 Jul   │ 🟡Pending│[Approve]│ ││
│         │  │ │sara  │ New    │ 16 Jul   │ 🟡Pending│[Approve]│ ││
│         │  │ └──────┴────────┴──────────┴──────────┴─────────┘ ││
│         │  └────────────────────────────────────────────────────┘│
│         │                                                         │
│         │  ┌────────────────────────────────────────────────────┐│
│         │  │  Quick Actions                                     ││
│         │  │  [➕ Add New HR]  [📋 View All Requests]           ││
│         │  └────────────────────────────────────────────────────┘│
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Sidebar "Dashboard"** | Nav link | — | Active page indicator |
| **Sidebar "HRs"** | Nav link | Navigate | `/admin/hrs` |
| **Sidebar "Requests"** | Nav link | Navigate | `/admin/requests` |
| **Sidebar "Settings"** | Nav link | Navigate | `/admin/settings` (future) |
| **Notification Bell 🔔** | Icon button | Opens **NotificationDropdown** | Overlay dropdown |
| **Total HRs Card** | Clickable card | Navigate | `/admin/hrs` |
| **Pending Requests Card** | Clickable card | Navigate | `/admin/requests` |
| **Total Applicants Card** | Clickable card | Navigate (read-only info) | `/admin/applicants` (future) |
| **"[View All]" link** | Text link | Navigate | `/admin/requests` |
| **"[Approve]" button** | Button per row | Server Action `approveRequest(id)` | ✅ **Success:** Row updates, toast appears |
| | | | Opens **ApproveRequestModal** for password reset type |
| **"[Reject]" button** | Button per row | Opens **RejectRequestModal** | Modal with reason field |
| **"Add New HR" button** | CTA Button | Navigate | `/admin/hrs/new` |
| **"View All Requests" button** | Button | Navigate | `/admin/requests` |
| **Admin Name / Avatar** | Dropdown trigger | Opens user menu dropdown | Options: [Profile, Sign Out] |

---

## 11.6 PAGE: /admin/hrs (Protected — Admin Only)

### Overview
List of all HR accounts with management actions.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    Admin Panel                              🔔 [3]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  HR Account Management                                 │
│  Dashboard│                                                       │
│         │  [🔍 Search HRs...]          [➕ Add New HR]           │
│  👥 HRs │                                                         │
│  (active)│  ┌─────┬─────────┬──────────┬────────┬────────┬─────┐ │
│         │  │ #   │ Name    │ Username │ Phone  │ Status │Actions│ │
│  📋     │  ├─────┼─────────┼──────────┼────────┼────────┼─────┤ │
│  Requests│  │ 1   │ Sarah J.│ hr_sarah │ +91... │ 🟢Active│ ✏️🔒│ │
│         │  │ 2   │ John D. │ hr_john  │ +91... │ 🟢Active│ ✏️🔒│ │
│  ⚙️     │  │ 3   │ Priya...│ hr_priya │ +91... │ 🔴Inact.│ ✏️🔒│ │
│  Settings│  └─────┴─────────┴──────────┴────────┴────────┴─────┘ │
│         │                                                         │
│         │  Showing 3 of 12 HRs                  [1] [2] [3] [›] │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Search Input** | Text field | Filters HR list in real-time (client-side) | Filters table rows |
| **"Add New HR" button** | CTA Button | Navigate | `/admin/hrs/new` |
| **"Active/Inactive" Status** | Toggle switch | Server Action `toggleHRActive(id)` | ✅ Toggles status, row updates |
| **✏️ (Edit) Icon** | Icon button | Navigate | `/admin/hrs/[id]/edit` |
| **🔒 (Reset Password) Icon** | Icon button | Server Action / Opens **ResetPasswordModal** | Modal overlay |
| **Pagination Controls** | Navigation buttons | Change page | Updates table data (same page) |
| **Column Headers** | Clickable | Sort table | Sorts by that column asc/desc |

---

## 11.7 PAGE: /admin/hrs/new (Protected — Admin Only)

### Overview
Form to create a new HR account.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    Admin Panel                              🔔 [3]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Create New HR Account                                 │
│  Dashboard│                                                       │
│         │  ┌────────────────────────────────────────────────────┐│
│  👥 HRs │  │  Full Name:  [____________________________]       ││
│         │  │  Phone:      [____________________________]       ││
│  📋     │  │  Username:   [____________________________]       ││
│  Requests│  │  Password:   [____________________________] [🔄] ││
│         │  │                                                    ││
│  ⚙️     │  │  [Cancel]              [Create HR Account]        ││
│  Settings│  └────────────────────────────────────────────────────┘│
│         │                                                         │
│         │  💡 Password will be auto-generated if left empty.     │
│         │  Share credentials with the HR through a secure        │
│         │  channel (WhatsApp, phone, or in-person).              │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Full Name Input** | Text field | — | — |
| **Phone Input** | Text field | — | — |
| **Username Input** | Text field | Real-time uniqueness check (debounced) | Shows ✅ or ❌ next to field |
| **Password Input** | Password field | — | Show/hide toggle |
| **🔄 (Generate) Icon** | Icon button | Generates random secure password | Fills password field |
| **"Cancel" Button** | Button | Navigate | `/admin/hrs` |
| **"Create HR Account" Button** | Submit button | Server Action `createHR(data)` | ✅ **Success:** Redirects to `/admin/hrs` with toast "HR account created" |
| | | | ❌ **Error:** Field-level errors displayed |

---

## 11.8 PAGE: /admin/hrs/[id]/edit (Protected — Admin Only)

### Overview
Edit an existing HR account's details.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    Admin Panel                              🔔 [3]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Edit HR Account — hr_sarah                            │
│  Dashboard│                                                       │
│         │  ┌────────────────────────────────────────────────────┐│
│  👥 HRs │  │  Full Name:  [Sarah Johnson______________]        ││
│         │  │  Phone:      [+91-9876543210____________]         ││
│  📋     │  │  Username:   [hr_sarah___________________]        ││
│  Requests│  │                                                    ││
│         │  │  🔒 Password: [••••••••••] [Reset Password]       ││
│  ⚙️     │  │                                                    ││
│  Settings│  │  [Delete Account]     [Cancel]   [Save Changes]   ││
│         │  └────────────────────────────────────────────────────┘│
│         │                                                         │
│         │  🟢 Account is active  [Deactivate]                    │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Full Name Input** | Text field (pre-filled) | — | — |
| **Phone Input** | Text field (pre-filled) | — | — |
| **Username Input** | Text field (pre-filled) | — | — |
| **"Reset Password" Button** | Button | Opens **ResetPasswordModal** | Modal overlay |
| **"Delete Account" Button** | Danger button | Opens **ConfirmDialog** | "Are you sure?" → Soft delete (deactivate) |
| **"Cancel" Button** | Button | Navigate | `/admin/hrs` |
| **"Save Changes" Button** | Submit button | Server Action `updateHR(id, data)` | ✅ **Success:** Redirects to `/admin/hrs` with toast |
| **"Deactivate/Activate" Button** | Toggle | Server Action `toggleHRActive(id)` | ✅ Toggles status, button text changes |

---

## 11.9 PAGE: /admin/requests (Protected — Admin Only)

### Overview
View and manage all HR access/password reset requests.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    Admin Panel                              🔔 [3]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  HR Requests                                           │
│  Dashboard│                                                       │
│         │  [All] [Pending] [Approved] [Rejected]                 │
│  👥 HRs │                                                         │
│         │  ┌──────┬────────┬───────────┬────────┬──────────────┐ │
│  📋     │  │ User │ Type   │ Date      │ Status │ Actions      │ │
│  Requests│  ├──────┼────────┼───────────┼────────┼──────────────┤ │
│  (active)│  │ john │ Reset  │ 16 Jul    │ 🟡Pend │ [Approve]    │ │
│         │  │ sara │ New    │ 16 Jul    │ 🟡Pend │ [Approve]    │ │
│  ⚙️     │  │ adam │ New    │ 15 Jul    │ ✅Appr │ —            │ │
│  Settings│  │ lee  │ Reset  │ 14 Jul    │ ❌Rej  │ —            │ │
│         │  └──────┴────────┴───────────┴────────┴──────────────┘ │
│         │                                                         │
│         │  Showing 4 of 15 requests                              │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Tab Filters** | Tab buttons | Filter list | [All] [Pending] [Approved] [Rejected] |
| **"[Approve]" Button** | Button per row | Server Action `approveRequest(id)` | ✅ **New Account:** Opens HR creation form pre-filled with username → `/admin/hrs/new?username=sara` |
| | | | ✅ **Password Reset:** Opens **ResetPasswordModal** |
| **"[Reject]" Button** | Button per row | Opens **RejectRequestModal** | Modal with reason field → updates status |

---

## 11.10 MODAL: ResetPasswordModal (Overlay)

### Overview
Opens when Admin resets an HR's password (from HR edit page or request approval).

### Layout
```
┌───────────────────────────────────────────────┐
│  Reset Password — hr_sarah               [X]  │
│                                                 │
│  New Password:                                  │
│  [___________________________________]    [🔄] │
│                                                 │
│  Password strength: ████████░░  80%             │
│                                                 │
│  [Generate Strong Password]                     │
│                                                 │
│  ─────────────────────────────────────────      │
│                                                 │
│  ⚠️ The new password will be shown only once.   │
│  Share it with the HR securely.                 │
│                                                 │
│  [Cancel]          [Reset Password]              │
└───────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"X" (Close)** | Icon button | Closes modal | Modal dismissed |
| **Password Input** | Password field | — | Live strength indicator |
| **🔄 (Generate) Icon** | Icon button | Generates random password | Fills field |
| **"Generate Strong Password"** | Link | Same as 🔄 | Fills field with strong password |
| **"Cancel" Button** | Button | Closes modal | Modal dismissed |
| **"Reset Password" Button** | Submit button | Server Action `resetHRPassword(id, pw)` | ✅ **Success:** Modal shows new password (one-time display), Admin copies and shares manually |

---

## 11.11 MODAL: RejectRequestModal (Overlay)

### Overview
Opens when Admin rejects an HR request.

### Layout
```
┌───────────────────────────────────────────────┐
│  Reject Request — hr_john                 [X]  │
│                                                 │
│  Are you sure you want to reject this           │
│  password reset request from "hr_john"?         │
│                                                 │
│  Reason (optional):                             │
│  [___________________________________]          │
│                                                 │
│  [Cancel]          [Confirm Reject]              │
└───────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Reason Input** | Textarea | — | Optional |
| **"Cancel" Button** | Button | Closes modal | Modal dismissed |
| **"Confirm Reject" Button** | Danger button | Server Action `rejectRequest(id, reason)` | ✅ **Success:** Row updates, toast "Request rejected" |

---

## 11.12 PAGE: /hr/dashboard (Protected — HR Only)

### Overview
HR's landing page showing applicant summary and recent activity.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    HR Dashboard                             🔔 [5]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Good morning, Sarah!       📅 16 July 2026            │
│  Dashboard│                                                       │
│         │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  👤     │  │  180   │ │   25   │ │   8    │ │   2    │          │
│  Applicants│  │Pending │ │On Hold │ │Intervws│ │Docs   │          │
│         │  └────────┘ └────────┘ └────────┘ └────────┘          │
│  📅     │                                                         │
│  Interviews│  ┌────────────────────────────────────────────────────┐│
│         │  │  Today's Interviews                        [View All]││
│  📄     │  │                                                   ││
│  Documents│  │ 🕐 3:00 PM — Barath G         [Join Meeting]   ││
│         │  │ 🕐 4:30 PM — Rahul Kumar       [Join Meeting]   ││
│  🚀     │  └────────────────────────────────────────────────────┘│
│  Interns│                                                         │
│         │  ┌────────────────────────────────────────────────────┐│
│         │  │  ⏳ Pending Document Verification        [View All]││
│         │  │                                                   ││
│         │  │ 📄 Priya Sharma — Uploaded 10 min ago   [Review]  ││
│         │  │ 📄 Amit Patel  — Uploaded 1 hour ago    [Review]  ││
│         │  └────────────────────────────────────────────────────┘│
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Summary Cards (4)** | Clickable cards | Navigate with filter | Each card navigates to `/hr/applicants?status=pending` (or hold, interview, docs) |
| **"Today's Interviews" Section** | — | — | Shows upcoming interviews |
| **"[Join Meeting]" Button** | Button per row | Opens Google Meet link in new tab | External URL: `https://meet.google.com/...` |
| **"View All" (Interviews)** | Link | Navigate | `/hr/interviews` |
| **"[Review]" Button** | Button per row | Navigate | `/hr/applicants/[id]` with document tab active |
| **"View All" (Documents)** | Link | Navigate | `/hr/documents` |
| **Sidebar "Dashboard"** | Nav link | — | Active page |
| **Sidebar "Applicants"** | Nav link | Navigate | `/hr/applicants` |
| **Sidebar "Interviews"** | Nav link | Navigate | `/hr/interviews` |
| **Sidebar "Documents"** | Nav link | Navigate | `/hr/documents` |
| **Sidebar "Interns"** | Nav link | Navigate | `/hr/interns` |
| **Notification Bell 🔔** | Icon button | Opens **NotificationDropdown** | Overlay dropdown |

---

## 11.13 PAGE: /hr/applicants (Protected — HR Only)

### Overview
The main applicant list with filtering, search, and actions. This is the most complex page in the application.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    HR Dashboard                             🔔 [5]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Applicants                                            │
│  Dashboard│                                                       │
│         │  ┌──────┬──────┬──────┬──────┬──────┬──────┬────────┐ │
│  👤     │  │ All  │Pending│ Hold │Sched│Compl│Docs  │Rejected│ │
│  Applicants│  │ 245  │ 180  │  25  │  8  │  3  │  2   │  30   │ │
│  (active)│  └──────┴──────┴──────┴──────┴──────┴──────┴────────┘ │
│         │                                                         │
│  📅     │  [🔍 Search by name or email...]     [▼ Sort: Newest]  │
│  Interviews│                                                       │
│         │  ┌──────┬─────────────┬─────────┬──────────┬──────────┐│
│  📄     │  │ Name │ Email       │ Applied │ Status   │ Actions  ││
│  Documents│  ├──────┼─────────────┼─────────┼──────────┼──────────┤│
│         │  │Barath│barath@e..   │ 16 Jul  │ 🟡Pending│ [✅][⏸][❌]││
│  🚀     │  │Rahul │rahul@e..   │ 16 Jul  │ 🟡Pending│ [✅][⏸][❌]││
│  Interns│  │Priya │priya@e..   │ 15 Jul  │ 🔵Hold   │ [✅]   [❌]││
│         │  │Amit  │amit@e..    │ 15 Jul  │ 🟣Interview│ [📅]    ││
│         │  │Neha  │neha@e..    │ 14 Jul  │ 🟢Selected│ [📄]    ││
│         │  │Vikas │vikas@e..   │ 14 Jul  │ 🔴Rejectd│ —       ││
│         │  └──────┴─────────────┴─────────┴──────────┴──────────┘│
│         │                                                         │
│         │  Showing 1-10 of 180         [‹] [1] [2] [3] [...] [›] │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Tab Filters (7)** | Tab buttons | Filter by status | Reloads table with status filter: `?status=pending` |
| **Search Input** | Text field | Client + Server search (debounced) | Filters by name/email |
| **Sort Dropdown** | Select | Sort by: Newest, Oldest, Name A-Z, Name Z-A | Re-sorts table |
| **Column Headers** | Clickable | Sort by specific column | Toggle asc/desc |
| **Applicant Row** | Clickable row | Open detail side panel | Opens **ApplicantDetailPanel** overlay |
| **✅ (Accept) Button** | Icon button | Opens **ScheduleInterviewModal** | Modal overlay |
| **⏸ (Hold) Button** | Icon button | Server Action `holdApplicant(id)` | ✅ **Success:** Row updates, toast "Applicant moved to hold" |
| **❌ (Reject) Button** | Icon button | Opens **ConfirmDialog** | Confirm → Server Action `rejectApplicant(id)` |
| **📅 (View Interview) Button** | Icon button | Navigate | `/hr/applicants/[id]` with interview details |
| **📄 (View Documents) Button** | Icon button | Navigate | `/hr/documents?applicant=id` |
| **Pagination Controls** | Nav buttons | — | `[‹] [1] [2] [3] [›]` |

### Action Visibility Matrix (Critical)

| Current Status | ✅ Accept | ⏸ Hold | ❌ Reject | Other |
|----------------|-----------|---------|-----------|-------|
| **pending** | ✅ Shows (opens interview modal) | ✅ Shows | ✅ Shows | — |
| **on_hold** | ✅ Shows (opens interview modal) | ❌ Hidden | ✅ Shows | — |
| **interview_scheduled** | ❌ Hidden | ❌ Hidden | ❌ Hidden | 📅 View Interview |
| **interview_completed** | ✅ Accept (Post-Interview) | ❌ Hidden | ✅ Reject | — |
| **selected** | ❌ Hidden | ❌ Hidden | ❌ Hidden | 📄 View Docs |
| **document_collection** | ❌ Hidden | ❌ Hidden | ❌ Hidden | 📄 View Docs |
| **documents_received** | ❌ Hidden | ❌ Hidden | ❌ Hidden | 📄 View Docs |
| **documents_verified** | ❌ Hidden | ❌ Hidden | ❌ Hidden | 🚀 View Workspace |
| **workspace_created** | ❌ Hidden | ❌ Hidden | ❌ Hidden | 🚀 View Workspace |
| **rejected** | ❌ Hidden | ❌ Hidden | ❌ Hidden | — |

---

## 11.14 MODAL: ScheduleInterviewModal (Overlay)

### Overview
Opens when HR clicks ✅ **Accept** on a Pending or On Hold applicant.

### Layout
```
┌───────────────────────────────────────────────────────────────┐
│  Schedule Interview                                      [X]  │
│                                                                 │
│  Candidate:  Barath G                                          │
│  Email:      barath@email.com                                  │
│                                                                 │
│  ─────────────────────────────────────────                      │
│                                                                 │
│  Interview Date:                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📅  [18 Jul 2026]                                         ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Interview Time:                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🕐  [15:00]                                               ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ─────────────────────────────────────────                      │
│                                                                 │
│  Upon confirmation:                                             │
│  • ✅ Google Meet link will be auto-created                    │
│  • ✅ Interview invitation will be emailed to candidate         │
│                                                                 │
│  [Cancel]              [Schedule & Send Email]                  │
└───────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"X" (Close)** | Icon button | Closes modal | Modal dismissed |
| **Date Picker** | Date input | Select date | Min: tomorrow (cannot select past) |
| **Time Picker** | Time input | Select time | 30-min intervals, 10:00-18:00 |
| **"Cancel" Button** | Button | Closes modal | Modal dismissed |
| **"Schedule & Send Email" Button** | Submit button | Server Action `acceptApplicant(id, date, time)` | ✅ **Success:** Modal closes, toast "Interview scheduled! Email sent to candidate." |
| | | | Applicant status updates to `interview_scheduled` |
| | | | Google Meet created, email sent |

---

## 11.15 MODAL: Post-Interview Accept (Variant of Accept)

### Overview
Appears when HR clicks ✅ Accept on an applicant whose interview is completed.

### Layout
```
┌───────────────────────────────────────────────────────────────┐
│  Confirm Selection                                        [X]  │
│                                                                 │
│  Candidate:  Barath G                                          │
│  Interview:  18 Jul 2026 at 3:00 PM                            │
│                                                                 │
│  You are about to accept this candidate after the interview.    │
│                                                                 │
│  Upon confirmation:                                             │
│  • ✅ Agreement letter PDF will be automatically emailed       │
│  • ✅ Candidate will receive upload portal link for documents   │
│                                                                 │
│  ─────────────────────────────────────────                      │
│                                                                 │
│  Notes (visible to candidate):                                  │
│  [___________________________________]                          │
│                                                                 │
│  [Cancel]              [Confirm & Send Agreement]               │
└───────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"Cancel" Button** | Button | Closes modal | Modal dismissed |
| **"Confirm & Send Agreement" Button** | Submit button | Server Action `selectCandidate(id)` | ✅ **Success:** Modal closes, toast "Agreement letter sent to candidate." Status → `document_collection` |

---

## 11.16 MODAL: ConfirmDialog (Generic Reusable Overlay)

### Overview
Generic confirmation dialog used for rejections, deletions, and other destructive actions.

### Layout
```
┌───────────────────────────────────────────────┐
│  Confirm Action                           [X]  │
│                                                 │
│  ⚠️  Are you sure?                              │
│                                                 │
│  You are about to reject Barath G's             │
│  application. This action cannot be undone.     │
│                                                 │
│  Reason (optional):                             │
│  [___________________________________]          │
│                                                 │
│  [Cancel]          [Confirm]                    │
└───────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"Cancel" Button** | Button | Closes modal | Modal dismissed, no action |
| **"Confirm" Button** | Danger button | Triggers the confirmed action | ✅ Calls the respective Server Action |

---

## 11.17 SIDE PANEL: ApplicantDetailPanel (Overlay)

### Overview
Slides in from the right when an HR clicks on an applicant row. Shows full details and timeline.

### Layout
```
┌─────────────────────────────┬──────────────────────────────────────┐
│   Applicant List            │  ┌─────────────────────────────────┐ │
│     ...                     │  │  Barath G                   [X] │ │
│     ...                     │  │                                   │ │
│     ...                     │  │  📧 barath@email.com             │ │
│     ...                     │  │  📞 +91-9876543210               │ │
│                             │  │  📅 Applied: 16 July 2026        │ │
│                             │  │                                   │ │
│                             │  │  🟡 Status: Pending Review       │ │
│                             │  │                                   │ │
│                             │  │  ─── Timeline ───                │ │
│                             │  │  ✅ Pending Review · 16 Jul      │ │
│                             │  │  ☐ Accepted                      │ │
│                             │  │  ☐ Interview Scheduled           │ │
│                             │  │  ☐ Interview Completed           │ │
│                             │  │  ☐ Selected                      │ │
│                             │  │  ☐ Docs Received                 │ │
│                             │  │  ☐ Docs Verified                 │ │
│                             │  │  ☐ Workspace Created             │ │
│                             │  │                                   │ │
│                             │  │  ─── Resume ───                  │ │
│                             │  │  [📄 View Resume]                │ │
│                             │  │                                   │ │
│                             │  │  ─── Actions ───                │ │
│                             │  │                                   │ │
│                             │  │  [✅ Accept] [⏸ Hold] [❌ Reject]│ │
│                             │  │                                   │ │
│                             │  └─────────────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"X" (Close)** | Icon button | Closes panel | Panel slides out |
| **Click outside panel** | Backdrop | Closes panel | Panel dismissed |
| **"[View Resume]" Link** | Link | Opens resume in new tab | External URL (from Google Sheet) |
| **Timeline items (completed)** | Visual indicator | — | Shows date of completion |
| **✅ Accept Button** | Button | Opens **ScheduleInterviewModal** | Modal overlay |
| **⏸ Hold Button** | Button | Server Action `holdApplicant(id)` | ✅ Updates timeline, toast |
| **❌ Reject Button** | Button | Opens **ConfirmDialog** | Confirm → rejects |

---

## 11.18 PAGE: /hr/interviews (Protected — HR Only)

### Overview
Shows all interviews — upcoming and completed.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    HR Dashboard                             🔔 [5]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Interviews                                      [➕]  │
│  Dashboard│                                                       │
│         │  [Upcoming] [Completed] [Cancelled]                    │
│  👤     │                                                         │
│  Applicants│  ┌──────┬───────────┬────────┬──────────┬──────────┐│
│         │  │ Name │ Date      │ Time   │ Status   │ Action   ││
│  📅     │  ├──────┼───────────┼────────┼──────────┼──────────┤│
│  Interviews│  │Barath│ 18 Jul    │ 3:00PM │ 🟣Sched  │[Join]    ││
│  (active)│  │Rahul │ 18 Jul    │ 4:30PM │ 🟣Sched  │[Join]    ││
│         │  │Priya │ 17 Jul    │ 2:00PM │ ✅Compl  │[Mark C.] ││
│  📄     │  │Amit  │ 16 Jul    │ 11:00AM│ ✅Compl  │[Mark C.] ││
│  Documents│  └──────┴───────────┴────────┴──────────┴──────────┘│
│         │                                                         │
│  🚀     │  📊 Stats: 2 upcoming · 2 completed today              │
│  Interns│                                                         │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Tab Filters** | Tab buttons | Filter by interview status | [Upcoming] [Completed] [Cancelled] |
| **"[Join]" Button** | Button per row | Opens Google Meet link | External URL in new tab |
| **"[Mark Complete]" Button** | Button per row | Server Action `markInterviewComplete(id)` | ✅ **Success:** Status updates to Completed, row moves tab |
| **📊 Stats** | Visual | — | Summary counts |

---

## 11.19 PAGE: /hr/documents (Protected — HR Only)

### Overview
Shows candidates pending document verification.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    HR Dashboard                             🔔 [2]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Document Verification                                  │
│  Dashboard│                                                       │
│         │  [Pending Review (2)] [Verified (5)] [Rejected (1)]    │
│  👤     │                                                         │
│  Applicants│  ┌──────┬──────────┬──────────┬────────────────────┐│
│         │  │ Name │ Submitted │ Status   │ Documents          ││
│  📅     │  ├──────┼──────────┼──────────┼────────────────────┤│
│  Interviews│  │Priya │ 10 min ago│ 🟡Pending│ 📄📄📄 [View All]  ││
│         │  │Amit  │ 1 hr ago  │ 🟡Pending│ 📄📄📄 [View All]  ││
│  📄     │  └──────┴──────────┴──────────┴────────────────────┘│
│  Documents│                                                       │
│  (active)│  ┌────────────────────────────────────────────────────┐│
│         │  │  Priya Sharma's Documents                           ││
│  🚀     │  │  ┌─────┬──────────┬────────┬────────┐             ││
│  Interns│  │  │ #   │ Document │ Status │ Preview│             ││
│         │  │  ├─────┼──────────┼────────┼────────┤             ││
│         │  │  │ 1   │ Agreement│ ✅Recvd│ [👁️]   │             ││
│         │  │  │ 2   │ Aadhaar  │ ✅Recvd│ [👁️]   │             ││
│         │  │  │ 3   │ Marksheet│ ✅Recvd│ [👁️]   │             ││
│         │  │  └─────┴──────────┴────────┴────────┘             ││
│         │  │                                                    ││
│         │  │  [Approve Documents]    [Request Resubmission]     ││
│         │  └────────────────────────────────────────────────────┘│
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Tab Filters** | Tab buttons | Filter | [Pending] [Verified] [Rejected] |
| **Applicant Row (clickable)** | Clickable row | Expand documents below | Shows document list |
| **"[View All]" Link** | Link | Expand documents | Shows document list below |
| **👁️ (Preview) Icon** | Icon button | Opens **DocumentPreview** | Modal/overlay previews the document (PDF/image) |
| **"Approve Documents" Button** | Button | Server Action `verifyDocuments(applicantId)` | ✅ **Success:** Status → `documents_verified`, triggers **workspace creation**, toast "Documents verified. Workspace being created..." |
| **"Request Resubmission" Button** | Button | Opens **ConfirmDialog** | Reason field → Server Action `rejectDocuments(id, reason)` → Email sent to candidate |

---

## 11.20 MODAL: DocumentPreview (Overlay)

### Overview
Full-screen preview of a candidate's uploaded document.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  [X] Close    Document Preview — Agreement Letter — Priya Sharma │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │            PDF / Image Preview Here                          ││
│  │            (Embedded viewer)                                 ││
│  │                                                              ││
│  │                                                              ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  [Download]     [Zoom In]     [Zoom Out]     [Rotate]            │
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"X" Close** | Icon/Button | Closes preview | Returns to documents page |
| **"Download" Button** | Link | Downloads file | Triggers file download |
| **Zoom Controls** | Buttons | Zoom in/out | Adjusts preview scale |

---

## 11.21 PAGE: /hr/interns (Protected — HR Only)

### Overview
Shows all active interns (candidates with workspace created) and their workspace details.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    HR Dashboard                             🔔 [5]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │                                                         │
│  📊     │  Active Interns                              [5 total] │
│  Dashboard│                                                       │
│         │  ┌──────┬───────────┬───────────┬────────────────────┐ │
│  👤     │  │ Name │ Joined    │ Workspace │ Quick Actions      │ │
│  Applicants│  ├──────┼───────────┼───────────┼────────────────────┤ │
│         │  │Barath│ 19 Jul    │ [📁 Open]  │ [📊 Task Tracker] │ │
│  📅     │  │Rahul │ 18 Jul    │ [📁 Open]  │ [📊 Task Tracker] │ │
│  Interviews│  │Priya │ 17 Jul    │ [📁 Open]  │ [📊 Task Tracker] │ │
│         │  └──────┴───────────┴───────────┴────────────────────┘ │
│  📄     │                                                         │
│  Documents│  📊 Task Submission (Today)                           │
│         │  ┌──────┬────────┬────────┬──────────────┐            │
│  🚀     │  │ Name │ Status │ Pending│ Last Submission│           │
│  Interns│  ├──────┼────────┼────────┼──────────────┤            │
│  (active)│  │Barath│ ✅ Done│ 0     │ 16 Jul ✅    │            │
│         │  │Rahul │ ⏳ Pending│2 days│ 14 Jul       │            │
│         │  │Priya │ ✅ Done│ 0     │ 16 Jul ✅    │            │
│         │  └──────┴────────┴────────┴──────────────┘            │
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"[📁 Open]" Button** | Button per row | Opens Google Drive folder | External URL in new tab |
| **"[📊 Task Tracker]" Button** | Button per row | Opens Task Tracker Google Sheet | External URL in new tab |
| **Intern Row (clickable)** | Clickable row | Opens detail | Shows extended info panel |

---

## 11.22 PAGE: /upload/[token] (Public — Token-Based)

### Overview
Secure document upload portal for candidates. No authentication required — accessed via unique token from email.

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    ┌─────────────────────────┐                    │
│                    │                         │                    │
│                    │   🏢 Rivo               │                    │
│                    │                         │                    │
│                    │   Welcome, Barath G!    │                    │
│                    │                         │                    │
│                    │   Please upload your     │                    │
│                    │   onboarding documents   │                    │
│                    │   to complete the        │                    │
│                    │   joining process.       │                    │
│                    │                         │                    │
│                    ├─────────────────────────┤                    │
│                    │                         │                    │
│                    │   1. Signed Agreement    │                    │
│                    │   [Choose File] ✅       │                    │
│                    │                         │                    │
│                    │   2. Aadhaar Card        │                    │
│                    │   [Choose File] ⏳       │                    │
│                    │                         │                    │
│                    │   3. Current Marksheet   │                    │
│                    │   [Choose File] ⏳       │                    │
│                    │                         │                    │
│                    │   ┌─────────────────┐    │                    │
│                    │   │   Submit All     │    │                    │
│                    │   └─────────────────┘    │                    │
│                    │                         │                    │
│                    │   ⚠️ Accepted formats:   │                    │
│                    │   PDF, JPG, PNG          │                    │
│                    │   Max size: 10 MB each   │                    │
│                    │                         │                    │
│                    └─────────────────────────┘                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"[Choose File]" Buttons** | File input (3x) | Opens file picker | PDF/JPG/PNG only |
| **Upload Status Indicators** | Icon | ✅ Uploaded / ⏳ Pending / ❌ Error | Updates as files are selected |
| **"Submit All" Button** | Submit button | Server Action `uploadDocuments(token, files)` | ✅ **Success:** Confirmation screen: "Documents submitted! HR will review them shortly." |
| | | | ❌ **Error:** "Upload failed. Please try again." |
| **File validation** | Client-side | — | Shows error for wrong type or oversized file |

### Upload Confirmation State (After Submit)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    ┌─────────────────────────┐                    │
│                    │                         │                    │
│                    │      ✅  Success!        │                    │
│                    │                         │                    │
│                    │   Your documents have    │                    │
│                    │   been submitted for     │                    │
│                    │   review.                │                    │
│                    │                         │                    │
│                    │   What happens next:     │                    │
│                    │   • HR will verify your  │                    │
│                    │     documents            │                    │
│                    │   • You'll receive your  │                    │
│                    │     workspace access via │                    │
│                    │     email                │                    │
│                    │   • You can close this   │                    │
│                    │     page                 │                    │
│                    │                         │                    │
│                    └─────────────────────────┘                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11.23 PAGE: /hr/applicants/[id] (Protected — HR Only, Detail View)

### Overview
A full-page detail view for an applicant (alternative to side panel for complex cases).

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  🏢 Rivo HR    HR Dashboard                             🔔 [5]  │
├─────────┬────────────────────────────────────────────────────────┤
│         │  [← Back to Applicants]                                │
│         │                                                         │
│  📊     │  ┌────────────────────────────────────────────────────┐│
│  Dashboard│  │  Barath G                                      ││
│         │  │  Status: 🟡 Pending Review                       ││
│  👤     │  │                                                   ││
│  Applicants│  │  ┌──────────┐ ┌──────────────────────────────┐ ││
│         │  │  │Details   │ │Timeline                       │ ││
│  📅     │  │  │          │ │ ┌──────────────────────────┐  │ ││
│  Interviews│  │  │Email:..  │ │ │ ✅ Pending · 16 Jul    │  │ ││
│         │  │  │Phone:..  │ │ │ ☐ Accepted              │  │ ││
│  📄     │  │  │Applied:..│ │ │ ☐ Interview Scheduled   │  │ ││
│  Documents│  │  │Resume:.. │ │ │ ☐ Interview Completed  │  │ ││
│         │  │  │          │ │ │ ☐ Selected              │  │ ││
│  🚀     │  │  └──────────┘ │ │ ☐ Docs Received         │  │ ││
│  Interns│  │               │ │ ☐ Docs Verified         │  │ ││
│         │  │               │ │ ☐ Workspace Created     │  │ ││
│         │  │               │ └──────────────────────────┘  │ ││
│         │  │               └──────────────────────────────┘ ││
│         │  │                                                   ││
│         │  │  ─── Actions ───                                  ││
│         │  │                                                   ││
│         │  │  [✅ Accept]  [⏸ Hold]  [❌ Reject]             ││
│         │  └────────────────────────────────────────────────────┘│
│         └─────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"[← Back to Applicants]" Link** | Link | Navigate | `/hr/applicants` |
| **Same actions as Applicant table row** | Buttons | Same behaviors | Same as Section 11.13 |

---

## 11.24 COMPONENT: NotificationDropdown (Overlay — Any Page)

### Overview
Dropdown from the bell icon showing recent notifications. Accessible from any protected page.

### Layout
```
      ┌───┐
  🔔 ─│ 5 │
      └───┘
        │ (click)
        ▼
  ┌───────────────────────────────────┐
  │  Notifications                    │
  ├───────────────────────────────────┤
  │ 🔔 Interview in 20 min            │
  │  Barath G — 3:00 PM               │
  │  [Join Meeting]       2 min ago   │
  ├───────────────────────────────────┤
  │ 📄 New Documents Received         │
  │  Priya Sharma uploaded documents  │
  │  [Review]             15 min ago  │
  ├───────────────────────────────────┤
  │ 📁 Workspace Created              │
  │  Rahul's workspace is ready       │
  │  [Open]               1 hour ago  │
  ├───────────────────────────────────┤
  │ 📋 HR Request Pending             │
  │  New account request from "adam"  │
  │  [View]               2 hours ago │
  ├───────────────────────────────────┤
  │                                   │
  │  [View All Notifications →]       │
  └───────────────────────────────────┘
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **Notification Item** | Clickable list item | Opens action or navigates | HR: "Join Meeting" opens Meet link; "Review" navigates to document; "View" navigates to request |
| **"[Join Meeting]" Button** | Inline button | Opens Google Meet | External URL |
| **"[Review]" Button** | Inline button | Navigate | `/hr/documents` |
| **"[Open]" Button** | Inline button | Opens Drive folder | External URL |
| **"[View All Notifications]" Link** | Link | Navigate (future) | `/notifications` |
| **Click outside dropdown** | Backdrop | Closes dropdown | Dropdown dismissed |

---

## 11.25 COMPONENT: InterviewReminderToast (Auto-Triggered)

### Overview
An auto-triggered toast notification that appears 20 minutes before each interview. Not manually navigated to — triggered by the background cron job.

### Layout
```
┌───────────────────────────────────────────────────────────────┐
│  🔔 Interview in 20 minutes                                   │
│  Barath G — 3:00 PM                                           │
│  ┌─────────────────┐   ┌──────────┐                          │
│  │  🔗 Join Meeting │   │ Dismiss  │                          │
│  └─────────────────┘   └──────────┘                          │
└───────────────────────────────────────────────────────────────┘
   ↳ Appears at top-right corner, auto-dismisses after 30s
```

### Interactive Elements

| Element | Type | Action | Redirect/Result |
|---------|------|--------|-----------------|
| **"Join Meeting" Button** | Button | Opens Google Meet | External URL (new tab) |
| **"Dismiss" Button** | Button | Dismisses toast | Toast disappears |

---

## 11.26 COMPONENT: Sidebar Navigation (Persistent — All Protected Pages)

### Overview
The sidebar is present on all protected pages. It has two variants — Admin sidebar and HR sidebar.

### Admin Sidebar

```
┌──────────────────┐
│                  │
│  🏢 Rivo HR      │  ← App logo
│  Automation      │
│                  │
│  ─────────────  │
│                  │
│  📊 Dashboard    │  → /admin/dashboard
│                  │
│  👥 HRs          │  → /admin/hrs
│                  │
│  📋 Requests     │  → /admin/requests  (with badge: 3)
│                  │
│  ⚙️ Settings     │  → /admin/settings (future)
│                  │
│  ─────────────  │
│                  │
│  👤 Admin Name   │  → User dropdown
│  [Sign Out]      │  → Server Action signOut() → /sign-in
│                  │
└──────────────────┘
```

### HR Sidebar

```
┌──────────────────┐
│                  │
│  🏢 Rivo HR      │  ← App logo
│  Automation      │
│                  │
│  ─────────────  │
│                  │
│  📊 Dashboard    │  → /hr/dashboard
│                  │
│  👤 Applicants   │  → /hr/applicants  (with pending count)
│                  │
│  📅 Interviews   │  → /hr/interviews  (with today's count)
│                  │
│  📄 Documents    │  → /hr/documents   (with pending count)
│                  │
│  🚀 Interns      │  → /hr/interns     (with active count)
│                  │
│  ─────────────  │
│                  │
│  👤 HR Name      │  → User dropdown
│  [Sign Out]      │  → Server Action signOut() → /sign-in
│                  │
└──────────────────┘
```

---

## 11.27 Navigation Flow Diagram

```
                                         ┌──────────────┐
                                         │   /sign-in   │
                                         └──────┬───────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │   Authenticate via    │
                                    │   Server Action       │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │   Role Detection      │
                                    └───────────┬───────────┘
                                                │
                     ┌──────────────────────────┼──────────────────────────┐
                     │                          │                          │
                     ▼                          ▼                          │
           ┌──────────────────┐      ┌──────────────────┐                 │
           │  Role: admin     │      │  Role: hr        │                 │
           │  Redirect to:    │      │  Redirect to:    │                 │
           │  /admin/dashboard│      │  /hr/dashboard   │                 │
           └────────┬─────────┘      └────────┬─────────┘                 │
                    │                          │                           │
     ┌──────────────┼──────────────┐           │              ┌────────────┴────────────┐
     │              │              │           │              │           │             │
     ▼              ▼              ▼           ▼              ▼           ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ /admin/  │ │ /admin/ │ │ /admin/  │  │ /hr/     │  │ /hr/     │  │ /hr/     │  │ /upload/ │
│dashboard │ │  /hrs   │ │requests  │  │dashboard │  │applicants│  │interviews│  │ [token]  │
│          │ │         │ │          │  │          │  │          │  │          │  │ (public) │
└──────────┘ └──┬──────┘ └──────────┘  └──────────┘  └────┬─────┘  └──────────┘  └──────────┘
                │                                          │
          ┌─────┴─────┐                             ┌──────┴──────┐
          ▼           ▼                             ▼             ▼
   ┌──────────┐ ┌──────────┐                 ┌──────────┐  ┌──────────┐
   │ /admin/  │ │ /admin/  │                 │ /hr/     │  │ /hr/     │
   │hrs/new   │ │hrs/[id]/│                 │applicants│  │documents │
   │          │ │  edit   │                 │  /[id]   │  │          │
   └──────────┘ └──────────┘                 └──────────┘  └──────────┘
```

---

## 11.28 Page Count Summary

| Page/Component | Type | Authentication | Route |
|----------------|------|----------------|-------|
| Sign In | Full Page | Public | `/sign-in` |
| Request Access Modal | Modal Overlay | Public | (Overlay on `/sign-in`) |
| Admin Dashboard | Full Page | Admin | `/admin/dashboard` |
| HR Account List | Full Page | Admin | `/admin/hrs` |
| Create HR Account | Full Page | Admin | `/admin/hrs/new` |
| Edit HR Account | Full Page | Admin | `/admin/hrs/[id]/edit` |
| HR Requests | Full Page | Admin | `/admin/requests` |
| HR Dashboard | Full Page | HR | `/hr/dashboard` |
| Applicant List | Full Page | HR | `/hr/applicants` |
| Applicant Detail | Full Page | HR | `/hr/applicants/[id]` |
| Applicant Detail Panel | Side Panel | HR | (Overlay on `/hr/applicants`) |
| Interview List | Full Page | HR | `/hr/interviews` |
| Document Verification | Full Page | HR | `/hr/documents` |
| Active Interns | Full Page | HR | `/hr/interns` |
| Document Upload Portal | Full Page | Public (Token) | `/upload/[token]` |
| Schedule Interview Modal | Modal Overlay | HR | (Overlay on `/hr/applicants`) |
| Post-Interview Accept Modal | Modal Overlay | HR | (Overlay on `/hr/applicants`) |
| Confirm Dialog | Modal Overlay | Any Auth | (Generic reusable) |
| Reset Password Modal | Modal Overlay | Admin | (Overlay on multiple pages) |
| Reject Request Modal | Modal Overlay | Admin | (Overlay on `/admin/requests`) |
| Document Preview | Modal Overlay | HR | (Overlay on `/hr/documents`) |
| Notification Dropdown | Dropdown Overlay | Any Auth | (Overlay, accessible from all pages) |
| Interview Reminder Toast | Toast Notification | HR | (Auto-triggered, not navigated) |
| Sidebar Navigation | Persistent Component | Any Auth | (Present on all protected pages) |

**Total Full Pages: 13**
\
**Total Modals/Overlays: 8**
\
**Total Persistent Components: 2** (Sidebar, Top Bar with Notification Bell)
\
**Total Auto-triggered Components: 1** (Interview Reminder Toast)

---

## 11.29 Summary of Buttons & Their Navigation Targets

| Button/Link | Page Location | Type | Navigates To |
|-------------|---------------|------|-------------|
| **Sign In** | `/sign-in` | Submit | `/admin/dashboard` or `/hr/dashboard` |
| **Request Access** | `/sign-in` | Opens Modal | RequestAccessModal |
| **Forgot Password?** | `/sign-in` | Opens Modal | RequestAccessModal |
| **Dashboard** | Sidebar (Admin) | Nav Link | `/admin/dashboard` |
| **HRs** | Sidebar (Admin) | Nav Link | `/admin/hrs` |
| **Requests** | Sidebar (Admin) | Nav Link | `/admin/requests` |
| **Settings** | Sidebar (Admin) | Nav Link | `/admin/settings` (future) |
| **Sign Out** | Sidebar (Admin/HR) | Server Action | `/sign-in` |
| **Dashboard** | Sidebar (HR) | Nav Link | `/hr/dashboard` |
| **Applicants** | Sidebar (HR) | Nav Link | `/hr/applicants` |
| **Interviews** | Sidebar (HR) | Nav Link | `/hr/interviews` |
| **Documents** | Sidebar (HR) | Nav Link | `/hr/documents` |
| **Interns** | Sidebar (HR) | Nav Link | `/hr/interns` |
| **Add New HR** | `/admin/dashboard`, `/admin/hrs` | Nav Link | `/admin/hrs/new` |
| **View All Requests** | `/admin/dashboard` | Nav Link | `/admin/requests` |
| **Approve (Request)** | `/admin/requests` | Submit + Nav | Stay + Modal or `/admin/hrs/new` |
| **Reject (Request)** | `/admin/requests` | Opens Modal | RejectRequestModal |
| **Approve (Applicant)** | `/hr/applicants` | Opens Modal | ScheduleInterviewModal |
| **Hold (Applicant)** | `/hr/applicants` | Submit | Stay (status update) |
| **Reject (Applicant)** | `/hr/applicants` | Opens Modal | ConfirmDialog |
| **Schedule & Send Email** | ScheduleInterviewModal | Submit | Stay (modal closes, toast) |
| **Confirm & Send Agreement** | Post-Interview Accept Modal | Submit | Stay (modal closes, toast) |
| **Join Meeting** | `/hr/dashboard`, `/hr/interviews`, Notification | External Link | Google Meet URL (new tab) |
| **Mark Complete** | `/hr/interviews` | Submit | Stay (status update) |
| **Review Documents** | `/hr/dashboard`, `/hr/documents` | Nav Link | `/hr/documents` |
| **Preview Document** | `/hr/documents` | Opens Modal | DocumentPreview |
| **Approve Documents** | `/hr/documents` | Submit | Stay (triggers workspace) |
| **Request Resubmission** | `/hr/documents` | Submit | Stay (email sent) |
| **Open Workspace** | `/hr/interns` | External Link | Google Drive folder (new tab) |
| **Open Task Tracker** | `/hr/interns` | External Link | Google Sheet (new tab) |
| **Submit All (Upload)** | `/upload/[token]` | Submit | Stay (confirmation screen) |
| **Back to Applicants** | `/hr/applicants/[id]` | Nav Link | `/hr/applicants` |
| **Cancel (Modal)** | Multiple modals | Dismiss | Closes modal |
| **Confirm (Dialog)** | ConfirmDialog | Submit | Executes action |

---

> **Total pages: 13 full pages + 8 modal overlays + 2 persistent components + 1 auto-triggered component**
>
> **Total identifiable navigation actions: 42 unique button/link actions**
>
> **Note:** This document should be used as the single source of truth for frontend page routing, navigation, and user flow design. Every route maps to a specific page file in the Next.js App Router `app/` directory structure.
