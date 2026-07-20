'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InternCard } from '@/components/hr/InternCard';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/providers';

interface Intern {
  id: string;
  name: string;
  email: string;
  joined_date: string;
  workspace_url: string | null;
  tracker_url: string | null;
}

export default function InternsPage() {
  const { addToast } = useToast();
  const [interns,   setInterns]   = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInterns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await fetch('/api/hr/interns');
      const json = await res.json();
      if (json.success) {
        setInterns(json.data ?? []);
      } else {
        addToast({ message: json.error ?? 'Failed to load interns.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to load interns.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadInterns(); }, [loadInterns]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interns</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage active interns and their workspace access.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : interns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No active interns yet.</p>
          <p className="text-gray-400 text-xs mt-1">Interns will appear here once their workspace is created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {interns.map((intern) => (
            <InternCard
              key={intern.id}
              intern={intern}
            />
          ))}
        </div>
      )}
    </div>
  );
}
