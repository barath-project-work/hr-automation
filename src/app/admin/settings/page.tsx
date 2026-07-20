'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth, useToast } from '@/providers';
import { updateHR } from '@/lib/auth';

export default function AdminSettingsPage() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    avatar_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await updateHR(user.id, formData);
      if (res.success && res.data) {
        setUser({ ...user, ...res.data });
        addToast({ message: 'Admin profile updated successfully!', type: 'success' });
      } else {
        addToast({ message: res.error || 'Failed to update profile.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Error updating profile.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system configuration and admin profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile Form */}
        <Card className="lg:col-span-2">
          <CardTitle>Admin Profile &amp; Picture</CardTitle>
          <CardContent className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <Avatar name={formData.full_name || 'Admin'} size="xl" src={formData.avatar_url} />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{formData.full_name || 'Admin'}</h3>
                  <p className="text-xs text-gray-500">{formData.username ? `@${formData.username}` : 'Administrator'}</p>
                </div>
              </div>

              <Input
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Admin Name"
                disabled={isLoading}
              />

              {/* Direct Profile Photo File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Photo (JPG / PNG)</label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <Avatar name={formData.full_name || 'Admin'} size="lg" src={formData.avatar_url} />
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsLoading(true);
                        try {
                          const body = new FormData();
                          body.append('file', file);
                          if (user) body.append('userId', user.id);
                          const res = await fetch('/api/upload/avatar', { method: 'POST', body });
                          const json = await res.json();
                          if (json.success && json.avatar_url) {
                            setFormData((prev) => ({ ...prev, avatar_url: json.avatar_url }));
                            if (user) {
                              setUser({ ...user, avatar_url: json.avatar_url });
                            }
                            addToast({ message: 'Profile picture uploaded successfully!', type: 'success' });
                          } else {
                            addToast({ message: json.error || 'Failed to upload photo.', type: 'error' });
                          }
                        } catch {
                          addToast({ message: 'Failed to upload profile photo.', type: 'error' });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Upload a JPG, PNG, or WebP photo for Admin (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@rivomind.com"
                disabled={isLoading}
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91-9876543210"
                disabled={isLoading}
              />

              <Button type="submit" variant="primary" isLoading={isLoading}>
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>General Settings</CardTitle>
          <CardContent className="mt-2 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">System Name</p>
                <p className="text-xs text-gray-500">Rivomind HR Automation Platform</p>
              </div>
              <span className="text-xs text-gray-400">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Default Language</p>
                <p className="text-xs text-gray-500">English (India)</p>
              </div>
              <span className="text-xs text-gray-400">Default</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Google Workspace</CardTitle>
          <CardContent className="mt-2 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Google Sheets Sync</p>
                <p className="text-xs text-gray-500">Automatic applicant sync</p>
              </div>
              <span className="text-xs text-gray-400">Phase 2</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Gmail Integration</p>
                <p className="text-xs text-gray-500">Automated email sending</p>
              </div>
              <span className="text-xs text-gray-400">Phase 2</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
