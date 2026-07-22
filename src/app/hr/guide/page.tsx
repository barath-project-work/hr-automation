'use client';

import React, { useState } from 'react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: { title: string; desc: string }[];
}

const sections: Section[] = [
  {
    id: 'overview',
    title: 'Your Role as HR',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'bg-gray-900 text-white',
    items: [
      { title: 'What HRs Do', desc: 'As an HR user, your job is to manage the full recruitment lifecycle — from reviewing incoming applicants to scheduling interviews, tracking document collection, and onboarding selected candidates.' },
      { title: 'Your Scope', desc: 'You only see applicants assigned to you. Your account is managed by the Admin — they control your password, profile, and access. Contact your Admin for account-related help.' },
      { title: 'Getting Help', desc: 'If you\'re locked out or need a password reset, use the "Request Access" option on the sign-in page. If you need something else, contact your Admin directly.' },
    ],
  },
  {
    id: 'applicants',
    title: 'Managing Applicants',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'bg-blue-600 text-white',
    items: [
      { title: 'Viewing Applicants', desc: 'Go to the Applicants page to see all candidates assigned to you. Each row shows name, email, phone, current status, and quick action buttons.' },
      { title: 'Searching & Filtering', desc: 'Use the search bar at the top to find applicants by name or email. Use the status filter dropdown to narrow down by stage (e.g., Pending, Accepted, Interview Scheduled).' },
      { title: 'Reviewing an Applicant', desc: 'Click the eye icon or the applicant\'s name to open the detail panel. Here you can see all their information, notes, resume link, and status history.' },
      { title: 'Updating Status', desc: 'In the detail panel, use the status dropdown to move an applicant forward (e.g., from Pending → Accepted → Interview Scheduled). Always update status promptly to keep records accurate.' },
      { title: 'Adding Notes', desc: 'Use the notes field in the detail panel to leave internal notes about a candidate. Notes are private — candidates never see them.' },
    ],
  },
  {
    id: 'interviews',
    title: 'Scheduling Interviews',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-green-600 text-white',
    items: [
      { title: 'Schedule an Interview', desc: 'From the Applicants page, click the calendar icon next to a candidate who is in "Accepted" status. Select the date, time, and optionally paste a Google Meet link. Click Schedule Interview to confirm.' },
      { title: 'Interview Statuses', desc: 'Interviews can be: Scheduled (upcoming), Completed (done and noted), Cancelled (called off), or No Show (candidate didn\'t attend). Always update the status after the interview.' },
      { title: 'View All Interviews', desc: 'Go to the Interviews page in the sidebar to see all scheduled, upcoming, and past interviews in one list. Filter by status using the tabs at the top.' },
      { title: 'After the Interview', desc: 'Once an interview is done, update the applicant\'s status to "Interview Completed" and then proceed based on outcome: move to "Selected" or "Rejected".' },
    ],
  },
  {
    id: 'documents',
    title: 'Document Collection',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-amber-600 text-white',
    items: [
      { title: 'When to Collect Documents', desc: 'After an applicant is "Selected", move them to "Document Collection" status. This signals to the system that documents are expected.' },
      { title: 'Viewing Submitted Documents', desc: 'Go to the Documents page to see all document submissions. Each document card shows the file, type, upload date, and current verification status.' },
      { title: 'Document Statuses', desc: 'Documents go through: Pending (just uploaded) → Received (acknowledged) → Verified (confirmed valid) → Rejected (invalid, needs resubmission). Update each document\'s status after review.' },
      { title: 'Required Documents', desc: 'The standard required documents are: Agreement Letter, Aadhaar Card, and Marksheet (10th or 12th). All three must be in Verified status before workspace creation.' },
    ],
  },
  {
    id: 'interns',
    title: 'Interns Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-purple-600 text-white',
    items: [
      { title: 'Who Appears Here', desc: 'The Interns page shows all applicants who have been selected and have completed document verification — these are your active or onboarding interns.' },
      { title: 'Workspace Creation', desc: 'Once documents are verified, you can trigger workspace creation. This sets up a Google Drive folder and Sheet for the intern. Status updates to "Workspace Created" automatically.' },
      { title: 'Tracking Progress', desc: 'Use the Interns page to track where each intern is in their onboarding. All stages from Selection to Workspace Created are visible here.' },
    ],
  },
  {
    id: 'profile',
    title: 'Your Profile & Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'bg-rose-600 text-white',
    items: [
      { title: 'View Your Profile', desc: 'Click your name or avatar in the bottom-left sidebar to open your profile card. It shows your full name, username, email, phone, role, and member-since date.' },
      { title: 'Your Username & Password', desc: 'Your username and initial password are set by your Admin. If you forget your password, use "Request Password Reset" from the sign-in page, or ask your Admin.' },
      { title: 'Notifications', desc: 'The bell icon (top right) shows alerts for things like interview reminders, document submissions, and workspace creations. Click a notification to go directly to the related page.' },
      { title: 'Request Password Reset', desc: 'If you\'re logged in, click the key icon in the top bar to request a password reset. If you\'re locked out, use the "Request Access" link on the sign-in page.' },
    ],
  },
  {
    id: 'tips',
    title: 'Tips & Best Practices',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'bg-teal-600 text-white',
    items: [
      { title: 'Keep Statuses Up to Date', desc: 'Update applicant statuses immediately after each action — it helps the Admin see accurate progress and triggers automated notifications where applicable.' },
      { title: 'Use Notes Effectively', desc: 'Leave clear, concise notes in the applicant\'s detail panel after every interaction — call outcomes, interview impressions, or document feedback. This creates a clear history.' },
      { title: 'Double-Check Before Rejecting', desc: 'Rejection emails go out automatically when you set an applicant to "Rejected". Make sure you\'ve reviewed the candidate thoroughly before taking this action.' },
      { title: 'Verify All Three Documents', desc: 'Before marking an intern as ready for workspace creation, confirm all three documents (Agreement, Aadhaar, Marksheet) are verified — not just received.' },
    ],
  },
];

export default function HRGuidePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Guide</h1>
        <p className="text-sm text-gray-500 mt-1">
          A complete reference for everything you can do as an HR on the Rivomind platform.
        </p>
      </div>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 text-white p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full border border-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border border-white translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">You are an HR Recruiter</h2>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              Your role covers the full recruitment pipeline — from reviewing applicants to scheduling interviews,
              collecting documents, and onboarding interns. Use this guide to get the most out of the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline overview */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recruitment Pipeline</p>
        <div className="flex items-center gap-1 flex-wrap">
          {['Pending', 'Accepted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Documents', 'Verified', 'Workspace Created'].map((stage, i, arr) => (
            <React.Fragment key={stage}>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                {stage}
              </span>
              {i < arr.length - 1 && (
                <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(activeSection === s.id ? null : s.id);
              setTimeout(() => {
                document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = activeSection === section.id;
          return (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => setActiveSection(isOpen ? null : section.id)}
                className="w-full flex items-center gap-4 p-5 text-left group"
                aria-expanded={isOpen}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${section.color}`}>
                  {section.icon}
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                  {section.title}
                </span>
                <span className="text-xs text-gray-400 mr-2">{section.items.length} topics</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-5">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-gray-500">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Need further help? Use "Request Password Reset" from the sign-in page, or contact your Admin directly for account issues.</p>
      </div>
    </div>
  );
}
