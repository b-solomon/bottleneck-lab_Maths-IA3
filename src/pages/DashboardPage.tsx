import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, BarChart3, Zap, Target, Database,
  Calculator, Activity, ArrowRight, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../App';
import Card, { CardGrid } from '../components/ui/Card';
import { DemoBanner } from '../components/ui/Alert';
import { calculatePearson, extractValidPairs } from '../engine/pearson';
import { runBottleneckAnalysis, getStrength } from '../engine/bottleneck';
import { StrengthBadge } from '../components/ui/Badge';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';

export default function DashboardPage() {
  const { auth, datasetState, isDemo } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  const topPair = useMemo(() => {
    const candidates = runBottleneckAnalysis(obs);
    return candidates[0] ?? null;
  }, [obs]);

  const cpuVsRT = useMemo(() => {
    const xs = obs.map((o) => o.cpu);
    const ys = obs.map((o) => o.responseTime);
    const { xValues, yValues } = extractValidPairs(xs, ys);
    return calculatePearson({ xValues, yValues, xLabel: 'CPU', yLabel: 'Response Time' });
  }, [obs]);

  const chartData = useMemo(() =>
    obs.map((o, i) => ({
      name: o.label || `Obs ${i + 1}`,
      cpu: o.cpu,
      responseTime: o.responseTime,
      memory: o.memory,
    })),
    [obs]
  );

  const statsCards = [
    { label: 'Observations', value: obs.length, icon: Database, color: 'text-blue-400' },
    {
      label: 'Top Candidate',
      value: topPair?.metricLabel ?? 'N/A',
      sub: topPair ? `r = ${topPair.pearsonR?.toFixed(3) ?? 'N/A'}` : '',
      icon: Target,
      color: 'text-red-400',
    },
    {
      label: 'CPU vs RT (Pearson)',
      value: cpuVsRT.r !== null ? cpuVsRT.r.toFixed(4) : 'N/A',
      sub: getStrength(cpuVsRT.r !== null ? Math.abs(cpuVsRT.r) : null),
      icon: TrendingUp,
      color: 'text-violet-400',
    },
    {
      label: 'Data Mode',
      value: dataset.meta.mode === 'simulated' ? 'Simulated' : 'Measured',
      sub: dataset.meta.name,
      icon: Activity,
      color: dataset.meta.mode === 'simulated' ? 'text-amber-400' : 'text-green-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isDemo ? 'Bottleneck Lab — Demo' : `Welcome back, ${auth.user?.displayName ?? 'User'}`}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pearson & Spearman correlation analysis for system performance
          </p>
        </div>
        <Link
          to="/presentation"
          className="inline-flex items-center gap-2 bg-violet-700/30 border border-violet-600/40 text-violet-300 hover:bg-violet-700/50 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Zap className="w-4 h-4" />
          Presentation Mode
        </Link>
      </div>

      {/* Demo banner */}
      {dataset.meta.mode === 'simulated' && (
        <DemoBanner />
      )}

      {/* Stats */}
      <CardGrid cols={4}>
        {statsCards.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center flex-shrink-0">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-lg font-bold text-white truncate">{String(value)}</p>
              {sub && <p className="text-xs text-slate-500 truncate">{String(sub)}</p>}
            </div>
          </Card>
        ))}
      </CardGrid>

      {/* Chart */}
      <Card title="Performance Overview" noPadding>
        <div className="px-5 pb-5">
          <p className="text-xs text-slate-500 mb-4 mt-3">
            CPU utilization (%) and response time (ms) across observations.{' '}
            {dataset.meta.mode === 'simulated' && (
              <span className="text-amber-400">Simulated data.</span>
            )}
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'CPU %', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#64748b', fontSize: 10 } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'RT ms', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#64748b', fontSize: 10 } }}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', fontSize: '12px', color: '#f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line yAxisId="left" type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} dot={false} name="CPU %" />
              <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} dot={false} name="Response Time (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { to: '/app/formula', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-900/10 border-amber-700/20', title: 'Formula in Action', desc: 'See every calculation step with your data' },
            { to: '/app/bottleneck', icon: Target, color: 'text-red-400', bg: 'bg-red-900/10 border-red-700/20', title: 'Bottleneck Report', desc: 'Ranked candidates with evidence' },
            { to: '/app/solve', icon: Calculator, color: 'text-cyan-400', bg: 'bg-cyan-900/10 border-cyan-700/20', title: 'Solve a Problem', desc: 'Assignment-style step-by-step solution' },
            { to: '/app/heatmap', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-900/10 border-green-700/20', title: 'Correlation Heatmap', desc: 'Full correlation matrix' },
            { to: '/app/dataset', icon: Database, color: 'text-blue-400', bg: 'bg-blue-900/10 border-blue-700/20', title: 'Manage Dataset', desc: 'Add, edit, or import observations' },
            { to: '/app/guide', icon: Activity, color: 'text-violet-400', bg: 'bg-violet-900/10 border-violet-700/20', title: 'Math Guide', desc: 'Understand Pearson and Spearman' },
          ].map(({ to, icon: Icon, color, bg, title, desc }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 p-4 rounded-xl border ${bg} hover:border-opacity-60 transition-all group`}
            >
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{title}</p>
                <p className="text-xs text-slate-500 truncate">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottleneck summary */}
      {topPair && (
        <Card>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Top Statistical Candidate: {topPair.metricLabel}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pearson r = {topPair.pearsonR?.toFixed(4) ?? 'N/A'} &nbsp;|&nbsp;
                  Spearman ρ = {topPair.spearmanRho?.toFixed(4) ?? 'N/A'} &nbsp;|&nbsp;
                  n = {topPair.supportingObs} observations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StrengthBadge strength={topPair.strength} />
              <Link to="/app/bottleneck" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Full report <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 border-t border-slate-700/50 pt-3">
            ⚠ Correlation measures statistical association, not causation. A high coefficient does not confirm that this metric is the root cause of performance degradation.
          </p>
        </Card>
      )}
    </div>
  );
}
