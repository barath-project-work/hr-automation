# 07 — Google Workspace Integration & Automation Engine

> **Document Purpose:** Define every Google Workspace API integration — Gmail, Drive, Calendar/Meet, and Sheets — including authentication, implementation patterns, error handling, rate limiting, and the background job scheduler.

---

## 7.1 Automation Engine Overview

The automation engine is the heart of the HR Automation platform. It replaces the following manual tasks:

| Manual Task | Automation | Google API |
|------------|------------|------------|
| Composing and sending interview emails | Auto-email on Accept | Gmail API |
| Creating individual Google Meet links | Auto-create on scheduling | Google Calendar API |
| Creating candidate workspace folders | Auto-create on verification | Google Drive API |
| Creating Task Tracker sheets | Auto-create with workspace | Google Sheets API |
| Sharing folders with candidates | Auto-share on creation | Google Drive API |
| Syncing applicant data | Periodic sync from sheet | Google Sheets API |
| Sending agreement letters | Auto-send on selection | Gmail API |
| Sending workspace access emails | Auto-send on creation | Gmail API |

---

## 7.2 Google Cloud Platform Setup

### 7.2.1 Project Configuration

Before any integration, the following must be completed in Google Cloud Console:

**Step 1: Create a Google Cloud Project**
```
Project Name: Rivo HR Automation
Project ID: rivo-hr-automation
```

**Step 2: Enable Required APIs**

Navigate to "APIs & Services > Library" and enable:

| API | Service Name | Purpose |
|-----|-------------|---------|
| Gmail API | `gmail.googleapis.com` | Send emails |
| Google Drive API | `drive.googleapis.com` | Create folders, manage permissions |
| Google Calendar API | `calendar-json.googleapis.com` | Create events with Meet |
| Google Sheets API | `sheets.googleapis.com` | Read/write sheet data |

**Step 3: Create a Service Account**

```
Service Account Name: rivo-hr-automation-sa
Service Account ID: rivo-hr-automation-sa@rivo-hr-automation.iam.gserviceaccount.com
Role: (No role needed at project level)
Key: JSON key file (download and store securely)
```

**Step 4: Enable Domain-Wide Delegation**

For the service account to act on behalf of Rivo's Google Workspace users (HR team members), enable **Domain-Wide Delegation** in the service account settings.

Then in **Google Workspace Admin Console** (admin.google.com):

```
Security → API Controls → Domain-wide Delegation
  → Add new:
    Client ID: <Service Account Client ID>
    OAuth Scopes:
      - https://mail.google.com/          (Gmail: send emails)
      - https://www.googleapis.com/auth/drive (Drive: full access)
      - https://www.googleapis.com/auth/calendar (Calendar: create events)
      - https://www.googleapis.com/auth/spreadsheets (Sheets: read/write)
```

---

## 7.3 Service Account Authentication

### 7.3.1 Google Auth Client Setup

```typescript
// lib/google/auth.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// The service account email to impersonate (Rivo's main HR Google Workspace account)
const IMPERSONATED_USER = 'hr@rivo.com';

export function getAuthClient(): JWT {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    subject: IMPERSONATED_USER,  // Impersonate the main HR account
  });

  return auth;
}

// Singleton pattern to reuse auth client
let authClient: JWT | null = null;

export function getSharedAuthClient(): JWT {
  if (!authClient) {
    authClient = getAuthClient();
  }
  return authClient;
}
```

### 7.3.2 Environment Variables

```bash
# .env.local
GOOGLE_SERVICE_ACCOUNT_EMAIL=rivo-hr-automation-sa@rivo-hr-automation.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID=1ABC123...   # Root folder where all candidate folders are created
```

---

## 7.4 Gmail API — Automated Emailing

### 7.4.1 Email Templates

The system uses predefined email templates stored either in the database or as constants.

| Template ID | Trigger | Recipient | Subject |
|-------------|---------|-----------|---------|
| `interview_invitation` | Accept + Schedule | Candidate | 🎉 You're Shortlisted for an Interview at Rivo! |
| `agreement_letter` | Post-Interview Accept | Candidate | 📄 Congratulations! Your Selection & Agreement Letter |
| `document_resubmission` | Document Rejected | Candidate | 📋 Document Resubmission Required |
| `workspace_ready` | Workspace Created | Candidate | 🚀 Your Internship Workspace is Ready! |

