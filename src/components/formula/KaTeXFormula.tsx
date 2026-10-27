// ============================================================
// KaTeXFormula — safe stub, no katex dependency
// Replaced to avoid CSS crash. Re-exports from MathFormula.
// ============================================================

import { FormulaBlock } from './MathFormula';

// Default export stub (inline span — does not crash)
export default function KaTeXFormula({ formula, className = '' }: {
  formula: string;
  display?: boolean;
  className?: string;
  errorFallback?: string;
}) {
  return (
    <span className={`font-mono text-blue-200 text-sm ${className}`}>
      {formula}
    </span>
  );
}

// BlockFormula re-exported from MathFormula
export { FormulaBlock as BlockFormula };
