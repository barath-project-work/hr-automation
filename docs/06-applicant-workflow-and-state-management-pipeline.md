# 06 — Applicant Workflow & State Management Pipeline

> **Document Purpose:** Define the complete applicant lifecycle — from initial application through Google Sheet sync to daily task tracking as an active intern. Every state, transition, action, and business rule is documented here.

---

## 6.1 Complete Pipeline Overview

The applicant progresses through **10 distinct states** across **6 major stages**:

```
APPLICATION  →  SCREENING  →  INTERVIEW  →  SELECTION  →  ONBOARDING  →  WORK
   STAGE         STAGE          STAGE        STAGE          STAGE        STAGE

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Pending  │  │Accepted  │  │Interview │  │ Selected │  │Documents │  │Workspace │
│          │  │          │  │Scheduled │  │          │  │Received  │  │Created   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │             │             │             │             │
     │             │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│On Hold   │  │Interview │  │Interview │  │Document  │  │Documents │  │Active    │
│          │  │Scheduled │  │Completed │  │Collection│  │Verified  │  │Intern    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
                                                              │
                                                              ▼
                                                         ┌──────────┐
                                                         │ Rejected │ (can happen at any stage)
                                                         └──────────┘
```

---

## 6.2 State Definitions

| # | State | Label | Description | Stage |
|---|-------|-------|-------------|-------|
| 1 | `pending` | **Pending Review** | New application synced from Google Sheet, awaiting HR review | Application |
| 2 | `on_hold` | **On Hold** | HR has temporarily paused this application for later review | Screening |
| 3 | `accepted` | **Accepted** | HR accepted the applicant; interview scheduling is in progress | Screening |
| 4 | `interview_scheduled` | **Interview Scheduled** | Interview has been scheduled; email with Meet link sent | Interview |
| 5 | `interview_completed` | **Interview Completed** | Interview has taken place; awaiting post-interview decision | Interview |
| 6 | `selected` | **Selected** | Accepted after interview; agreement letter sent | Selection |
| 7 | `document_collection` | **Document Collection** | Candidate is uploading required documents | Onboarding |
| 8 | `documents_received` | **Documents Received** | All documents uploaded by candidate; awaiting HR verification | Onboarding |
| 9 | `documents_verified` | **Documents Verified** | HR verified all documents; workspace creation in progress | Onboarding |
| 10 | `workspace_created` | **Workspace Created** | Google Drive workspace created; candidate is now an active intern | Work |
| 11 | `rejected` | **Rejected** | Candidate rejected at any stage | Any |

---

## 6.3 State Transition Diagram

```
                    ╔══════════════════════════════════════════════╗
                    ║             A P P L I C A T I O N           ║
                    ╚══════════════════════════════════════════════╝

                                   [Google Form]
                                       │
                                       ▼
                               ┌──────────────┐
                  ┌────────────│   Pending    │────────────┐
                  │            └──────────────┘            │
                  │                  │    │                │
                  ▼                  │    ▼                ▼
           ┌──────────┐             │  ┌──────────┐  ┌──────────┐
           │ On Hold  │◄────────────┘  │ Accepted │  │ Rejected │
           └──────────┘                └──────────┘  └──────────┘
                │  │                       │
                │  └──────────┐            │
                ▼             ▼            ▼
        ┌──────────┐    ┌──────────┐  ╔══════════════════════════╗
        │ Rejected │    │ Accepted │  ║      I N T E R V I E W   ║
        └──────────┘    └──────────┘  ╚══════════════════════════╝
                                       │
                                       ▼
                               ┌──────────────────┐
                               │ Interview        │
                               │ Scheduled        │
                               └──────────────────┘
                                       │
                              (Interview happens)
                                       │
                                       ▼
                               ┌──────────────────┐
                          ┌────│ Interview        │────┐
                          │    │ Completed        │    │
                          │    └──────────────────┘    │
                          ▼                            ▼
                   ┌──────────┐              ┌──────────────┐  ═══ SELECTION ═══
                   │ Selected │              │ Rejected     │
                   └──────────┘              │ (Post-       │
                        │                    │  Interview)  │
                        ▼                    └──────────────┘
                ╔══════════════════════════════════════════════╗
                ║         D O C U M E N T   C O L L E C T I O N ║
                ╚══════════════════════════════════════════════╝
                        │
                        ▼
                ┌──────────────────┐
                │ Document         │
                │ Collection       │
                └──────────────────┘
                        │
                 (Candidate uploads)
                        │
                        ▼
                ┌──────────────────┐
                │ Documents        │
                │ Received         │
                └──────────────────┘
                        │
                 (HR verifies)
                        │
                ┌───────┴───────┐
                ▼               ▼
        ┌──────────────┐ ┌──────────┐
        │ Documents    │ │ Rejected │
        │ Verified     │ │ (During  │
        └──────────────┘ │ Verif.)  │
                │        └──────────┘
                ▼
        ╔══════════════════════════════════════════════╗
        ║      W O R K S P A C E   C R E A T I O N    ║
        ╚══════════════════════════════════════════════╝
                │
                ▼
        ┌──────────────────┐
        │ Workspace        │
        │ Created          │
        └──────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ Active Intern    │
        │ (Daily Tracking) │
        └──────────────────┘
```

