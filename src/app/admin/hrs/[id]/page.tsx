'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { HREditForm } from '@/components/admin/HREditForm';
import { Spinner } from '@/components/ui/Spinner';
import { getSupabaseAdminClient } from '@/lib/supabase';

export default function EditHRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [hr, setHR] = useState<{ id: string; full_name: string; email?: string | null; phone: string; username: string; avatar_url?: string | null; is_active: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHR() {
      try {
        const res  = await fetch(`/api/admin/hrs`);
        const json = await res.json();
        if (json.success) {
          const found = (json.data as typeof hr[]).find((h) => h?.id === id);
          if (found) {
            setHR(found);
          } else {
            setError('HR account not found.');
          }
        } else {
          setError(json.error ?? 'Failed to load HR account.');
        }
      } catch {
        setError('Unable to connect.');
      } finally {
        setIsLoading(false);
      }
    }
    loadHR();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !hr) {
    return (
      <div className="space-y-4">
        <Link href="/admin/hrs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Back to HR Management
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error || 'HR account not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link
          href="/admin/hrs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          Back to HR Management
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit HR Account</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update details for <span className="font-medium text-gray-700">{hr.full_name}</span>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl">
        <HREditForm hr={hr} />
      </div>
    </div>
  );
}
