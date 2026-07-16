'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  items: NavItem[];
  userName: string;
  userRole: 'admin' | 'hr';
  onSignOut: () => void;
}

export function Sidebar({ items, userName, userRole, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50',
          'transition-all duration-300 ease-in-out',
          'flex flex-col',
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center border-b border-gray-100 px-5 h-16 flex-shrink-0',
          collapsed && 'lg:justify-center lg:px-0'
        )}>
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div className={cn(
            'ml-3 transition-all duration-300 overflow-hidden',
            collapsed && 'lg:w-0 lg:ml-0 lg:opacity-0'
          )}>
            <p className="text-sm font-bold text-gray-900 leading-tight">Rivomind</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">HR Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  'group relative',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className={cn(
                  'flex-shrink-0 transition-transform duration-200',
                  !isActive && 'group-hover:scale-110'
                )}>
                  {item.icon}
                </span>
                <span className={cn(
                  'transition-all duration-300',
                  collapsed && 'lg:w-0 lg:opacity-0 lg:overflow-hidden'
                )}>
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    'ml-auto bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                    collapsed && 'lg:absolute lg:top-1 lg:right-1 lg:ml-0'
                  )}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn(
          'border-t border-gray-100 p-3',
          collapsed && 'lg:p-2'
        )}>
          <div className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl',
            collapsed && 'lg:justify-center lg:px-0'
          )}>
            <Avatar name={userName} size="sm" />
            <div className={cn(
              'flex-1 min-w-0 transition-all duration-300',
              collapsed && 'lg:hidden'
            )}>
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className={cn(
              'w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200',
              collapsed && 'lg:justify-center lg:px-0'
            )}
            title="Sign out"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={cn('transition-all duration-300', collapsed && 'lg:hidden')}>Sign Out</span>
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all hidden lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn('w-3 h-3 transition-transform duration-300', collapsed && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    </>
  );
}
