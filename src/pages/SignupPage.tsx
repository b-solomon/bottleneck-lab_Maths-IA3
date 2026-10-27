import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Activity, UserPlus, Check, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../App';import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import PasswordStrength from '../components/ui/PasswordStrength';
import DemoVerification from '../components/ui/DemoVerification';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const { auth, isDemo, setGuestMode } = useAppContext();
  const navigate = useNavigate();

  function handleTryDemo() {
    setGuestMode(true);
    navigate('/app/dashboard');
  }

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const passwordsMatch = password === confirmPassword;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = 'Full name is required.';
    if (!email) e.email = 'Email is required.';
    else if (!validateEmail(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!humanVerified) e.captcha = 'Please complete the verification.';
    if (!agreedToTerms) e.terms = 'You must accept the privacy notice to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    if (!validate()) return;

    if (isDemo) {
      setSubmitError('Authentication is not configured. Running in demo mode — account creation is unavailable.');
      return;
    }

    setIsLoading(true);
    const { error, needsVerification } = await auth.signUp(email, password, displayName.trim());
    setIsLoading(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    if (needsVerification) {
      setSuccessMessage(
        `Account created. A verification email has been sent to ${email}. Please check your inbox (and spam folder) and click the link to activate your account.`
      );
    } else {
      navigate('/app/dashboard');
    }
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-900/30 border border-green-700/40 flex items-center justify-center mb-5">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{successMessage}</p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* ── Top navigation ── */}
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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Save datasets and analysis history</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          {isDemo && (
            <Alert type="demo" className="mb-5">
              <strong>Demo mode:</strong> Supabase is not configured. Account creation is unavailable.{' '}
              <Link to="/app/dashboard" className="underline text-amber-300">
                Try demo instead →
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
              label="Full Name"
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setErrors((err) => ({ ...err, displayName: undefined })); }}
              error={errors.displayName}
              placeholder="Your full name"
            />

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

            <div>
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((err) => ({ ...err, password: undefined })); }}
                error={errors.password}
                placeholder="Choose a strong password"
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
              <PasswordStrength password={password} />
            </div>

            <div>
              <Input
                label="Confirm Password"
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((err) => ({ ...err, confirmPassword: undefined })); }}
                error={errors.confirmPassword}
                placeholder="Repeat your password"
                rightAddon={
                  <div className="flex items-center gap-1">
                    {confirmPassword && (
                      <span className={passwordsMatch ? 'text-green-400' : 'text-red-400'} aria-hidden="true">
                        {passwordsMatch ? '✓' : '✗'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide' : 'Show'}
                      className="hover:text-slate-200 transition-colors p-0.5"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                }
              />
              {confirmPassword && (
                <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`} aria-live="polite">
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Human verification */}
            <div>
              <DemoVerification onVerified={setHumanVerified} />
              {errors.captcha && (
                <p role="alert" className="text-xs text-red-400 mt-1">⚠ {errors.captcha}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => { setAgreedToTerms(e.target.checked); setErrors((err) => ({ ...err, terms: undefined })); }}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 flex-shrink-0 cursor-pointer"
                  aria-required="true"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  I have read and accept the{' '}
                  <Link to="/app/about" className="text-blue-400 hover:text-blue-300">
                    privacy notice and terms
                  </Link>{' '}
                  for this educational project.
                </span>
              </label>
              {errors.terms && (
                <p role="alert" className="text-xs text-red-400 mt-1">⚠ {errors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isDemo}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Try demo option */}
        <div className="mt-4 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0b0f1a] px-3 text-xs text-slate-600">or</span>
            </div>
          </div>
          <button
            onClick={handleTryDemo}
            className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/60 bg-slate-800/30 hover:bg-emerald-900/10 text-slate-400 hover:text-emerald-300 text-sm font-medium transition-all"
          >
            🔬 Explore Demo — no account needed
          </button>
        </div>

      </div>
    </div>
  );
}
