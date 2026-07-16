# 03 — Complete Requirements Specification (SRS)

> **Document Purpose:** Define every functional and non-functional requirement for the HR Automation platform. This document serves as the single source of truth for what the system must do.

---

## 3.1 Functional Requirements — Module-Wise

---

### MODULE A: Authentication & Session Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AUTH-01 | The system shall have a **single sign-in page** for both Admin and HR users | P0 | One page at route `/sign-in`, no separate `/admin/login` or `/hr/login` |
| AUTH-02 | The sign-in page shall accept **Username** and **Password** fields | P0 | Form with two text inputs and a "Sign In" button |
| AUTH-03 | The system shall determine the user's role (Admin/HR) from their credentials and redirect to the appropriate dashboard | P0 | Admin → `/admin/dashboard`, HR → `/hr/dashboard` |
| AUTH-04 | The sign-in page shall have a **"Request"** button for HR account/password requests | P0 | Clicking "Request" opens a modal or page with username input |
| AUTH-05 | When an HR submits a request, it shall appear in the Admin's **Requests** list | P0 | Request stored in `requests` table with status `pending` |
| AUTH-06 | The Admin shall be able to **view all pending requests** in a dedicated page/section | P0 | Table showing: username, request type, date, action buttons |
| AUTH-07 | The Admin shall be able to **approve a request** and set/reset the HR's password | P0 | After approval, password is updated; HR can log in with new credentials |
| AUTH-08 | The Admin shall be able to **reject a request** with an optional reason | P1 | Rejected request moves to `rejected` status |
| AUTH-09 | Passwords shall be **hashed** (not stored in plain text) | P0 | Uses bcrypt or Supabase Auth's built-in hashing |
| AUTH-10 | Sessions shall **expire** after 24 hours of inactivity | P1 | Session cookie has maxAge of 86400 seconds |
| AUTH-11 | The system shall provide a **"Forgot Password"** flow for existing HRs | P1 | HR submits request → Admin resets → HR receives new credentials |

---

### MODULE B: Admin — HR Account Management

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| ADM-01 | The Admin dashboard shall show a **list of all HR accounts** | P0 | Table with columns: Name, Phone, Username, Status, Created Date |
| ADM-02 | The Admin shall be able to **create a new HR account** | P0 | Form with: Name, Phone, Username, Password fields |
| ADM-03 | The Admin shall be able to **edit an existing HR account** | P0 | Pre-filled form allowing edits to Name, Phone, Username |
| ADM-04 | The Admin shall be able to **reset an HR's password** | P0 | Button that generates/accepts a new password |
| ADM-05 | The Admin shall be able to **deactivate/reactivate** an HR account | P1 | Deactivated HRs cannot log in (status = `inactive`) |
| ADM-06 | The Admin shall be able to **view request history** from HRs | P1 | Chronological list of past requests with status and timestamps |
| ADM-07 | The Admin dashboard shall show **summary statistics** (total HRs, active HRs, pending requests) | P1 | Cards at top of dashboard: "12 Active HRs", "3 Pending Requests" |
| ADM-08 | The Admin shall be able to **search/filter** HRs by name or username | P2 | Search input that filters the HR table in real-time |

---

### MODULE C: HR Dashboard — Applicant Overview

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| HRD-01 | The HR dashboard shall display **all applicants** from the synced Google Sheet data | P0 | List/table of applicants with: Name, Email, Phone, Applied Date, Status |
| HRD-02 | The dashboard shall show **summary cards** at the top: Total Applicants, Accepted, Rejected, On Hold, Pending Review | P0 | Four clickable cards; clicking filters the list below |
| HRD-03 | Each applicant row shall display their **current status** with a color-coded badge | P0 | Pending=Yellow, Accepted=Green, Rejected=Red, Hold=Blue, Interview Scheduled=Purple |
| HRD-04 | The applicant list shall be **paginated** (25/50/100 per page) | P0 | Page numbers, Previous/Next buttons |
| HRD-05 | The HR shall be able to **search** applicants by name or email | P0 | Search input that filters results as user types |
| HRD-06 | The HR shall be able to **filter** applicants by status | P1 | Dropdown filter: All, Pending, Accepted, Rejected, Hold, Interview Scheduled |
| HRD-07 | The HR shall be able to **sort** applicants by date or name | P1 | Clickable column headers to sort ascending/descending |
| HRD-08 | The HR shall be able to **view applicant details** in a side panel or modal | P0 | Clicking an applicant reveals full details: name, email, phone, resume link, applied date, status history |

