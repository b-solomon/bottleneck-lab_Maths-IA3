import React from 'react';
import type { AssociationStrength } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
  blue: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  green: 'bg-green-900/50 text-green-300 border-green-700/50',
  yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  red: 'bg-red-900/50 text-red-300 border-red-700/50',
  purple: 'bg-violet-900/50 text-violet-300 border-violet-700/50',
  slate: 'bg-slate-800/50 text-slate-400 border-slate-600/50',
};

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function StrengthBadge({ strength }: { strength: AssociationStrength }) {
  const map: Record<AssociationStrength, { label: string; variant: string }> = {
    'Very Strong': { label: 'Very Strong', variant: 'green' },
    'Strong': { label: 'Strong', variant: 'blue' },
    'Moderate': { label: 'Moderate', variant: 'yellow' },
    'Weak': { label: 'Weak', variant: 'red' },
    'Very Weak': { label: 'Very Weak', variant: 'slate' },
    'Undefined': { label: 'Undefined', variant: 'red' },
  };
  const { label, variant } = map[strength] ?? map['Undefined'];
  return <Badge variant={variant as BadgeProps['variant']}>{label}</Badge>;
}
