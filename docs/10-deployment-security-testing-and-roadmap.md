# 10 — Deployment, Security, Testing & Roadmap

> **Document Purpose:** Define the deployment strategy on Vercel, security measures, testing methodology, and the complete development roadmap with future enhancements.

---

## 10.1 Deployment Strategy

### 10.1.1 Hosting Architecture

```
                      ┌──────────────────────────────────┐
                      │          VERCEL (CDN + Edge)      │
                      │                                   │
                      │  ┌────────────────────────────┐   │
                      │  │  Next.js App Router        │   │
                      │  │  • Server Components       │   │
                      │  │  • Server Actions          │   │
                      │  │  • API Routes              │   │
                      │  │  • Middleware              │   │
                      │  └────────────────────────────┘   │
                      └──────────────┬───────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌────────────┐  ┌────────────────┐  ┌──────────┐
            │  SUPABASE  │  │  GOOGLE CLOUD  │  │  CANDIDATE│
            │            │  │                │  │  BROWSER │
            │  • Postgres│  │  • Gmail API   │  └──────────┘
            │  • Storage │  │  • Drive API   │
            │  • Auth    │  │  • Calendar API│
            │  • Realtime│  │  • Sheets API  │
            └────────────┘  └────────────────┘
```

### 10.1.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["bom1"],        // Mumbai, India — closest to Rivo's operations
  "crons": [
    {
      "path": "/api/cron/sync-applicants",
      "schedule": "*/5 * * * *"      // Every 5 minutes
    },
    {
      "path": "/api/cron/interview-reminders",
      "schedule": "* * * * *"        // Every minute
    },
    {
      "path": "/api/cron/mark-completed-interviews",
      "schedule": "*/5 * * * *"      // Every 5 minutes
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL": "@google-sa-email",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY": "@google-sa-private-key",
    "GOOGLE_DRIVE_PARENT_FOLDER_ID": "@google-drive-folder-id",
    "CRON_SECRET": "@cron-secret",
    "NEXT_PUBLIC_APP_URL": "@app-url"
  }
}
```

### 10.1.3 Environment Variables — Complete List

| Variable | Source | Required | Notes |
|----------|--------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ | Publicly exposed but harmless |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ | Public, restricted by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | ✅ | Never exposed to client; for admin operations |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Cloud Console → IAM → Service Accounts | ✅ | e.g., `rivo-hr-automation-sa@...` |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Google Cloud Console → IAM → Service Accounts | ✅ | JSON key private key value |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | Google Drive → URL of parent folder | ✅ | The folder where all candidate workspaces live |
| `CRON_SECRET` | Randomly generated string | ✅ | Protects cron endpoints from unauthorized access |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain | ✅ | e.g., `https://rivo-hr.vercel.app` |

### 10.1.4 Deployment Checklist

**Pre-Deployment:**
- [ ] All environment variables configured in Vercel
- [ ] Supabase project in production mode
- [ ] Google Cloud service account created with proper permissions
- [ ] Domain-wide delegation configured in Google Workspace
- [ ] Google Drive parent folder created and ID noted
- [ ] RLS policies applied to all tables
- [ ] Supabase Auth configured (disable signups, session duration 24h)
- [ ] Storage bucket created with proper policies
- [ ] CORS configured for Supabase storage

**Deployment Steps:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repository to Vercel
#    → Import from GitHub
#    → Select repo
#    → Configure environment variables
#    → Deploy

# 3. Verify cron jobs are running
#    → Vercel Dashboard → Cron Jobs → Check logs

# 4. Run initial Google Sheet sync manually
#    → GET /api/cron/sync-applicants (with CRON_SECRET header)

# 5. Test end-to-end flows
#    → Sign in as admin → Create HR → Sign in as HR → etc.
```

**Post-Deployment:**
- [ ] Set up custom domain (e.g., `hr.rivo.com`)
- [ ] Configure SSL (automatic with Vercel)
- [ ] Set up monitoring (see section 10.4)
- [ ] Create HR training documentation
- [ ] Schedule user acceptance testing with HR team

---

## 10.2 Security Architecture

### 10.2.1 Security Layers

```
Layer 1: Network
├── HTTPS (TLS 1.3) — All traffic encrypted
├── Vercel WAF — Protection against common attacks
└── DDoS protection — Vercel Edge Network