---

### MODULE D: Applicant Actions — Accept / Reject / Hold

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| ACT-01 | Each Pending applicant shall have **three action buttons**: Accept, Reject, Hold | P0 | Three distinct buttons/actions visible on each applicant card/row |
| ACT-02 | When **Accept** is clicked on a Pending applicant, an **interview scheduling modal** shall appear | P0 | Modal with Date picker, Time picker, and Confirm/Cancel buttons |
| ACT-03 | Upon confirming the interview schedule, the system shall automatically send an interview email with a Google Meet link | P0 | See Module E for detailed requirements |
| ACT-04 | When **Reject** is clicked on a Pending applicant, a **confirmation dialog** shall appear | P0 | "Are you sure?" with Confirm/Cancel; optionally notes field |
| ACT-05 | When Reject is confirmed, the applicant shall move to the **Rejected list** (not deleted from platform) | P0 | Applicant status changes to `rejected`; data preserved in database |
| ACT-06 | The **Google Sheet data shall never be modified** when a rejection occurs | P0 | Platform only changes its own `status` column; original sheet untouched |
| ACT-07 | When **Hold** is clicked on a Pending applicant, the applicant shall move to the **Hold list** | P0 | Status changes to `on_hold` |
| ACT-08 | Applicants in the **Hold list** shall only show **two actions**: Accept and Reject | P0 | Hold button is hidden for already-held applicants |
| ACT-09 | Clicking **Accept** on a Held applicant shall trigger the same interview scheduling flow as a new accept | P0 | Same modal, same automation |
| ACT-10 | Clicking **Reject** on a Held applicant shall move them to Rejected | P0 | Same rejection flow |
| ACT-11 | The system shall **track status change history** for audit purposes | P1 | `status_history` table logs: applicant_id, old_status, new_status, changed_by, changed_at |

---

### MODULE E: Interview Automation

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| INT-01 | The interview scheduling modal shall allow HR to select **Date** (date picker) and **Time** (time picker) | P0 | Both fields required; cannot submit without both |
| INT-02 | Upon confirmation, the system shall call **Google Calendar API** to create an event with Google Meet conferencing | P0 | Event created; Meet link returned |
| INT-03 | The system shall store the **interview record** in the database (candidate_id, date, time, meet_link, status) | P0 | `interviews` table populated |
| INT-04 | The system shall send an **automated email** via Gmail API to the candidate | P0 | Email sent to candidate's registered email address |
| INT-05 | The interview invitation email shall contain: congratulations message, interview date, interview time, unique Google Meet link, and instructions | P0 | All fields present in email body |
| INT-06 | The email shall be sent **immediately** upon confirmation (no delay) | P0 | Email dispatched within same request-response cycle (or queued with immediate execution) |
| INT-07 | The applicant's status shall update to **"Interview Scheduled"** | P0 | Status visible on dashboard |
| INT-08 | The system shall display a **success toast/notification** to HR: "Interview scheduled and email sent to [candidate name]" | P0 | Toast appears at top-right of dashboard |

---

### MODULE F: Interview Reminders

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| REM-01 | The system shall automatically notify the HR **20 minutes before** each scheduled interview | P0 | In-app notification appears 20 minutes prior |
| REM-02 | The notification shall display: candidate name, scheduled time, and a **"Join Meeting"** button | P0 | Button links to the Google Meet URL |
| REM-03 | The notification shall appear as a **toast/banner** in the HR dashboard | P0 | Visible regardless of which page HR is on within the dashboard |
| REM-04 | Notifications shall be **dismissible** | P1 | HR can click "Dismiss" to remove the notification |
| REM-05 | The system shall have a **notification center** showing all past notifications | P2 | Bell icon → dropdown with notification history |
| REM-06 | For MVP, reminders are **in-app only** (no email/SMS reminders) | P0 | No email/SMS integration for reminders yet |
| REM-07 | The reminder scheduler shall run as a **background job** (cron) that checks upcoming interviews every minute | P0 | Cron job or Supabase pg_cron checking `interviews` table |

