'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DocumentCard } from '@/components/hr/DocumentCard';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/providers';
import { timeAgo } from '@/lib/utils';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: string;
  file_name: string;
}

interface DocumentGroup {
  applicant_id: string;
  applicant_name: string;
  submitted_at: string;
  documents: DocumentItem[];
}

export default function DocumentsPage() {
  const { addToast } = useToast();
  const [groups,       setGroups]       = useState<DocumentGroup[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [confirmId,    setConfirmId]    = useState<string | null>(null);
  const [confirmName,  setConfirmName]  = useState('');

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await fetch('/api/hr/documents');
      const json = await res.json();
      if (json.success) {
        setGroups(json.data ?? []);
      } else {
        addToast({ message: json.error ?? 'Failed to load documents.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to load documents.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleVerify = async () => {
    if (!confirmId) return;
    try {
      const res  = await fetch(`/api/hr/documents/${confirmId}/verify`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast({ message: json.message ?? 'Documents verified!', type: 'success' });
        setConfirmId(null);
        loadDocuments();
      } else {
        addToast({ message: json.error ?? 'Verification failed.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to verify documents.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and verify candidate onboarding documents.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No documents pending verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <DocumentCard
              key={group.applicant_id}
              applicantName={group.applicant_name}
              submittedAt={timeAgo(group.submitted_at)}
              documents={group.documents}
              onVerify={() => {
                setConfirmId(group.applicant_id);
                setConfirmName(group.applicant_name);
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleVerify}
        title="Approve Documents"
        message={`Are you sure you want to approve all documents for ${confirmName}? This will update their status to Documents Verified.`}
        confirmLabel="Approve & Verify"
        variant="default"
      />
    </div>
  );
}
