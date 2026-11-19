import React from 'react';
import { Navigate, useLocation, useInRouterContext } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card, Button } from '../components/ui';
import { Shield, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const RouterRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, login, isMsalConfigured, error } = useAuth();
  const inRouter = useInRouterContext();

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 font-medium">Checking authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!isMsalConfigured && inRouter) {
      return <RouterRedirect />;
    }

    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <Card className="p-8 text-center space-y-6 shadow-sm border-[#E7DFD5] bg-white">
          <div className="w-14 h-14 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Lock size={26} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-[#1C1917]">
              Sign in to CloudResumeAI
            </h2>
            <p className="text-sm text-stone-600">
              Please authenticate to access your resumes and personal workspace.
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
              onClick={() => {
                void login();
              }}
            >
              <Shield size={16} />
              <span>Sign in with Microsoft Entra</span>
              <ArrowRight size={14} />
            </Button>

            <a
              href="/login"
              className="block w-full py-2.5 text-xs text-stone-600 hover:text-stone-900 border border-[#E7DFD5] rounded-full hover:bg-[#FAF7F2] transition-colors font-medium text-center"
            >
              Open Full Sign In & Demo Personas ↗
            </a>

            {!isMsalConfigured && (
              <p className="text-xs text-stone-400">
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
