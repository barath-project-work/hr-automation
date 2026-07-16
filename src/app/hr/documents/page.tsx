'use client';

import React, { useState } from 'react';
import { cn, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/providers';
import { verifyDocuments } from '@/lib/auth';

interface DocumentSet {
  applicant_id: string;
  applicant_name: string;
  submitted_at: string;
  documents: { name: string; type: string; status: 'received' | 'verified' }[];
}

const mockDocuments: DocumentSet[] = [
  {
    applicant_id: '1',
    applicant_name: 'Priya Sharma',
    submitted_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    documents: [
      { name: 'Agreement Letter', type: 'agreement_letter', status: 'received' },
      { name: 'Aadhaar Card', type: 'aadhaar_card', status: 'received' },
      { name: 'Marksheet', type: 'marksheet', status: 'received' },
    ],
  },
  {
    applicant_id: '2',
    applicant_name: 'Amit Patel',
    submitted_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    documents: [
      { name: 'Agreement Letter', type: 'agreement_letter', status: 'received' },
      { name: 'Aadhaar Card', type: 'aadhaar_card', status: 'received' },
      { name: 'Marksheet', type: 'marksheet', status: 'received' },
    ],
  },
];

type TabType = 'pending' | 'verified' | 'rejected';

export default function DocumentsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (applicantId: string, name: string) => {
    setIsVerifying(true);
    try {
      await verifyDocuments(applicantId);
      addToast({ message: `Documents verified for ${name}. Workspace being created...`, type: 'success' });
    } catch {
      addToast({ message: 'Failed to verify documents.', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
        <p className="text-sm text-gray-500 mt-1">Review and verify candidate documents.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: 'pending' as TabType, label: 'Pending Review', count: mockDocuments.length },
          { key: 'verified' as TabType, label: 'Verified', count: 0 },
          { key: 'rejected' as TabType, label: 'Rejected', count: 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Document Sets */}
      {mockDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">All clear! No documents pending verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockDocuments.map((docSet) => (
            <div
              key={docSet.applicant_id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === docSet.applicant_id ? null : docSet.applicant_id)}
                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={docSet.applicant_name} size="md" />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">{docSet.applicant_name}</h3>
                    <p className="text-xs text-gray-500">Submitted {timeAgo(docSet.submitted_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="pending" size="sm" dot>Pending</Badge>
                  <svg
                    className={cn(
                      'w-4 h-4 text-gray-400 transition-transform duration-200',
                      expandedId === docSet.applicant_id && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === docSet.applicant_id && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 animate-slide-up">
                  <div className="pt-4 space-y-3">
                    {docSet.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.status === 'received' ? 'pending' : 'completed'} size="sm" dot>
                            {doc.status === 'received' ? 'Received' : 'Verified'}
                          </Badge>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label={`Preview ${doc.name}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        Request Resubmission
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerify(docSet.applicant_id, docSet.applicant_name)}
                        isLoading={isVerifying}
                      >
                        Approve Documents
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
