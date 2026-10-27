import { Link } from 'react-router-dom';
import { LogOut, Mail, Calendar } from 'lucide-react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function ProfilePage() {
  const { auth, isDemo } = useAppContext();

  if (isDemo || !auth.isAuthenticated) {
    return (
      <div className="max-w-xl space-y-5">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <Alert type="demo" title="Not signed in">
          Sign in to save datasets and analysis history.{' '}
          <Link to="/signup" className="underline text-amber-300">Create an account</Link>{' '}
          or <Link to="/login" className="underline text-amber-300">sign in</Link>.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">
              {auth.user?.displayName?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{auth.user?.displayName}</p>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {auth.user?.email}
            </p>
            {auth.user?.createdAt && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(auth.user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Account">
        <div className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-200">Email</p>
              <p className="text-xs text-slate-400">{auth.user?.email}</p>
            </div>
            <span className="text-xs bg-green-900/30 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full">Verified</span>
          </div>
        </div>
      </Card>

      <Card title="Session">
        <div className="mt-3 space-y-2">
          <p className="text-sm text-slate-400">
            You are signed in as <strong className="text-slate-200">{auth.user?.email}</strong>.
            Signing out will end your session and return you to the home page.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={auth.signOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
