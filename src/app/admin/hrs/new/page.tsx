'use client';

import React from 'react';
import Link from 'next/link';
import { HRCreateForm } from '@/components/admin/HRCreateForm';

export default function CreateHRPage() {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New HR Account</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new HR team member to the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <HRCreateForm />
      </div>
    </div>
  );
}
