'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';

interface Intern {
  id: string;
  name: string;
  joined_date: string;
  workspace_url: string;
  tracker_url: string;
  task_status: 'done' | 'pending';
  last_submission: string | null;
  pending_days: number;
}

const mockInterns: Intern[] = [
  { id: '1', name: 'Barath G', joined_date: '2026-07-19', workspace_url: 'https://drive.google.com', tracker_url: 'https://sheets.google.com', task_status: 'done', last_submission: '2026-07-16', pending_days: 0 },
  { id: '2', name: 'Rahul Kumar', joined_date: '2026-07-18', workspace_url: 'https://drive.google.com', tracker_url: 'https://sheets.google.com', task_status: 'pending', last_submission: '2026-07-14', pending_days: 2 },
  { id: '3', name: 'Priya Sharma', joined_date: '2026-07-17', workspace_url: 'https://drive.google.com', tracker_url: 'https://sheets.google.com', task_status: 'done', last_submission: '2026-07-16', pending_days: 0 },
  { id: '4', name: 'Amit Patel', joined_date: '2026-07-16', workspace_url: 'https://drive.google.com', tracker_url: 'https://sheets.google.com', task_status: 'done', last_submission: '2026-07-16', pending_days: 0 },
  { id: '5', name: 'Neha Gupta', joined_date: '2026-07-15', workspace_url: 'https://drive.google.com', tracker_url: 'https://sheets.google.com', task_status: 'pending', last_submission: '2026-07-13', pending_days: 3 },
];

export default function InternsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Interns</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all active interns and their workspaces.</p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-gray-900">{mockInterns.length} total</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500">{mockInterns.filter((i) => i.task_status === 'done').length} submitted today</span>
        <span className="text-gray-300">·</span>
        <span className="text-red-500">{mockInterns.filter((i) => i.pending_days > 0).length} pending</span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interns List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Interns</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockInterns.map((intern) => (
              <div key={intern.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={intern.name} size="md" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{intern.name}</h3>
                      <p className="text-xs text-gray-500">Joined {formatDate(intern.joined_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={intern.workspace_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Open
                    </a>
                    <a
                      href={intern.tracker_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Tracker
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Submission Status */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Task Submission Today</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockInterns.map((intern) => (
              <div key={intern.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${intern.task_status === 'done' ? 'bg-gray-700' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{intern.name}</p>
                    <p className="text-xs text-gray-500">
                      {intern.last_submission ? `Last: ${formatDate(intern.last_submission)}` : 'No submissions'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={intern.task_status === 'done' ? 'completed' : 'pending'}
                    size="sm"
                    dot
                  >
                    {intern.task_status === 'done' ? 'Done' : `${intern.pending_days}d pending`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
