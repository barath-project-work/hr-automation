'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth, useToast } from '@/providers';
import { signOut } from '@/lib/auth';

const adminNavItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'HRs',
    href: '/admin/hrs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    badge: 0,
  },
  {
    label: 'Requests',
    href: '/admin/requests',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    badge: 3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Parameters<typeof TopBar>[0]['notifications']>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (json.success) {
          setNotifications((json.data ?? []).map((n: {
            id: string; title: string; message: string;
            notification_type: string; is_read: boolean; created_at: string; link?: string;
          }) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.notification_type as 'request',
            is_read: n.is_read,
            created_at: n.created_at,
            action: n.link ? { label: 'View', onClick: () => router.push(n.link!) } : undefined,
          })));
        }
      } catch { /* silent */ }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    return () => clearInterval(interval);
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    addToast({ message: 'Signed out successfully.', type: 'success' });
    router.push('/sign-in');
  }, [addToast, router]);

  const displayName = user?.full_name ?? 'Admin';
  const avatarUrl = user?.avatar_url ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        items={adminNavItems}
        userName={displayName}
        userRole="admin"
        userAvatar={avatarUrl}
        onSignOut={handleSignOut}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-[72px]'}`}>
        <TopBar
          userName={displayName}
          userRole="admin"
          userAvatar={avatarUrl}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          onMarkRead={async (id) => {
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
          }}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
