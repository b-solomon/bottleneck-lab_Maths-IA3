import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleRight?: React.ReactNode;
  noPadding?: boolean;
}

export default function Card({ children, className = '', title, titleRight, noPadding }: CardProps) {
  return (
    <div
      className={`
        bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl
        ${noPadding ? '' : 'p-5'}
        ${className}
      `}
    >
      {title && (
        <div className={`flex items-center justify-between ${noPadding ? 'px-5 pt-5' : 'mb-4'}`}>
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            {title}
          </h2>
          {titleRight && <div className="flex items-center gap-2">{titleRight}</div>}
        </div>
      )}
      {noPadding && title ? (
        <div>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

export function CardGrid({ children, cols = 3, className = '' }: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const colMap = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4' };
  return (
    <div className={`grid ${colMap[cols]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
