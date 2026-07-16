'use client';

import React, { useState } from 'react';
import { ApplicantTable } from '@/components/hr/ApplicantTable';
import { ApplicantDetailPanel } from '@/components/hr/ApplicantDetailPanel';
import { ScheduleInterviewModal } from '@/components/hr/ScheduleInterviewModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/providers';
import { holdApplicant, rejectApplicant, selectCandidate } from '@/lib/auth';
import type { Applicant, ApplicantStatus } from '@/lib/types';

// Mock data
const mockApplicants: Applicant[] = [
  { id: '1', hr_id: 'hr1', google_sheet_row: 1, full_name: 'Barath G', email: 'barath@email.com', phone: '+91-9876543210', resume_url: null, additional_data: null, status: 'pending', interview_date: null, interview_time: null, meet_link: null, notes: null, created_at: '2026-07-16T10:00:00Z', updated_at: '2026-07-16T10:00:00Z' },
  { id: '2', hr_id: 'hr1', google_sheet_row: 2, full_name: 'Rahul Kumar', email: 'rahul@email.com', phone: '+91-9876543211', resume_url: null, additional_data: null, status: 'pending', interview_date: null, interview_time: null, meet_link: null, notes: null, created_at: '2026-07-16T09:00:00Z', updated_at: '2026-07-16T09:00:00Z' },
  { id: '3', hr_id: 'hr1', google_sheet_row: 3, full_name: 'Priya Sharma', email: 'priya@email.com', phone: '+91-9876543212', resume_url: null, additional_data: null, status: 'on_hold', interview_date: null, interview_time: null, meet_link: null, notes: 'Strong profile, waiting for position confirmation', created_at: '2026-07-15T14:00:00Z', updated_at: '2026-07-16T08:00:00Z' },
  { id: '4', hr_id: 'hr1', google_sheet_row: 4, full_name: 'Amit Patel', email: 'amit@email.com', phone: '+91-9876543213', resume_url: null, additional_data: null, status: 'interview_scheduled', interview_date: '2026-07-18', interview_time: '15:00', meet_link: 'https://meet.google.com/abc-defg-hij', notes: null, created_at: '2026-07-15T10:00:00Z', updated_at: '2026-07-16T12:00:00Z' },
  { id: '5', hr_id: 'hr1', google_sheet_row: 5, full_name: 'Neha Gupta', email: 'neha@email.com', phone: '+91-9876543214', resume_url: null, additional_data: null, status: 'interview_completed', interview_date: '2026-07-17', interview_time: '14:00', meet_link: 'https://meet.google.com/xyz-uvw-rst', notes: 'Good communication skills', created_at: '2026-07-14T11:00:00Z', updated_at: '2026-07-17T15:00:00Z' },
  { id: '6', hr_id: 'hr1', google_sheet_row: 6, full_name: 'Vikas Singh', email: 'vikas@email.com', phone: '+91-9876543215', resume_url: null, additional_data: null, status: 'rejected', interview_date: null, interview_time: null, meet_link: null, notes: 'Insufficient experience', created_at: '2026-07-14T09:00:00Z', updated_at: '2026-07-15T10:00:00Z' },
  { id: '7', hr_id: 'hr1', google_sheet_row: 7, full_name: 'Deepa K', email: 'deepa@email.com', phone: '+91-9876543216', resume_url: null, additional_data: null, status: 'selected', interview_date: '2026-07-16', interview_time: '11:00', meet_link: 'https://meet.google.com/aaa-bbb-ccc', notes: null, created_at: '2026-07-13T10:00:00Z', updated_at: '2026-07-16T13:00:00Z' },
  { id: '8', hr_id: 'hr1', google_sheet_row: 8, full_name: 'Rohit M', email: 'rohit@email.com', phone: '+91-9876543217', resume_url: null, additional_data: null, status: 'document_collection', interview_date: '2026-07-15', interview_time: '10:00', meet_link: 'https://meet.google.com/ddd-eee-fff', notes: null, created_at: '2026-07-12T10:00:00Z', updated_at: '2026-07-16T14:00:00Z' },
  { id: '9', hr_id: 'hr1', google_sheet_row: 9, full_name: 'Ananya R', email: 'ananya@email.com', phone: '+91-9876543218', resume_url: null, additional_data: null, status: 'workspace_created', interview_date: '2026-07-14', interview_time: '15:00', meet_link: 'https://meet.google.com/ggg-hhh-iii', notes: null, created_at: '2026-07-11T10:00:00Z', updated_at: '2026-07-16T16:00:00Z' },
];

export default function ApplicantsPage() {
  const { addToast } = useToast();
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<Applicant | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<Applicant | null>(null);
  const [selectConfirm, setSelectConfirm] = useState<Applicant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all');

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
      await holdApplicant(applicant.id);
      addToast({ message: `${applicant.full_name} moved to On Hold.`, type: 'success' });
    } catch {
      addToast({ message: 'Failed to hold applicant.', type: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectConfirm) return;
    try {
      await rejectApplicant(rejectConfirm.id);
      addToast({ message: `${rejectConfirm.full_name} has been rejected.`, type: 'success' });
      setRejectConfirm(null);
    } catch {
      addToast({ message: 'Failed to reject applicant.', type: 'error' });
    }
  };

  const handleSelectCandidate = async () => {
    if (!selectConfirm) return;
    try {
      await selectCandidate(selectConfirm.id);
      addToast({ message: `${selectConfirm.full_name} selected. Agreement letter sent.`, type: 'success' });
      setSelectConfirm(null);
    } catch {
      addToast({ message: 'Failed to select candidate.', type: 'error' });
    }
  };

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
          applicants={mockApplicants}
          onSelect={handleSelect}
          onAccept={handleAccept}
          onReject={(a) => setRejectConfirm(a)}
          onHold={handleHold}
          total={mockApplicants.length}
          currentPage={currentPage}
          pageSize={25}
          onPageChange={setCurrentPage}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
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
            addToast({ message: `Interview scheduled! Email sent to ${scheduleModal.full_name}.`, type: 'success' });
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
        message={`You are about to accept ${selectConfirm?.full_name} after the interview. An agreement letter will be sent automatically.`}
        confirmLabel="Confirm & Send Agreement"
        variant="default"
      />
    </div>
  );
}