---

### MODULE G: Post-Interview Decision

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| PIM-01 | After the interview date/time has passed, the interview status shall become **"Completed"** | P0 | Status updates automatically based on scheduled time (or HR can manually mark complete) |
| PIM-02 | For completed interviews, the HR shall see **Accept** and **Reject** action buttons | P0 | Same visual style as applicant actions |
| PIM-03 | When **Accept** is clicked post-interview, the system shall automatically send the **Agreement Letter PDF** via email | P0 | Email sent with PDF attachment from template |
| PIM-04 | The agreement letter email shall include instructions to: print, sign, scan, and upload via the **candidate upload portal** | P0 | Email contains upload portal link |
| PIM-05 | The candidate's status shall update to **"Document Collection"** | P0 | Status reflects that documents are pending from candidate |
| PIM-06 | When **Reject** is clicked post-interview, the candidate moves to Rejected (post-interview) | P0 | Different status tag: "Rejected (Post-Interview)" |
| PIM-07 | The system shall store a **reference to the sent agreement letter** (which template version, sent date) | P1 | `agreement_letters` table tracks sent letters |

---

### MODULE H: Document Collection — Candidate Upload Portal

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| DOC-01 | The email sent to selected candidates shall contain a **secure upload link** (unique per candidate) | P0 | URL includes a token or candidate ID; expires in 7 days |
| DOC-02 | The upload portal shall require **three mandatory uploads**: Signed Agreement Letter, Aadhaar Card, Current Marksheet | P0 | Three file upload fields, all required |
| DOC-03 | The upload portal shall accept **PDF and image files** (JPG, PNG) | P0 | File type validation on client and server |
| DOC-04 | Files shall be **validated** for: max size (10 MB each), file type, and virus scanning (future) | P0 | Reject files exceeding limits with clear error message |
| DOC-05 | Upon successful upload, files shall be stored in **Supabase Storage** under a candidate-specific path | P0 | Path: `candidates/{candidateId}/documents/{type}_{timestamp}.pdf` |
| DOC-06 | After all three files are uploaded, the candidate shall see a **confirmation message** | P0 | "Your documents have been submitted successfully. HR will review them shortly." |
| DOC-07 | The system shall **notify the HR** immediately when documents are submitted | P0 | In-app notification: "New documents received from [candidate name]" |
| DOC-08 | The system shall **disable the upload portal** once all documents are uploaded | P1 | Prevent duplicate submissions |
| DOC-09 | The HR shall be able to **view documents** directly in the browser (PDF preview, image preview) | P0 | Click to open file in overlay or new tab |

---

### MODULE I: Document Verification

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| VER-01 | The HR dashboard shall have a **"Pending Verification"** section showing candidates awaiting document review | P0 | Tab/card showing count; click to see list |
| VER-02 | For each candidate pending verification, the HR shall see: candidate name, submitted date, and status of each document | P0 | Three status indicators: Received / Not Received |
| VER-03 | The HR shall be able to **click to view/preview** each submitted document | P0 | In-browser preview for PDFs and images |
| VER-04 | The HR shall have two actions: **Approve** or **Reject** documents | P0 | Approve marks verification complete; Reject may allow requesting resubmission |
| VER-05 | When approved, the system shall proceed to **workspace creation** (see Module J) | P0 | Auto-trigger workspace creation flow |
| VER-06 | When rejected, the HR shall provide a **reason** and the candidate shall be notified to resubmit | P1 | Email sent to candidate with rejection reason |
| VER-07 | The verification shall be **timestamped** and **attributed** to the verifying HR | P0 | `verified_by` and `verified_at` fields in database |

