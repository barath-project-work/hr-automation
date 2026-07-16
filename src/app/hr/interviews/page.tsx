'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/providers';
import { markInterviewComplete } from '@/lib/auth';

interface Interview {
  id: string;
  applicant_name: string;
  applicant_email: string;
  date: string;
  time: string;
  meet_link: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const mockInterviews: Interview[] = [
  { id: '1', applicant_name: 'Barath G', applicant_email: 'barath@email.com', date: '2026-07-18', time: '15:00', meet_link: 'https://meet.google.com/abc-defg-hij', status: 'scheduled' },
  { id: '2', applicant_name: 'Rahul Kumar', applicant_email: 'rahul@email.com', date: '2026-07-18', time: '16:30', meet_link: 'https://meet.google.com/klm-nopq-rst', status: 'scheduled' },
  { id: '3', applicant_name: 'Priya Sharma', applicant_email: 'priya@email.com', date: '2026-07-17', time: '14:00', meet_link: 'https://meet.google.com/uvw-xyz-abc', status: 'completed' },
  { id: '4', applicant_name: 'Amit Patel', applicant_email: 'amit@email.com', date: '2026-07-16', time: '11:00', meet_link: 'https://meet.google.com/def-ghi-jkl', status: 'completed' },
];

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function InterviewsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const filtered = mockInterviews.filter((i) => i.status === activeTab || (activeTab === 'upcoming' && i.status === 'scheduled'));

  const handleMarkComplete = async (id: string) => {
    try {
      await markInterviewComplete(id);
      addToast({ message: 'Interview marked as completed.', type: 'success' });
    } catch {
      addToast({ message: 'Failed to mark interview as completed.', type: 'error' });
    }
  };

  const upcomingCount = mockInterviews.filter((i) => i.status === 'scheduled').length;
  const completedCount = mockInterviews.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track all scheduled interviews.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: 'upcoming' as TabType, label: 'Upcoming', count: upcomingCount },
          { key: 'completed' as TabType, label: 'Completed', count: completedCount },
          { key: 'cancelled' as TabType, label: 'Cancelled', count: 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{upcomingCount} upcoming</span>
        <span>·</span>
        <span>{completedCount} completed today</span>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No {activeTab} interviews found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((interview) => (
              <div key={interview.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar name={interview.applicant_name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{interview.applicant_name}</h3>
                        <Badge
                          variant={interview.status === 'scheduled' ? 'scheduled' : interview.status === 'completed' ? 'completed' : 'danger'}
                          size="sm"
                          dot
                        >
                          {interview.status === 'scheduled' ? 'Scheduled' : interview.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(interview.date)} at {formatTime(interview.time)} · {interview.applicant_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {interview.status === 'scheduled' && (
                      <>
                        <a
                          href={interview.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Join
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkComplete(interview.id)}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
