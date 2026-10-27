import { useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

function getRequirements(password: string): Requirement[] {
  return [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a special character', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
const STRENGTH_TEXT = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400'];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  if (!password) return null;

  const score = result?.score ?? 0; // 0-4
  const displayScore = Math.max(1, score); // clamp to 1 minimum for display
  const label = STRENGTH_LABELS[displayScore];
  const colorClass = STRENGTH_COLORS[displayScore];
  const textClass = STRENGTH_TEXT[displayScore];

  const suggestions: string[] = result?.feedback?.suggestions ?? [];
  const warning: string = result?.feedback?.warning ?? '';

  const requirements = getRequirements(password);

  return (
    <div className="mt-2 space-y-3" aria-live="polite" aria-label="Password strength feedback">
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Password strength</span>
          <span className={`text-xs font-semibold ${textClass}`} aria-label={`Strength: ${label}`}>
            {label}
          </span>
        </div>
        <div className="flex gap-1" role="img" aria-label={`${displayScore} out of 4 strength bars filled`}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= displayScore ? colorClass : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Strength scores are estimates, not security guarantees.
        </p>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1" aria-label="Password requirements">
        {requirements.map((req) => (
          <li key={req.label} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
            )}
            <span className={req.met ? 'text-slate-300' : 'text-slate-500'}>
              {req.label}
            </span>
            <span className="sr-only">{req.met ? '— met' : '— not met'}</span>
          </li>
        ))}
      </ul>

      {/* zxcvbn suggestions */}
      {(warning || suggestions.length > 0) && (
        <div className="text-xs text-amber-400 space-y-0.5">
          {warning && <p>⚠ {warning}</p>}
          {suggestions.map((s, i) => (
            <p key={i}>→ {s}</p>
          ))}
        </div>
      )}
    </div>
  );
}
