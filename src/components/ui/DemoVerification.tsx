import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ShieldAlert, Check, X } from 'lucide-react';

interface DemoVerificationProps {
  onVerified: (verified: boolean) => void;
}

function generateChallenge(): { a: number; b: number; op: '+' | '-' } {
  const ops: ('+' | '-')[] = ['+', '-'];
  const op = ops[Math.floor(Math.random() * 2)];
  const a = Math.floor(Math.random() * 15) + 3;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b: op === '-' ? Math.min(b, a - 1) : b, op };
}

function computeAnswer(a: number, b: number, op: string): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  return 0;
}

export default function DemoVerification({ onVerified }: DemoVerificationProps) {
  const [challenge, setChallenge] = useState(generateChallenge());
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const refresh = useCallback(() => {
    setChallenge(generateChallenge());
    setAnswer('');
    setStatus('idle');
    onVerified(false);
  }, [onVerified]);

  useEffect(() => {
    if (!answer.trim()) {
      setStatus('idle');
      onVerified(false);
      return;
    }
    const num = parseInt(answer, 10);
    if (isNaN(num)) {
      setStatus('idle');
      onVerified(false);
      return;
    }
    const correct = computeAnswer(challenge.a, challenge.b, challenge.op);
    if (num === correct) {
      setStatus('correct');
      onVerified(true);
    } else {
      setStatus('wrong');
      onVerified(false);
    }
  }, [answer, challenge, onVerified]);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
            DEMO HUMAN VERIFICATION — NOT PRODUCTION SECURITY
          </p>
          <p className="text-xs text-amber-200/80 mt-0.5">
            An arithmetic question is not a substitute for secure production CAPTCHA.
          </p>
        </div>
      </div>

      <div className={`border rounded-lg p-4 transition-colors ${
        status === 'correct' ? 'bg-green-900/10 border-green-700/50'
        : status === 'wrong' ? 'bg-red-900/10 border-red-700/50'
        : 'bg-slate-800/60 border-slate-700'
      }`}>
        <label htmlFor="captcha-answer" className="block text-sm font-medium text-slate-300 mb-3">
          Solve this to continue:
        </label>
        <div className="flex items-center gap-3">
          <span className="text-lg font-mono font-bold text-blue-300 select-none">
            {challenge.a} {challenge.op} {challenge.b} = ?
          </span>
          <input
            id="captcha-answer"
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="?"
            autoComplete="off"
            className={`w-20 bg-slate-900 border rounded-lg px-3 py-2 text-slate-100 text-sm text-center font-mono font-bold focus:outline-none focus:ring-2 transition-colors ${
              status === 'correct' ? 'border-green-500 focus:ring-green-500'
              : status === 'wrong' ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-600 focus:ring-blue-500'
            }`}
          />
          {status === 'correct' && <Check className="w-5 h-5 text-green-400" />}
          {status === 'wrong' && <X className="w-5 h-5 text-red-400" />}
          <button type="button" onClick={refresh} aria-label="New question"
            className="text-slate-500 hover:text-slate-300 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-xs mt-2 font-medium ${
          status === 'correct' ? 'text-green-400'
          : status === 'wrong' ? 'text-red-400'
          : 'text-slate-500'
        }`}>
          {status === 'correct' && '✓ Correct — verification passed'}
          {status === 'wrong' && `✗ Incorrect. Try again or click ↻ for a new question.`}
          {status === 'idle' && 'Enter the answer to the sum above.'}
        </p>
      </div>
    </div>
  );
}
