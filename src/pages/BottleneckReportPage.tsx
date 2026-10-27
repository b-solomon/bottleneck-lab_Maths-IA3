import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Printer } from 'lucide-react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import Alert, { DemoBanner } from '../components/ui/Alert';
import { StrengthBadge } from '../components/ui/Badge';
import { runBottleneckAnalysis } from '../engine/bottleneck';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

export default function BottleneckReportPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  const [satThreshold, setSatThreshold] = useState(80);
  const [rankBy, setRankBy] = useState<'pearson' | 'spearman'>('pearson');

  const candidates = useMemo(
    () => runBottleneckAnalysis(obs, satThreshold, rankBy),
    [obs, satThreshold, rankBy]
  );

  const chartData = useMemo(() =>
    candidates.map((c) => ({
      name: c.metricLabel.replace(' Utilization', '').replace(' ', '\n'),
      pearson: c.pearsonR !== null ? parseFloat(Math.abs(c.pearsonR).toFixed(4)) : 0,
      spearman: c.spearmanRho !== null ? parseFloat(Math.abs(c.spearmanRho).toFixed(4)) : 0,
      pearsonRaw: c.pearsonR,
      spearmanRaw: c.spearmanRho,
    })),
    [candidates]
  );

  const topCandidate = candidates[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Bottleneck Identification Report</h1>
          <p className="text-slate-400 text-sm mt-1">
            Evidence-based ranking of potential bottleneck candidates.
            Correlation shows association, not causation.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-lg transition-colors no-print"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {/* Methodology note */}
      <Alert type="info" title="Methodology">
        Each candidate metric is correlated with average response time using both Pearson and Spearman methods.
        Candidates are ranked by the absolute value of the selected coefficient.
        High correlation is statistical evidence of association — it does not prove the metric is the root cause of performance degradation.
        Further investigation (profiling, saturation analysis, workload testing) is always required.
      </Alert>

      {/* Controls */}
      <Card title="Analysis Settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              Rank By
            </label>
            <div className="flex gap-2">
              {(['pearson', 'spearman'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setRankBy(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                    rankBy === m
                      ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  |{m === 'pearson' ? 'r|' : 'ρ|'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
              Saturation Threshold: {satThreshold}%
            </label>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={satThreshold}
              onChange={(e) => setSatThreshold(Number(e.target.value))}
              className="w-full accent-blue-500"
              aria-label="Saturation threshold percentage"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {satThreshold}% is used as the example threshold for saturation counts. It is not a universal standard.
            </p>
          </div>
        </div>
      </Card>

      {/* Top candidate highlight */}
      {topCandidate && topCandidate.pearsonR !== null && (
        <div className="bg-gradient-to-r from-amber-900/20 to-red-900/10 border border-amber-700/30 rounded-xl p-5">
          <div className="flex items-start gap-3 flex-wrap">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                Highest Statistical Candidate: {topCandidate.metricLabel}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                Pearson r = <span className="font-mono text-blue-300">{topCandidate.pearsonR.toFixed(4)}</span>
                {' '}| Spearman ρ = <span className="font-mono text-violet-300">{topCandidate.spearmanRho?.toFixed(4) ?? 'N/A'}</span>
                {' '}| n = {topCandidate.supportingObs} observations
              </p>
              <p className="text-xs text-slate-400 mt-2">{topCandidate.recommendation}</p>
              <div className="flex items-center gap-2 mt-3">
                <StrengthBadge strength={topCandidate.strength} />
                <span className="text-xs text-slate-500">
                  {topCandidate.saturationPct}% of observations ≥ {satThreshold}% utilization
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bar chart */}
      <Card title="Correlation with Response Time — Absolute Values">
        <div className="mt-3">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                interval={0}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                label={{ value: '|coefficient|', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', fontSize: '12px', color: '#f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number, name: string) => [value.toFixed(4), name === 'pearson' ? '|Pearson r|' : '|Spearman ρ|']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(v) => v === 'pearson' ? '|Pearson r|' : '|Spearman ρ|'} />
              <ReferenceLine y={0.6} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Strong (0.6)', fontSize: 10, fill: '#3b82f6' }} />
              <ReferenceLine y={0.4} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Moderate (0.4)', fontSize: 10, fill: '#f59e0b' }} />
              <Bar dataKey="pearson" fill="#3b82f6" radius={[3, 3, 0, 0]} name="pearson" />
              <Bar dataKey="spearman" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="spearman" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detailed candidate table */}
      <Card title="Candidate Details" noPadding>
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Metric</th>
                <th>Pearson r</th>
                <th>Spearman ρ</th>
                <th>Strength</th>
                <th>Direction</th>
                <th>Sat. {satThreshold}%</th>
                <th>n</th>
                <th>Step-by-step</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.metricKey}>
                  <td className="text-center">
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                      c.rank === 1 ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>{c.rank}</span>
                  </td>
                  <td className="font-medium text-slate-200">{c.metricLabel}</td>
                  <td className={`font-mono ${c.pearsonR !== null && c.pearsonR >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {c.pearsonR !== null ? c.pearsonR.toFixed(4) : 'N/A'}
                  </td>
                  <td className={`font-mono ${c.spearmanRho !== null && c.spearmanRho >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {c.spearmanRho !== null ? c.spearmanRho.toFixed(4) : 'N/A'}
                  </td>
                  <td><StrengthBadge strength={c.strength} /></td>
                  <td className="text-xs text-slate-400">{c.direction}</td>
                  <td className={`text-xs ${c.saturationPct >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {c.saturationPct}% of obs.
                  </td>
                  <td className="text-slate-400">{c.supportingObs}</td>
                  <td>
                    <Link
                      to={`/app/formula?x=${c.metricKey}&y=responseTime&method=${rankBy === 'pearson' ? 'Pearson' : 'Spearman'}`}
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

      {/* Recommendation details */}
      <Card title="Investigation Recommendations">
        <div className="space-y-3 mt-2">
          {candidates.map((c) => (
            <div key={c.metricKey} className="border-b border-slate-700/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-200">#{c.rank} {c.metricLabel}</span>
                <StrengthBadge strength={c.strength} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{c.recommendation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Limitations */}
      <Card title="Important Limitations">
        <div className="space-y-2 text-sm text-slate-400 mt-2">
          <p>⚠ <strong className="text-slate-300">Correlation ≠ Causation.</strong> A high coefficient shows statistical association between two variables in this dataset. It does not prove that one causes the other.</p>
          <p>⚠ <strong className="text-slate-300">Small sample sizes</strong> can produce high coefficients by chance. These observations are {obs.length} data points.</p>
          <p>⚠ <strong className="text-slate-300">Confounding variables</strong> (e.g., time-of-day, concurrent workloads) may explain observed associations.</p>
          <p>⚠ <strong className="text-slate-300">Saturation evidence</strong> (observations exceeding a utilization threshold) is additional context, not confirmation of a bottleneck.</p>
          <p>⚠ <strong className="text-slate-300">Throughput</strong> is analyzed separately because it may have a negative correlation with response time in some datasets, which requires different engineering interpretation.</p>
          {dataset.meta.mode === 'simulated' && (
            <p className="text-amber-300">⚠ This report uses <strong>simulated data</strong>. Results are illustrative only.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
