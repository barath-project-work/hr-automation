'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'interview' | 'document' | 'workspace' | 'request';
  link?: string;
  is_read: boolean;
  created_at: string;
  action?: { label: string; onClick: () => void };
}

interface TopBarProps {
  userName: string;
  userRole: 'admin' | 'hr';
  userAvatar?: string | null;
  notifications: Notification[];
  onMenuToggle: () => void;
  onMarkRead?: (id: string) => void;
  onRequestPasswordReset?: () => void;
  onProfileClick?: () => void;
}

export function TopBar({ userName, userRole, userAvatar, notifications, onMenuToggle, onMarkRead, onRequestPasswordReset, onProfileClick }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notificationIcons: Record<string, React.ReactNode> = {
    interview: (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    ),
    document: (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    ),
    workspace: (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
    ),
    request: (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
    ),
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Menu toggle + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0',
                          !notif.is_read && 'bg-gray-50/50'
                        )}
                      >
                        {notificationIcons[notif.type]}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          {notif.action && (
                            <button
                              onClick={notif.action.onClick}
                              className="mt-1.5 text-xs font-medium text-gray-700 hover:text-black transition-colors"
                            >
                              {notif.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User info (responsive) */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-gray-200">
            <div
              onClick={onProfileClick}
              className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-gray-100/80 transition-all cursor-pointer active:scale-[0.98]"
              title="View Profile Details"
              role="button"
              tabIndex={0}
            >
              <Avatar name={userName} size="sm" src={userAvatar} />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-medium text-gray-900 leading-tight">{userName}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{userRole}</span>
              </div>
            </div>
            {userRole === 'hr' && onRequestPasswordReset && (
              <button
                onClick={onRequestPasswordReset}
                className="hidden md:inline-flex ml-1 px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Request password reset from Admin"
              >
                Reset Password
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
