'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  file_name: string;
}

export interface DocumentCardProps {
  applicantName: string;
  submittedAt: string;
  documents: DocumentItem[];
  onVerify: () => void;
}

export function DocumentCard({
  applicantName,
  submittedAt,
  documents,
  onVerify,
}: DocumentCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={applicantName} size="md" />
          <div>
            <h3 className="text-base font-semibold text-gray-900">{applicantName}</h3>
            <p className="text-xs text-gray-500">Submitted {submittedAt}</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onVerify}>
          Approve & Verify
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{doc.file_name}</p>
            </div>
            <Badge variant={doc.status === 'verified' ? 'completed' : 'pending'} size="sm">
              {doc.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
