'use client';

import React from 'react';
import { RequestList } from '@/components/admin/RequestList';
import type { HRRequest } from '@/lib/types';

// Mock data
const mockRequests: HRRequest[] = [
  {
    id: '1',
    username: 'hr_john',
    request_type: 'password_reset',
    status: 'pending',
    admin_id: null,
    rejection_reason: null,
    created_at: '2026-07-16T10:00:00Z',
    resolved_at: null,
  },
  {
    id: '2',
    username: 'hr_sara',
    request_type: 'new_account',
    status: 'pending',
    admin_id: null,
    rejection_reason: null,
    created_at: '2026-07-16T09:00:00Z',
    resolved_at: null,
  },
  {
    id: '3',
    username: 'hr_adam',
    request_type: 'new_account',
    status: 'pending',
    admin_id: null,
    rejection_reason: null,
    created_at: '2026-07-15T14:00:00Z',
    resolved_at: null,
  },
  {
    id: '4',
    username: 'hr_lee',
    request_type: 'password_reset',
    status: 'approved',
    admin_id: 'admin-1',
    rejection_reason: null,
    created_at: '2026-07-14T11:00:00Z',
    resolved_at: '2026-07-14T15:00:00Z',
  },
  {
    id: '5',
    username: 'old_hr',
    request_type: 'password_reset',
    status: 'rejected',
    admin_id: 'admin-1',
    rejection_reason: 'Account already exists with different name',
    created_at: '2026-07-13T08:00:00Z',
    resolved_at: '2026-07-13T16:00:00Z',
  },
  {
    id: '6',
    username: 'hr_new',
    request_type: 'new_account',
    status: 'approved',
    admin_id: 'admin-1',
    rejection_reason: null,
    created_at: '2026-07-12T10:00:00Z',
    resolved_at: '2026-07-12T12:00:00Z',
  },
];

export default function RequestsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage account requests and password resets from HR team members.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <RequestList requests={mockRequests} />
      </div>
    </div>
  );
}
