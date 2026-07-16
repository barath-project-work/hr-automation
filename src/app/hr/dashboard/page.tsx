'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCards } from '@/components/hr/StatsCards';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function HRDashboard() {
  const cards = [
    {
      label: 'Pending Review',
      value: 180,
      onClick: () => {},
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'On Hold',
      value: 25,
      variant: 'dark' as const,
      onClick: () => {},
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Upcoming Interviews',
      value: 8,
      onClick: () => {},
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Pending Docs',
      value: 2,
      onClick: () => {},
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const todayInterviews = [
    { name: 'Barath G', time: '3:00 PM', meetLink: 'https://meet.google.com' },
    { name: 'Rahul Kumar', time: '4:30 PM', meetLink: 'https://meet.google.com' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Sarah!</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards cards={cards} />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Interviews */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Interviews</h2>
            <Link href="/hr/interviews" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              View All →
            </Link>
          </div>

          {todayInterviews.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No interviews scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayInterviews.map((interview, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{interview.name}</p>
                      <p className="text-xs text-gray-500">{interview.time}</p>
                    </div>
                  </div>
                  <a
                    href={interview.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Document Verification */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending Verification</h2>
            <Link href="/hr/documents" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Priya Sharma', time: '10 min ago', status: 'pending' },
              { name: 'Amit Patel', time: '1 hour ago', status: 'pending' },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={doc.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.time}</p>
                  </div>
                </div>
                <Link
                  href="/hr/documents"
                  className="text-xs font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Review →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
