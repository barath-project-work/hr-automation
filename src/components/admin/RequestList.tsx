'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { approveRequest, rejectRequest } from '@/lib/auth';
import { cn, formatDate } from '@/lib/utils';
import type { HRRequest } from '@/lib/types';

interface RequestListProps {
  requests: HRRequest[];
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export function RequestList({ requests }: RequestListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [rejectModal, setRejectModal] = useState<{ id: string; username: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filtered = activeTab === 'all'
    ? requests
    : requests.filter((r) => r.status === activeTab);

  const handleApprove = async (req: HRRequest) => {
    setIsProcessing(req.id);
    try {
      await approveRequest(req.id);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setIsProcessing(rejectModal.id);
    try {
      await rejectRequest(rejectModal.id, rejectionReason);
      setRejectModal(null);
      setRejectionReason('');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({requests.filter((r) => r.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                  No {activeTab === 'all' ? '' : activeTab} requests found.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 font-mono">{req.username}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default" size="sm">
                      {req.request_type === 'new_account' ? 'New Account' : 'Password Reset'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(req.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'pending' && (
                      <Badge variant="pending" size="sm" dot>Pending</Badge>
                    )}
                    {req.status === 'approved' && (
                      <Badge variant="completed" size="sm" dot>Approved</Badge>
                    )}
                    {req.status === 'rejected' && (
                      <Badge variant="danger" size="sm" dot>Rejected</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {req.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(req)}
                            isLoading={isProcessing === req.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRejectModal({ id: req.id, username: req.username })}
                            disabled={isProcessing === req.id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => {
          setRejectModal(null);
          setRejectionReason('');
        }}
        title={`Reject Request — ${rejectModal?.username || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to reject this request from <strong>{rejectModal?.username}</strong>?
          </p>
          <Input
            label="Reason (optional)"
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={isProcessing === rejectModal?.id}>
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
