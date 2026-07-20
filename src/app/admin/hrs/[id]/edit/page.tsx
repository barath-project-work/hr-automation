'use client';

import React from 'react';
import Link from 'next/link';
import { HREditForm } from '@/components/admin/HREditForm';
import { Badge } from '@/components/ui/Badge';

// Mock HR data - in production, fetch from DB
const mockHR = {
  id: '1',
  full_name: 'Sarah Johnson',
  phone: '+91-9876543210',
  username: 'hr_sarah',
  is_active: true,
};

export default function EditHRPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hrs"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back to HR list"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit HR Account</h1>
            <p className="text-sm text-gray-500 mt-1">
              Managing: <span className="font-mono font-medium">{mockHR.username}</span>
            </p>
          </div>
          <Badge variant={mockHR.is_active ? 'active' : 'danger'} size="sm" dot>
            {mockHR.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <HREditForm hr={mockHR} />
      </div>
    </div>
  );
}
