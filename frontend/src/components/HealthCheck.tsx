import React, { useState, useEffect } from 'react';
import { fetchHealth, HealthResponse } from '../services/api';
import { CheckCircle2, AlertCircle, RefreshCw, Server, Database, Clock, Tag } from 'lucide-react';

export const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred while contacting backend';
      setError(message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Backend System Status</h2>
            <p className="text-xs text-slate-400">Endpoint: GET /api/health</p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          aria-label="Refresh status"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Checking...' : 'Refresh'}</span>
        </button>
      </div>

      {loading && !health && !error && (
        <div className="py-8 text-center text-slate-400 animate-pulse" role="status">
          Checking backend connection...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-200" role="alert">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-300">Backend Unreachable</p>
              <p className="text-xs text-rose-200/80 mt-1 break-words">{error}</p>
              <p className="text-xs text-rose-300/70 mt-2">
                Ensure the Flask backend is running on port 5000 (<code className="bg-rose-900/40 px-1 py-0.5 rounded">python wsgi.py</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {health && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/40 rounded-lg">
            <span className="text-sm font-medium text-slate-300">API Health</span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="capitalize">{health.status}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Service</span>
              </div>
              <p className="font-mono font-medium text-slate-200 truncate">{health.service}</p>
            </div>

            <div className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Environment</span>
              </div>
              <p className="font-mono font-medium text-slate-200 uppercase">{health.environment}</p>
            </div>

            <div className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Database</span>
              </div>
              <p className="font-mono font-medium text-slate-200 capitalize">
                {health.database?.status || 'unconfigured'}
              </p>
              {health.database?.message && (
                <p className="text-[10px] text-slate-400 mt-1 truncate" title={health.database.message}>
                  {health.database.message}
                </p>
              )}
            </div>

            <div className="p-3 bg-slate-900/40 border border-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Backend Time</span>
              </div>
              <p className="font-mono text-[11px] text-slate-200 truncate" title={health.timestamp}>
                {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {lastChecked && (
            <p className="text-[11px] text-right text-slate-500">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

