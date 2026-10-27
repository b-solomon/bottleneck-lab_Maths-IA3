import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftAddon,
  rightAddon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const ariaDescribedBy = [
    error ? errorId : '',
    hint ? hintId : '',
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {leftAddon}
          </div>
        )}
        <input
          id={inputId}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!!error}
          className={`
            w-full bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500
            px-3 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-150
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 hover:border-slate-600'}
            ${leftAddon ? 'pl-10' : ''}
            ${rightAddon ? 'pr-10' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {rightAddon && (
          <div className="absolute right-3 text-slate-400">
            {rightAddon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-400 flex items-start gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}
