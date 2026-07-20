'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface HR {
  id: string;
  full_name: string;
  email?: string | null;
  username: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface HRTableProps {
  hrs: HR[];
  onToggleActive: (id: string) => void;
  onResetPassword: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}

export function HRTable({ hrs, onToggleActive, onResetPassword, onDelete }: HRTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = hrs.filter(
    (hr) =>
      hr.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hr.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hr.email && hr.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search HRs by name, email, or username..."
            className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all"
            aria-label="Search HR accounts"
          />
        </div>
        <Link
          href="/admin/hrs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New HR
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">HR</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                  {searchQuery ? 'No HRs match your search.' : 'No HR accounts yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((hr) => (
                <tr
                  key={hr.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={hr.full_name} size="sm" />
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">{hr.full_name}</span>
                        {hr.email && <span className="text-xs text-gray-500 block">{hr.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{hr.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{hr.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleActive(hr.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all',
                        hr.is_active
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', hr.is_active ? 'bg-gray-700' : 'bg-red-500')} />
                      {hr.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/hrs/${hr.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Edit ${hr.full_name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => onResetPassword(hr.id, hr.full_name)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Reset password for ${hr.full_name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14v3m0 0v3m0-3h3m-3 0h-3" />
                        </svg>
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(hr.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Deactivate ${hr.full_name}`}
                          title="Deactivate account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {hrs.length} HRs
      </p>
    </div>
  );
}
