import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error' | 'demo';

interface AlertProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const styles: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  info: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-200',
    icon: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />,
  },
  success: {
    bg: 'bg-green-900/20',
    border: 'border-green-500/30',
    text: 'text-green-200',
    icon: <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-200',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    text: 'text-red-200',
    icon: <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
  },
  demo: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/40',
    text: 'text-amber-200',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  },
};

export default function Alert({ type, title, children, onClose, className = '' }: AlertProps) {
  const s = styles[type];
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`${s.bg} border ${s.border} rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        {s.icon}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-sm font-semibold ${s.text} mb-0.5`}>{title}</p>
          )}
          <div className={`text-sm ${s.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Dismiss"
            className="text-slate-500 hover:text-slate-300 flex-shrink-0 -mt-0.5 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function DemoBanner() {
  return (
    <Alert type="demo" title="⚠ SIMULATED DATA — FOR DEMONSTRATION">
      These observations are generated examples and are not measurements from a real system.
      Results illustrate the mathematical methods only.
    </Alert>
  );
}

export function DemoModeBanner() {
  return (
    <Alert type="demo" title="DEMO MODE — Supabase Not Configured">
      Authentication and persistent data storage require Supabase configuration.
      See <code className="text-amber-300">.env.example</code> for setup instructions.
      All calculations are fully functional in demo mode.
    </Alert>
  );
}