---

## 6.4 State Transition Rules

### Rule Table

| From State | Action | To State | Condition | Automation Triggered |
|------------|--------|----------|-----------|---------------------|
| `pending` | Accept | `accepted` | — | — (next action: schedule interview) |
| `pending` | Reject | `rejected` | — | — |
| `pending` | Hold | `on_hold` | — | — |
| `on_hold` | Accept | `accepted` | — | — |
| `on_hold` | Reject | `rejected` | — | — |
| `accepted` | Schedule Interview | `interview_scheduled` | Date & time selected | Google Meet creation, email sending |
| `interview_scheduled` | Auto (time passes) | `interview_completed` | Interview time has passed | — |
| `interview_scheduled` | HR marks complete | `interview_completed` | HR clicks "Mark Complete" | — |
| `interview_completed` | Accept (Post-Interview) | `selected` | — | Agreement letter email sent |
| `interview_completed` | Reject (Post-Interview) | `rejected` | — | — |
| `selected` | Auto (email sent) | `document_collection` | Agreement letter email sent | — |
| `document_collection` | Candidate uploads all docs | `documents_received` | All 3 documents uploaded | HR notification created |
| `documents_received` | HR Approves Documents | `documents_verified` | HR verifies all docs | — |
| `documents_received` | HR Rejects Documents | `document_collection` | (resubmission) | Email sent to candidate |
| `documents_verified` | Auto | `workspace_created` | Workspace created | Google Drive folder + sheet creation, email sent |
| `workspace_created` | — | Active Intern | Onboarding complete | — |

---

## 6.5 Available Actions Per State

| State | Available Actions | Hidden Actions | Explanation |
|-------|-------------------|----------------|-------------|
| `pending` | Accept, Reject, Hold | — | All three actions visible |
| `on_hold` | Accept, Reject | Hold | Already on hold; no need to hold again |
| `accepted` | Schedule Interview | Accept, Reject, Hold | Must proceed to scheduling |
| `interview_scheduled` | Mark Complete (HR), Cancel | All other actions | Interview is in progress |
| `interview_completed` | Accept (Post-Interview), Reject | — | Decision time |
| `selected` | — | All actions | Awaiting documents (system-driven) |
| `document_collection` | — | All actions | Awaiting candidate upload |
| `documents_received` | Verify (Approve), Reject | — | HR reviews |
| `documents_verified` | — | All actions | System working on workspace |
| `workspace_created` | View Workspace | — | Active intern |
| `rejected` | — | All actions | Final state (no returning) |

---

## 6.6 Business Rules & Validations

### BR-01: No Skipping States

An applicant cannot skip states. They must progress through the pipeline sequentially.

**Valid:** `pending → accepted → interview_scheduled → interview_completed → selected`

**Invalid:** `pending → selected` (must go through interview)

### BR-02: No Returning from Rejected

Once an applicant is `rejected`, they can never be moved to another state.

**Exception:** If system supports "Reconsider" in future, a separate flow will be designed.

