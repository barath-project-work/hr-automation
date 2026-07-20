'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusTimeline } from '@/components/shared/StatusTimeline';
import { ScheduleInterviewModal } from '@/components/hr/ScheduleInterviewModal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/providers';
import { formatDate, formatTime } from '@/lib/utils';
import type { ApplicantStatus } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

interface StatusHistoryItem {
  id: string;
  old_status: ApplicantStatus | null;
  new_status: ApplicantStatus;
  created_at: string;
  notes: string | null;
  changed_by_name: string;
}

interface ApplicantDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: ApplicantStatus;
  resume_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  interview_date: string | null;
  interview_time: string | null;
  meet_link: string | null;
  status_history: StatusHistoryItem[];
}

export default function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { addToast } = useToast();

  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const loadApplicant = async () => {
    try {
      const res  = await fetch(`/api/hr/applicants/${resolvedParams.id}`);
      const json = await res.json();
      if (json.success) {
        setApplicant(json.data);
      } else {
        setError(json.error ?? 'Failed to load applicant.');
      }
    } catch {
      setError('Unable to connect.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadApplicant(); }, [resolvedParams.id]);

  const handleHold = async () => {
    if (!applicant) return;
    try {
      const res  = await fetch(`/api/hr/applicants/${applicant.id}/hold`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast({ message: 'Applicant moved to On Hold.', type: 'success' });
        loadApplicant();
      } else {
        addToast({ message: json.error ?? 'Failed.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed.', type: 'error' });
    }
  };

  const handleReject = async () => {
    if (!applicant) return;
    try {
      const res  = await fetch(`/api/hr/applicants/${applicant.id}/reject`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast({ message: 'Applicant has been rejected.', type: 'success' });
        loadApplicant();
      } else {
        addToast({ message: json.error ?? 'Failed.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to reject applicant.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="space-y-4">
        <Link href="/hr/applicants" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Back to Applicants
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error || 'Applicant not found.'}
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[applicant.status];

  return (
    <div className="space-y-6 animate-fade-in">
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
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <Avatar name={applicant.full_name} size="xl" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{applicant.full_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{applicant.email}</p>
                    {applicant.phone && <p className="text-sm text-gray-500">{applicant.phone}</p>}
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
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(applicant.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Updated</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(applicant.updated_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Application ID</p>
                <p className="text-sm font-medium text-gray-900 font-mono mt-0.5">#{applicant.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          {applicant.interview_date && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(applicant.interview_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {applicant.interview_time ? formatTime(applicant.interview_time) : '—'}
                  </p>
                </div>
              </div>
              {applicant.meet_link && (
                <a
                  href={applicant.meet_link}
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

          {/* Status History */}
          {applicant.status_history.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
              <div className="space-y-3">
                {applicant.status_history.map((h) => {
                  const cfg = STATUS_CONFIG[h.new_status];
                  return (
                    <div key={h.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                      <div className="flex-1 min-w-0">
                        {h.notes && <p className="text-xs text-gray-600 mt-0.5">{h.notes}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(h.created_at)} · {h.changed_by_name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Actions</h2>
            <div className="space-y-3">
              {(applicant.status === 'pending' || applicant.status === 'on_hold') && (
                <>
                  <Button variant="primary" className="w-full" onClick={() => setScheduleOpen(true)}>
                    Accept &amp; Schedule Interview
                  </Button>
                  {applicant.status === 'pending' && (
                    <Button variant="outline" className="w-full" onClick={handleHold}>Hold</Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </>
              )}
              {applicant.status === 'interview_completed' && (
                <Button variant="primary" className="w-full" onClick={async () => {
                  const res = await fetch(`/api/hr/applicants/${applicant.id}/select`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
                  });
                  const json = await res.json();
                  if (json.success) {
                    addToast({ message: json.message, type: 'success' });
                    if (json.data?.uploadUrl) navigator.clipboard.writeText(json.data.uploadUrl).catch(() => {});
                    loadApplicant();
                  } else {
                    addToast({ message: json.error ?? 'Failed.', type: 'error' });
                  }
                }}>
                  Select Candidate
                </Button>
              )}
              {!['pending', 'on_hold', 'interview_completed'].includes(applicant.status) && (
                <p className="text-sm text-gray-500 text-center">No actions available for this status.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Progress</h2>
            <StatusTimeline currentStatus={applicant.status} items={[]} />
          </div>
        </div>
      </div>

      {scheduleOpen && (
        <ScheduleInterviewModal
          isOpen={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          applicant={{ id: applicant.id, full_name: applicant.full_name, email: applicant.email, status: applicant.status } as any}
          onSuccess={() => {
            addToast({ message: 'Interview scheduled!', type: 'success' });
            setScheduleOpen(false);
            loadApplicant();
          }}
        />
      )}
    </div>
  );
}
