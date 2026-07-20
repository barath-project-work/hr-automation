'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ApplicantTable } from '@/components/hr/ApplicantTable';
import { ApplicantDetailPanel } from '@/components/hr/ApplicantDetailPanel';
import { ScheduleInterviewModal } from '@/components/hr/ScheduleInterviewModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/providers';
import type { Applicant, ApplicantStatus } from '@/lib/types';

export default function ApplicantsPage() {
  const { addToast } = useToast();
  const [applicants,    setApplicants]    = useState<Applicant[]>([]);
  const [total,         setTotal]         = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [isLoading,     setIsLoading]     = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [scheduleModal, setScheduleModal] = useState<Applicant | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<Applicant | null>(null);
  const [selectConfirm, setSelectConfirm] = useState<Applicant | null>(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [statusFilter,  setStatusFilter]  = useState<ApplicantStatus | 'all'>('all');

  const pageSize = 25;

  const loadApplicants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(currentPage),
        limit: String(pageSize),
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      });
      const res  = await fetch(`/api/hr/applicants?${params}`);
      const json = await res.json();
      if (json.success) {
        setApplicants(json.data ?? []);
        setTotal(json.total ?? 0);
        setTotalPages(json.totalPages ?? 1);
      } else {
        addToast({ message: json.error ?? 'Failed to load applicants.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to load applicants.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  useEffect(() => { loadApplicants(); }, [loadApplicants]);

  const handleSelect = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setPanelOpen(true);
  };

  const handleAccept = (applicant: Applicant) => {
    if (applicant.status === 'interview_completed') {
      setSelectConfirm(applicant);
    } else {
      setScheduleModal(applicant);
    }
  };

  const handleHold = async (applicant: Applicant) => {
    try {
      const res  = await fetch(`/api/hr/applicants/${applicant.id}/hold`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast({ message: `${applicant.full_name} moved to On Hold.`, type: 'success' });
        loadApplicants();
      } else {
        addToast({ message: json.error ?? 'Failed to hold applicant.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to hold applicant.', type: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectConfirm) return;
    try {
      const res  = await fetch(`/api/hr/applicants/${rejectConfirm.id}/reject`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast({ message: `${rejectConfirm.full_name} has been rejected.`, type: 'success' });
        setRejectConfirm(null);
        loadApplicants();
      } else {
        addToast({ message: json.error ?? 'Failed to reject applicant.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to reject applicant.', type: 'error' });
    }
  };

  const handleSelectCandidate = async () => {
    if (!selectConfirm) return;
    try {
      const res  = await fetch(`/api/hr/applicants/${selectConfirm.id}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        addToast({
          message: `${selectConfirm.full_name} selected!${json.data?.uploadUrl ? ' Upload link generated.' : ''}`,
          type: 'success',
        });
        if (json.data?.uploadUrl) {
          // Copy upload URL to clipboard
          navigator.clipboard.writeText(json.data.uploadUrl).catch(() => {});
          addToast({ message: `Upload link copied to clipboard: ${json.data.uploadUrl}`, type: 'info' });
        }
        setSelectConfirm(null);
        loadApplicants();
      } else {
        addToast({ message: json.error ?? 'Failed to select candidate.', type: 'error' });
      }
    } catch {
      addToast({ message: 'Failed to select candidate.', type: 'error' });
    }
  };

  if (isLoading && applicants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, accept, or reject applicants. Click on a row to view full details.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        <ApplicantTable
          applicants={applicants}
          onSelect={handleSelect}
          onAccept={handleAccept}
          onReject={(a) => setRejectConfirm(a)}
          onHold={handleHold}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => { setCurrentPage(p); }}
          statusFilter={statusFilter}
          onStatusFilterChange={(s) => { setStatusFilter(s); setCurrentPage(1); }}
        />
      </div>

      {/* Detail Panel */}
      <ApplicantDetailPanel
        applicant={selectedApplicant!}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onAccept={handleAccept}
        onReject={(a) => { setPanelOpen(false); setRejectConfirm(a); }}
        onHold={handleHold}
      />

      {/* Schedule Interview Modal */}
      {scheduleModal && (
        <ScheduleInterviewModal
          isOpen={!!scheduleModal}
          onClose={() => setScheduleModal(null)}
          applicant={scheduleModal}
          onSuccess={() => {
            addToast({ message: `Interview scheduled for ${scheduleModal.full_name}.`, type: 'success' });
            setScheduleModal(null);
            loadApplicants();
          }}
        />
      )}

      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        onConfirm={handleReject}
        title="Reject Applicant"
        message={`Are you sure you want to reject ${rejectConfirm?.full_name}? This action cannot be undone.`}
        confirmLabel="Yes, Reject"
        variant="danger"
      />

      {/* Post-Interview Select Confirmation */}
      <ConfirmDialog
        isOpen={!!selectConfirm}
        onClose={() => setSelectConfirm(null)}
        onConfirm={handleSelectCandidate}
        title="Confirm Selection"
        message={`You are about to select ${selectConfirm?.full_name}. An upload link will be generated for their documents.`}
        confirmLabel="Confirm & Generate Link"
        variant="default"
      />
    </div>
  );
}
