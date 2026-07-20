'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';

export interface InternCardProps {
  intern: {
    id: string;
    name: string;
    email: string;
    joined_date: string;
    workspace_url: string | null;
    tracker_url: string | null;
  };
}

export function InternCard({ intern }: InternCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-start gap-3">
        <Avatar name={intern.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 truncate">{intern.name}</h3>
          <p className="text-xs text-gray-500 truncate">{intern.email}</p>
          <p className="text-[11px] text-gray-400 mt-1">Joined {formatDate(intern.joined_date)}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex gap-2">
        {intern.workspace_url ? (
          <a
            href={intern.workspace_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Folder
          </a>
        ) : (
          <span className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-400 text-xs font-medium rounded-xl cursor-not-allowed">
            Folder pending
          </span>
        )}

        {intern.tracker_url ? (
          <a
            href={intern.tracker_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tracker
          </a>
        ) : (
          <span className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-100 text-gray-300 text-xs font-medium rounded-xl cursor-not-allowed">
            Tracker pending
          </span>
        )}
      </div>
    </div>
  );
}
