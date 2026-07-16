# 01 — Project Overview & Introduction

> **Project Name:** HR Automation Platform (Rivomind HR)  
> **Client Company:** Rivo  
> **Project Type:** Full-Stack Web Application + Google Workspace Automation  
> **Tech Stack:** Next.js (App Router) + Supabase + Google Workspace APIs  
> **Target Users:** Admin (Super User) + HR Team Members  
> **Version:** v1.0.0 — MVP

---

## 1.1 Company Background

Rivo is a growing organization that actively recruits interns and full-time talent through LinkedIn job postings. Their current recruitment and onboarding workflow is entirely manual — relying on Google Forms for applications, Google Sheets for data storage, and individual email correspondence for every communication with candidates. As the company scales and receives thousands of applications per hiring cycle, their manual processes have become a bottleneck.

> **Key Insight:** Rivo's HR team currently spends ~70% of their time on repetitive administrative tasks (sending emails, creating folders, verifying documents) instead of strategic hiring decisions.

---

## 1.2 The Problem — Current AS-IS Workflow

The existing recruitment workflow is documented here in its entirety as described by Rivo's founder and team lead.

### Stage 1: Job Posting & Application Collection

```
LinkedIn Post → Google Form → Google Sheet
                                    ↓
                            HR manually reviews resumes
```

- Rivo's HR posts internship/job openings on LinkedIn.
- The post contains a link to a **Google Form**.
- Candidates fill in personal details, upload resumes, and submit.
- Each HR has their **own Google Form**, linked to their **individual Google Sheet**.
- A separate **Master Google Sheet** consolidates all applicants across HRs.
- HR manually opens the sheet and reviews each resume to shortlist candidates.

**Pain Points:**
- No centralized dashboard to view all applicants.
- Manual resume screening is slow and error-prone.
- No status tracking — HR must remember where each candidate is.
- Duplicate candidates can appear across different HR sheets.

### Stage 2: Interview Scheduling

```
Shortlisted Candidates
          ↓
HR manually composes interview email
          ↓
HR sends email one by one
          ↓
Candidate receives: "Interview on [date], link will be shared later"
          ↓
HR creates Google Meet link manually (just before interview)
          ↓
HR sends Meet link individually
```

**Pain Points:**
- Every email is composed and sent manually.
- Interview scheduling requires back-and-forth communication.
- Google Meet links are created manually for each candidate.
- HR must remember to send meeting links before each interview.
- No centralized view of scheduled interviews.

### Stage 3: Post-Interview & Selection

```
Interview Completed
          ↓
HR manually evaluates
          ↓
Selected → HR sends selection email manually
          ↓
HR creates agreement letter PDF manually
          ↓
HR sends agreement letter as email attachment
```

**Pain Points:**
- No structured post-interview workflow in the system.
- Agreement letters are manually generated and emailed.
- No tracking of who has received the agreement letter.

### Stage 4: Document Collection

```
Candidate receives agreement letter
          ↓
Candidate prints, signs, scans → converts to PDF
          ↓
Candidate emails back: signed agreement + Aadhaar + marksheet
          ↓
HR downloads attachments manually
          ↓
HR verifies documents one by one
```

**Pain Points:**
- Candidates must print, sign, and scan — entirely offline steps.
- Email attachments can be lost, unreadable, or missing.
- HR must manually track which documents have been received.
- No structured upload mechanism — everything is in email threads.
- Difficult to scale beyond a few dozen candidates.

### Stage 5: Workspace Creation & Onboarding

```
Documents verified
          ↓
HR creates Google Drive folder manually
          ↓
HR creates Task Tracker Google Sheet manually
          ↓
HR creates Daily Tasks subfolder manually
          ↓
HR sets sharing permissions manually
          ↓
HR composes and sends workspace email manually
```

**Pain Points:**
- Every element of the workspace is created manually.
- Naming conventions can be inconsistent.
- Sharing permissions must be set individually.
- Multiple manual steps per candidate — doesn't scale.

### Stage 6: Daily Task Tracking

```
Intern receives workspace access
          ↓
Intern creates daily dated folder inside Daily Tasks
          ↓
Intern saves proof screenshots into folder
          ↓
Intern copies folder link into Task Tracker sheet
          ↓
HR opens each folder link to review proof
          ↓
HR manually updates status and remarks
```

**Pain Points:**
- No automation in task tracking.
- HR must open individual folder links for every intern, every day.
- No dashboard showing pending reviews.
- Difficult to track which interns are submitting work consistently.

---

## 1.3 The Vision — Desired TO-BE Workflow

The HR Automation platform aims to transform the above workflow into an efficient, partially automated system:

```
LinkedIn Post → Google Form → Google Sheet
                                      ↓
                          ┌──────────────────────────┐
                          │   HR Automation Platform  │
                          │   (Next.js + Supabase)    │
                          └──────────────────────────┘
                                      ↓
                     ┌────────────────┼────────────────┐
                     │                │                │
               Admin Portal     HR Dashboard    Automation Engine
                                              (Google APIs)
                                               ↓
                              Emails · Meet Links · Drive Folders
```

