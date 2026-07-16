'use client';

import React from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">System configuration and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardTitle>General Settings</CardTitle>
          <CardContent className="mt-2 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">System Name</p>
                <p className="text-xs text-gray-500">Rivomind HR Automation Platform</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Default Language</p>
                <p className="text-xs text-gray-500">English (India)</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Timezone</p>
                <p className="text-xs text-gray-500">Asia/Kolkata (IST, UTC +5:30)</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
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
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Gmail Integration</p>
                <p className="text-xs text-gray-500">Automated email sending</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Google Drive</p>
                <p className="text-xs text-gray-500">Workspace folder creation</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Notifications</CardTitle>
          <CardContent className="mt-2 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Interview Reminders</p>
                <p className="text-xs text-gray-500">20 minutes before interviews</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Document Uploads</p>
                <p className="text-xs text-gray-500">Notify HR on new uploads</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Security</CardTitle>
          <CardContent className="mt-2 space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                <p className="text-xs text-gray-500">24 hours of inactivity</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Password Policy</p>
                <p className="text-xs text-gray-500">Min 8 chars, mixed case + special</p>
              </div>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