### BR-03: Hold Constraints

An applicant in `on_hold` state:
- Cannot be put on hold again (button hidden)
- Can only be Accepted or Rejected

### BR-04: Document Collection Completeness

The system shall only transition from `document_collection` to `documents_received` when **all three** required document types have been uploaded:
1. Signed Agreement Letter
2. Aadhaar Card
3. Current Marksheet

### BR-05: Unique Active Interview

An applicant can have at most **one active `scheduled` interview** at any time. If an interview is cancelled, a new one can be scheduled.

### BR-06: Workspace One-Time Creation

Workspace creation can only happen once per candidate. If the process fails, the system retries (max 3 attempts) but does not create duplicate workspaces.

---

## 6.7 Status History & Audit Trail

Every state transition is recorded in the `status_history` table.

### Sample Audit Log

```
┌────────────────┬────────────┬──────────────┬────────────┬──────────────────┐
│  Timestamp     │ Old Status │ New Status   │ Changed By │ Notes            │
├────────────────┼────────────┼──────────────┼────────────┼──────────────────┤
│ 16 Jul 10:30   │ pending    │ accepted     │ hr_john    │ Good resume      │
│ 16 Jul 10:31   │ accepted   │ interview    │ hr_john    │ Scheduled for    │
│                │            │ _scheduled   │            │ 18 Jul 3 PM     │
│ 18 Jul 15:00   │ interview  │ interview    │ System     │ Auto-completed   │
│                │ _scheduled │ _completed   │            │                  │
│ 18 Jul 15:05   │ interview  │ selected     │ hr_john    │ Strong interview │
│                │ _completed │              │            │ performance      │
│ 18 Jul 15:06   │ selected   │ document     │ System     │ Agreement sent   │
│                │            │ _collection  │            │                  │
│ 19 Jul 12:00   │ document   │ documents    │ System     │ All 3 docs       │
│                │ _collection│ _received    │            │ uploaded         │
│ 19 Jul 14:00   │ documents  │ documents    │ hr_john    │ Verified OK      │
│                │ _received  │ _verified    │            │                  │
│ 19 Jul 14:01   │ documents  │ workspace    │ System     │ Workspace        │
│                │ _verified  │ _created     │            │ created          │
└────────────────┴────────────┴──────────────┴────────────┴──────────────────┘
```

### Audit API

```typescript
// Get full history for an applicant
async function getApplicantHistory(applicantId: string) {
  const { data } = await supabase
    .from('status_history')
    .select(`
      old_status,
      new_status,
      notes,
      created_at,
      changed_by:profiles(full_name)
    `)
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: true });

  return data;
}
```

---

## 6.8 Dashboard Views by Status

The HR dashboard should provide quick-access filters based on status:

### Summary Cards

```
┌─────────────────────────────────────────────────────────────────┐
│  [Total: 245]  [Pending: 180]  [On Hold: 25]  [Rejected: 30]   │
│  [Interview Scheduled: 8]  [Pending Verification: 2]  [Active: 5]│
└─────────────────────────────────────────────────────────────────┘
```

### Tab-Based Views

| Tab | Filter Criteria | Count Badge |
|-----|----------------|-------------|
| All | No filter | 245 |
| Pending | status = 'pending' | 180 |
| On Hold | status = 'on_hold' | 25 |
| Interview Scheduled | status = 'interview_scheduled' | 8 |
| Completed Interviews | status = 'interview_completed' | 3 (last 7 days) |
| Pending Verification | status = 'documents_received' | 2 |
| Active Interns | status = 'workspace_created' | 5 |
| Rejected | status = 'rejected' | 30 |

### Expanded Row / Side Panel

When an HR clicks on an applicant row, a side panel opens showing:

