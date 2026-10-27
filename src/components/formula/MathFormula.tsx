// ============================================================
// MATH FORMULA RENDERER
// Renders beautiful mathematical formulas using pure HTML/CSS.
// No CDN, no KaTeX dependency issues.
// ============================================================

import React from 'react';

// ---- Generic wrapper ----------------------------------------
interface FormulaBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function FormulaBlock({ children, className = '' }: FormulaBlockProps) {
  return (
    <div className={`my-4 py-5 px-6 bg-slate-900/70 border border-blue-800/30 rounded-xl overflow-x-auto text-center ${className}`}>
      <div className="inline-block text-left">
        {children}
      </div>
    </div>
  );
}

// ---- Fraction -----------------------------------------------
interface FracProps {
  num: React.ReactNode;
  den: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Frac({ num, den, size = 'md' }: FracProps) {
  const textSize = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className={`inline-flex flex-col items-center mx-1 align-middle ${textSize}`}>
      <span className="px-2 pb-0.5 border-b-2 border-blue-300 leading-tight">{num}</span>
      <span className="px-2 pt-0.5 leading-tight">{den}</span>
    </span>
  );
}

// ---- Square root --------------------------------------------
export function Sqrt({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center mx-0.5 align-middle">
      <span className="text-blue-200 text-xl mr-0.5" style={{ fontFamily: 'serif' }}>√</span>
      <span className="border-t-2 border-blue-300 px-1 leading-tight">{children}</span>
    </span>
  );
}

// ---- Subscript/Superscript ----------------------------------
export function Sub({ children }: { children: React.ReactNode }) {
  return <sub className="text-xs align-sub">{children}</sub>;
}

export function Sup({ children }: { children: React.ReactNode }) {
  return <sup className="text-xs align-super">{children}</sup>;
}

// ---- Math text helpers -------------------------------------
export function MathVar({ children }: { children: React.ReactNode }) {
  return <span className="italic text-blue-200 font-medium">{children}</span>;
}

export function MathOp({ children }: { children: React.ReactNode }) {
  return <span className="text-slate-300 mx-0.5">{children}</span>;
}

export function MathNum({ children }: { children: React.ReactNode }) {
  return <span className="text-green-300">{children}</span>;
}

// ---- Sigma (Summation) --------------------------------------
export function Sigma() {
  return <span className="text-amber-300 text-xl mx-0.5 align-middle" style={{ fontFamily: 'serif' }}>Σ</span>;
}

// ---- Specific Formulas -------------------------------------

export function PearsonFormula() {
  return (
    <FormulaBlock>
      {/* Main formula */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span className="text-white font-bold text-xl italic">r</span>
        <MathOp>=</MathOp>
        <Frac
          size="lg"
          num={
            <span className="flex items-center gap-0.5">
              <Sigma />
              <span className="text-white">[</span>
              <span className="text-blue-200 italic">(x</span>
              <Sub>i</Sub>
              <MathOp>−</MathOp>
              <span className="text-blue-200 italic">x̄)(y</span>
              <Sub>i</Sub>
              <MathOp>−</MathOp>
              <span className="text-blue-200 italic">ȳ)</span>
              <span className="text-white">]</span>
            </span>
          }
          den={
            <Sqrt>
              <span className="flex items-center gap-0.5">
                <Sigma />
                <span className="text-blue-200 italic">(x</span>
                <Sub>i</Sub>
                <MathOp>−</MathOp>
                <span className="text-blue-200 italic">x̄)</span>
                <Sup>2</Sup>
                <MathOp>·</MathOp>
                <Sigma />
                <span className="text-blue-200 italic">(y</span>
                <Sub>i</Sub>
                <MathOp>−</MathOp>
                <span className="text-blue-200 italic">ȳ)</span>
                <Sup>2</Sup>
              </span>
            </Sqrt>
          }
        />
      </div>

      {/* Divider */}
      <div className="text-center text-slate-600 text-xs my-3">— Computational form —</div>

      {/* Computational form */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-white font-bold text-xl italic">r</span>
        <MathOp>=</MathOp>
        <Frac
          size="lg"
          num={
            <span className="flex items-center gap-0.5">
              <MathNum>n</MathNum>
              <Sigma />
              <span className="text-blue-200 italic">x</span>
              <Sub>i</Sub>
              <span className="text-blue-200 italic">y</span>
              <Sub>i</Sub>
              <MathOp>−</MathOp>
              <span className="text-white">(</span>
              <Sigma />
              <span className="text-blue-200 italic">x</span>
              <Sub>i</Sub>
              <span className="text-white">)(</span>
              <Sigma />
              <span className="text-blue-200 italic">y</span>
              <Sub>i</Sub>
              <span className="text-white">)</span>
            </span>
          }
          den={
            <Sqrt>
              <span className="flex items-center gap-0.5">
                <span className="text-white">[</span>
                <MathNum>n</MathNum>
                <Sigma />
                <span className="text-blue-200 italic">x</span>
                <Sub>i</Sub>
                <Sup>2</Sup>
                <MathOp>−</MathOp>
                <span className="text-white">(</span>
                <Sigma />
                <span className="text-blue-200 italic">x</span>
                <Sub>i</Sub>
                <span className="text-white">)</span>
                <Sup>2</Sup>
                <span className="text-white">][</span>
                <MathNum>n</MathNum>
                <Sigma />
                <span className="text-blue-200 italic">y</span>
                <Sub>i</Sub>
                <Sup>2</Sup>
                <MathOp>−</MathOp>
                <span className="text-white">(</span>
                <Sigma />
                <span className="text-blue-200 italic">y</span>
                <Sub>i</Sub>
                <span className="text-white">)</span>
                <Sup>2</Sup>
                <span className="text-white">]</span>
              </span>
            </Sqrt>
          }
        />
      </div>
    </FormulaBlock>
  );
}

export function SpearmanFormula() {
  return (
    <FormulaBlock>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-violet-300 font-bold text-xl italic">ρ</span>
        <MathOp>=</MathOp>
        <MathNum>1</MathNum>
        <MathOp>−</MathOp>
        <Frac
          size="lg"
          num={
            <span className="flex items-center gap-0.5">
              <MathNum>6</MathNum>
              <Sigma />
              <span className="text-violet-200 italic">d</span>
              <Sub>i</Sub>
              <Sup>2</Sup>
            </span>
          }
          den={
            <span className="flex items-center gap-0.5">
              <MathNum>n</MathNum>
              <span className="text-white">(</span>
              <MathNum>n</MathNum>
              <Sup>2</Sup>
              <MathOp>−</MathOp>
              <MathNum>1</MathNum>
              <span className="text-white">)</span>
            </span>
          }
        />
      </div>
    </FormulaBlock>
  );
}

// Generic inline formula display using plain text with math styling
export function InlineFormula({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-blue-200 bg-slate-900/60 px-2 py-0.5 rounded text-sm border border-slate-700/40">
      {children}
    </span>
  );
}
