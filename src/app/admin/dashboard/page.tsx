import React from 'react';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase';
import { StatsCards } from '@/components/hr/StatsCards';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

// Server Component — fetches real data on every request
export default async function AdminDashboard() {
  const supabase = await getSupabaseServerClient();

  // ── Fetch stats in parallel ──────────────────────────────────
  const [
    { count: totalHRs },
    { count: activeHRs },
    { count: pendingRequests },
    { count: totalApplicants },
    { data: recentRequests },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 2),

    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 2)
      .eq('is_active', true),

    supabase
      .from('hr_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('applicants')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('hr_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const cards = [
    {
      label: 'Total HRs',
      value: totalHRs ?? 0,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Active HRs',
      value: activeHRs ?? 0,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pending Requests',
      value: pendingRequests ?? 0,
      trend: pendingRequests
        ? { direction: 'up' as const, value: `${pendingRequests} pending` }
        : undefined,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Applicants',
      value: totalApplicants ?? 0,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin!</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards cards={cards} />

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Link href="/admin/hrs/new">
          <Button
            variant="primary"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add New HR
          </Button>
        </Link>
        <Link href="/admin/requests">
          <Button
            variant="outline"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            View All Requests{pendingRequests ? ` (${pendingRequests})` : ''}
          </Button>
        </Link>
      </div>

      {/* Recent Pending Requests */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Requests
            {pendingRequests ? (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-black text-white rounded-full">
                {pendingRequests}
              </span>
            ) : null}
          </h2>
          <Link
            href="/admin/requests"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            View All →
          </Link>
        </div>

        {!recentRequests || recentRequests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">No pending requests — all clear! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-gray-900 font-mono">{req.username}</span>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="default" size="sm">
                        {req.request_type === 'new_account' ? 'New Account' : 'Password Reset'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href="/admin/requests">
                        <Button variant="primary" size="sm">Review</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
