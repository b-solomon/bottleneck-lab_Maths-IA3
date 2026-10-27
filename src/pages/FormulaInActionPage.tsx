import { useState, useMemo } from 'react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import Alert, { DemoBanner } from '../components/ui/Alert';
import { PearsonFormula, SpearmanFormula } from '../components/formula/MathFormula';
import { StrengthBadge } from '../components/ui/Badge';
import { calculatePearson, extractValidPairs, round } from '../engine/pearson';
import { calculateSpearman } from '../engine/spearman';
import { interpretCorrelation } from '../lib/interpretation';
import { METRIC_META, ALL_NUMERIC_METRICS } from '../data/metricMeta';
import type { MetricKey } from '../types';

const METHODS = ['Pearson', 'Spearman'] as const;
type Method = typeof METHODS[number];

export default function FormulaInActionPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  const [xKey, setXKey] = useState<MetricKey>('cpu');
  const [yKey, setYKey] = useState<MetricKey>('responseTime');
  const [method, setMethod] = useState<Method>('Pearson');

  const xMeta = METRIC_META.find((m) => m.key === xKey)!;
  const yMeta = METRIC_META.find((m) => m.key === yKey)!;

  const { xValues, yValues, validIndices } = useMemo(() => {
    return extractValidPairs(
      obs.map((o) => o[xKey] as number | null),
      obs.map((o) => o[yKey] as number | null)
    );
  }, [obs, xKey, yKey]);

  const obsLabels = useMemo(() =>
    validIndices.map((i) => obs[i].label || `Obs ${i + 1}`),
    [validIndices, obs]
  );

  const pearsonResult = useMemo(() =>
    calculatePearson({ xValues, yValues, xLabel: xMeta.label, yLabel: yMeta.label }),
    [xValues, yValues, xMeta.label, yMeta.label]
  );

  const spearmanResult = useMemo(() =>
    calculateSpearman(xValues, yValues, xMeta.label, yMeta.label, obsLabels),
    [xValues, yValues, xMeta.label, yMeta.label, obsLabels]
  );

  const primaryR = method === 'Pearson' ? pearsonResult.r : spearmanResult.rho;
  const interpretation = useMemo(() =>
    interpretCorrelation(primaryR, xMeta.label, yMeta.label, method),
    [primaryR, xMeta.label, yMeta.label, method]
  );

  const n = xValues.length;

  // Dynamic problem statement
  const problemStatement = `We are applying ${method} correlation to ${xMeta.label} (${xMeta.unit || 'dimensionless'}) and ${yMeta.label} (${yMeta.unit || 'dimensionless'}) to determine whether higher ${xMeta.label} tends to be associated with higher (or lower) ${yMeta.label} in the selected ${n} observations.`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Formula in Action</h1>
        <p className="text-slate-400 text-sm mt-1">
          See every formula, symbol, and calculation step applied to your actual data.
        </p>
      </div>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {/* Controls */}
      <Card title="Variable & Method Selection">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              First Variable (X)
            </label>
            <select
              value={xKey}
              onChange={(e) => setXKey(e.target.value as MetricKey)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_NUMERIC_METRICS.filter((k) => k !== yKey).map((k) => {
                const m = METRIC_META.find((mm) => mm.key === k)!;
                return <option key={k} value={k}>{m.label} ({m.unit || 'count'})</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Second Variable (Y)
            </label>
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value as MetricKey)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_NUMERIC_METRICS.filter((k) => k !== xKey).map((k) => {
                const m = METRIC_META.find((mm) => mm.key === k)!;
                return <option key={k} value={k}>{m.label} ({m.unit || 'count'})</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Method
            </label>
            <div className="flex gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    method === m
                      ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Problem Statement */}
      <Card>
        <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
          Problem Statement
        </h2>
        <p className="text-slate-200 text-sm leading-relaxed">{problemStatement}</p>
        <p className="text-xs text-slate-500 mt-2">
          Valid observations used: <strong className="text-slate-300">{n}</strong>
          {' '}/ {obs.length} total (pairs where both {xMeta.label} and {yMeta.label} are present).
        </p>
      </Card>

      {n < 2 ? (
        <Alert type="error" title="Insufficient Data">
          At least 2 valid paired observations are required. Currently only {n} valid pair{n === 1 ? '' : 's'} found
          for {xMeta.label} and {yMeta.label}. Add more observations or select different variables.
        </Alert>
      ) : (
        <>
          {method === 'Pearson' ? (
            <PearsonWalkthrough
              xValues={xValues}
              yValues={yValues}
              obsLabels={obsLabels}
              xMeta={xMeta}
              yMeta={yMeta}
              result={pearsonResult}
            />
          ) : (
            <SpearmanWalkthrough
              xValues={xValues}
              yValues={yValues}
              obsLabels={obsLabels}
              xMeta={xMeta}
              yMeta={yMeta}
              result={spearmanResult}
            />
          )}

          {/* Result summary */}
          <Card className="border-blue-700/30 bg-blue-900/10">
            <h2 className="text-sm font-bold text-white mb-3">Result</h2>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">
                  {method === 'Pearson' ? 'r' : 'ρ'}
                </p>
                <p className="text-3xl font-bold font-mono text-blue-300">
                  {primaryR !== null ? primaryR.toFixed(4) : 'Undefined'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <StrengthBadge strength={interpretation.strength} />
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  interpretation.direction === 'Positive'
                    ? 'bg-green-900/30 text-green-300 border-green-700/30'
                    : interpretation.direction === 'Negative'
                    ? 'bg-red-900/30 text-red-300 border-red-700/30'
                    : 'bg-slate-800/50 text-slate-400 border-slate-600/30'
                }`}>
                  {interpretation.direction}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">{interpretation.summary}</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{interpretation.engineeringNote}</p>
            <p className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">{interpretation.limitationNote}</p>
          </Card>

          {/* Method Comparison */}
          <Card title="Method Comparison — Same Variables">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
              <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2">Pearson r</p>
                <p className="text-2xl font-bold font-mono text-white mb-1">
                  {pearsonResult.r !== null ? pearsonResult.r.toFixed(4) : 'Undefined'}
                </p>
                <p className="text-xs text-slate-400">
                  Measures <em>linear</em> association on the original values.
                  {pearsonResult.undefined_reason && (
                    <span className="text-amber-400"> {pearsonResult.undefined_reason}</span>
                  )}
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-4">
                <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide mb-2">
                  Spearman ρ {spearmanResult.usedPearsonOnRanks && '(Pearson on ranks — ties)'}
                </p>
                <p className="text-2xl font-bold font-mono text-white mb-1">
                  {spearmanResult.rho !== null ? spearmanResult.rho.toFixed(4) : 'Undefined'}
                </p>
                <p className="text-xs text-slate-400">
                  Measures <em>monotonic</em> association through ranks.{' '}
                  {spearmanResult.hasTies && 'Tied ranks present — used Pearson-on-ranks method.'}
                  {spearmanResult.undefined_reason && (
                    <span className="text-amber-400"> {spearmanResult.undefined_reason}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 bg-slate-900/30 rounded-lg p-3">
              <strong className="text-slate-400">Interpreting the comparison:</strong>{' '}
              Similar Pearson and Spearman values suggest the relationship is approximately linear with no strong rank reversals.
              Noticeably different values may indicate nonlinearity, outliers, or ties that alter the rank structure.
              Neither difference nor similarity alone confirms a particular cause.
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ---- Pearson Step-by-Step Walkthrough ----------------------

function PearsonWalkthrough({ xValues: _xValues, yValues: _yValues, obsLabels, xMeta, yMeta, result }: {
  xValues: number[];
  yValues: number[];
  obsLabels: string[];
  xMeta: typeof METRIC_META[0];
  yMeta: typeof METRIC_META[0];
  result: ReturnType<typeof calculatePearson>;
}) {
  return (
    <div className="space-y-5">
      {/* Formula */}
      <Card>
        <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
          WHERE — The Pearson Formula
        </h2>
        <PearsonFormula />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[
            ['r', 'Pearson correlation coefficient'],
            ['xᵢ, yᵢ', 'Individual observations'],
            ['x̄, ȳ', 'Means of X and Y'],
            ['n', `Number of valid pairs (${result.n})`],
            ['Σ', 'Summation over all n pairs'],
            ['(xᵢ−x̄)', 'Deviation of xᵢ from mean'],
            ['(yᵢ−ȳ)', 'Deviation of yᵢ from mean'],
          ].map(([sym, desc]) => (
            <div key={sym} className="bg-slate-900/50 rounded px-2 py-1.5 text-xs">
              <span className="font-mono text-blue-300 mr-1">{sym}</span>
              <span className="text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          <strong className="text-slate-400">WHY Pearson?</strong>{' '}
          Pearson r measures the strength of the <em>linear</em> relationship between two continuous variables.
          It is appropriate when both variables are numeric and we want to quantify how closely changes in {xMeta.label} correspond to proportional changes in {yMeta.label}.
        </p>
      </Card>

      {/* Observations used */}
      <Card title={`Observations Used — ${xMeta.label} (X) and ${yMeta.label} (Y)`} noPadding>
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Obs</th>
                <th>X: {xMeta.label} ({xMeta.unit})</th>
                <th>Y: {yMeta.label} ({yMeta.unit || 'ms'})</th>
                <th>xᵢ − x̄</th>
                <th>yᵢ − ȳ</th>
                <th>(xᵢ−x̄)²</th>
                <th>(yᵢ−ȳ)²</th>
                <th>(xᵢ−x̄)(yᵢ−ȳ)</th>
              </tr>
            </thead>
            <tbody>
              {result.deviationRows.map((row, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{obsLabels[i]}</td>
                  <td className="font-mono">{row.x}</td>
                  <td className="font-mono text-blue-300">{row.y}</td>
                  <td className={`font-mono text-xs ${row.xDev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.xDev.toFixed(4)}</td>
                  <td className={`font-mono text-xs ${row.yDev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.yDev.toFixed(4)}</td>
                  <td className="font-mono text-xs">{row.xDevSq.toFixed(4)}</td>
                  <td className="font-mono text-xs">{row.yDevSq.toFixed(4)}</td>
                  <td className={`font-mono text-xs font-semibold ${row.product >= 0 ? 'text-violet-300' : 'text-orange-300'}`}>{row.product.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-600">
                <td colSpan={2} className="font-semibold text-slate-300">Totals / Means</td>
                <td></td>
                <td className="font-mono text-xs text-slate-500">{result.sumXDev.toFixed(4)}</td>
                <td className="font-mono text-xs text-slate-500">{result.sumYDev.toFixed(4)}</td>
                <td className="font-mono font-bold text-amber-300">{result.sumXDevSq.toFixed(4)}</td>
                <td className="font-mono font-bold text-amber-300">{result.sumYDevSq.toFixed(4)}</td>
                <td className="font-mono font-bold text-violet-300">{result.sumProduct.toFixed(4)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Substitution */}
      <Card>
        <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
          Substitution — Actual Values Into the Formula
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <p><span className="font-mono text-blue-300">n</span> = <strong className="text-white">{result.n}</strong> valid pairs</p>
            <p><span className="font-mono text-blue-300">x̄</span> ({xMeta.label}) = <strong className="text-white">{result.xMean.toFixed(4)}</strong> {xMeta.unit}</p>
            <p><span className="font-mono text-blue-300">ȳ</span> ({yMeta.label}) = <strong className="text-white">{result.yMean.toFixed(4)}</strong> {yMeta.unit || 'ms'}</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <p><span className="font-mono text-violet-300">Σ(xᵢ−x̄)(yᵢ−ȳ)</span> = <strong className="text-white">{result.sumProduct.toFixed(6)}</strong></p>
            <p><span className="font-mono text-amber-300">Σ(xᵢ−x̄)²</span> = <strong className="text-white">{result.sumXDevSq.toFixed(6)}</strong></p>
            <p><span className="font-mono text-amber-300">Σ(yᵢ−ȳ)²</span> = <strong className="text-white">{result.sumYDevSq.toFixed(6)}</strong></p>
          </div>
        </div>
        <div className="mt-4 bg-slate-900/60 border border-slate-700/40 rounded-lg p-4 font-mono text-sm">
          <p className="text-slate-400 mb-1">r =</p>
          <p className="text-white">
            {result.sumProduct.toFixed(6)} / √({result.sumXDevSq.toFixed(6)} × {result.sumYDevSq.toFixed(6)})
          </p>
          <p className="text-slate-400 mt-1 mb-1">r =</p>
          <p className="text-white">
            {result.sumProduct.toFixed(6)} / √({round(result.sumXDevSq * result.sumYDevSq, 6)})
          </p>
          <p className="text-slate-400 mt-1 mb-1">r =</p>
          <p className="text-white">
            {result.sumProduct.toFixed(6)} / {round(Math.sqrt(result.sumXDevSq * result.sumYDevSq), 6)}
          </p>
          <p className="text-blue-300 font-bold mt-2">
            r = {result.r !== null ? result.r.toFixed(6) : 'Undefined'}
          </p>
        </div>
        {result.undefined_reason && (
          <Alert type="warning" className="mt-3">{result.undefined_reason}</Alert>
        )}
      </Card>
    </div>
  );
}

// ---- Spearman Step-by-Step Walkthrough ----------------------

function SpearmanWalkthrough({ xValues: _xValues, yValues: _yValues, obsLabels, xMeta, yMeta, result }: {
  xValues: number[];
  yValues: number[];
  obsLabels: string[];
  xMeta: typeof METRIC_META[0];
  yMeta: typeof METRIC_META[0];
  result: ReturnType<typeof calculateSpearman>;
}) {
  const n = result.n;
  const denominator = n > 0 ? n * (n * n - 1) : 0;

  return (
    <div className="space-y-5">
      {/* Formula */}
      <Card>
        <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
          WHERE — The Spearman Formula
        </h2>
        {!result.hasTies ? (
          <>
            <SpearmanFormula />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {[
                ['ρ (rho)', 'Spearman rank correlation coefficient'],
                ['d', 'Difference between paired ranks: rank(xᵢ) − rank(yᵢ)'],
                ['Σd²', 'Sum of squared rank differences'],
                ['n', `Number of paired observations (${n})`],
              ].map(([sym, desc]) => (
                <div key={sym} className="bg-slate-900/50 rounded px-2 py-1.5 text-xs">
                  <span className="font-mono text-violet-300 mr-1">{sym}</span>
                  <span className="text-slate-400">{desc}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <Alert type="info" className="mb-3">
              <strong>Tied ranks detected.</strong> The simplified formula ρ = 1 − 6Σd²/n(n²−1) assumes no ties.
              Because tied values exist in this dataset, average ranks have been assigned and the{' '}
              <strong>Pearson correlation coefficient is calculated on the two rank arrays</strong>.
              This is the standard correction for tied ranks.
            </Alert>
            <div className="my-3 py-4 px-6 bg-slate-900/70 border border-violet-800/30 rounded-xl text-center">
              <span className="text-violet-300 font-bold text-xl italic">ρ</span>
              <span className="text-slate-300 mx-2">=</span>
              <span className="text-blue-200 italic">r</span>
              <sub className="text-xs text-slate-400">rank(X), rank(Y)</sub>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Where average ranks are assigned to tied values (e.g., if two observations tie for 3rd place, both receive rank 3.5).
            </p>
          </>
        )}
        <p className="text-xs text-slate-500 mt-3">
          <strong className="text-slate-400">WHY Spearman?</strong>{' '}
          Spearman ρ measures <em>monotonic</em> association — whether one variable tends to increase (or decrease)
          as the other increases, without requiring the relationship to be linear.
          It is more robust to outliers than Pearson r.
        </p>
      </Card>

      {/* Rank table */}
      <Card title="Rank Assignment and Differences" noPadding>
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Obs</th>
                <th>X: {xMeta.label}</th>
                <th>Y: {yMeta.label}</th>
                <th>Rank X</th>
                <th>Rank Y</th>
                <th>d = RX − RY</th>
                <th>d²</th>
              </tr>
            </thead>
            <tbody>
              {result.rankRows.map((row, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{obsLabels[i]}</td>
                  <td className="font-mono">{row.x}</td>
                  <td className="font-mono text-blue-300">{row.y}</td>
                  <td className={`font-mono text-violet-300 ${!Number.isInteger(row.rankX) ? 'italic' : ''}`}>
                    {row.rankX}{!Number.isInteger(row.rankX) ? ' ★' : ''}
                  </td>
                  <td className={`font-mono text-violet-300 ${!Number.isInteger(row.rankY) ? 'italic' : ''}`}>
                    {row.rankY}{!Number.isInteger(row.rankY) ? ' ★' : ''}
                  </td>
                  <td className={`font-mono text-xs ${row.d >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.d.toFixed(2)}</td>
                  <td className="font-mono text-xs text-amber-300 font-semibold">{row.dSq.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-600">
                <td colSpan={5} className="font-semibold text-slate-300">Sum</td>
                <td></td>
                <td className="font-mono font-bold text-amber-300">Σd² = {result.sumDSq.toFixed(4)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {result.hasTies && (
          <p className="text-xs text-amber-400/80 px-4 py-2">★ Average rank assigned due to tied values.</p>
        )}
      </Card>

      {/* Substitution */}
      <Card>
        <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
          Substitution — Actual Values Into the Formula
        </h2>
        {!result.hasTies ? (
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-4 font-mono text-sm space-y-2">
            <p><span className="text-slate-400">n =</span> <span className="text-white">{n}</span></p>
            <p><span className="text-slate-400">Σd² =</span> <span className="text-white">{result.sumDSq.toFixed(4)}</span></p>
            <p><span className="text-slate-400">n(n² − 1) =</span> <span className="text-white">{n}({n}² − 1) = {n}({n * n - 1}) = {denominator}</span></p>
            <p><span className="text-slate-400">ρ =</span> <span className="text-white">1 − (6 × {result.sumDSq.toFixed(4)}) / {denominator}</span></p>
            <p><span className="text-slate-400">ρ =</span> <span className="text-white">1 − {round(6 * result.sumDSq, 6)} / {denominator}</span></p>
            <p><span className="text-slate-400">ρ =</span> <span className="text-white">1 − {round((6 * result.sumDSq) / denominator, 6)}</span></p>
            <p className="text-violet-300 font-bold">ρ = {result.rho !== null ? result.rho.toFixed(6) : 'Undefined'}</p>
          </div>
        ) : (
          result.pearsonOnRanks && (
            <div className="space-y-2 text-sm">
              <p className="text-slate-400 text-xs">Because ties exist, Pearson r is applied to the rank arrays:</p>
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-4 font-mono text-sm space-y-1">
                <p><span className="text-slate-400">rank(X) mean =</span> <span className="text-white">{result.pearsonOnRanks.xMean.toFixed(4)}</span></p>
                <p><span className="text-slate-400">rank(Y) mean =</span> <span className="text-white">{result.pearsonOnRanks.yMean.toFixed(4)}</span></p>
                <p><span className="text-slate-400">Σ(rX−r̄X)(rY−r̄Y) =</span> <span className="text-white">{result.pearsonOnRanks.sumProduct.toFixed(6)}</span></p>
                <p><span className="text-slate-400">Σ(rX−r̄X)² =</span> <span className="text-white">{result.pearsonOnRanks.sumXDevSq.toFixed(6)}</span></p>
                <p><span className="text-slate-400">Σ(rY−r̄Y)² =</span> <span className="text-white">{result.pearsonOnRanks.sumYDevSq.toFixed(6)}</span></p>
                <p className="text-violet-300 font-bold">ρ = {result.rho !== null ? result.rho.toFixed(6) : 'Undefined'}</p>
              </div>
            </div>
          )
        )}
        {result.undefined_reason && (
          <Alert type="warning" className="mt-3">{result.undefined_reason}</Alert>
        )}
      </Card>
    </div>
  );
}
