import { useState, useMemo } from 'react';
import { Printer } from 'lucide-react';
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

type Method = 'Pearson' | 'Spearman';

export default function SolveProblemPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  const [xKey, setXKey] = useState<MetricKey>('cpu');
  const [yKey, setYKey] = useState<MetricKey>('responseTime');
  const [method, setMethod] = useState<Method>('Pearson');

  const xMeta = METRIC_META.find((m) => m.key === xKey)!;
  const yMeta = METRIC_META.find((m) => m.key === yKey)!;

  const { xValues, yValues, validIndices } = useMemo(() =>
    extractValidPairs(
      obs.map((o) => o[xKey] as number | null),
      obs.map((o) => o[yKey] as number | null)
    ),
    [obs, xKey, yKey]
  );

  const obsLabels = validIndices.map((i) => obs[i].label || `Obs ${i + 1}`);

  const pearsonResult = useMemo(() =>
    calculatePearson({ xValues, yValues, xLabel: xMeta.label, yLabel: yMeta.label }),
    [xValues, yValues, xMeta.label, yMeta.label]
  );

  const spearmanResult = useMemo(() =>
    calculateSpearman(xValues, yValues, xMeta.label, yMeta.label, obsLabels),
    [xValues, yValues, xMeta.label, yMeta.label, obsLabels]
  );

  const r = method === 'Pearson' ? pearsonResult.r : spearmanResult.rho;
  const interp = useMemo(() =>
    interpretCorrelation(r, xMeta.label, yMeta.label, method),
    [r, xMeta.label, yMeta.label, method]
  );

  const n = xValues.length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap no-print">
        <div>
          <h1 className="text-2xl font-bold text-white">Solve a Problem</h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete assignment-style solution from your active dataset.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 px-3 py-2 rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Solution
        </button>
      </div>

      {dataset.meta.mode === 'simulated' && (
        <div className="no-print">
          <DemoBanner />
        </div>
      )}

      {/* Variable selection */}
      <Card title="Select Variables and Method" className="no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Variable X</label>
            <select
              value={xKey}
              onChange={(e) => setXKey(e.target.value as MetricKey)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_NUMERIC_METRICS.filter((k) => k !== yKey).map((k) => {
                const m = METRIC_META.find((mm) => mm.key === k)!;
                return <option key={k} value={k}>{m.label}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Variable Y</label>
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value as MetricKey)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_NUMERIC_METRICS.filter((k) => k !== xKey).map((k) => {
                const m = METRIC_META.find((mm) => mm.key === k)!;
                return <option key={k} value={k}>{m.label}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Method</label>
            <div className="flex gap-2">
              {(['Pearson', 'Spearman'] as Method[]).map((m) => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    method === m ? 'bg-blue-600/20 border-blue-500/60 text-blue-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Print header (hidden on screen) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold text-black">Bottleneck Lab — Solution</h1>
        <p className="text-sm text-gray-600">System Bottleneck Identification Using Correlation and Rank Correlation</p>
        <p className="text-sm text-gray-600">Karunya Institute of Technology and Sciences</p>
        <p className="text-sm text-gray-500 mt-1">
          Dataset: {dataset.meta.name} · {dataset.meta.mode === 'simulated' ? 'SIMULATED DATA' : 'Measured Data'} · {n} observations
        </p>
      </div>

      {n < 2 ? (
        <Alert type="error" title="Insufficient Data">
          Need at least 2 valid paired observations for {xMeta.label} and {yMeta.label}. Found {n}.
        </Alert>
      ) : (
        <div className="space-y-5">
          {/* GIVEN */}
          <SectionBlock title="Given" number="1">
            <p className="text-sm text-slate-300 mb-3">
              {n} observations of <strong className="text-blue-300">{xMeta.label} ({xMeta.unit || 'dimensionless'})</strong> and{' '}
              <strong className="text-blue-300">{yMeta.label} ({yMeta.unit || 'units'})</strong> from the dataset "{dataset.meta.name}".
            </p>
            {dataset.meta.mode === 'simulated' && (
              <p className="text-xs text-amber-400 mb-3">Note: This dataset uses simulated data for demonstration purposes.</p>
            )}
            <div className="overflow-x-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>Obs</th>
                    {validIndices.map((vi, i) => <th key={vi}>{obsLabels[i]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-blue-300">{xMeta.label} ({xMeta.unit})</td>
                    {xValues.map((v, i) => <td key={i} className="font-mono">{v}</td>)}
                  </tr>
                  <tr>
                    <td className="font-medium text-violet-300">{yMeta.label} ({yMeta.unit || 'ms'})</td>
                    {yValues.map((v, i) => <td key={i} className="font-mono text-blue-200">{v}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>

          {/* TO FIND */}
          <SectionBlock title="To Find" number="2">
            <p className="text-sm text-slate-300">
              Calculate the <strong className="text-blue-300">{method} correlation coefficient</strong> between{' '}
              {xMeta.label} and {yMeta.label} using {n} paired observations to determine whether
              a statistical association exists.
            </p>
          </SectionBlock>

          {/* FORMULA */}
          <SectionBlock title="Formula" number="3">
            {method === 'Pearson' ? (
              <PearsonFormula />
            ) : (
              <>
                {!spearmanResult.hasTies ? (
                  <SpearmanFormula />
                ) : (
                  <>
                    <p className="text-sm text-slate-300 mb-2">
                      Tied values detected. Average ranks assigned; Pearson r applied to rank arrays:
                    </p>
                    <div className="my-3 py-4 px-6 bg-slate-900/70 border border-violet-800/30 rounded-xl text-center">
                      <span className="text-violet-300 font-bold text-xl italic">ρ</span>
                      <span className="text-slate-300 mx-2">=</span>
                      <span className="text-blue-200 italic">r</span>
                      <sub className="text-xs text-slate-400">rank(X), rank(Y)</sub>
                    </div>
                  </>
                )}
              </>
            )}
          </SectionBlock>

          {/* CALCULATION */}
          <SectionBlock title="Calculation" number="4">
            {method === 'Pearson' ? (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="data-table text-xs">
                    <thead>
                      <tr>
                        <th>Obs</th>
                        <th>xᵢ</th>
                        <th>yᵢ</th>
                        <th>xᵢ − x̄</th>
                        <th>yᵢ − ȳ</th>
                        <th>(xᵢ−x̄)²</th>
                        <th>(yᵢ−ȳ)²</th>
                        <th>(xᵢ−x̄)(yᵢ−ȳ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pearsonResult.deviationRows.map((row, i) => (
                        <tr key={i}>
                          <td className="font-medium">{obsLabels[i]}</td>
                          <td className="font-mono">{row.x}</td>
                          <td className="font-mono text-blue-300">{row.y}</td>
                          <td className={`font-mono ${row.xDev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.xDev.toFixed(4)}</td>
                          <td className={`font-mono ${row.yDev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.yDev.toFixed(4)}</td>
                          <td className="font-mono">{row.xDevSq.toFixed(4)}</td>
                          <td className="font-mono">{row.yDevSq.toFixed(4)}</td>
                          <td className={`font-mono font-semibold ${row.product >= 0 ? 'text-violet-300' : 'text-orange-300'}`}>{row.product.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-600 font-bold">
                        <td colSpan={5} className="text-slate-300">Sums</td>
                        <td className="font-mono text-amber-300">{pearsonResult.sumXDevSq.toFixed(4)}</td>
                        <td className="font-mono text-amber-300">{pearsonResult.sumYDevSq.toFixed(4)}</td>
                        <td className="font-mono text-violet-300">{pearsonResult.sumProduct.toFixed(4)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="bg-slate-900/40 rounded-lg p-3 text-xs text-slate-400">
                  x̄ ({xMeta.label}) = {pearsonResult.xMean.toFixed(4)} &nbsp;|&nbsp;
                  ȳ ({yMeta.label}) = {pearsonResult.yMean.toFixed(4)} &nbsp;|&nbsp;
                  n = {pearsonResult.n}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>Obs</th>
                      <th>xᵢ</th>
                      <th>yᵢ</th>
                      <th>Rank X</th>
                      <th>Rank Y</th>
                      <th>d</th>
                      <th>d²</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spearmanResult.rankRows.map((row, i) => (
                      <tr key={i}>
                        <td className="font-medium">{obsLabels[i]}</td>
                        <td className="font-mono">{row.x}</td>
                        <td className="font-mono text-blue-300">{row.y}</td>
                        <td className="font-mono text-violet-300">{row.rankX}</td>
                        <td className="font-mono text-violet-300">{row.rankY}</td>
                        <td className={`font-mono ${row.d >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.d.toFixed(2)}</td>
                        <td className="font-mono text-amber-300">{row.dSq.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600 font-bold">
                      <td colSpan={5} className="text-slate-300">Sum</td>
                      <td></td>
                      <td className="font-mono text-amber-300">Σd² = {spearmanResult.sumDSq.toFixed(4)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </SectionBlock>

          {/* SUBSTITUTION */}
          <SectionBlock title="Substitution" number="5">
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-4 font-mono text-sm space-y-1.5">
              {method === 'Pearson' ? (
                <>
                  <p className="text-slate-400">r = {pearsonResult.sumProduct.toFixed(6)} / √({pearsonResult.sumXDevSq.toFixed(6)} × {pearsonResult.sumYDevSq.toFixed(6)})</p>
                  <p className="text-slate-400">r = {pearsonResult.sumProduct.toFixed(6)} / √({round(pearsonResult.sumXDevSq * pearsonResult.sumYDevSq, 6)})</p>
                  <p className="text-slate-400">r = {pearsonResult.sumProduct.toFixed(6)} / {round(Math.sqrt(pearsonResult.sumXDevSq * pearsonResult.sumYDevSq), 6)}</p>
                  <p className="text-blue-300 font-bold text-base">r = {pearsonResult.r !== null ? pearsonResult.r.toFixed(6) : 'Undefined'}</p>
                </>
              ) : !spearmanResult.hasTies ? (
                <>
                  <p className="text-slate-400">ρ = 1 − (6 × {spearmanResult.sumDSq.toFixed(4)}) / ({n}({n}² − 1))</p>
                  <p className="text-slate-400">ρ = 1 − {round(6 * spearmanResult.sumDSq, 4)} / {n * (n * n - 1)}</p>
                  <p className="text-slate-400">ρ = 1 − {round((6 * spearmanResult.sumDSq) / (n * (n * n - 1)), 6)}</p>
                  <p className="text-violet-300 font-bold text-base">ρ = {spearmanResult.rho !== null ? spearmanResult.rho.toFixed(6) : 'Undefined'}</p>
                </>
              ) : (
                <>
                  <p className="text-amber-400 text-xs mb-2">Tied ranks present — Pearson on ranks applied.</p>
                  {spearmanResult.pearsonOnRanks && (
                    <>
                      <p className="text-slate-400">Σ(rX−r̄X)(rY−r̄Y) = {spearmanResult.pearsonOnRanks.sumProduct.toFixed(6)}</p>
                      <p className="text-slate-400">Σ(rX−r̄X)² = {spearmanResult.pearsonOnRanks.sumXDevSq.toFixed(6)}</p>
                      <p className="text-slate-400">Σ(rY−r̄Y)² = {spearmanResult.pearsonOnRanks.sumYDevSq.toFixed(6)}</p>
                    </>
                  )}
                  <p className="text-violet-300 font-bold text-base">ρ = {spearmanResult.rho !== null ? spearmanResult.rho.toFixed(6) : 'Undefined'}</p>
                </>
              )}
            </div>
          </SectionBlock>

          {/* RESULT */}
          <SectionBlock title="Result" number="6">
            <div className="flex flex-wrap items-center gap-5">
              <div>
                <p className="text-xs text-slate-400 mb-1">{method === 'Pearson' ? 'r' : 'ρ'} =</p>
                <p className="text-4xl font-bold font-mono text-blue-300">
                  {r !== null ? r.toFixed(4) : 'Undefined'}
                </p>
              </div>
              <div className="space-y-1.5">
                <StrengthBadge strength={interp.strength} />
                <p className="text-sm text-slate-300">{interp.strengthLabel} {interp.directionLabel} association</p>
                <p className="text-xs text-slate-500">n = {n} valid paired observations</p>
              </div>
            </div>
          </SectionBlock>

          {/* INTERPRETATION */}
          <SectionBlock title="Interpretation" number="7">
            <p className="text-sm text-slate-300 leading-relaxed mb-2">{interp.summary}</p>
            <p className="text-xs text-slate-500">{interp.limitationNote}</p>
          </SectionBlock>

          {/* APPLICATION */}
          <SectionBlock title="Application to Bottleneck Investigation" number="8">
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{interp.engineeringNote}</p>
            <p className="text-sm text-slate-400">
              This result is one piece of statistical evidence. A complete bottleneck investigation also
              requires profiling data, saturation analysis, queue measurements, and workload testing
              before identifying a root cause.
            </p>
          </SectionBlock>
        </div>
      )}
    </div>
  );
}

function SectionBlock({ title, number, children }: {
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 bg-slate-800/60 px-5 py-3 border-b border-slate-700/40">
        <span className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-600/50 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
