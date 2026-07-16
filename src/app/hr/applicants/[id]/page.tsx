'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusTimeline } from '@/components/shared/StatusTimeline';
import { useToast } from '@/providers';
import { holdApplicant, rejectApplicant, selectCandidate } from '@/lib/auth';
import { formatDate, formatTime } from '@/lib/utils';
import type { ApplicantStatus } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

// Mock data
const mockApplicant = {
  id: '1',
  full_name: 'Barath G',
  email: 'barath@email.com',
  phone: '+91-9876543210',
  status: 'pending' as ApplicantStatus,
  resume_url: null,
  notes: null,
  created_at: '2026-07-16T10:00:00Z',
  updated_at: '2026-07-16T10:00:00Z',
  interview_date: null,
  interview_time: null,
  meet_link: null,
};

const statusConfig = STATUS_CONFIG[mockApplicant.status];

export default function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { addToast } = useToast();

  const handleHold = async () => {
    try {
      await holdApplicant(resolvedParams.id);
      addToast({ message: 'Applicant moved to On Hold.', type: 'success' });
    } catch {
      addToast({ message: 'Failed to hold applicant.', type: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await rejectApplicant(resolvedParams.id);
      addToast({ message: 'Applicant has been rejected.', type: 'success' });
    } catch {
      addToast({ message: 'Failed to reject applicant.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        href="/hr/applicants"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
        </svg>
        Back to Applicants
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <Avatar name={mockApplicant.full_name} size="xl" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{mockApplicant.full_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{mockApplicant.email}</p>
                    {mockApplicant.phone && (
                      <p className="text-sm text-gray-500">{mockApplicant.phone}</p>
                    )}
                  </div>
                  <Badge variant={statusConfig.variant} dot size="md">
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Applied</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(mockApplicant.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Updated</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(mockApplicant.updated_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Application ID</p>
                <p className="text-sm font-medium text-gray-900 font-mono mt-0.5">#{resolvedParams.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Interview Info */}
          {mockApplicant.interview_date && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(mockApplicant.interview_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{mockApplicant.interview_time ? formatTime(mockApplicant.interview_time) : '—'}</p>
                </div>
              </div>
              {mockApplicant.meet_link && (
                <a
                  href={mockApplicant.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Actions</h2>
            <div className="space-y-3">
              {(mockApplicant.status === 'pending' || mockApplicant.status === 'on_hold') && (
                <>
                  <Button variant="primary" className="w-full">Accept & Schedule Interview</Button>
                  {mockApplicant.status === 'pending' && (
                    <Button variant="outline" className="w-full" onClick={handleHold}>Hold</Button>
                  )}
                  <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600" onClick={handleReject}>
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Progress</h2>
            <StatusTimeline currentStatus={mockApplicant.status} items={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
