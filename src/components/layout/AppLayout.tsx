import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  TrendingUp,
  BarChart3,
  Zap,
  Grid3x3,
  Target,
  Calculator,
  BookOpen,
  Info,
  User,
  LogOut,
  Menu,
  X,
  Activity,
  Presentation,
  ChevronRight,
} from 'lucide-react';
import { useAppContext } from '../../App';
import { DemoModeBanner } from '../ui/Alert';

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/dataset', icon: Database, label: 'Dataset' },
  { to: '/app/pearson', icon: TrendingUp, label: 'Pearson Analysis' },
  { to: '/app/spearman', icon: BarChart3, label: 'Spearman Analysis' },
  { to: '/app/formula', icon: Zap, label: 'Formula in Action' },
  { to: '/app/heatmap', icon: Grid3x3, label: 'Correlation Heatmap' },
  { to: '/app/bottleneck', icon: Target, label: 'Bottleneck Report' },
  { to: '/app/solve', icon: Calculator, label: 'Solve a Problem' },
  { to: '/app/guide', icon: BookOpen, label: 'Math Guide' },
  { to: '/app/about', icon: Info, label: 'About / Case Study' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const { auth, datasetState, isDemo } = useAppContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white">Bottleneck Lab</div>
          <div className="text-xs text-slate-500 truncate">
            {isDemo ? 'Demo Mode' : auth.user?.displayName ?? auth.user?.email ?? ''}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group
              ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
          </NavLink>
        ))}
      </nav>

      {/* Dataset mode indicator */}
      <div className="px-4 py-2 border-t border-slate-800">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              datasetState.dataset.meta.mode === 'simulated'
                ? 'bg-amber-500'
                : 'bg-green-500'
            }`}
          />
          <span className="truncate">
            {datasetState.dataset.meta.name}
            {datasetState.dataset.meta.mode === 'simulated' && ' (Simulated)'}
          </span>
        </div>
        <div className="text-xs text-slate-600 mt-0.5">
          {datasetState.dataset.observations.length} observations
        </div>
      </div>

      {/* Presentation Mode */}
      <div className="px-3 py-2 border-t border-slate-800">
        <NavLink
          to="/presentation"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-violet-300 hover:bg-violet-900/20 border border-violet-700/30 transition-colors"
        >
          <Presentation className="w-4 h-4" />
          <span>Presentation Mode</span>
        </NavLink>
      </div>

      {/* User actions */}
      <div className="px-3 pb-3 pt-1 border-t border-slate-800 space-y-0.5">
        {!isDemo && auth.isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-300 hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        )}
        {isDemo && (
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-400 hover:bg-blue-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign in</span>
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-slate-900/80 border-r border-slate-800 fixed inset-y-0 left-0 z-30"
        aria-label="Sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-slate-900 border-r border-slate-800 z-50 overflow-y-auto">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-60 flex-1 flex flex-col min-w-0">
        {/* Top bar on mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Bottleneck Lab</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {isDemo && (
            <div className="mb-4">
              <DemoModeBanner />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
