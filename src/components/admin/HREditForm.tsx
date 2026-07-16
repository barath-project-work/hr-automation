'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateHR, toggleHRActive, deleteHR } from '@/lib/auth';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface HREditFormProps {
  hr: {
    id: string;
    full_name: string;
    phone: string;
    username: string;
    is_active: boolean;
  };
}

export function HREditForm({ hr }: HREditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: hr.full_name,
    phone: hr.phone,
    username: hr.username,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isActive, setIsActive] = useState(hr.is_active);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!formData.full_name.trim()) {
      setErrors({ full_name: 'Full name is required.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateHR(hr.id, formData);
      if (result.success) {
        router.push('/admin/hrs');
      } else {
        setApiError(result.error || 'Failed to update HR account.');
      }
    } catch {
      setApiError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const result = await toggleHRActive(hr.id);
      if (result.success) {
        setIsActive(!isActive);
      }
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHR(hr.id);
      router.push('/admin/hrs');
    } catch {
      // silent
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-slide-up" role="alert">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          value={formData.full_name}
          onChange={handleChange('full_name')}
          placeholder="Full name"
          error={errors.full_name}
          disabled={isLoading}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          placeholder="Phone number"
          disabled={isLoading}
        />

        <Input
          label="Username"
          type="text"
          value={formData.username}
          onChange={handleChange('username')}
          placeholder="Username"
          disabled={isLoading}
        />

        {/* Status toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">Account Status</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isActive ? 'Account is active and can sign in.' : 'Account is deactivated.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-gray-900' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            variant="danger"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            size="sm"
          >
            Delete Account
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" type="button" onClick={() => router.push('/admin/hrs')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Are you sure you want to delete ${hr.full_name}'s account? This will deactivate their access.`}
        confirmLabel="Yes, Delete"
        variant="danger"
      />
    </>
  );
}