```
┌─────────────────────────────────────────────┐
│  Applicant Details                           │
│                                             │
│  Name:     Barath G                          │
│  Email:    barath@email.com                  │
│  Phone:    +91-9876543210                    │
│  Applied:  15 Jul 2026                       │
│  Status:   Interview Scheduled               │
│                                             │
│  ─── Status Timeline ───                    │
│  ✅ Pending (15 Jul)                        │
│  ✅ Accepted (16 Jul)                       │
│  ⏳ Interview Scheduled (16 Jul)            │
│     - Date: 18 Jul 2026                     │
│     - Time: 3:00 PM                         │
│     - Meet: [Open Meet Link]                │
│  ☐ Interview Completed                      │
│  ☐ Selected                                 │
│  ☐ Documents Collection                     │
│  ☐ Documents Verified                       │
│  ☐ Workspace Created                        │
│                                             │
│  [Accept] [Reject] [Hold]                   │
└─────────────────────────────────────────────┘
```

---

## 6.9 Batch Operations (Future Enhancement)

For handling large volumes of applicants, the following batch operations may be added in v2:

| Operation | Description |
|-----------|-------------|
| Batch Accept | Select multiple applicants → schedule interviews |
| Batch Reject | Select multiple applicants → reject with common reason |
| Batch Hold | Select multiple applicants → hold for later review |
| Export to CSV | Export filtered applicant list |

---

## 6.10 State Machine Implementation (Pseudocode)

```typescript
// Core state machine logic
type State = 'pending' | 'on_hold' | 'accepted' | 'interview_scheduled'
  | 'interview_completed' | 'selected' | 'document_collection'
  | 'documents_received' | 'documents_verified' | 'workspace_created' | 'rejected';

type Action = 'accept' | 'reject' | 'hold' | 'schedule_interview'
  | 'mark_interview_complete' | 'accept_post_interview'
  | 'documents_uploaded' | 'verify_documents' | 'reject_documents';

const TRANSITIONS: Record<State, Record<Action, State | null>> = {
  pending: {
    accept: 'accepted',
    reject: 'rejected',
    hold: 'on_hold',
    schedule_interview: null,           // Not allowed from pending
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: null,
    verify_documents: null,
    reject_documents: null,
  },
  on_hold: {
    accept: 'accepted',                // Resume from hold
    reject: 'rejected',
    hold: null,                         // Already on hold
    schedule_interview: null,
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: null,
    verify_documents: null,
    reject_documents: null,
  },
  accepted: {
    accept: null,                       // Already accepted
    reject: 'rejected',
    hold: null,
    schedule_interview: 'interview_scheduled',
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: null,
    verify_documents: null,
    reject_documents: null,
  },
  interview_scheduled: {
    accept: null,
    reject: 'rejected',
    hold: null,
    schedule_interview: null,
    mark_interview_complete: 'interview_completed',
    accept_post_interview: null,
    documents_uploaded: null,
    verify_documents: null,
    reject_documents: null,
  },
  interview_completed: {
    accept: null,
    reject: 'rejected',
    hold: null,
    schedule_interview: null,
    mark_interview_complete: null,
    accept_post_interview: 'selected',
    documents_uploaded: null,
    verify_documents: null,
    reject_documents: null,
  },
  selected: {
    accept: null,
    reject: 'rejected',
    hold: null,
    schedule_interview: null,
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: null,           // System-driven: moves to document_collection
    verify_documents: null,
    reject_documents: null,
  },
  document_collection: {
    accept: null,
    reject: 'rejected',
    hold: null,
    schedule_interview: null,
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: 'documents_received',
    verify_documents: null,
    reject_documents: null,
  },
  documents_received: {
    accept: null,
    reject: 'rejected',
    hold: null,
    schedule_interview: null,
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: null,
    verify_documents: 'documents_verified',
    reject_documents: 'document_collection',  // Send back for resubmission
  },
  documents_verified: {
    accept: null,
    reject: 'rejected',
    hold: null,
    schedule_interview: null,
    mark_interview_complete: null,
    accept_post_interview: null,
    documents_uploaded: null,
    verify_documents: null,             // System-driven: moves to workspace_created
    reject_documents: null,
  },
  workspace_created: {
    // Terminal state for onboarding — no further transitions
    ...noTransitions,
  },
  rejected: {
    // Terminal state — no transitions out
    ...noTransitions,
  },
};
```

---

> **Next Document:** [07 — Google Workspace Integration & Automation Engine](./07-google-workspace-integration-and-automation-engine.md)
