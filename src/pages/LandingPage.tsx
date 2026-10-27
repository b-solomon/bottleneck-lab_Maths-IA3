import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
  Grid3x3,
  Target,
  Calculator,
  ArrowRight,
  ChevronRight,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  BarChart2,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';
import { useAppContext } from '../App';

const FEATURES = [
  {
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-700/30',
    title: 'Pearson Correlation',
    desc: 'Measures linear association between performance metrics. Full step-by-step calculation with every intermediate value shown.',
  },
  {
    icon: BarChart3,
    color: 'text-violet-400',
    bg: 'bg-violet-900/20',
    border: 'border-violet-700/30',
    title: 'Spearman Rank Correlation',
    desc: 'Rank-based monotonic association. Correctly handles tied ranks with average-rank assignment.',
  },
  {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    title: 'Formula in Action',
    desc: 'Watch every symbol substituted with real data. Shows exactly where and why each formula is applied.',
  },
  {
    icon: Grid3x3,
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-700/30',
    title: 'Interactive Heatmaps',
    desc: 'Full correlation matrix across all performance metrics. Diverging color scale with drill-down to detailed calculations.',
  },
  {
    icon: Target,
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-700/30',
    title: 'Bottleneck Ranking',
    desc: 'Evidence-based candidate ranking with saturation analysis. Honest about what correlation can and cannot prove.',
  },
  {
    icon: Calculator,
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-700/30',
    title: 'Solve a Problem',
    desc: 'Generate a complete assignment-style solution from your data. Print-ready with all steps shown.',
  },
];

const STEPS = [
  { num: 1, icon: Server, title: 'Collect Observations', desc: 'Import CSV from performance tools or use the built-in demo dataset.' },
  { num: 2, icon: TrendingUp, title: 'Calculate Coefficients', desc: 'The engine computes Pearson and Spearman correlations automatically.' },
  { num: 3, icon: BarChart2, title: 'Compare Relationships', desc: 'View heatmaps, ranked candidates, and side-by-side method comparisons.' },
  { num: 4, icon: Target, title: 'Investigate Bottlenecks', desc: 'Use statistical evidence to prioritize further investigation.' },
];

export default function LandingPage() {
  const { auth, isDemo, setGuestMode } = useAppContext();
  const navigate = useNavigate();

  function handleTryDemo() {
    setGuestMode(true);
    navigate('/app/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0b0f1a]/90 backdrop-blur border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Bottleneck Lab</span>
          </div>
          <nav className="flex items-center gap-3" aria-label="Site navigation">
            <Link
              to="/app/guide"
              className="hidden sm:inline-flex text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Math Guide
            </Link>
            {auth.isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleTryDemo}
                  className="hidden sm:inline-flex text-sm text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 border border-emerald-700/40 rounded-lg hover:bg-emerald-900/20"
                >
                  🔬 Try Demo
                </button>
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-20 pb-24">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <FlaskConical className="w-3.5 h-3.5" />
            Mathematics Microproject — Karunya Institute of Technology and Sciences
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
              Find the Bottleneck.
            </span>
            <br />
            <span className="text-white">Understand the Mathematics.</span>
            <br />
            <span className="bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">
              Improve Performance.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            An interactive statistical analysis platform that uses{' '}
            <strong className="text-blue-300">Pearson correlation</strong> and{' '}
            <strong className="text-violet-300">Spearman rank correlation</strong> to study
            system performance, explore mathematical relationships, and identify components
            that deserve further investigation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={auth.isAuthenticated ? '/app/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleTryDemo}
              className="inline-flex items-center gap-2 bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-600/50 text-emerald-300 font-semibold px-8 py-3.5 rounded-xl transition-all"
            >
              🔬 Try Demo — no account
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/app/guide"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-300 font-medium px-4 py-3.5 transition-colors"
            >
              Explore the Mathematics <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isDemo && (
            <p className="mt-4 text-xs text-amber-400/80">
              Running in demo mode — full functionality available, no account required for calculations.
            </p>
          )}
        </div>
      </section>

      {/* System Flow Diagram */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 sm:p-8">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">
            System Performance Flow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { icon: Server, label: 'Incoming Requests', color: 'text-blue-400' },
              null,
              { icon: Cpu, label: 'Application Server', color: 'text-violet-400' },
              null,
              { icon: Cpu, label: 'CPU', color: 'text-red-400' },
              { icon: HardDrive, label: 'Memory', color: 'text-orange-400' },
              { icon: HardDrive, label: 'Disk I/O', color: 'text-yellow-400' },
              { icon: Wifi, label: 'Network', color: 'text-green-400' },
              null,
              { icon: Clock, label: 'Response Time', color: 'text-cyan-400' },
            ].map((item, i) =>
              item === null ? (
                <ArrowRight key={i} className="w-4 h-4 text-slate-600 flex-shrink-0" aria-hidden="true" />
              ) : (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2.5 min-w-[72px]"
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-xs text-slate-400 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl font-bold text-center text-white mb-3">
          Everything you need to analyze performance correlations
        </h2>
        <p className="text-slate-400 text-center text-sm mb-10 max-w-xl mx-auto">
          From raw observations to publication-quality step-by-step solutions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div
              key={title}
              className={`${bg} border ${border} rounded-xl p-5 transition-transform hover:-translate-y-0.5`}
            >
              <div className={`w-9 h-9 rounded-lg bg-slate-900/60 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 pb-20"
        aria-labelledby="steps-heading"
      >
        <h2 id="steps-heading" className="text-2xl font-bold text-center text-white mb-10">
          Four steps from data to insight
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="relative text-center">
              {num < 4 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-600/50 to-transparent z-0" />
              )}
              <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-900/60 to-violet-900/60 border border-blue-700/30 flex items-center justify-center mb-3">
                <Icon className="w-7 h-7 text-blue-300" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {num}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Academic note */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 text-center">
          <GraduationCap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-3">Academic Context</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            "We collect system performance observations from monitoring tools or application tests.
            We enter or import the observations into Bottleneck Lab. The application calculates
            Pearson and Spearman rank correlation to study associations between system metrics and
            response time. These results help us prioritize possible bottlenecks for further
            investigation — but correlation alone does not prove the cause."
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to investigate your system?</h2>
        <p className="text-slate-400 text-sm mb-8">
          Start with the demo dataset, import your own CSV, or save your analysis to the cloud.
        </p>
        <Link
          to={auth.isAuthenticated ? '/app/dashboard' : '/signup'}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all text-lg"
        >
          Start Analysing <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>Bottleneck Lab — Mathematics Microproject</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link to="/app/guide" className="hover:text-slate-400 transition-colors">Math Guide</Link>
            <Link to="/app/about" className="hover:text-slate-400 transition-colors">About</Link>
            <span>Karunya Institute of Technology and Sciences</span>
          </div>
        </div>
        <p className="text-center text-xs text-slate-700 mt-4">
          This project is not officially endorsed by Supabase, Google, or Karunya Institute.
          Correlation does not imply causation.
        </p>
      </footer>
    </div>
  );
}
