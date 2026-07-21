'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { approveRequest, rejectRequest } from '@/lib/auth';
import { cn, formatDate } from '@/lib/utils';
import type { HRRequest } from '@/lib/types';

import { generatePassword, checkPasswordStrength, getPasswordStrengthInfo } from '@/lib/utils';
import { useToast } from '@/providers';
import { useRouter } from 'next/navigation';

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

export function RequestList({ requests: initialRequests }: RequestListProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [requests, setRequests] = useState<HRRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const [approveModal, setApproveModal] = useState<{ id: string; username: string; type: 'new_account' | 'password_reset' } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [rejectModal, setRejectModal] = useState<{ id: string; username: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const passwordStrength = checkPasswordStrength(newPassword);
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  const filtered = activeTab === 'all'
    ? requests
    : requests.filter((r) => r.status === activeTab);

  const handleOpenApprove = (req: HRRequest) => {
    if (req.request_type === 'password_reset') {
      const pw = generatePassword();
      setNewPassword(pw);
      setShowPassword(true);
      setApproveModal({ id: req.id, username: req.username, type: 'password_reset' });
    } else {
      // For new account, redirect to create HR form with pre-filled username
      router.push(`/admin/hrs/new?username=${encodeURIComponent(req.username)}`);
    }
  };

  const handleApproveSubmit = async () => {
    if (!approveModal) return;
    const targetId = approveModal.id;
    const targetUsername = approveModal.username;
    
    // Save previous state for rollback
    const previousRequests = [...requests];

    // Optimistic UI update
    setRequests((prev) =>
      prev.map((r) => (r.id === targetId ? { ...r, status: 'approved' } : r))
    );
    setApproveModal(null);
    setIsProcessing(targetId);

    try {
      const result = await approveRequest(targetId, newPassword);

      if (result.success) {
        addToast({
          message: result.message ?? `Password reset approved for ${targetUsername}.`,
          type: 'success',
        });
      } else {
        // Rollback on error
        setRequests(previousRequests);
        addToast({ message: result.error ?? 'Failed to approve request.', type: 'error' });
      }
    } catch {
      setRequests(previousRequests);
      addToast({ message: 'Failed to approve request.', type: 'error' });
    } finally {
      setIsProcessing(null);
      setNewPassword('');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const targetId = rejectModal.id;
    const targetReason = rejectionReason;

    // Save previous state for rollback
    const previousRequests = [...requests];

    // Optimistic UI update
    setRequests((prev) =>
      prev.map((r) => (r.id === targetId ? { ...r, status: 'rejected', rejection_reason: targetReason } : r))
    );
    setRejectModal(null);
    setRejectionReason('');
    setIsProcessing(targetId);

    try {
      const result = await rejectRequest(targetId, targetReason);

      if (result.success) {
        addToast({ message: result.message ?? 'Request rejected.', type: 'success' });
      } else {
        setRequests(previousRequests);
        addToast({ message: result.error ?? 'Failed to reject request.', type: 'error' });
      }
    } catch {
      setRequests(previousRequests);
      addToast({ message: 'Failed to reject request.', type: 'error' });
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
                            onClick={() => handleOpenApprove(req)}
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

      {/* Approve Password Reset Modal */}
      <Modal
        isOpen={!!approveModal}
        onClose={() => {
          setApproveModal(null);
          setNewPassword('');
        }}
        title={`Approve Password Reset — ${approveModal?.username || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Set a new password for <strong>{approveModal?.username}</strong> to approve their request. The password will be updated immediately so they can sign in.
          </p>

          <div className="space-y-1.5">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter or generate new password"
              disabled={isProcessing === approveModal?.id}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide' : 'Show'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              }
            />
            {newPassword && (
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strengthInfo.color}`}
                    style={{ width: strengthInfo.width }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Strength: {strengthInfo.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPassword(generatePassword());
                      setShowPassword(true);
                    }}
                    className="text-xs text-gray-600 hover:text-black font-medium transition-colors"
                  >
                    Generate New
                  </button>
                </div>
              </div>
            )}
          </div>

          {newPassword && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-700 font-mono break-all">{newPassword}</p>
              <p className="text-[10px] text-yellow-600 mt-1">
                Copy this new password and share it with the HR so they can log in.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => { setApproveModal(null); setNewPassword(''); }}
              disabled={isProcessing === approveModal?.id}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApproveSubmit}
              isLoading={isProcessing === approveModal?.id}
              disabled={!newPassword || newPassword.length < 8}
            >
              Set Password &amp; Approve
            </Button>
          </div>
        </div>
      </Modal>

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