### 7.4.2 Interview Invitation Email

```typescript
// lib/email/templates/interview-invitation.ts
export function buildInterviewEmail(params: {
  candidateName: string;
  interviewDate: string;  // Formatted: "Friday, 18 July 2026"
  interviewTime: string;  // Formatted: "3:00 PM IST"
  meetLink: string;
}): { subject: string; bodyHtml: string; to: string } {
  const subject = `🎉 Congratulations ${params.candidateName}! You're Shortlisted for an Interview at Rivo`;

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Congratulations! 🎉</h1>
      </div>
      <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Dear <strong>${params.candidateName}</strong>,</p>
        <p>We are pleased to inform you that your application has been shortlisted for the <strong>Full Stack Developer Internship</strong> at <strong>Rivo</strong>.</p>
        <p>Your interview has been scheduled as follows:</p>
        <table style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; width: 100%;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 100px;">Date:</td>
            <td style="padding: 8px;">${params.interviewDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Time:</td>
            <td style="padding: 8px;">${params.interviewTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Mode:</td>
            <td style="padding: 8px;">Google Meet (Online)</td>
          </tr>
        </table>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${params.meetLink}"
             style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none;
                    border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
            🔗 Join Google Meet
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>Note:</strong> Please ensure you have a stable internet connection and join 5 minutes before the scheduled time.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          This is an automated message from the Rivo HR Automation System. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return { subject, bodyHtml, to: params.candidateName };
}
```

### 7.4.3 Sending Email via Gmail API

```typescript
// lib/email/send.ts
import { google } from 'googleapis';
import { getSharedAuthClient } from '@/lib/google/auth';

export async function sendEmail(params: {
  to: string;
  subject: string;
  bodyHtml: string;
  attachments?: Array<{ filename: string; content: Buffer; mimeType: string }>;
}) {
  const auth = getSharedAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  // Build the email MIME message
  let email = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="boundary123"',
    '',
    '--boundary123',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(params.bodyHtml).toString('base64'),
  ];

  // Add attachments if present
  if (params.attachments) {
    for (const attachment of params.attachments) {
      email = email.concat([
        '',
        '--boundary123',
        `Content-Type: ${attachment.mimeType}`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        '',
        attachment.content.toString('base64'),
      ]);
    }
  }

  email.push('', '--boundary123--');

  const encodedEmail = Buffer.from(email.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });
    return { success: true, messageId: response.data.id };
  } catch (error: any) {
    console.error('Gmail API error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
```

---

## 7.5 Google Calendar API — Meet Link Generation

### 7.5.1 Creating a Calendar Event with Google Meet

```typescript
// lib/calendar/create-meeting.ts
import { google } from 'googleapis';
import { getSharedAuthClient } from '@/lib/google/auth';

export async function createInterviewMeeting(params: {
  candidateName: string;
  candidateEmail: string;
  interviewDate: string;        // '2026-07-18'
  interviewTime: string;        // '15:00'
  hrEmail: string;
}): Promise<{ meetLink: string; eventId: string }> {
  const auth = getSharedAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const startDateTime = new Date(`${params.interviewDate}T${params.interviewTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);  // 1 hour duration

  const event = {
    summary: `Interview: ${params.candidateName} - Full Stack Developer Internship`,
    description: `Interview with ${params.candidateName} for the Full Stack Developer Internship position.`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',    // IST
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    attendees: [
      { email: params.candidateEmail },    // Candidate
      { email: params.hrEmail },           // HR
    ],
    conferenceData: {
      createRequest: {
        requestId: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },     // 1 day before
        { method: 'popup', minutes: 30 },            // 30 minutes before
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,   // Must be 1 to generate Meet link
      sendUpdates: 'all',          // Send email notifications to attendees
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || '';

    return {
      meetLink,
      eventId: response.data.id!,
    };
  } catch (error: any) {
    console.error('Google Calendar API error:', error);
    throw new Error(`Failed to create meeting: ${error.message}`);
  }
}
```

### 7.5.2 Key Details About Meet Link Generation

| Aspect | Detail |
|--------|--------|
| Duration | 1 hour (configurable) |
| Timezone | IST (Asia/Kolkata) |
| Reminders | Email (24h before) + Popup (30min before) |
| Attendees | Candidate + HR (added automatically) |
| Invitations | Sent automatically by Google Calendar |
| Rate Limit | 100 events per 100 seconds per project (configurable) |

---

## 7.6 Google Drive API — Workspace Automation

### 7.6.1 Creating Candidate Workspace

```typescript
// lib/drive/create-workspace.ts
import { google } from 'googleapis';
import { getSharedAuthClient } from '@/lib/google/auth';

const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID!;

export async function createCandidateWorkspace(params: {
  candidateName: string;
  candidateEmail: string;
  hrEmail: string;
}): Promise<{
  folderId: string;
  folderUrl: string;
  sheetId: string;
  sheetUrl: string;
}> {
  const auth = getSharedAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // Step 1: Create candidate's main folder
  const folderResponse = await drive.files.create({
    requestBody: {
      name: params.candidateName,            // "Barath G"
      mimeType: 'application/vnd.google-apps.folder',
      parents: [PARENT_FOLDER_ID],
    },
    fields: 'id, webViewLink',
  });

  const folderId = folderResponse.data.id!;
  const folderUrl = folderResponse.data.webViewLink!;

  // Step 2: Create "Daily Tasks" subfolder
  await drive.files.create({
    requestBody: {
      name: 'Daily Tasks',
      mimeType: 'application/vnd.google-apps.folder',
      parents: [folderId],
    },
  });

  // Step 3: Create Task Tracker Google Sheet
  const sheetResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: `Task Tracker - ${params.candidateName}`,
      },
      sheets: [
        {
          properties: {
            title: 'Daily Tasks',
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Date' } },
                    { userEnteredValue: { stringValue: 'Task ID' } },
                    { userEnteredValue: { stringValue: 'Assigned Task' } },
                    { userEnteredValue: { stringValue: 'Work Done' } },
                    { userEnteredValue: { stringValue: 'Proof of Documents' } },
                    { userEnteredValue: { stringValue: 'HR Status' } },
                    { userEnteredValue: { stringValue: 'HR Remarks' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const sheetId = sheetResponse.data.spreadsheetId!;
  const sheetUrl = sheetResponse.data.spreadsheetUrl!;

  // Move sheet into the candidate's folder
  await drive.files.update({
    fileId: sheetId,
    addParents: folderId,
    removeParents: 'root',
    fields: 'id',
  });

  // Step 4: Set sharing permissions
  // Candidate: writer (can edit Task Tracker)
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: 'writer',
      type: 'user',
      emailAddress: params.candidateEmail,
    },
  });

  // HR: writer (can review and edit)
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: 'writer',
      type: 'user',
      emailAddress: params.hrEmail,
    },
  });

  return { folderId, folderUrl, sheetId, sheetUrl };
}
```

### 7.6.2 Folder Structure in Google Drive

```
Rivo HR Workspaces (Parent Folder)
│
├── Barath G
│   ├── Daily Tasks/
│   │   ├── 16-07-2026/
│   │   │   ├── screenshot_1.png
│   │   │   └── screenshot_2.png
│   │   ├── 17-07-2026/
│   │   └── ...
│   └── Task Tracker - Barath G (Google Sheet)
│
├── Rahul Kumar
│   ├── Daily Tasks/
│   └── Task Tracker - Rahul Kumar (Google Sheet)
│
└── ...
```

---

## 7.7 Google Sheets API — Applicant Data Sync

### 7.7.1 Reading from Google Sheet

```typescript
// lib/sheets/sync-applicants.ts
import { google } from 'googleapis';
import { getSharedAuthClient } from '@/lib/google/auth';

interface SheetConfig {
  sheetUrl: string;       // Google Sheet URL
  sheetRange: string;     // e.g., 'Sheet1!A2:F'
  columnMapping: {
    name: string;         // Column header → database field mapping
    email: string;
    phone: string;
    resumeUrl?: string;
    [key: string]: string | undefined;
  };
}

export async function syncApplicantsFromSheet(
  hrId: string,
  config: SheetConfig
): Promise<{ newApplicants: number; errors: string[] }> {
  const auth = getSharedAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  // Extract spreadsheet ID from URL
  // URL format: https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit...
  const spreadsheetId = extractSheetId(config.sheetUrl);

  try {
    // Read data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: config.sheetRange,
    });

    const rows = response.data.values || [];

    if (rows.length < 2) {
      return { newApplicants: 0, errors: ['No data rows found in sheet'] };
    }

    // First row = headers; remaining rows = data
    const headers = rows[0];
    const dataRows = rows.slice(1);

    let newApplicants = 0;
    const errors: string[] = [];

    for (const [index, row] of dataRows.entries()) {
      try {
        const applicant = {
          hr_id: hrId,
          google_sheet_row: index + 2,  // +2 because row 1 is headers, 0-indexed
          full_name: row[0] || '',
          email: row[1] || '',
          phone: row[2] || '',
          resume_url: row[3] || null,
          additional_data: {},  // Store extra columns as JSONB
          status: 'pending',
        };

        // Check if applicant already exists (by email + hr_id)
        const existing = await checkExistingApplicant(hrId, applicant.email);
        if (!existing) {
          await supabase.from('applicants').insert(applicant);
          newApplicants++;
        }
      } catch (error: any) {
        errors.push(`Row ${index + 2}: ${error.message}`);
      }
    }

    return { newApplicants, errors };
  } catch (error: any) {
    throw new Error(`Failed to sync sheet: ${error.message}`);
  }
}

function extractSheetId(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error('Invalid Google Sheet URL');
  return match[1];
}
```

### 7.7.2 Sync Frequency Options

| Method | Description | Latency | Complexity |
|--------|-------------|---------|------------|
| **Polling (MVP)** | Cron job runs every 5-15 minutes | 5-15 min | Low |
| **Google Apps Script Webhook** | Sheet sends POST to our API on change | < 1 min | Medium |
| **Google Workspace Push Notification** | Drive API push notifications | Real-time | High |

**MVP Approach:** Polling via cron job (Vercel Cron Jobs or Supabase pg_cron):

```typescript
// app/api/cron/sync-applicants/route.ts
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all HRs with linked Google Sheets
  const { data: hrs } = await supabase
    .from('profiles')
    .select('id')
    .eq('role_id', 2)  // HR role
    .eq('is_active', true);

  const results = [];
  for (const hr of hrs || []) {
    // Each HR has a preferred sheet URL stored in their profile or a config table
    const sheetUrl = await getHRSheetUrl(hr.id);
    if (sheetUrl) {
      const result = await syncApplicantsFromSheet(hr.id, {
        sheetUrl,
        sheetRange: 'Sheet1!A2:F',
        columnMapping: {
          name: 'A',
          email: 'B',
          phone: 'C',
          resumeUrl: 'E',
        },
      });
      results.push({ hrId: hr.id, ...result });
    }
  }

  return Response.json({ synced: results.length, details: results });
}
```

---

## 7.8 Background Job Scheduler

### 7.8.1 Job Definitions

| Job ID | Schedule | Purpose |
|--------|----------|---------|
| `sync-applicants` | Every 5 minutes | Sync new applicants from Google Sheets |
| `interview-reminders` | Every 1 minute | Check for interviews starting in 20 minutes, send notifications |
| `mark-completed-interviews` | Every 5 minutes | Mark interviews as completed if time has passed |
| `expire-upload-portals` | Every 1 hour | Disable upload portal links older than 7 days |

### 7.8.2 Interview Reminder Implementation

```typescript
// lib/cron/interview-reminders.ts
export async function processInterviewReminders() {
  // Find interviews starting in the next 20 minutes
  const now = new Date();
  const twentyMinutesLater = new Date(now.getTime() + 20 * 60 * 1000);

  const { data: upcomingInterviews, error } = await supabase
    .from('interviews')
    .select(`
      id,
      interview_date,
      interview_time,
      meet_link,
      applicant:applicants(full_name),
      hr_id
    `)
    .eq('status', 'scheduled')
    .eq('reminder_sent', false)
    .gte('interview_date', now.toISOString().split('T')[0])
    // More precise time matching (see SQL function below)

  for (const interview of upcomingInterviews || []) {
    // Create notification for HR
    await supabase.from('notifications').insert({
      user_id: interview.hr_id,
      notification_type: 'interview_reminder',
      title: '🔔 Interview Starting Soon',
      message: `Your interview with ${interview.applicant.full_name} starts in 20 minutes. Please be ready.`,
      link: interview.meet_link,  // Clicking notification opens the Meet link
    });

    // Mark reminder as sent
    await supabase
      .from('interviews')
      .update({ reminder_sent: true })
      .eq('id', interview.id);
  }
}
```

### 7.8.3 Cron Implementation

**Option A: Vercel Cron Jobs (Recommended for MVP)**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-applicants",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/interview-reminders",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/mark-completed-interviews",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Option B: Supabase pg_cron (Database-level)**

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule interview reminders (every minute)
SELECT cron.schedule(
  'interview-reminders',
  '* * * * *',
  $$ SELECT send_interview_reminders(); $$
);

-- Schedule mark completed interviews (every 5 minutes)
SELECT cron.schedule(
  'mark-completed-interviews',
  '*/5 * * * *',
  $$ SELECT mark_passed_interviews(); $$
);
```

---

## 7.9 Error Handling & Retry Logic

### 7.9.1 Retry with Exponential Backoff

```typescript
// lib/google/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's a client error (4xx) that won't succeed on retry
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
        onRetry?.(attempt, error);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### 7.9.2 Rate Limiting

Google APIs have per-project rate limits. Implement a token bucket or queue system:

```typescript
// lib/google/rate-limiter.ts
// Simple rate limiter using a queue
class GoogleAPIRateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly MIN_INTERVAL_MS = 100;  // Max 10 requests per second

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_INTERVAL_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.MIN_INTERVAL_MS - timeSinceLastRequest)
        );
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }

    this.processing = false;
  }
}

export const googleRateLimiter = new GoogleAPIRateLimiter();
```

---

## 7.10 Complete Automation Flow — End to End

### Full Accept → Interview Schedule Flow

```typescript
// actions/applicants.ts
export async function acceptAndScheduleInterview(
  applicantId: string,
  interviewDate: string,
  interviewTime: string
) {
  // 1. Get applicant details
  const { data: applicant } = await supabase
    .from('applicants')
    .select('*')
    .eq('id', applicantId)
    .single();

  if (!applicant) throw new Error('Applicant not found');

  // 2. Get HR email for calendar
  const { data: hrProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', applicant.hr_id)
    .single();

  // 3. Create Google Calendar event with Meet link
  const meeting = await withRetry(() =>
    createInterviewMeeting({
      candidateName: applicant.full_name,
      candidateEmail: applicant.email,
      interviewDate,
      interviewTime,
      hrEmail: `${hrProfile.username}@rivo.com`,  // HR's Google Workspace email
    })
  );

  // 4. Save interview record
  await supabase.from('interviews').insert({
    applicant_id: applicantId,
    hr_id: applicant.hr_id,
    interview_date: interviewDate,
    interview_time: interviewTime,
    meet_link: meeting.meetLink,
    calendar_event_id: meeting.eventId,
    status: 'scheduled',
  });

  // 5. Send interview invitation email
  const emailContent = buildInterviewEmail({
    candidateName: applicant.full_name,
    interviewDate: formatDate(interviewDate),     // "Friday, 18 July 2026"
    interviewTime: formatTime(interviewTime),      // "3:00 PM IST"
    meetLink: meeting.meetLink,
  });

  await withRetry(() =>
    sendEmail({
      to: applicant.email,
      subject: emailContent.subject,
      bodyHtml: emailContent.bodyHtml,
    })
  );

  // 6. Update applicant status
  await supabase
    .from('applicants')
    .update({
      status: 'interview_scheduled',
      interview_date: interviewDate,
      interview_time: interviewTime,
      meet_link: meeting.meetLink,
    })
    .eq('id', applicantId);

  // 7. Log status change
  await supabase.from('status_history').insert({
    applicant_id: applicantId,
    old_status: applicant.status,
    new_status: 'interview_scheduled',
    changed_by: applicant.hr_id,
    notes: `Interview scheduled for ${interviewDate} at ${interviewTime}`,
  });

  return { success: true, meetLink: meeting.meetLink };
}
```

---

> **Next Document:** [08 — UI/UX Design & Frontend Architecture](./08-ui-ux-design-and-frontend-architecture.md)
