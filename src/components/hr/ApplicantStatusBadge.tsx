'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { ApplicantStatus } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

interface StatusBadgeProps {
  status: ApplicantStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function ApplicantStatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'default' as const };

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}