---

### MODULE J: Workspace Automation (Google Drive)

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| WKS-01 | Upon document verification, the system shall **automatically create** a candidate workspace in Google Drive | P0 | Drive API called without HR intervention |
| WKS-02 | The workspace folder shall be named using the **candidate's full name** | P0 | E.g., "Barath G", "Rahul Kumar" — dynamically named |
| WKS-03 | The workspace shall contain a **"Daily Tasks"** subfolder | P0 | Created as subfolder inside candidate's main folder |
| WKS-04 | The workspace shall contain a **Task Tracker Google Sheet** with pre-defined columns | P0 | Columns: Date, Task ID, Assigned Task, Work Done, Proof of Documents, HR Status, HR Remarks |
| WKS-05 | The workspace shall be **shared** with the candidate's email and the HR's email | P0 | Google Drive `permissions.create()` for both parties |
| WKS-06 | After workspace creation, the system shall send an **automated email** to the candidate with the workspace link | P0 | Email: "Your internship workspace is ready. Click here to access." |
| WKS-07 | The system shall store the **workspace metadata** in the database | P0 | `workspaces` table: folder_id, folder_url, sheet_id, created_at |
| WKS-08 | The workspace creation shall have **error handling**: retry on failure, notify admin on persistent failure | P1 | Max 3 retries with exponential backoff |

---

### MODULE K: Daily Task Tracking

| ID | Requirement | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| TSK-01 | The HR shall be able to **view all active interns** and their Task Tracker sheets | P0 | List of interns with link to open their Task Tracker |
| TSK-02 | The HR shall be able to **review proof of work** by opening the folder link in the Task Tracker | P0 | Link opens the date-specific proof folder in Google Drive |
| TSK-03 | The HR shall be able to update **Status** (Accepted/Rejected/Pending) and **Remarks** in the Task Tracker | P0 | HR can write/edit remarks directly or via a platform UI that syncs to the sheet |
| TSK-04 | The system shall provide a **dashboard view** of task submission status across all interns | P2 | Show who has/hasn't submitted daily proof |
| TSK-05 | The system shall **notify the HR** when an intern submits daily proof (via the sheet) | P2 | Notification: "[Intern name] has submitted work for [date]" |

---

## 3.2 Non-Functional Requirements

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR-01 | **Page Load Time** — Dashboard pages shall load within 2 seconds | < 2s | Lighthouse / WebPageTest |
| NFR-02 | **API Response Time** — Accept/Reject actions shall respond within 3 seconds (including email sending) | < 3s | Server-side timing logs |
| NFR-03 | **Concurrent Users** — System shall support 50+ concurrent HR users | 50+ users | Load testing with k6/Artillery |
| NFR-04 | **Uptime** — System shall be available 99.9% of the time during business hours | 99.9% | Vercel status page |
| NFR-05 | **Data Security** — All user passwords shall be hashed, all data encrypted in transit (HTTPS) | PASS | Security audit |
| NFR-06 | **Data Backup** — Database shall be backed up daily | Daily | Supabase automated backups |
| NFR-07 | **Mobile Responsive** — Dashboard shall be usable on tablets and large phones | PASS | Responsive design audit |
| NFR-08 | **Accessibility** — Shall meet WCAG 2.1 AA standards | AA | Lighthouse accessibility audit |
| NFR-09 | **Google API Rate Limits** — System shall respect Google API quotas with queuing | No quota errors | API error monitoring |
| NFR-10 | **Input Validation** — All user inputs shall be validated (client + server side) | 100% | Code review |
| NFR-11 | **Audit Trail** — All status changes shall be logged with timestamp and actor | Complete | Database audit log |

---

## 3.3 User Stories

### Admin Stories

```
As an Admin, I want to log in with my credentials so that I can access the admin dashboard.
As an Admin, I want to view all HR accounts so that I know who has access to the system.
As an Admin, I want to create new HR accounts so that new HR team members can use the platform.
As an Admin, I want to reset an HR's password so that they can regain access if they forget it.
As an Admin, I want to view pending HR requests so that I can approve or reject them.
As an Admin, I want to deactivate an HR account so that former team members lose access.
As an Admin, I want to see dashboard statistics so that I understand system usage.
```