**Key Improvements:**
- **Admin** manages HR accounts and approval requests from a single dashboard.
- **HR** views all applicants in a clean UI with Accept / Reject / Hold actions.
- **One-click Accept** triggers automated interview email with a unique Google Meet link.
- **In-app notifications** remind HR of upcoming interviews (20 minutes before).
- **Post-interview Accept** sends agreement letter PDF automatically.
- **Candidate upload portal** (proposed enhancement) for document submission.
- **One-click workspace creation** after document verification — Drive folder, Task Tracker sheet, and sharing all happen automatically.

---

## 1.4 Project Scope

### In Scope (MVP)
| Module | Description |
|--------|-------------|
| Admin Portal | Single sign-in, HR account management, request approval |
| HR Portal | Dashboard with applicant list, Accept/Reject/Hold |
| Interview Automation | Date/time selection → auto email + Google Meet link |
| Interview Reminders | In-app notification 20 minutes before interview |
| Post-Interview Decision | Accept/Reject with auto agreement letter email |
| Document Verification | HR reviews submitted docs, approves/rejects |
| Workspace Automation | Auto-create Google Drive folder + Task Tracker sheet |
| Candidate Upload Portal | Secure link for candidates to upload documents |
| Task Tracking | Daily folder creation, proof link submission, HR review |

### Out of Scope (MVP)
| Feature | Reasoning |
|---------|-----------|
| Candidate self-registration | Candidates come through Google Forms only |
| Automated resume parsing | May be added in v2 |
| Advanced analytics / reporting | Basic counts only in MVP |
| Mobile apps | Web-first responsive design |
| Payroll integration | Future phase |
| Public job board | Uses LinkedIn for job posting |

---

## 1.5 Key Success Metrics

| Metric | Target |
|--------|--------|
| Time to send interview email per candidate | < 5 seconds (from ~15 minutes manual) |
| Time to create candidate workspace | < 10 seconds (from ~20 minutes manual) |
| HR satisfaction score (NPS) | > 8/10 |
| Reduction in manual email sending | 100% automated |
| Reduction in manual folder creation | 100% automated |
| Document verification turnaround | < 24 hours (from ~72 hours) |

---

## 1.6 Stakeholders

| Stakeholder | Role in Project |
|-------------|-----------------|
| **Founder / Team Lead** | Product owner, defines requirements, approves scope |
| **HR Team** | End users of the platform |
| **Admin** | Manages HR accounts, approves requests |
| **Interns/Candidates** | Indirect users (receive emails, use upload portal) |
| **Development Team** | Full-stack developers building the platform |

---

## 1.7 Project Timeline (Estimated)

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Requirements & Design | 1 week | SRS, UI mockups, DB schema |
| Authentication & Admin | 1 week | Sign-in, HR CRUD, request system |
| HR Dashboard & Applicants | 1.5 weeks | Applicant list, Accept/Reject/Hold |
| Interview Automation | 1 week | Google Meet API, email automation |
| Document Collection | 1 week | Upload portal, verification dashboard |
| Workspace Automation | 1 week | Google Drive API, folder creation |
| Task Tracking Module | 1 week | Task Tracker, proof review |
| Integration Testing | 3 days | End-to-end flow testing |
| Deployment & Training | 2 days | Production deployment, HR training |

**Total estimated MVP timeline: 8–9 weeks**

---

## 1.8 Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Google API quota limits | High | Medium | Implement rate limiting, batch operations |
| Candidate email delivery failure | Medium | Low | Use Gmail API with retry + fallback |
| HR adoption resistance | Medium | Medium | Training sessions, intuitive UI |
| Google OAuth token expiry | High | High | Implement token refresh mechanism |
| Supabase RLS misconfiguration | High | Low | Thorough testing, security audit |
| Scalability with 10k+ applicants | Medium | Low | Pagination, efficient queries, indexing |

---

## 1.9 Glossary

| Term | Definition |
|------|------------|
| Admin | Super user who manages HR accounts and system settings |
| HR | Human Resources team member who manages recruitment pipeline |
| Applicant | Person who applied via Google Form (before screening) |
| Candidate | Person who has been accepted into the pipeline (after screening) |
| Intern | Person who has completed onboarding and is actively working |
| Agreement Letter | PDF document sent to selected candidates for signature |
| Joining Letter | Official offer letter sent after document verification |
| Task Tracker | Google Sheet where interns log daily work |
| Daily Tasks | Folder structure within candidate's workspace for proof files |
| Workspace | Candidate's dedicated Google Drive folder with Task Tracker + Daily Tasks |

---

> **Next Document:** [02 — System Architecture & Tech Stack Decisions](./02-system-architecture-and-tech-stack.md)
