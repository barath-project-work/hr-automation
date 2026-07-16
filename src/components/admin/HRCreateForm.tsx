'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createHR } from '@/lib/auth';
import { generatePassword, checkPasswordStrength, getPasswordStrengthInfo } from '@/lib/utils';

export function HRCreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = checkPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

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

  const handleGeneratePassword = () => {
    const pw = generatePassword();
    setFormData((prev) => ({ ...prev, password: pw }));
    setShowPassword(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required.';
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await createHR(formData);
      if (result.success) {
        router.push('/admin/hrs');
      } else {
        setApiError(result.error || 'Failed to create HR account.');
      }
    } catch {
      setApiError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        placeholder="Enter HR's full name"
        error={errors.full_name}
        disabled={isLoading}
      />

      <Input
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={handleChange('phone')}
        placeholder="e.g., +91-9876543210"
        error={errors.phone}
        disabled={isLoading}
      />

      <Input
        label="Username"
        type="text"
        value={formData.username}
        onChange={handleChange('username')}
        placeholder="e.g., hr_name"
        error={errors.username}
        hint="Must be unique. Use format: hr_yourname"
        disabled={isLoading}
      />

      <div className="space-y-1.5">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange('password')}
          placeholder="Enter or generate password"
          error={errors.password}
          disabled={isLoading}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
        {formData.password && (
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color}`}
                style={{ width: strengthInfo.width }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Password strength: {strengthInfo.label}</span>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs text-gray-600 hover:text-black font-medium transition-colors"
              >
                Generate strong password
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          type="button"
          onClick={() => router.push('/admin/hrs')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create HR Account
        </Button>
      </div>
    </form>
  );
}
