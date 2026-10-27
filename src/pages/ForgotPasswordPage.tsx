import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, Check } from 'lucide-react';
import { useAppContext } from '../App';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function ForgotPasswordPage() {
  const { auth, isDemo } = useAppContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError('');
    if (!email) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email.'); return; }
    if (isDemo) { setError('Authentication is not configured. Demo mode.'); return; }

    setIsLoading(true);
    const result = await auth.resetPassword(email);
    setIsLoading(false);

    if (result.error) {
      // Show generic message to avoid email enumeration
      setSent(true);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-900/30 border border-blue-700/40 flex items-center justify-center mb-5">
            <Check className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            If an account exists for <strong className="text-slate-300">{email}</strong>,
            a password reset link has been sent. Please check your inbox and spam folder.
          </p>
          <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Bottleneck Lab</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email to receive a reset link.</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          {error && <Alert type="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isDemo}
              leftIcon={<Mail className="w-4 h-4" />}
              className="w-full"
            >
              Send Reset Link
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
