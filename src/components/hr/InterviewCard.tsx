'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface InterviewCardProps {
  interview: {
    id: string;
    applicant_name: string;
    date: string;
    time: string;
    meet_link: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  };
  onMarkComplete?: () => void;
}

export function InterviewCard({ interview, onMarkComplete }: InterviewCardProps) {
  const isScheduled = interview.status === 'scheduled';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{interview.applicant_name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {interview.date} at {interview.time}
            </p>
          </div>
          <Badge
            variant={
              interview.status === 'completed'
                ? 'completed'
                : interview.status === 'scheduled'
                ? 'scheduled'
                : 'danger'
            }
            size="sm"
          >
            {interview.status}
          </Badge>
        </div>

        {interview.meet_link && (
          <a
            href={interview.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-black font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Meeting Link
          </a>
        )}
      </div>

      {isScheduled && onMarkComplete && (
        <div className="pt-2 border-t border-gray-100 flex gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={onMarkComplete}>
            Mark Completed
          </Button>
          <a
            href={interview.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Join
          </a>
        </div>
      )}
    </div>
  );
}
