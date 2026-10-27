import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Activity, LogIn, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../App';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const { auth, isDemo, setGuestMode } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Only redirect if authenticated AND not still loading
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate, from]);

  function handleContinueAsGuest() {
    setGuestMode(true);
    navigate('/app/dashboard');
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required.';
    else if (!validateEmail(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    if (isDemo) {
      setSubmitError('Authentication is not configured. Running in demo mode — sign in is unavailable.');
      return;
    }
    setIsLoading(true);
    const { error } = await auth.signIn(email, password);
    setIsLoading(false);
    if (error) {
      setSubmitError(error);
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Top navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Bottleneck Lab</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Bottleneck Lab</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          {isDemo && (
            <Alert type="demo" className="mb-5">
              <strong>Demo mode:</strong> Supabase is not configured. Sign in is unavailable.{' '}
              <Link to="/app/dashboard" className="underline text-amber-300">
                Continue to app →
              </Link>
            </Alert>
          )}

          {submitError && (
            <Alert type="error" className="mb-5" onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((err) => ({ ...err, email: undefined })); }}
              error={errors.email}
              placeholder="you@example.com"
            />

            <div className="space-y-1">
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((err) => ({ ...err, password: undefined })); }}
                error={errors.password}
                placeholder="Your password"
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="hover:text-slate-200 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isDemo}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-5 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0b0f1a] px-3 text-xs text-slate-500">or</span>
            </div>
          </div>
          <button
            onClick={handleContinueAsGuest}
            className="mt-4 inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl border border-slate-600 hover:border-blue-500/60 bg-slate-800/40 hover:bg-blue-900/10 text-slate-300 hover:text-blue-300 text-sm font-medium transition-all"
          >
            🔬 Explore Demo — no account needed
          </button>
        </div>
      </div>
    </div>
  );
}
