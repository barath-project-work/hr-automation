'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusTimeline } from '@/components/shared/StatusTimeline';
import { formatDate, formatTime } from '@/lib/utils';
import type { Applicant } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

interface ApplicantDetailPanelProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (applicant: Applicant) => void;
  onReject: (applicant: Applicant) => void;
  onHold: (applicant: Applicant) => void;
}

export function ApplicantDetailPanel({
  applicant,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onHold,
}: ApplicantDetailPanelProps) {
  if (!isOpen) return null;

  const statusConfig = STATUS_CONFIG[applicant.status];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900">Applicant Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar name={applicant.full_name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{applicant.full_name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{applicant.email}</p>
              {applicant.phone && (
                <p className="text-sm text-gray-500">{applicant.phone}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <Badge variant={statusConfig.variant} dot>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Applied</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(applicant.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Updated</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(applicant.updated_at)}</p>
            </div>
            {applicant.interview_date && (
              <>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Interview Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(applicant.interview_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Interview Time</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {applicant.interview_time ? formatTime(applicant.interview_time) : '—'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Resume */}
          {applicant.resume_url && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Resume</p>
              <a
                href={applicant.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Resume
              </a>
            </div>
          )}

          {/* Notes */}
          {applicant.notes && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-xl border border-gray-200">{applicant.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Progress Timeline</p>
            <StatusTimeline currentStatus={applicant.status} items={[]} />
          </div>

          {/* Actions */}
          {(applicant.status === 'pending' || applicant.status === 'on_hold') && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="primary"
                onClick={() => onAccept(applicant)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
                className="flex-1"
              >
                Accept
              </Button>
              {applicant.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => onHold(applicant)}
                  className="flex-1"
                >
                  Hold
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onReject(applicant)}
                className="flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
