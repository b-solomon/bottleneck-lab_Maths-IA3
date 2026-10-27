import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useDataset } from './hooks/useDataset';
import { isSupabaseConfigured } from './lib/supabase';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import DatasetPage from './pages/DatasetPage';
import PearsonPage from './pages/PearsonPage';
import SpearmanPage from './pages/SpearmanPage';
import FormulaInActionPage from './pages/FormulaInActionPage';
import HeatmapPage from './pages/HeatmapPage';
import BottleneckReportPage from './pages/BottleneckReportPage';
import SolveProblemPage from './pages/SolveProblemPage';
import MathGuidePage from './pages/MathGuidePage';
import AboutPage from './pages/AboutPage';
import PresentationPage from './pages/PresentationPage';
import ProfilePage from './pages/ProfilePage';

// ---- App Context ----------------------------------------

interface AppContextType {
  auth: ReturnType<typeof useAuth>;
  datasetState: ReturnType<typeof useDataset>;
  isDemo: boolean;
  // Guest mode: user chose "Continue without account"
  isGuest: boolean;
  setGuestMode: (v: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContext.Provider');
  return ctx;
}

// ---- Protected Route ------------------------------------
// Allows access when:
//  1. No Supabase configured (demo mode)
//  2. User is authenticated
//  3. User explicitly chose guest/demo mode

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth, isDemo, isGuest } = useAppContext();

  // Still checking session
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // Always allow: no Supabase configured, signed in, or guest mode
  if (isDemo || auth.isAuthenticated || isGuest) {
    return <>{children}</>;
  }

  // Not authenticated and not guest → go to login
  return <Navigate to="/login" replace />;
}

// ---- Root App -------------------------------------------

export default function App() {
  const auth = useAuth();
  const datasetState = useDataset(auth.user?.id);
  const isDemo = !isSupabaseConfigured;

  // Guest mode: set to true when user clicks "Continue without account"
  const [isGuest, setGuestMode] = useState(false);

  return (
    <AppContext.Provider value={{ auth, datasetState, isDemo, isGuest, setGuestMode }}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Presentation mode */}
          <Route
            path="/presentation"
            element={
              <ProtectedRoute>
                <PresentationPage />
              </ProtectedRoute>
            }
          />

          {/* Protected app routes with sidebar layout */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dataset" element={<DatasetPage />} />
            <Route path="pearson" element={<PearsonPage />} />
            <Route path="spearman" element={<SpearmanPage />} />
            <Route path="formula" element={<FormulaInActionPage />} />
            <Route path="heatmap" element={<HeatmapPage />} />
            <Route path="bottleneck" element={<BottleneckReportPage />} />
            <Route path="solve" element={<SolveProblemPage />} />
            <Route path="guide" element={<MathGuidePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