Layer 2: Authentication
├── Supabase Auth — Username + password with bcrypt
├── Session management — HTTP-only cookies, SameSite=Lax
├── Rate limiting — 5 attempts per 15 minutes per IP
└── Session expiry — 24 hours inactivity

Layer 3: Authorization
├── Row-Level Security — PostgreSQL policies on every table
├── Middleware — Route protection at the Next.js level
├── Role-based access — Admin vs HR permissions
└── Service role key — Used only in server-side admin operations

Layer 4: Input Validation
├── Zod schemas — Every server action validates input
├── File type validation — Client + server for uploads
├── File size limits — 10 MB per file
└── XSS prevention — React's built-in escaping

Layer 5: Data Protection
├── Supabase Storage RLS — Only authorized users access files
├── Signed URLs — Temporary access to uploaded documents
├── Token-based upload portal — No auth required, time-limited
└── Audit logging — All status changes tracked
```

### 10.2.2 Security Best Practices Checklist

- [x] **Passwords never stored in plaintext** — Supabase Auth handles bcrypt hashing
- [x] **No email/password in URLs** — Sessions use encrypted cookies
- [x] **API rate limiting** — Implemented on sign-in and document upload endpoints
- [x] **Input sanitization** — All user input validated with Zod
- [x] **SQL injection protection** — Supabase JS client parameterizes all queries
- [x] **XSS protection** — React auto-escapes JSX; no `dangerouslySetInnerHTML` without review
- [x] **CSRF protection** — SameSite cookies + server action inherent CSRF protection
- [x] **Secure headers** — Vercel applies HSTS, X-Content-Type-Options, X-Frame-Options
- [x] **Principle of least privilege** — RLS ensures HRs see only their own data
- [x] **No secrets in client bundle** — Environment variables prefixed with `NEXT_PUBLIC_` are only for public keys
- [x] **Regular dependency updates** — Use `npm audit` and Dependabot

### 10.2.3 Sensitive Data Handling

| Data Type | Storage | Access Control | Retention |
|-----------|---------|---------------|-----------|
| Passwords | Supabase Auth (bcrypt) | Never readable | Until account deletion |
| Aadhaar Cards | Supabase Storage (encrypted at rest) | HR + Admin only (RLS) | 6 months post-internship |
| Marksheets | Supabase Storage (encrypted at rest) | HR + Admin only (RLS) | 6 months post-internship |
| Signed Agreements | Supabase Storage (encrypted at rest) | HR + Admin only (RLS) | 6 months post-internship |
| Email addresses | Supabase Postgres | HR + Admin only (RLS) | Indefinitely (for audit) |
| Phone numbers | Supabase Postgres | HR + Admin only (RLS) | Indefinitely (for audit) |
| Google API tokens | Vercel Environment (encrypted) | Server-side only | Until rotated |

### 10.2.4 Security Incident Response

| Incident | Response |
|----------|----------|
| Brute force attack detected | IP blocked for 30 minutes; admin notified |
| Unauthorized access attempt | Logged with IP and timestamp; admin emailed |
| File upload with malware | Rejected at upload (file type validation); scan with VirusTotal (future) |
| Data breach suspicion | Immediately rotate all API keys and service account credentials |
| Session hijacking | Force logout all sessions; require password reset |

---

## 10.3 Testing Strategy

### 10.3.1 Testing Pyramid

```
         ╱╲
        ╱ E2E ╲
       ╱ Tests ╲           ~5% — Critical user journeys
      ╱──────────╲
     ╱ Integration ╲
    ╱    Tests      ╲      ~25% — API + database interactions
   ╱──────────────────╲
  ╱    Unit Tests      ╲
 ╱                      ╲    ~70% — Individual functions, components
╱──────────────────────────╲
```

### 10.3.2 Unit Tests

**Framework:** Vitest + React Testing Library

```typescript
// tests/unit/email-templates.test.ts
import { describe, it, expect } from 'vitest';
import { buildInterviewEmail } from '@/lib/email/templates/interview-invitation';

