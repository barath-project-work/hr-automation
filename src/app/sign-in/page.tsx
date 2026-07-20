'use client';

import React, { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { RequestAccessModal } from '@/components/auth/RequestAccessModal';

export default function SignInPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full border border-white" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/20" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <span className="text-black text-lg font-bold">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Rivomind HR</h1>
              <p className="text-xs text-gray-400">Automation Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-light leading-relaxed text-gray-300">
            "Streamline your recruitment pipeline from application to onboarding — all in one place."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs font-medium text-white"
                >
                  {['S', 'J', 'P', 'A'][i - 1]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">Trusted by HR teams</p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          © 2026 Rivomind. All rights reserved.
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm mx-auto animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <span className="text-white text-lg font-bold">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Rivomind HR</h1>
              <p className="text-xs text-gray-500">Automation Platform</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500">
              Sign in to access your dashboard
            </p>
          </div>

          <SignInForm onRequestAccess={() => setShowRequestModal(true)} />


        </div>
      </div>

      {/* Request Access Modal */}
      <RequestAccessModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}
