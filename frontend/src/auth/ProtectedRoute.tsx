import React from 'react';
import { useAuth } from './AuthContext';
import { Button, Card } from '../components/ui';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, login, isMsalConfigured, error } = useAuth();

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Checking authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <Card className="p-8 text-center space-y-6 shadow-sm border-slate-200">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Sign in to CloudResumeAI
            </h2>
            <p className="text-sm text-slate-500">
              Please authenticate with Microsoft Entra External ID to access your
              resumes and personal workspace.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm"
              onClick={login}
            >
              <Shield size={16} />
              <span>Sign in with Microsoft Entra</span>
              <ArrowRight size={14} />
            </Button>

            {!isMsalConfigured && (
              <p className="text-xs text-slate-400">
                Running in local development identity mode.
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

