'use client';

import React, { useState } from 'react';
import { HRTable } from '@/components/admin/HRTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetHRPassword } from '@/lib/auth';
import { generatePassword, getPasswordStrengthInfo, checkPasswordStrength } from '@/lib/utils';
import { useToast } from '@/providers';

// Mock data for demonstration
const mockHRs = [
  { id: '1', full_name: 'Sarah Johnson', username: 'hr_sarah', phone: '+91-9876543210', is_active: true, created_at: '2026-06-01' },
  { id: '2', full_name: 'John Doe', username: 'hr_john', phone: '+91-9876543211', is_active: true, created_at: '2026-06-05' },
  { id: '3', full_name: 'Priya Sharma', username: 'hr_priya', phone: '+91-9876543212', is_active: false, created_at: '2026-06-10' },
  { id: '4', full_name: 'Amit Patel', username: 'hr_amit', phone: '+91-9876543213', is_active: true, created_at: '2026-06-15' },
  { id: '5', full_name: 'Neha Gupta', username: 'hr_neha', phone: '+91-9876543214', is_active: true, created_at: '2026-06-20' },
  { id: '6', full_name: 'Rahul Kumar', username: 'hr_rahul', phone: '+91-9876543215', is_active: true, created_at: '2026-07-01' },
];

export default function HRListPage() {
  const { addToast } = useToast();
  const [resetModal, setResetModal] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!resetModal) return;
    setIsResetting(true);
    try {
      await resetHRPassword(resetModal.id, newPassword);
      addToast({ message: `Password reset for ${resetModal.name}.`, type: 'success' });
      setResetModal(null);
      setNewPassword('');
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
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Account Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all HR team members and their access.</p>
      </div>

      <HRTable
        hrs={mockHRs}
        onToggleActive={(id) => {
          addToast({ message: `HR ${id} status toggled.`, type: 'success' });
        }}
        onResetPassword={(id, name) => {
          setResetModal({ id, name });
          setNewPassword(generatePassword());
        }}
      />

      {/* Reset Password Modal */}
      <Modal isOpen={!!resetModal} onClose={() => { setResetModal(null); setNewPassword(''); }} title={`Reset Password — ${resetModal?.name || ''}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Set a new password for <strong>{resetModal?.name}</strong>. The password will be shown only once.
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
                  <div className={`h-full rounded-full transition-all ${strengthInfo.color}`} style={{ width: strengthInfo.width }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Strength: {strengthInfo.label}</span>
                  <button onClick={handleGeneratePassword} className="text-xs text-gray-600 hover:text-black font-medium transition-colors">
                    Generate
                  </button>
                </div>
              </div>
            )}
          </div>

          {newPassword && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-700 font-mono break-all">{newPassword}</p>
              <p className="text-[10px] text-yellow-600 mt-1">Copy this password and share it securely with the HR.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setResetModal(null); setNewPassword(''); }} disabled={isResetting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResetPassword} isLoading={isResetting}>
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
