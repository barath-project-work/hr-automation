'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InterviewCard } from '@/components/hr/InterviewCard';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/providers';
import { formatDate, formatTime } from '@/lib/utils';

type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

interface Interview {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  interview_date: string;
  interview_time: string;
  meet_link: string;
  status: InterviewStatus;
}

export default function InterviewsPage() {
  const { addToast } = useToast();
  const [interviews,  setInterviews]  = useState<Interview[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [activeTab,   setActiveTab]   = useState<InterviewStatus | 'all'>('scheduled');

  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = activeTab !== 'all' ? `?status=${activeTab}` : '?status=all';
      const res  = await fetch(`/api/hr/interviews${params}`);
      const json = await res.json();
      if (json.success) {
        setInterviews(json.data ?? []);
      } else {
        addToast({ message: json.error ?? 'Failed to load interviews.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to load interviews.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => { loadInterviews(); }, [loadInterviews]);

  const handleMarkComplete = async (id: string) => {
    try {
      const res  = await fetch(`/api/hr/interviews/${id}/complete`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast({ message: 'Interview marked as completed.', type: 'success' });
        loadInterviews();
      } else {
        addToast({ message: json.error ?? 'Failed.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to mark interview as completed.', type: 'error' });
    }
  };

  const tabs: { key: InterviewStatus | 'all'; label: string }[] = [
    { key: 'scheduled', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your scheduled and completed interviews.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            No {activeTab === 'scheduled' ? 'upcoming' : activeTab} interviews.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={{
                id: interview.id,
                applicant_name: interview.applicant_name,
                date: formatDate(interview.interview_date),
                time: formatTime(interview.interview_time),
                meet_link: interview.meet_link,
                status: interview.status,
              }}
              onMarkComplete={interview.status === 'scheduled' ? () => handleMarkComplete(interview.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