describe('Interview Email Template', () => {
  it('should include candidate name in subject', () => {
    const email = buildInterviewEmail({
      candidateName: 'Barath G',
      interviewDate: 'Friday, 18 July 2026',
      interviewTime: '3:00 PM IST',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    });

    expect(email.subject).toContain('Barath G');
  });

  it('should include meet link in body', () => {
    const email = buildInterviewEmail({
      candidateName: 'Barath G',
      interviewDate: 'Friday, 18 July 2026',
      interviewTime: '3:00 PM IST',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    });

    expect(email.bodyHtml).toContain('https://meet.google.com/abc-defg-hij');
  });

  it('should include date and time', () => {
    const email = buildInterviewEmail({
      candidateName: 'Barath G',
      interviewDate: 'Friday, 18 July 2026',
      interviewTime: '3:00 PM IST',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    });

    expect(email.bodyHtml).toContain('Friday, 18 July 2026');
    expect(email.bodyHtml).toContain('3:00 PM IST');
  });
});
```

```typescript
// tests/unit/state-machine.test.ts
import { describe, it, expect } from 'vitest';
import { validateTransition } from '@/lib/state-machine';

describe('Applicant State Machine', () => {
  it('should allow accept from pending', () => {
    expect(validateTransition('pending', 'accept')).toBe('accepted');
  });

  it('should allow reject from pending', () => {
    expect(validateTransition('pending', 'reject')).toBe('rejected');
  });

  it('should allow hold from pending', () => {
    expect(validateTransition('pending', 'hold')).toBe('on_hold');
  });

  it('should not allow schedule_interview from pending', () => {
    expect(validateTransition('pending', 'schedule_interview')).toBeNull();
  });

  it('should not allow accept from interview_scheduled', () => {
    expect(validateTransition('interview_scheduled', 'accept')).toBeNull();
  });

  it('should allow accept from on_hold', () => {
    expect(validateTransition('on_hold', 'accept')).toBe('accepted');
  });

  it('should not allow hold from on_hold', () => {
    expect(validateTransition('on_hold', 'hold')).toBeNull();
  });

  it('should not allow transition from rejected', () => {
    expect(validateTransition('rejected', 'accept')).toBeNull();
    expect(validateTransition('rejected', 'reject')).toBeNull();
    expect(validateTransition('rejected', 'hold')).toBeNull();
  });
});
```

### 10.3.3 Integration Tests

```typescript
// tests/integration/sync-applicants.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncApplicantsFromSheet } from '@/lib/sheets/sync-applicants';

// Mock Google Sheets API
vi.mock('@/lib/google/auth', () => ({
  getSharedAuthClient: () => ({ /* mock auth client */ }),
}));

