import React from 'react';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { RequestList } from '@/components/admin/RequestList';
import type { HRRequest } from '@/lib/types';

// Server Component — fetches real requests from DB on every load
export default async function RequestsPage() {
  const adminClient = getSupabaseAdminClient();

  const { data: requests, error } = await adminClient
    .from('hr_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const safeRequests: HRRequest[] = (requests ?? []) as HRRequest[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and manage account requests and password resets from HR team members.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Failed to load requests: {error.message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <RequestList requests={safeRequests} />
      </div>
    </div>
  );
}
