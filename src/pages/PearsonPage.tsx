import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import { DemoBanner } from '../components/ui/Alert';
import { StrengthBadge } from '../components/ui/Badge';
import { PearsonFormula } from '../components/formula/MathFormula';
import { calculatePearson, extractValidPairs } from '../engine/pearson';
import { interpretCorrelation } from '../lib/interpretation';
import { METRIC_META, ELIGIBLE_X_METRICS } from '../data/metricMeta';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

export default function PearsonPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  // Calculate Pearson for all eligible X metrics vs response time
  const analyses = useMemo(() => {
    return ELIGIBLE_X_METRICS.map((xKey) => {
      const xMeta = METRIC_META.find((m) => m.key === xKey)!;
      const yMeta = METRIC_META.find((m) => m.key === 'responseTime')!;
      const { xValues, yValues } = extractValidPairs(
        obs.map((o) => o[xKey] as number | null),
        obs.map((o) => o.responseTime)
      );
      const result = calculatePearson({ xValues, yValues, xLabel: xMeta.label, yLabel: yMeta.label });
      const interp = interpretCorrelation(result.r, xMeta.label, yMeta.label, 'Pearson');
      return { xKey, xMeta, yMeta, result, interp };
    });
  }, [obs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Pearson Correlation Analysis</h1>
          <p className="text-slate-400 text-sm mt-1">
            Linear association between each metric and average response time.
          </p>
        </div>
        <Link to="/app/formula" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
          Full step-by-step walkthrough <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {/* Formula reminder */}
      <Card>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Formula</p>
        <PearsonFormula />
        <p className="text-xs text-slate-500 mt-2">
          Strength bands (educational guidelines): 0.00–0.19 Very Weak · 0.20–0.39 Weak · 0.40–0.59 Moderate · 0.60–0.79 Strong · 0.80–1.00 Very Strong
        </p>
      </Card>

      {/* Results table */}
      <Card title="Pearson Coefficients — All Metrics vs Response Time" noPadding>
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Metric (X)</th>
                <th>vs. Response Time (Y)</th>
                <th>r</th>
                <th>|r|</th>
                <th>n</th>
                <th>Strength</th>
                <th>Direction</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {analyses
                .sort((a, b) => (b.result.r !== null ? Math.abs(b.result.r) : 0) - (a.result.r !== null ? Math.abs(a.result.r) : 0))
                .map(({ xKey, xMeta, result, interp }) => (
                  <tr key={xKey}>
                    <td className="font-medium text-slate-200">{xMeta.label}</td>
                    <td className="text-slate-400">Avg Response Time</td>
                    <td className={`font-mono font-semibold ${result.r !== null && result.r >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {result.r !== null ? result.r.toFixed(4) : 'N/A'}
                    </td>
                    <td className="font-mono text-slate-300">
                      {result.r !== null ? Math.abs(result.r).toFixed(4) : '—'}
                    </td>
                    <td className="text-slate-400">{result.n}</td>
                    <td><StrengthBadge strength={interp.strength} /></td>
                    <td className="text-xs text-slate-400">{interp.direction}</td>
                    <td>
                      <Link
                        to={`/app/formula?x=${xKey}&y=responseTime&method=Pearson`}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Individual scatter plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {analyses.map(({ xKey, xMeta, result }) => {
          const chartData = obs
            .filter((o) => o[xKey] !== null && o.responseTime !== null)
            .map((o) => ({ x: o[xKey] as number, y: o.responseTime as number, name: o.label }));

          return (
            <Card key={xKey}>
              <p className="text-sm font-semibold text-slate-200 mb-1">
                {xMeta.label} vs Response Time
              </p>
              <p className="text-xs text-slate-500 mb-3">
                r = <span className="font-mono text-blue-300">{result.r !== null ? result.r.toFixed(4) : 'N/A'}</span>
                {' '}· n = {result.n}
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 5, right: 5, bottom: 15, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={xMeta.label}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: `${xMeta.label} (${xMeta.unit})`, position: 'insideBottomRight', offset: -5, style: { fill: '#64748b', fontSize: 10 } }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Response Time"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    label={{ value: 'RT (ms)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', fontSize: '12px', color: '#f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    content={({ payload }) => {
                      if (!payload || payload.length < 2) return null;
                      const xVal = payload.find(p => p.dataKey === 'x');
                      const yVal = payload.find(p => p.dataKey === 'y');
                      return (
                        <div style={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                          <p style={{ color: '#94a3b8', margin: '0 0 4px 0', fontWeight: 600 }}>
                            {xMeta.label} ({xMeta.unit}):
                            <span style={{ color: '#f1f5f9', marginLeft: 6 }}>{xVal?.value}</span>
                          </p>
                          <p style={{ color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                            Response Time (ms):
                            <span style={{ color: '#60a5fa', marginLeft: 6 }}>{yVal?.value}</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={chartData} fill={xMeta.color} fillOpacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          );
        })}
      </div>

      {/* Interpretation guidelines */}
      <Card title="Interpretation Guidelines">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          {[
            { range: '0.00–0.19', label: 'Very Weak', color: 'text-slate-400' },
            { range: '0.20–0.39', label: 'Weak', color: 'text-orange-400' },
            { range: '0.40–0.59', label: 'Moderate', color: 'text-yellow-400' },
            { range: '0.60–0.79', label: 'Strong', color: 'text-blue-400' },
            { range: '0.80–1.00', label: 'Very Strong', color: 'text-green-400' },
          ].map(({ range, label, color }) => (
            <div key={label} className="bg-slate-900/40 rounded-lg p-3 text-center">
              <p className={`text-sm font-bold ${color}`}>{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">|r| = {range}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          These bands are educational guidelines, not universal statistical standards.
          Correlation measures association strength, not causation.
          Statistical significance is not reported here — small datasets may show high |r| by chance.
        </p>
      </Card>
    </div>
  );
}
