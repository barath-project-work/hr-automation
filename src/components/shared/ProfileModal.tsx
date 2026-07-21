'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/lib/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  if (!user) return null;

  const roleName = user.role === 'admin' ? 'System Administrator' : 'HR Recruiter';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile Details" size="md">
      <div className="space-y-4 sm:space-y-5 pt-1 max-h-[80vh] overflow-y-auto pr-1">
        {/* Avatar Header */}
        <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
          <Avatar name={user.full_name} src={user.avatar_url} size="lg" className="w-16 h-16 sm:w-20 sm:h-20 text-lg sm:text-xl shadow-md border-2 border-white" />
          <h3 className="mt-2.5 text-base sm:text-lg font-bold text-gray-900">{user.full_name}</h3>
          <p className="text-xs text-gray-500 font-mono">@{user.username}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="default" size="sm">{roleName}</Badge>
            {user.is_active ? (
              <Badge variant="active" size="sm" dot>Active</Badge>
            ) : (
              <Badge variant="danger" size="sm" dot>Inactive</Badge>
            )}
          </div>
        </div>

        {/* Read-Only Details */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100 gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Username</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 font-mono break-all">{user.username}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100 gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 break-words">{user.full_name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100 gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 break-all">{user.email || 'Not provided'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100 gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900">{user.phone || 'Not provided'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100 gap-1 sm:gap-4">
            <span className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Role</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">{user.role ?? (user.role_id === 1 ? 'admin' : 'hr')}</span>
          </div>

          {user.created_at && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 bg-gray-50 rounded-xl border border-gray-100 gap-1 sm:gap-4">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{formatDate(user.created_at)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="primary" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
