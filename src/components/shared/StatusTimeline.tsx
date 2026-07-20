'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ApplicantStatus } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

interface TimelineItem {
  status: ApplicantStatus;
  completed: boolean;
  date?: string;
  isCurrent?: boolean;
}

interface StatusTimelineProps {
  items: TimelineItem[];
  currentStatus?: ApplicantStatus;
  className?: string;
}

const STATUS_ORDER: ApplicantStatus[] = [
  'pending',
  'accepted',
  'interview_scheduled',
  'interview_completed',
  'selected',
  'document_collection',
  'documents_received',
  'documents_verified',
  'workspace_created',
];

export function StatusTimeline({ items, currentStatus, className }: StatusTimelineProps) {
  // If items provided, use them. Otherwise, generate from status order.
  const timelineItems: TimelineItem[] = items.length > 0
    ? items
    : STATUS_ORDER.map((status) => ({
        status,
        completed: currentStatus
          ? STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(currentStatus)
          : false,
        isCurrent: status === currentStatus,
      }));

  return (
    <div className={cn('space-y-0', className)}>
      {timelineItems.map((item, index) => {
        const config = STATUS_CONFIG[item.status] || { label: item.status };
        const isLast = index === timelineItems.length - 1;

        return (
          <div key={item.status} className="flex gap-3">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full border-2 transition-all duration-300',
                  item.completed
                    ? 'bg-gray-900 border-gray-900'
                    : item.isCurrent
                    ? 'bg-white border-gray-900 ring-2 ring-gray-900/20'
                    : 'bg-white border-gray-300'
                )}
              />
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-8 transition-colors duration-300',
                    item.completed ? 'bg-gray-900' : 'bg-gray-200'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  item.completed ? 'text-gray-900' : item.isCurrent ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {config.label}
              </p>
              {item.date && (
                <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
