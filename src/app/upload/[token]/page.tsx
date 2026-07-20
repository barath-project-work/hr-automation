'use client';

import React, { useState, useRef, useEffect } from 'react';
import { use } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface UploadFile {
  name: string;
  label: string;
  file: File | null;
  uploaded: boolean;
}

type PageState = 'loading' | 'invalid' | 'ready' | 'submitted';

export default function UploadPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [pageState, setPageState]     = useState<PageState>('loading');
  const [tokenError, setTokenError]   = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const agreementRef  = useRef<HTMLInputElement>(null);
  const aadhaarRef    = useRef<HTMLInputElement>(null);
  const marksheetRef  = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<Record<string, UploadFile>>({
    agreement_letter: { name: 'agreement_letter', label: 'Signed Agreement Letter', file: null, uploaded: false },
    aadhaar_card:     { name: 'aadhaar_card',     label: 'Aadhaar Card',            file: null, uploaded: false },
    marksheet:        { name: 'marksheet',         label: 'Current Marksheet',       file: null, uploaded: false },
  });

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      try {
        const res  = await fetch(`/api/upload/${resolvedParams.token}`);
        const json = await res.json();
        if (json.success) {
          setApplicantName(json.data.applicant_name);
          setPageState('ready');
        } else {
          setTokenError(json.error ?? 'Invalid upload link.');
          setPageState('invalid');
        }
      } catch {
        setTokenError('Unable to validate upload link. Please check your internet connection.');
        setPageState('invalid');
      }
    }
    validateToken();
  }, [resolvedParams.token]);

  const handleFileSelect = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, and PNG files are accepted.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10 MB.');
        return;
      }
      setFiles((prev) => ({
        ...prev,
        [key]: { ...prev[key], file, uploaded: true },
      }));
    }
  };

  const removeFile = (key: string) => {
    setFiles((prev) => ({
      ...prev,
      [key]: { ...prev[key], file: null, uploaded: false },
    }));
  };

  const allUploaded = Object.values(files).every((f) => f.uploaded);

  const handleSubmit = async () => {
    if (!allUploaded) return;
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      Object.entries(files).forEach(([key, fileInfo]) => {
        if (fileInfo.file) formData.append(key, fileInfo.file);
      });

      const res  = await fetch(`/api/upload/${resolvedParams.token}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setPageState('submitted');
      } else {
        setUploadError(json.error ?? 'Upload failed. Please try again.');
      }
    } catch {
      setUploadError('Upload failed. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Loading state ──
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Invalid / expired token ──
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Link Invalid</h2>
          <p className="text-sm text-gray-500">{tokenError}</p>
        </div>
      </div>
    );
  }

  // ── Success state ──
  if (pageState === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 text-center animate-slide-up shadow-xl">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Complete!</h2>
          <p className="text-gray-500 mb-2">
            Your documents have been submitted successfully for review.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mt-6 text-left space-y-2">
            <p className="text-sm font-medium text-gray-900">What happens next:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-700 mt-0.5">•</span>
                HR will review your documents
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-700 mt-0.5">•</span>
                You&apos;ll receive your workspace access via email
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-700 mt-0.5">•</span>
                You can safely close this page
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload form ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 shadow-xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Rivomind</h1>
              <p className="text-xs text-gray-500">Document Upload Portal</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Welcome{applicantName ? `, ${applicantName.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please upload your onboarding documents to complete the joining process.
          </p>
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}

        {/* Upload Fields */}
        <div className="px-8 pb-6 space-y-4">
          {Object.entries(files).map(([key, fileInfo]) => (
            <div key={key}>
              <input
                ref={
                  key === 'agreement_letter'
                    ? agreementRef
                    : key === 'aadhaar_card'
                    ? aadhaarRef
                    : marksheetRef
                }
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect(key)}
                className="hidden"
                id={`file-${key}`}
              />
              <label
                htmlFor={`file-${key}`}
                className={cn(
                  'flex items-center justify-between p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
                  fileInfo.uploaded
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                    fileInfo.uploaded ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                  )}>
                    {fileInfo.uploaded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fileInfo.label}</p>
                    <p className="text-xs text-gray-500">
                      {fileInfo.file ? fileInfo.file.name : 'PDF, JPG or PNG (max 10 MB)'}
                    </p>
                  </div>
                </div>
                {fileInfo.uploaded && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile(key);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Remove ${fileInfo.label}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure upload</span>
            </div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!allUploaded || isUploading}
              isLoading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Submit All'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
