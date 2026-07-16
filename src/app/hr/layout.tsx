'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useToast } from '@/providers';
import { signOut } from '@/lib/auth';

const hrNavItems = [
  {
    label: 'Dashboard',
    href: '/hr/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Applicants',
    href: '/hr/applicants',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    badge: 180,
  },
  {
    label: 'Interviews',
    href: '/hr/interviews',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    badge: 8,
  },
  {
    label: 'Documents',
    href: '/hr/documents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badge: 2,
  },
  {
    label: 'Interns',
    href: '/hr/interns',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badge: 5,
  },
];

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { addToast } = useToast();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    addToast({ message: 'Signed out successfully.', type: 'success' });
    router.push('/sign-in');
  }, [addToast, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        items={hrNavItems}
        userName="Sarah Johnson"
        userRole="hr"
        onSignOut={handleSignOut}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-[72px]'}`}>
        <TopBar
          userName="Sarah Johnson"
          userRole="hr"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          notifications={[
            {
              id: '1',
              title: 'Interview in 20 minutes',
              message: 'Barath G — 3:00 PM',
              type: 'interview',
              is_read: false,
              created_at: '2 min ago',
              action: { label: 'Join Meeting', onClick: () => window.open('https://meet.google.com', '_blank') },
            },
            {
              id: '2',
              title: 'New Documents Received',
              message: 'Priya Sharma uploaded documents',
              type: 'document',
              is_read: false,
              created_at: '15 min ago',
              action: { label: 'Review', onClick: () => router.push('/hr/documents') },
            },
            {
              id: '3',
              title: 'Workspace Created',
              message: 'Rahul\'s workspace is ready',
              type: 'workspace',
              is_read: false,
              created_at: '1 hour ago',
              action: { label: 'Open', onClick: () => window.open('https://drive.google.com', '_blank') },
            },
          ]}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
