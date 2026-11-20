import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  LogOut,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Card, SectionHeader, Divider } from '../../components/ui';
import { getProfile, updateProfile } from '../../services/profileApi';
import { useAuth } from '../../auth/AuthContext';
import { useTheme, type AppTheme } from '../../context/ThemeContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

const defaultFormData: ProfileFormData = {
  firstName: '',
  lastName: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const { theme, setTheme } = useTheme();

  // Load real profile from database
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const profile = await getProfile();
        if (isMounted && profile) {
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            headline: profile.headline || '',
            email: profile.email || user?.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            website: profile.website || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
          });
        }
      } catch (err) {
        console.warn('Backend profile not loaded, using user auth session state:', err);
        if (isMounted) {
          const names = (user?.name || '').trim().split(' ');
          const first = names[0] || '';
          const last = names.slice(1).join(' ') || '';
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || first,
            lastName: prev.lastName || last,
            headline: prev.headline || user?.role || 'Cloud & Software Engineer',
            email: user?.email || '',
          }));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (statusMessage) setStatusMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        headline: formData.headline,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
      });

      setStatusMessage({
        type: 'success',
        text: 'Profile details successfully updated and saved to your account.',
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Failed to update profile on the server. Please check your network connection.',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials =
    ((formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')).toUpperCase() || 'CR';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-[var(--text-primary)] tracking-tight">Profile & Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 tracking-wider uppercase font-mono">
          Account details and personal preferences
        </p>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile card */}
      <Card className="p-5">
        <SectionHeader
          title="Profile Information"
          subtitle="Your personal contact details stored in the persistent database."
        />
        <Divider className="my-4" />

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
            <Loader2 size={24} className="animate-spin text-[var(--accent-primary)]" />
            <p className="text-xs">Loading profile from database...</p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-5 mb-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-xl tracking-wider shadow-sm">
                  {initials}
                </div>
                <button
                  type="button"
                  aria-label="Upload avatar"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center shadow-sm hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors"
                >
                  <Camera size={11} />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    label="First name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                  <Input
                    label="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                </div>
                <Input
                  label="Professional headline"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="e.g. Senior Cloud Engineer"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Email address"
                type="email"
                value={formData.email}
                disabled
                hint="Managed by identity provider (read-only)."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Pune, Maharashtra, India"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Website / Portfolio"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="LinkedIn"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </span>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Appearance */}
      <Card className="p-5">
        <SectionHeader title="Appearance" subtitle="Switch your workspace design system between Golden Hour and Midnight Dark modes." />
        <Divider className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              { value: 'golden' as AppTheme, icon: <Sun size={16} className="text-amber-500" />, label: 'Golden Hour' },
              { value: 'dark' as AppTheme, icon: <Moon size={16} className="text-blue-400" />, label: 'Midnight Dark' },
            ]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                theme === opt.value
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-primary)] shadow-xs font-bold'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-card)] bg-[var(--bg-subtle)]'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Sign out */}
      <button
        type="button"
        onClick={() => logout()}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-secondary)] hover:text-red-600 hover:bg-rose-500/10 rounded-2xl transition-colors border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs font-semibold"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  );
};

export default ProfilePage;
