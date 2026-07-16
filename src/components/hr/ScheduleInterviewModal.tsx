'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { acceptApplicant } from '@/lib/auth';
import type { Applicant } from '@/lib/types';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant;
  onSuccess?: () => void;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  applicant,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Please select an interview date.');
      return;
    }
    if (!time) {
      setError('Please select an interview time.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await acceptApplicant(applicant.id, date, time);
      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || 'Failed to schedule interview.');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Interview"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Applicant info */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
              {applicant.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{applicant.full_name}</p>
              <p className="text-xs text-gray-500">{applicant.email}</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-slide-up" role="alert">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Input
          label="Interview Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={minDate}
          disabled={isLoading}
          hint="Select a future date"
        />

        <Input
          label="Interview Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={isLoading}
          hint="Pick a time between 10:00 AM - 6:00 PM"
        />

        {/* Info box */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex gap-2">
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-500">
              Upon confirmation, a Google Meet link will be automatically created and the candidate will receive an interview invitation via email with the meeting details.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Schedule & Send Email
          </Button>
        </div>
      </form>
    </Modal>
  );
}
