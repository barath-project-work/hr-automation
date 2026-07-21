'use client';

import React, { useState, useEffect } from 'react';
import { HRTable } from '@/components/admin/HRTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { resetHRPassword, toggleHRActive, deleteHR } from '@/lib/auth';
import { generatePassword, getPasswordStrengthInfo, checkPasswordStrength } from '@/lib/utils';
import { useToast } from '@/providers';
import type { Profile } from '@/lib/types';

export default function HRListPage() {
  const { addToast } = useToast();

  const [hrs, setHRs] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [resetModal, setResetModal] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [toggleModal, setToggleModal] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch real HR list from Supabase ────────────────────────
  useEffect(() => {
    async function loadHRs() {
      try {
        const response = await fetch('/api/admin/hrs');
        const json = await response.json();
        if (json.success) {
          setHRs(json.data);
        } else {
          addToast({ message: json.error ?? 'Failed to load HR accounts.', type: 'error' });
        }
      } catch {
        addToast({ message: 'Failed to load HR accounts.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    loadHRs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle active status (after user confirms in modal) ──────
  const handleConfirmToggle = async () => {
    if (!toggleModal) return;
    setIsToggling(true);
    try {
      const result = await toggleHRActive(toggleModal.id);
      if (result.success) {
        setHRs((prev) =>
          prev.map((hr) =>
            hr.id === toggleModal.id ? { ...hr, is_active: result.data!.is_active } : hr
          )
        );
        addToast({
          message: result.message ?? `Account ${result.data!.is_active ? 'activated' : 'deactivated'}.`,
          type: 'success',
        });
        setToggleModal(null);
      } else {
        addToast({ message: result.error ?? 'Failed to update status.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to update status.', type: 'error' });
    } finally {
      setIsToggling(false);
    }
  };

  // ── Delete HR (after user confirms in modal) ─────────────────
  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      const result = await deleteHR(deleteModal.id);
      if (result.success) {
        setHRs((prev) => prev.filter((hr) => hr.id !== deleteModal.id));
        addToast({ message: result.message ?? 'HR account removed.', type: 'success' });
        setDeleteModal(null);
      } else {
        addToast({ message: result.error ?? 'Failed to remove HR.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to remove HR.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Reset password ───────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!resetModal) return;
    setIsResetting(true);
    try {
      const result = await resetHRPassword(resetModal.id, newPassword);
      if (result.success) {
        addToast({ message: `Password reset for ${resetModal.name}.`, type: 'success' });
        setResetModal(null);
        setNewPassword('');
      } else {
        addToast({ message: result.error ?? 'Failed to reset password.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to reset password.', type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleGeneratePassword = () => {
    const pw = generatePassword();
    setNewPassword(pw);
    setShowPassword(true);
  };

  const passwordStrength = checkPasswordStrength(newPassword);
  const strengthInfo     = getPasswordStrengthInfo(passwordStrength);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Account Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all HR team members and their access.
        </p>
      </div>

      <HRTable
        hrs={hrs}
        onToggleActive={(id, name, is_active) => {
          setToggleModal({ id, name, currentStatus: is_active });
        }}
        onResetPassword={(id, name) => {
          setResetModal({ id, name });
          setNewPassword(generatePassword());
          setShowPassword(true);
        }}
        onDelete={(id, name) => {
          setDeleteModal({ id, name });
        }}
      />

      {/* Confirmation Modal for Active / Inactive Status Toggle */}
      <ConfirmDialog
        isOpen={!!toggleModal}
        onClose={() => setToggleModal(null)}
        onConfirm={handleConfirmToggle}
        title={toggleModal?.currentStatus ? 'Deactivate HR Account' : 'Activate HR Account'}
        message={
          toggleModal?.currentStatus
            ? `Are you sure you want to deactivate ${toggleModal?.name}'s account? They will temporarily lose access to the HR portal.`
            : `Are you sure you want to activate ${toggleModal?.name}'s account? They will regain access to the HR portal.`
        }
        confirmLabel={toggleModal?.currentStatus ? 'Deactivate Account' : 'Activate Account'}
        cancelLabel="Cancel"
        variant={toggleModal?.currentStatus ? 'danger' : 'default'}
        isLoading={isToggling}
      />

      {/* Confirmation Modal for Account Deletion */}
      <ConfirmDialog
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete HR Account — ${deleteModal?.name || ''}`}
        message={`Are you sure you want to permanently delete ${deleteModal?.name}'s account? This action cannot be undone.`}
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetModal}
        onClose={() => { setResetModal(null); setNewPassword(''); }}
        title={`Reset Password — ${resetModal?.name || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Set a new password for <strong>{resetModal?.name}</strong>. Copy it and share with the HR — it will only be shown once.
          </p>

          <div className="space-y-1.5">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isResetting}
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
                    onClick={handleGeneratePassword}
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
                Copy this password and share it securely with the HR.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => { setResetModal(null); setNewPassword(''); }}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleResetPassword}
              isLoading={isResetting}
              disabled={!newPassword || newPassword.length < 8}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