describe('Google Sheets Sync', () => {
  it('should return count of new applicants', async () => {
    const result = await syncApplicantsFromSheet('hr-id-123', {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/test-spreadsheet/edit',
      sheetRange: 'Sheet1!A2:F',
      columnMapping: { name: 'A', email: 'B', phone: 'C' },
    });

    expect(result.newApplicants).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('should not duplicate existing applicants', async () => {
    const result1 = await syncApplicantsFromSheet('hr-id-123', config);
    const result2 = await syncApplicantsFromSheet('hr-id-123', config);

    // Second sync should find no new applicants
    expect(result2.newApplicants).toBe(0);
  });
});
```

### 10.3.4 End-to-End Tests

```typescript
// tests/e2e/hr-flow.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('HR Recruitment Flow', () => {
  test('HR can sign in and see applicants', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('[name="username"]', 'hr_john');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/hr/dashboard');
    await expect(page.locator('text=Pending Review')).toBeVisible();
  });

  test('HR can accept and schedule interview', async ({ page }) => {
    // First sign in
    await page.goto('/sign-in');
    await page.fill('[name="username"]', 'hr_john');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    // Click Accept on first pending applicant
    await page.click('[data-testid="accept-btn"]:first-of-type');

    // Schedule modal appears
    await expect(page.locator('text=Schedule Interview')).toBeVisible();

    // Fill date and time
    await page.fill('[name="interviewDate"]', '2026-07-20');
    await page.fill('[name="interviewTime"]', '15:00');

    // Confirm
    await page.click('text=Schedule & Send Email');

    // Success toast
    await expect(page.locator('text=Interview scheduled')).toBeVisible();
  });

  test('HR can reject an applicant', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('[name="username"]', 'hr_john');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    // Click Reject
    await page.click('[data-testid="reject-btn"]:first-of-type');

    // Confirm dialog
    await expect(page.locator('text=Are you sure?')).toBeVisible();
    await page.click('text=Confirm');

    // Applicant moves to rejected tab
    await expect(page.locator('text=Rejected')).toBeVisible();
  });
});
```

### 10.3.5 Test Coverage Targets

| Area | Target Coverage |
|------|----------------|
| State machine logic | 100% |
| Validation schemas | 100% |
| Email templates | 100% |
| Server Actions | 90%+ |
| UI Components | 80%+ |
| Google API integrations | 70%+ (with mocks) |
| Error handling | 90%+ |

### 10.3.6 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:ci

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: [lint, type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 10.4 Monitoring & Observability

### 10.4.1 What to Monitor

| Category | What to Monitor | Tool |
|----------|----------------|------|
| **Application** | Page load times, API response times, error rates | Vercel Analytics |
| **Database** | Query performance, connection pool usage, disk usage | Supabase Dashboard |
| **Google APIs** | API call success rate, quota usage, latency | Google Cloud Monitoring |
| **Cron Jobs** | Execution time, success/failure, skipped runs | Custom logging |
| **Auth** | Failed login attempts, new user signups, session counts | Supabase Auth logs |
| **Storage** | File upload count, storage used, bandwidth | Supabase Storage dashboard |
| **Email** | Send rate, bounce rate, delivery failures | Gmail API logs |

### 10.4.2 Alerting Rules

| Alert Condition | Severity | Notification |
|----------------|----------|-------------|
| Google API failure rate > 5% in 5 minutes | Critical | Admin email + SMS |
| Cron job fails 3 consecutive times | Critical | Admin email |
| Supabase downtime > 1 minute | High | Admin email |
| Failed login attempts > 50 in 5 minutes | High | Admin email + temporary IP block |
| Error rate > 1% on any endpoint | Medium | Admin email (daily digest) |
| Storage usage > 80% | Medium | Admin email |
| Cron job execution time > 30 seconds | Low | Logged for review |

### 10.4.3 Logging Strategy

```typescript
// Structured logging format
{
  level: 'INFO' | 'WARN' | 'ERROR',
  timestamp: '2026-07-16T20:00:00.000Z',
  service: 'hr-automation',
  module: 'google-docs | auth | cron | etc.',
  action: 'createFolder | signIn | syncSheet',
  userId: 'uuid',
  duration: 1234,         // ms
  success: true | false,
  metadata: { ... },      // Context-specific data
  error: { message, stack },  // Only for errors
}
```

---

## 10.5 Development Roadmap

### 10.5.1 Phase 1 — MVP (Weeks 1-5)

```
Week 1-2: Foundation
├── Project setup (Next.js + Supabase + Tailwind CSS)
├── Authentication system (sign-in, sessions, middleware)
├── Admin module (HR CRUD, request approval)
├── Database schema setup + RLS policies
└── Basic dashboard layouts (Admin + HR)

Week 3-4: Core Recruitment
├── Google Sheets sync (applicant import)
├── Applicant list + detail panel
├── Accept/Reject/Hold actions
├── State machine implementation
└── Status timeline component

Week 5: Interview Automation
├── Google Calendar + Meet integration
├── Interview scheduling modal
├── Email automation (Gmail API)
├── Interview list view
└── Basic notification system
```

### 10.5.2 Phase 2 — Onboarding (Weeks 6-8)

```
Week 6: Document Management
├── Candidate upload portal (token-based)
├── File upload with validation
├── Supabase Storage setup + policies
├── Document preview component
└── Document verification UI

Week 7: Workspace Automation
├── Google Drive folder creation
├── Task Tracker sheet creation
├── Permission management (sharing)
├── Workspace access email
└── Intern list view

