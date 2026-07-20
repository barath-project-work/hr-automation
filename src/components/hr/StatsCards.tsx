'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  trend?: { direction: 'up' | 'down'; value: string };
  variant?: 'default' | 'dark';
}

function StatsCard({ label, value, icon, onClick, trend, variant = 'default' }: StatsCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 min-w-[140px] p-4 rounded-2xl border text-left transition-all duration-200',
        'group relative overflow-hidden',
        variant === 'dark'
          ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-850 hover:border-gray-700 hover:shadow-xl hover:-translate-y-0.5'
          : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      {/* Subtle hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              variant === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            {label}
          </span>
          {icon && (
            <span className={cn(
              'transition-transform duration-200 group-hover:scale-110',
              variant === 'dark' ? 'text-gray-400' : 'text-gray-500'
            )}>
              {icon}
            </span>
          )}
        </div>
        <div className="flex items-end gap-2">
          <span
            className={cn(
              'text-3xl font-bold tabular-nums transition-all duration-200',
              variant === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            {value.toLocaleString()}
          </span>
          {trend && (
            <span
              className={cn(
                'text-xs font-medium mb-1',
                trend.direction === 'up' ? 'text-gray-600' : 'text-red-500'
              )}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface StatsCardsProps {
  cards: StatsCardProps[];
  className?: string;
}

export function StatsCards({ cards, className }: StatsCardsProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}