### HR Stories

```
As an HR, I want to log in with my credentials so that I can manage the recruitment pipeline.
As an HR, I want to see all applicants in a clean dashboard so that I can review them efficiently.
As an HR, I want to accept/reject/hold applicants so that I can manage the pipeline.
As an HR, I want to schedule an interview with date/time so that candidates know when to join.
As an HR, I want the system to automatically send interview emails with Meet links so that I don't have to do it manually.
As an HR, I want to be reminded before an interview so that I don't miss it.
As an HR, I want to accept/reject candidates after their interview.
As an HR, I want the system to automatically send agreement letters so that I don't have to compose them manually.
As an HR, I want to review candidate documents in the platform so that everything is in one place.
As an HR, I want to verify documents and approve candidates so they can proceed to onboarding.
As an HR, I want the system to automatically create Google Drive workspaces so I don't have to do it manually.
As an HR, I want to see which interns have submitted daily work proof so that I can review it.
```

### Candidate Stories (Indirect Users)

```
As a candidate, I want to receive an interview invitation with a date, time, and Meet link so that I know when and how to join.
As a candidate, I want to upload my documents through a simple portal so that I don't have to email attachments.
As a candidate, I want to receive my workspace link so that I can access my Task Tracker and submit daily work.
```

---

## 3.4 Business Rules

| Rule ID | Rule Description | Enforced At |
|---------|-----------------|-------------|
| BR-01 | An applicant who is **Rejected** cannot be Accepted again | Application layer |
| BR-02 | An applicant who is **Accepted** and moves to Interview cannot go back to Pending | Application layer |
| BR-03 | An applicant who is **On Hold** can only be Accepted or Rejected (not put on Hold again) | UI + Application layer |
| BR-04 | Each candidate can have **only one active interview** scheduled at a time | Database unique constraint |
| BR-05 | Google Sheet data is **read-only** from the platform's perspective | API layer — no write calls to Sheets API for applicant data |
| BR-06 | An HR can only see **their own applicants** (based on the Google Sheet linked to that HR) | RLS policy + application logic |
| BR-07 | A Google Meet link is **unique per candidate per interview** | Generated per interview record |
| BR-08 | Document upload portal links **expire after 7 days** | Token expiry in database |
| BR-09 | Workspace folders are **never deleted** — only marked inactive if needed | Application logic |
| BR-10 | Password reset requests require **Admin approval** (no self-service password reset in MVP) | Application layer |

---

## 3.5 Data Retention & Privacy

| Data Type | Retention Period | Cleanup Action |
|-----------|------------------|----------------|
| Rejected applicants | Indefinitely (for audit) | Archived status, excluded from active views |
| Interview records | 1 year post-interview | Soft delete |
| Uploaded documents | Until internship ends + 6 months | Hard delete after retention period |
| Workspace data | Until internship ends + 1 year | Transfer ownership to company Drive |
| Session data | 24 hours of inactivity | Automatic expiry |
| Audit logs | 3 years | Archive to cold storage |

---

## 3.6 Error Handling Requirements

| Scenario | Expected Behavior |
|----------|-------------------|
| Google API call fails (Meet creation) | Retry up to 3 times; if still failing, log error and notify admin via email |
| Email delivery fails | Log failure; mark interview as "email_pending"; allow HR to retry manually |
| Document upload fails (network error) | Show clear error to candidate; allow retry without losing already-uploaded files |
| Supabase connection fails | Show graceful error page with "Try again" button |
| Invalid file type uploaded | Show specific error: "Only PDF and image files (JPG, PNG) are accepted" |
| Rate limit exceeded (Google API) | Queue the operation and retry after rate limit window |
| Session expires during long session | Redirect to sign-in page with message: "Your session has expired. Please sign in again." |

---

> **Next Document:** [04 — Database Schema & Supabase Design](./04-database-schema-and-supabase-design.md)
