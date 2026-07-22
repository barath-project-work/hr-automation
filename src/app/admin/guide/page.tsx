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
    title: 'Your Role as Administrator',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: 'bg-gray-900 text-white',
    items: [
      { title: 'Full Platform Control', desc: 'As an Admin, you have unrestricted access to all features — you manage HR accounts, approve requests, configure settings, and monitor the entire platform.' },
      { title: 'No Restrictions', desc: 'Unlike HR users, Admins can view data across all HR accounts, delete accounts, manage platform-wide settings, and access administrative functions.' },
      { title: 'Accountability', desc: 'All admin actions are logged. Requests you approve or reject are recorded, and account changes are tracked for audit purposes.' },
    ],
  },
  {
    id: 'hr-management',
    title: 'HR Account Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'bg-blue-600 text-white',
    items: [
      { title: 'Create HR Accounts', desc: 'Go to HRs → Add New HR. Fill in the full name, email, phone, username, and password. You can also upload a profile photo. Once created, the HR can immediately sign in.' },
      { title: 'Edit HR Profiles', desc: 'Click the edit (pencil) icon next to any HR to update their name, email, phone, username, or profile photo. Changes take effect immediately.' },
      { title: 'Activate / Deactivate Accounts', desc: 'Click the Active/Inactive badge on the HR list to toggle access. Deactivated HRs cannot sign in but their data is preserved.' },
      { title: 'Reset Passwords', desc: 'Click the key icon next to an HR to set a new password. You can generate a strong random password. Copy and share it securely — it\'s only shown once.' },
      { title: 'Delete Accounts', desc: 'Click the trash icon next to an HR or use the Delete Account button on the edit page. This permanently removes the account.' },
    ],
  },
  {
    id: 'requests',
    title: 'HR Access Requests',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'bg-amber-600 text-white',
    items: [
      { title: 'New Account Requests', desc: 'When someone submits a "Request Access" form on the sign-in page, the request appears here with the username they typed. Review and Approve to auto-create their HR account, or Reject with a reason.' },
      { title: 'Password Reset Requests', desc: 'If an HR submits a password reset request from the sign-in page, it appears here. Approve to trigger a reset, or reject it.' },
      { title: 'Reviewing Requests', desc: 'Open the Requests page from the sidebar. Pending requests show in yellow. Click Approve or Reject on each card. Approved requests turn green, rejected turn red.' },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-green-600 text-white',
    items: [
      { title: 'Platform Statistics', desc: 'The dashboard shows real-time counts of total HR accounts, pending requests, active HRs, and recent activity across the platform.' },
      { title: 'Notifications', desc: 'The bell icon (top right) shows all platform notifications — new access requests, account changes, and system alerts. Click any notification to navigate directly to the relevant page.' },
      { title: 'Quick Navigation', desc: 'Use the sidebar links to jump between Dashboard, HRs, Requests, and Settings. The sidebar can be collapsed for more screen space by clicking the arrow at the edge.' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'bg-purple-600 text-white',
    items: [
      { title: 'Update Your Admin Profile', desc: 'Go to Settings to update your name, email, phone, and profile photo. Click "Save Profile Changes" to apply updates.' },
      { title: 'Upload or Remove Profile Photo', desc: 'In the Profile Photo section, click "Choose File" to upload a JPG/PNG/WebP (max 5MB). If you already have a photo, a "Remove photo" link appears below to delete it.' },
      { title: 'View Your Profile Card', desc: 'Click your name/avatar in the bottom-left sidebar to open a read-only profile card showing your account details and role.' },
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
    color: 'bg-rose-600 text-white',
    items: [
      { title: 'Use Generated Passwords', desc: 'When creating or resetting HR passwords, always click "Generate strong password" — these are cryptographically random and far more secure than manual ones.' },
      { title: 'Check Requests Regularly', desc: 'HR account requests don\'t expire automatically. Check the Requests page regularly to avoid keeping candidates or new HRs waiting.' },
      { title: 'Deactivate Before Deleting', desc: 'If you\'re unsure about deleting an HR account, deactivate it first. Deactivated accounts preserve all their data but block login — safer than permanent deletion.' },
      { title: 'Profile Photos Should Be Real', desc: 'Uploading a real photo helps the team identify each other quickly in the interface. Use clear, professional headshots (square images work best).' },
    ],
  },
];

export default function AdminGuidePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Guide</h1>
        <p className="text-sm text-gray-500 mt-1">
          Everything you need to know to manage the Rivomind HR platform as an Administrator.
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">You are an Administrator</h2>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              Admins have full control over the platform — creating HR accounts, approving requests,
              managing settings, and monitoring all activity. Use this guide to understand every capability available to you.
            </p>
          </div>
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
              {/* Section header */}
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

              {/* Section body */}
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
        <p>This guide reflects the current version of the Rivomind HR Automation Platform. If you have questions or need assistance, contact your system developer.</p>
      </div>
    </div>
  );
}
