import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Activity } from 'lucide-react';
import { useAppContext } from '../App';
import { PearsonFormula, SpearmanFormula } from '../components/formula/MathFormula';
import { StrengthBadge } from '../components/ui/Badge';
import { calculatePearson, extractValidPairs, round } from '../engine/pearson';
import { calculateSpearman } from '../engine/spearman';
import { runBottleneckAnalysis } from '../engine/bottleneck';
import { interpretCorrelation } from '../lib/interpretation';

export default function PresentationPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;
  const navigate = useNavigate();

  const [stage, setStage] = useState(0);

  // Pre-compute CPU vs Response Time as the primary example
  const { xValues, yValues, validIndices } = useMemo(() =>
    extractValidPairs(
      obs.map((o) => o.cpu),
      obs.map((o) => o.responseTime)
    ),
    [obs]
  );

  const obsLabels = validIndices.map((i) => obs[i].label || `Obs ${i + 1}`);
  const pearson = useMemo(() =>
    calculatePearson({ xValues, yValues, xLabel: 'CPU Utilization', yLabel: 'Response Time' }),
    [xValues, yValues]
  );
  const spearman = useMemo(() =>
    calculateSpearman(xValues, yValues, 'CPU Utilization', 'Response Time', obsLabels),
    [xValues, yValues, obsLabels]
  );
  const candidates = useMemo(() => runBottleneckAnalysis(obs), [obs]);
  const interp = useMemo(() =>
    interpretCorrelation(pearson.r, 'CPU Utilization', 'Response Time', 'Pearson'),
    [pearson.r]
  );

  const STAGES = [
    // 0 - Title
    <Slide key="title" bg="from-blue-950 to-slate-950">
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-6">
          <Activity className="w-7 h-7 text-white" />
        </div>

        {/* Institution */}
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-2">
          Mathematics Microproject
        </p>
        <p className="text-slate-500 text-sm mb-6">
          Karunya Institute of Technology and Sciences
        </p>

        {/* Project Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            System Bottleneck Identification
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-300 mt-2">
            Using Correlation and Rank Correlation
          </h2>
        </div>

        {/* Divider */}
        <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full mb-8" />

        {/* Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
          {[
            { reg: 'URK25CS1191', name: 'BODDU SOLOMON' },
            { reg: 'URK25CS1161', name: 'MANISH BINU' },
            { reg: 'URK25CS1162', name: 'KOTHAPALLI SPOODY REX' },
            { reg: 'URK25CS1226', name: 'CHAVVA RAVI KUMAR REDDY' },
          ].map(({ reg, name }) => (
            <div
              key={reg}
              className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-left"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-mono text-blue-300">{reg}</p>
                <p className="text-sm font-bold text-white">{name}</p>
              </div>
            </div>
          ))}
        </div>

        {dataset.meta.mode === 'simulated' && (
          <div className="mt-6 bg-amber-900/20 border border-amber-500/30 px-4 py-2 rounded-lg text-amber-300 text-sm">
            ⚠ Dataset: {dataset.meta.name} — Simulated Data
          </div>
        )}
      </div>
    </Slide>,

    // 1 - Problem
    <Slide key="problem" bg="from-slate-950 to-navy-950">
      <SlideContent title="Problem Statement">
        <p className="text-xl text-slate-200 leading-relaxed">
          A web application is experiencing{' '}
          <span className="text-red-300 font-semibold">increasing response times</span> and{' '}
          <span className="text-red-300 font-semibold">reduced throughput</span> during periods of high traffic.
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['CPU', 'Memory', 'Disk I/O', 'Network'].map((m) => (
            <div key={m} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">⚡</p>
              <p className="text-slate-300 font-medium">{m}</p>
              <p className="text-xs text-slate-500 mt-1">suspect?</p>
            </div>
          ))}
        </div>
        <p className="text-slate-400 mt-6 text-lg">
          Which component is most strongly associated with response time degradation?
        </p>
      </SlideContent>
    </Slide>,

    // 2 - Why correlation
    <Slide key="why" bg="from-slate-950 to-violet-950/30">
      <SlideContent title="Why Correlation?">
        <div className="space-y-5 text-lg">
          <p className="text-slate-200">
            We need a mathematical tool to quantify how strongly each resource metric
            moves together with response time across our observations.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-5">
              <p className="text-blue-300 font-bold mb-2">Pearson r</p>
              <p className="text-slate-300">Measures <strong>linear association</strong> on the original values.</p>
            </div>
            <div className="bg-violet-900/20 border border-violet-700/30 rounded-xl p-5">
              <p className="text-violet-300 font-bold mb-2">Spearman ρ</p>
              <p className="text-slate-300">Measures <strong>monotonic association</strong> through ranks. More robust to outliers.</p>
            </div>
          </div>
          <p className="text-amber-300 text-base border border-amber-700/30 bg-amber-900/10 rounded-xl p-4">
            ⚠ Correlation shows statistical association. It does not prove causation.
          </p>
        </div>
      </SlideContent>
    </Slide>,

    // 3 - Dataset
    <Slide key="data" bg="from-slate-950 to-slate-900">
      <SlideContent title={`Dataset: ${dataset.meta.name}`}>
        <p className="text-slate-400 mb-4">
          {obs.length} observations · {dataset.meta.mode === 'simulated' ? '⚠ Simulated' : '✓ Measured'}
        </p>
        <div className="overflow-auto max-h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Obs', 'CPU %', 'Mem %', 'Disk %', 'Net %', 'RT (ms)', 'Queue'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-slate-400 text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obs.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-b border-slate-800/60">
                  <td className="px-3 py-2 text-slate-300 font-medium">{o.label}</td>
                  <td className="px-3 py-2 font-mono text-red-300">{o.cpu ?? '—'}</td>
                  <td className="px-3 py-2 font-mono">{o.memory ?? '—'}</td>
                  <td className="px-3 py-2 font-mono">{o.disk ?? '—'}</td>
                  <td className="px-3 py-2 font-mono">{o.network ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-blue-300 font-semibold">{o.responseTime ?? '—'}</td>
                  <td className="px-3 py-2 font-mono">{o.queueLength ?? '—'}</td>
                </tr>
              ))}
              {obs.length > 8 && (
                <tr><td colSpan={7} className="px-3 py-2 text-slate-500 text-xs">…and {obs.length - 8} more observations</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SlideContent>
    </Slide>,

    // 4 - Pearson Formula
    <Slide key="formula-pearson" bg="from-slate-950 to-blue-950/20">
      <SlideContent title="Pearson Formula">
        <div className="text-lg text-slate-300 mb-4">
          r = Pearson correlation coefficient · measures linear association
        </div>
        <PearsonFormula />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['r', 'Coefficient (−1 to +1)'],
            ['xᵢ, yᵢ', 'Individual observations'],
            ['x̄, ȳ', 'Arithmetic means'],
            ['n', `Valid pairs (${pearson.n})`],
          ].map(([sym, desc]) => (
            <div key={sym} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-blue-300 font-mono font-bold text-lg">{sym}</p>
              <p className="text-slate-400 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </SlideContent>
    </Slide>,

    // 5 - Spearman Formula
    <Slide key="formula-spearman" bg="from-slate-950 to-violet-950/20">
      <SlideContent title="Spearman Formula">
        <div className="text-lg text-slate-300 mb-4">
          ρ = Spearman rank correlation · measures monotonic association
        </div>
        <SpearmanFormula />
        {spearman.hasTies && (
          <div className="mt-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-sm text-amber-300">
            Tied values present in this dataset → Average ranks used → Pearson-on-ranks applied
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['ρ', 'Coefficient (−1 to +1)'],
            ['d', 'Rank difference: rank(xᵢ) − rank(yᵢ)'],
            ['Σd²', 'Sum of squared differences'],
          ].map(([sym, desc]) => (
            <div key={sym} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-violet-300 font-mono font-bold text-lg">{sym}</p>
              <p className="text-slate-400 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </SlideContent>
    </Slide>,

    // 6 - Step-by-step CPU vs RT
    <Slide key="steps" bg="from-slate-950 to-slate-900">
      <SlideContent title="Step-by-Step — CPU vs Response Time">
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div className="bg-blue-900/20 rounded-xl p-3">
            <p className="text-xs text-slate-400">x̄ CPU</p>
            <p className="text-2xl font-bold text-blue-300 font-mono">{pearson.xMean.toFixed(2)}</p>
          </div>
          <div className="bg-violet-900/20 rounded-xl p-3">
            <p className="text-xs text-slate-400">ȳ Response Time</p>
            <p className="text-2xl font-bold text-violet-300 font-mono">{pearson.yMean.toFixed(2)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3">
            <p className="text-xs text-slate-400">n pairs</p>
            <p className="text-2xl font-bold text-slate-200 font-mono">{pearson.n}</p>
          </div>
        </div>
        <div className="overflow-auto max-h-56 text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-2 py-1 text-left text-xs text-slate-400">Obs</th>
                <th className="px-2 py-1 text-left text-xs text-slate-400">CPU</th>
                <th className="px-2 py-1 text-left text-xs text-slate-400">RT</th>
                <th className="px-2 py-1 text-left text-xs text-slate-400">xᵢ−x̄</th>
                <th className="px-2 py-1 text-left text-xs text-slate-400">yᵢ−ȳ</th>
                <th className="px-2 py-1 text-left text-xs text-slate-400 font-bold">(xᵢ−x̄)(yᵢ−ȳ)</th>
              </tr>
            </thead>
            <tbody>
              {pearson.deviationRows.slice(0, 6).map((row, i) => (
                <tr key={i} className="border-b border-slate-800/60">
                  <td className="px-2 py-1 text-slate-300 font-medium">{obsLabels[i]}</td>
                  <td className="px-2 py-1 font-mono">{row.x}</td>
                  <td className="px-2 py-1 font-mono text-blue-300">{row.y}</td>
                  <td className={`px-2 py-1 font-mono ${row.xDev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.xDev.toFixed(2)}</td>
                  <td className={`px-2 py-1 font-mono ${row.yDev >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.yDev.toFixed(2)}</td>
                  <td className="px-2 py-1 font-mono font-bold text-violet-300">{row.product.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-slate-500">Showing first 6 of {pearson.n} observations</div>
      </SlideContent>
    </Slide>,

    // 7 - Substitution
    <Slide key="substitution" bg="from-slate-950 to-blue-950/20">
      <SlideContent title="Substitution — CPU vs Response Time">
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 font-mono text-lg space-y-3">
          <p><span className="text-slate-400">Σ(xᵢ−x̄)(yᵢ−ȳ) =</span> <span className="text-violet-300 font-bold">{pearson.sumProduct.toFixed(4)}</span></p>
          <p><span className="text-slate-400">Σ(xᵢ−x̄)² =</span> <span className="text-amber-300">{pearson.sumXDevSq.toFixed(4)}</span></p>
          <p><span className="text-slate-400">Σ(yᵢ−ȳ)² =</span> <span className="text-amber-300">{pearson.sumYDevSq.toFixed(4)}</span></p>
          <div className="border-t border-slate-700 pt-3">
            <p><span className="text-slate-400">r =</span> <span className="text-white">{pearson.sumProduct.toFixed(4)} / √({pearson.sumXDevSq.toFixed(4)} × {pearson.sumYDevSq.toFixed(4)})</span></p>
            <p><span className="text-slate-400">r =</span> <span className="text-white">{pearson.sumProduct.toFixed(4)} / {round(Math.sqrt(pearson.sumXDevSq * pearson.sumYDevSq), 4)}</span></p>
            <p className="text-blue-300 font-black text-2xl mt-2">r = {pearson.r?.toFixed(4) ?? 'N/A'}</p>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // 8 - Result
    <Slide key="result" bg="from-slate-950 to-green-950/20">
      <SlideContent title="Result — CPU vs Response Time">
        <div className="text-center py-4">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 mb-2">Pearson r</p>
              <p className="text-6xl font-black font-mono text-blue-300">{pearson.r?.toFixed(4) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">Spearman ρ</p>
              <p className="text-6xl font-black font-mono text-violet-300">{spearman.rho?.toFixed(4) ?? 'N/A'}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <StrengthBadge strength={interp.strength} />
            <span className={`px-3 py-1 rounded-full text-sm border ${
              interp.direction === 'Positive' ? 'bg-green-900/30 text-green-300 border-green-700/30' : 'bg-red-900/30 text-red-300 border-red-700/30'
            }`}>{interp.direction}</span>
          </div>
          <p className="text-slate-300 text-lg mt-6 max-w-xl mx-auto leading-relaxed">{interp.summary}</p>
        </div>
      </SlideContent>
    </Slide>,

    // 9 - Bottleneck ranking
    <Slide key="ranking" bg="from-slate-950 to-red-950/10">
      <SlideContent title="Bottleneck Candidate Ranking">
        <div className="space-y-3">
          {candidates.map((c) => (
            <div key={c.metricKey} className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/30 rounded-xl px-5 py-3">
              <span className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 ${
                c.rank === 1 ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}>{c.rank}</span>
              <span className="text-slate-200 font-medium flex-1">{c.metricLabel}</span>
              <span className="font-mono text-blue-300">r={c.pearsonR?.toFixed(3) ?? 'N/A'}</span>
              <span className="font-mono text-violet-300">ρ={c.spearmanRho?.toFixed(3) ?? 'N/A'}</span>
              <StrengthBadge strength={c.strength} />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">Ranked by |r|. Saturation data and further profiling required before drawing conclusions.</p>
      </SlideContent>
    </Slide>,

    // 10 - Engineering interpretation
    <Slide key="eng-interp" bg="from-slate-950 to-blue-950/10">
      <SlideContent title="Engineering Interpretation">
        <p className="text-xl text-slate-200 leading-relaxed mb-6">{interp.engineeringNote}</p>
        <div className="bg-amber-900/15 border border-amber-700/30 rounded-xl p-5">
          <p className="text-lg text-amber-300 font-semibold mb-2">What correlation tells us:</p>
          <p className="text-slate-300">Statistical evidence of association between the metric and response time in this dataset.</p>
          <p className="text-lg text-red-300 font-semibold mt-4 mb-2">What it does NOT tell us:</p>
          <p className="text-slate-300">Whether the metric is the root cause. Causation requires profiling, controlled testing, and domain analysis.</p>
        </div>
      </SlideContent>
    </Slide>,

    // 11 - Limitations
    <Slide key="limitations" bg="from-slate-950 to-slate-900">
      <SlideContent title="Limitations">
        <div className="space-y-3 text-lg">
          {[
            '⚠ Correlation ≠ Causation',
            `⚠ Small sample: ${obs.length} observations`,
            '⚠ Confounding variables are always possible',
            '⚠ Nonlinear relationships may show lower Pearson r',
            '⚠ Temporal dependence between consecutive measurements',
            dataset.meta.mode === 'simulated' ? '⚠ This demonstration uses SIMULATED data' : '✓ This analysis uses measured data',
          ].map((l, i) => (
            <p key={i} className={`${l.startsWith('✓') ? 'text-green-300' : 'text-slate-300'} flex items-start gap-2`}>{l}</p>
          ))}
        </div>
      </SlideContent>
    </Slide>,

    // 12 - Conclusion
    <Slide key="conclusion" bg="from-blue-950 to-violet-950/50">
      <SlideContent title="Conclusion">
        <p className="text-xl text-slate-200 leading-relaxed mb-6">
          Pearson and Spearman correlation provide a mathematically rigorous way to prioritize
          bottleneck investigation in system performance analysis.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {candidates.slice(0, 3).map((c) => (
            <div key={c.metricKey} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">#{c.rank}</p>
              <p className="text-white font-semibold">{c.metricLabel}</p>
              <p className="font-mono text-blue-300 text-lg">{c.pearsonR?.toFixed(3) ?? 'N/A'}</p>
              <StrengthBadge strength={c.strength} />
            </div>
          ))}
        </div>
        <p className="text-slate-400 text-base border-t border-slate-700/40 pt-4">
          Confirming the root cause requires profiling, saturation testing, and workload analysis —
          correlation is the starting point, not the conclusion.
        </p>
      </SlideContent>
    </Slide>,
  ];

  const total = STAGES.length;
  const current = STAGES[stage];

  return (
    <div className="min-h-screen bg-[#08091a] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/60 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white hidden sm:block">Bottleneck Lab</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">{stage + 1} / {total}</span>
          <div className="flex gap-1 items-center">
            {STAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStage(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === stage ? 'w-6 bg-blue-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => navigate(-1)}
            aria-label="Exit presentation"
            className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 overflow-hidden">{current}</div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/60 bg-slate-900/60">
        <button
          onClick={() => setStage((s) => Math.max(0, s - 1))}
          disabled={stage === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-mono">{stage + 1} of {total}</p>
        </div>

        <button
          onClick={() => setStage((s) => Math.min(total - 1, s + 1))}
          disabled={stage === total - 1}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
          aria-label="Next slide"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Slide({ children, bg }: { children: React.ReactNode; bg?: string }) {
  return (
    <div className={`h-full min-h-0 bg-gradient-to-br ${bg ?? 'from-slate-950 to-slate-900'} overflow-auto`}>
      {children}
    </div>
  );
}

function SlideContent({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 border-b border-slate-700/50 pb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
