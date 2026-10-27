import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import { DemoBanner } from '../components/ui/Alert';
import { calculatePearson, extractValidPairs } from '../engine/pearson';
import { calculateSpearman } from '../engine/spearman';
import { METRIC_META, ALL_NUMERIC_METRICS } from '../data/metricMeta';
import type { MetricKey } from '../types';

// Diverging color scale: negative = red, zero = gray, positive = blue/green
function getHeatColor(r: number | null): string {
  if (r === null || isNaN(r)) return '#1e293b';
  if (r >= 0.8) return '#1d4ed8';
  if (r >= 0.6) return '#2563eb';
  if (r >= 0.4) return '#3b82f6';
  if (r >= 0.2) return '#60a5fa';
  if (r >= 0.05) return '#93c5fd';
  if (r >= -0.05) return '#475569';
  if (r >= -0.2) return '#fca5a5';
  if (r >= -0.4) return '#f87171';
  if (r >= -0.6) return '#ef4444';
  if (r >= -0.8) return '#dc2626';
  return '#b91c1c';
}

function getTextColor(r: number | null): string {
  if (r === null || isNaN(r)) return '#64748b';
  const abs = Math.abs(r);
  return abs >= 0.4 ? '#ffffff' : '#e2e8f0';
}

type Method = 'Pearson' | 'Spearman';

export default function HeatmapPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>('Pearson');

  const metrics = ALL_NUMERIC_METRICS;

  // Build full correlation matrix
  const matrix = useMemo(() => {
    return metrics.map((rowKey) =>
      metrics.map((colKey) => {
        if (rowKey === colKey) return { r: 1, n: obs.filter((o) => o[rowKey] !== null).length };

        const { xValues, yValues } = extractValidPairs(
          obs.map((o) => o[rowKey] as number | null),
          obs.map((o) => o[colKey] as number | null)
        );

        let r: number | null;
        let n: number;

        if (method === 'Pearson') {
          const res = calculatePearson({ xValues, yValues, xLabel: rowKey, yLabel: colKey });
          r = res.r;
          n = res.n;
        } else {
          const res = calculateSpearman(xValues, yValues, rowKey, colKey);
          r = res.rho;
          n = res.n;
        }

        return { r, n };
      })
    );
  }, [obs, method, metrics]);

  function handleCellClick(rowKey: MetricKey, colKey: MetricKey) {
    if (rowKey === colKey) return;
    navigate(`/app/formula?x=${rowKey}&y=${colKey}&method=${method}`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Correlation Heatmap</h1>
          <p className="text-slate-400 text-sm mt-1">
            Full correlation matrix across all performance metrics.
            Click any cell to open the Formula in Action walkthrough.
          </p>
        </div>
        <div className="flex gap-2">
          {(['Pearson', 'Spearman'] as Method[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                method === m
                  ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {/* Heatmap */}
      <Card noPadding>
        <div className="p-4 overflow-auto">
          <p className="text-xs text-slate-500 mb-3">
            {method} correlation coefficients. Click a cell to see the step-by-step calculation.
            Diagonal = 1 (perfect self-correlation).
          </p>
          <div
            role="table"
            aria-label={`${method} correlation matrix`}
            className="min-w-max"
          >
            {/* Header row */}
            <div className="flex" role="row">
              <div className="w-32 flex-shrink-0" role="columnheader" />
              {metrics.map((colKey) => (
                <div
                  key={colKey}
                  role="columnheader"
                  className="w-20 text-center text-xs text-slate-400 px-1 pb-2"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '80px' }}
                >
                  {METRIC_META.find((m) => m.key === colKey)?.label ?? colKey}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {metrics.map((rowKey, ri) => (
              <div key={rowKey} className="flex" role="row">
                <div
                  className="w-32 flex-shrink-0 text-xs text-slate-300 flex items-center pr-2 py-0.5"
                  role="rowheader"
                  style={{ fontSize: '11px' }}
                >
                  {METRIC_META.find((m) => m.key === rowKey)?.label ?? rowKey}
                </div>
                {metrics.map((colKey, ci) => {
                  const cell = matrix[ri][ci];
                  const r = cell.r;
                  const isDiag = rowKey === colKey;
                  const bg = getHeatColor(r);
                  const textColor = getTextColor(r);

                  return (
                    <button
                      key={colKey}
                      role="cell"
                      disabled={isDiag}
                      onClick={() => handleCellClick(rowKey as MetricKey, colKey as MetricKey)}
                      title={
                        isDiag
                          ? `${METRIC_META.find((m) => m.key === rowKey)?.label} — self`
                          : `${METRIC_META.find((m) => m.key === rowKey)?.label} vs ${METRIC_META.find((m) => m.key === colKey)?.label}: ${r?.toFixed(3) ?? 'N/A'} (n=${cell.n})`
                      }
                      aria-label={isDiag ? 'Diagonal' : `${method} r = ${r?.toFixed(3) ?? 'N/A'}`}
                      className="w-20 h-12 text-xs font-mono font-semibold border border-slate-900/50 transition-transform hover:scale-105 hover:z-10 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-default"
                      style={{ background: bg, color: textColor }}
                    >
                      {r !== null ? r.toFixed(2) : '—'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Color legend */}
      <Card title="Color Scale">
        <div className="mt-2">
          <div className="flex items-center gap-0">
            {[
              { r: -1, label: '−1.0' },
              { r: -0.7, label: '−0.7' },
              { r: -0.4, label: '−0.4' },
              { r: -0.1, label: '−0.1' },
              { r: 0, label: '0' },
              { r: 0.1, label: '+0.1' },
              { r: 0.4, label: '+0.4' },
              { r: 0.7, label: '+0.7' },
              { r: 1, label: '+1.0' },
            ].map(({ r, label }) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full h-6 rounded-sm"
                  style={{ background: getHeatColor(r) }}
                  aria-label={`${method} r = ${label}`}
                />
                <span className="text-xs text-slate-500 mt-0.5">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Strong negative</span>
            <span>Near zero</span>
            <span>Strong positive</span>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Coefficients are for {obs.length} observation{obs.length !== 1 ? 's' : ''} in the active dataset.
          Click any non-diagonal cell to open the full step-by-step calculation.
        </p>
      </Card>
    </div>
  );
}
