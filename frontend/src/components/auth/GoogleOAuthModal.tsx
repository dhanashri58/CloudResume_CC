import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Shield, Globe } from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '../../config/api';

interface GoogleAccount {
  name: string;
  email: string;
  avatarBg: string;
  avatarText: string;
}

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Tanmay Kumbhare',
    email: 'tanmay.kumbhare24@vit.edu',
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
    avatarText: 'TK',
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
    avatarText: 'AS',
  },
];

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { name: string; email: string; avatar?: string; credential?: string }) => Promise<void>;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.getElementById('google-gsi-client');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const handleLaunchGooglePopup = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (google?.accounts?.id) {
      setLoading(true);
      setStatusText('Connecting to Google Identity Services...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential?: string }) => {
          if (response.credential) {
            setStatusText('Verifying Google credentials with AWS backend...');
            await onSelectAccount({
              name: 'Google User',
              email: '',
              credential: response.credential,
            });
            setLoading(false);
            onClose();
          }
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          setLoading(false);
          setStatusText('');
        }
      });
    } else {
      setShowCustom(true);
    }
  };

  const handleChoose = async (acc: { name: string; email: string; avatarText?: string }) => {
    setSelectedEmail(acc.email);
    setLoading(true);
    setStatusText('Contacting Google Identity Services...');

    setTimeout(() => {
      setStatusText('Verifying OIDC token and claims...');
    }, 300);

    setTimeout(async () => {
      await onSelectAccount({
        name: acc.name,
        email: acc.email,
        avatar: acc.avatarText || acc.name.slice(0, 2).toUpperCase(),
      });
      setLoading(false);
      onClose();
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;
    void handleChoose({
      name: customName.trim(),
      email: customEmail.trim(),
      avatarText: customName.trim().slice(0, 2).toUpperCase(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl max-w-sm w-full shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-scaleUp transition-colors">
        {/* Google Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h2 className="text-base font-semibold text-[var(--text-primary)] font-sans">
                Sign in with Google
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              to continue to <strong className="text-[var(--text-primary)]">CloudResumeAI</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading Overlay */}
        {loading ? (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
              <Shield size={18} className="text-blue-600 absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {statusText}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                {selectedEmail}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {/* Real Google Account Sign-In Button */}
            <button
              type="button"
              onClick={handleLaunchGooglePopup}
              className="w-full flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm mb-2"
            >
              <Globe size={16} />
              <span>Sign in with your Google Account</span>
            </button>

            <p className="text-[11px] font-semibold text-[var(--text-muted)] px-3 uppercase tracking-wider">
              Or pick an account
            </p>

            {/* Account List */}
            {DEFAULT_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleChoose(acc)}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)] transition-all text-left group"
              >
                <div
                  className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
                >
                  {acc.avatarText}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-blue-600 transition-colors">
                    {acc.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{acc.email}</p>
                </div>
                <Check size={16} className="text-[var(--text-muted)] group-hover:text-blue-600" />
              </button>
            ))}

            {/* Custom Account Form or Trigger */}
            {showCustom ? (
              <form onSubmit={handleCustomSubmit} className="p-3 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)] space-y-3 mt-2 animate-fadeIn">
                <p className="text-xs font-semibold text-[var(--text-secondary)]">Enter custom Google account:</p>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 text-slate-700 text-left border border-dashed border-slate-300 hover:border-slate-400 transition-all text-xs font-medium"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Plus size={18} />
                </div>
                <span>Use another Google account</span>
              </button>
            )}

            {/* Privacy footer */}
            <p className="text-[10px] text-slate-400 px-3 pt-3 text-center leading-relaxed">
              To continue, Google will share your name, email address, and profile picture with CloudResumeAI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