Week 8: Notifications + Polish
├── Interview reminder cron job
├── In-app notification center
├── Toast system
├── Error handling + edge cases
└── UI polish + responsive design
```

### 10.5.3 Phase 3 — Testing & Deployment (Week 9)

```
Week 9: Quality Assurance
├── Unit tests (state machine, validations, templates)
├── Integration tests (API interactions)
├── E2E tests (critical user journeys)
├── Security audit
├── Performance testing
├── HR team training + documentation
└── Production deployment
```

### 10.5.4 Phase 4 — Post-MVP Enhancements (v2)

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Real-time Sheet sync via webhook | High | Medium | Replace polling with Google Apps Script push |
| Batch operations (accept/reject multiple) | High | Medium | Checkbox selection + bulk action bar |
| Email template editor (HR-customizable) | Medium | Medium | Store templates in DB; WYSIWYG editor |
| Advanced search (filters by date, tags) | Medium | Low | Extended Supabase query building |
| Export reports (PDF/CSV summary) | Medium | Medium | Generate reports via a library like `jspdf` |
| Candidate feedback form (post-interview) | Medium | Low | Simple form sent after interview |
| Automated resume parsing (AI-based) | Low | High | Integrate with an NLP service |
| Interview scorecard (in-platform) | Low | Medium | Rating system for interviewers |
| Mobile app (React Native) | Low | Very High | Separate project; web-first for now |
| Multi-language support | Low | Medium | i18n with `next-intl` |
| WebSocket-based live updates | Low | Medium | Replace polling with Supabase Realtime |
| Audit dashboard (complete history view) | Low | Low | Filterable log explorer |
| Dark mode | Low | Low | Tailwind dark mode variant |
| Okta/SSO integration | Low | Medium | Enterprise authentication |
| Payroll integration | Low | Very High | Separate system integration |

---

## 10.6 Cost Estimation

### Monthly Running Costs

| Service | Plan | Estimated Cost | Notes |
|---------|------|---------------|-------|
| **Vercel** | Pro ($20/mo) | $20 | 1 team member, 1000 GB bandwidth, 6000 build minutes |
| **Supabase** | Pro ($25/mo) | $25 | 8 GB database, 100 GB bandwidth, 250 GB storage |
| **Google Cloud** | Pay-as-you-go | $5-15 | API costs are minimal at low volume |
| **Custom Domain** | Included with Vercel Pro | $0 | Or $10/year if purchased separately |
| **Total (MVP)** | | **$50-60/mo** | |

### One-Time Setup Costs

| Item | Cost | Notes |
|------|------|-------|
| Google Workspace subscription | $6/user/mo | Only if Rivo needs new seats for HR team |
| SSL Certificate | $0 | Included with Vercel |
| Domain (optional) | $10-15/year | e.g., hr.rivo.com |

---

## 10.7 Rollback Plan

### Scenario: Critical Bug in Production

```bash
# Vercel: Rollback to previous deployment
vercel rollback --yes

# Supabase: Restore database backup
# Supabase Dashboard → Database → Backups → Restore

# Google API: Revoke service account access if compromised
# Google Cloud Console → IAM → Service Accounts → Disable

# Communication:
# 1. Notify all HR users: "We are experiencing technical issues.
#    Please use the existing manual process temporarily."
# 2. Notify admin once resolved.
```

### Database Backup Strategy

| Backup Type | Frequency | Retention |
|------------|-----------|-----------|
| Continuous Archiving (WAL) | Real-time | 7 days |
| Daily snapshot | Daily at 2 AM IST | 30 days |
| Weekly snapshot | Sunday at 2 AM IST | 3 months |
| Manual backup (before deployments) | On-demand | Until next deployment |

---

## 10.8 Post-Launch Support Plan

### Immediate (First Week)
- Daily monitoring of error logs
- HR user support via dedicated Slack/Discord channel
- Quick bug fixes (within 24 hours for critical issues)
- Performance monitoring (page load times, API response times)

### Short-term (First Month)
- Weekly user feedback sessions with HR team
- Bug triage and prioritization
- Minor UX improvements based on feedback
- Performance optimization for largest data sets

### Long-term (Ongoing)
- Monthly feature releases
- Quarterly security audits
- Continuous dependency updates
- Annual architecture review

---

> This concludes the complete HR Automation Platform documentation series.  
> **Total Documents:** 10  
> **Total Topics Covered:** Project Overview, Architecture, Requirements, Database, Auth, Workflow, Google Integration, UI/UX, API Design, Deployment & Security  
>  
> *"We're not just digitizing the current process — we're removing repetitive work wherever it makes sense."*
