'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pending' | 'active' | 'completed' | 'danger' | 'hold' | 'scheduled' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-gray-50 text-gray-600 border-gray-200',
  active: 'bg-gray-900 text-white border-gray-900',
  completed: 'bg-gray-100 text-gray-900 border-gray-300',
  danger: 'bg-red-50 text-red-700 border-red-200',
  hold: 'bg-gray-100 text-gray-700 border-gray-300',
  scheduled: 'bg-gray-100 text-gray-800 border-gray-300',
  info: 'bg-gray-50 text-gray-600 border-gray-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

const dotColors = {
  default: 'bg-gray-400',
  pending: 'bg-gray-400',
  active: 'bg-white',
  completed: 'bg-gray-700',
  danger: 'bg-red-500',
  hold: 'bg-gray-500',
  scheduled: 'bg-gray-600',
  info: 'bg-gray-400',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            dotColors[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
