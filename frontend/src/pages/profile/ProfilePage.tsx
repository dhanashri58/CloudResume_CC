import React, { useState, useEffect } from 'react';
import {
  Bell,
  Shield,
  CreditCard,
  Globe,
  Moon,
  Monitor,
  LogOut,
  Camera,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Card, SectionHeader, Badge, Divider } from '../../components/ui';
import { getProfile, updateProfile } from '../../services/profileApi';
import { useAuth } from '../../auth/AuthContext';

type Theme = 'system' | 'light' | 'dark';

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
  firstName: 'Alex',
  lastName: 'Mercer',
  headline: 'Senior Cloud Architect & Engineering Lead',
  email: 'alex.mercer@cloudresume.ai',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  website: 'https://alexmercer.cloud',
  linkedin: 'linkedin.com/in/alexmercer',
  github: 'github.com/alexmercer',
};

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [notifications, setNotifications] = useState({
    resume: true,
    ai: false,
    marketing: false,
    weekly: true,
  });
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await getProfile();
        if (isMounted && data) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            headline: data.headline || '',
            email: data.email || 'alex.mercer@cloudresume.ai',
            phone: data.phone || '',
            location: data.location || '',
            website: data.website || '',
            linkedin: data.linkedin || '',
            github: data.github || '',
          });
        }
      } catch (err) {
        // Fallback to initial defaults if backend is unavailable in offline mock mode
        console.warn('Backend profile not loaded, using offline default state:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatusMessage(null);
      const updated = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        headline: formData.headline,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
      });

      if (updated) {
        setFormData((prev) => ({
          ...prev,
          firstName: updated.firstName ?? prev.firstName,
          lastName: updated.lastName ?? prev.lastName,
          headline: updated.headline ?? prev.headline,
          phone: updated.phone ?? prev.phone,
          location: updated.location ?? prev.location,
          website: updated.website ?? prev.website,
          linkedin: updated.linkedin ?? prev.linkedin,
          github: updated.github ?? prev.github,
        }));
      }

      setStatusMessage({
        type: 'success',
        text: 'Profile updated and saved to PostgreSQL successfully.',
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      setStatusMessage({ type: 'error', text: msg });
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
        <h1 className="text-2xl font-serif text-[#1C1917] tracking-tight">Profile & Settings</h1>
        <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-mono">
          Account details, cloud synchronization, and personal preferences
        </p>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
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
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-xs">Loading profile from database...</p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-5 mb-5">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-[#1C1917] flex items-center justify-center text-[#FAF7F2] font-serif text-xl tracking-wider shadow-sm">
                  {initials}
                </div>
                <button
                  type="button"
                  aria-label="Upload avatar"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-[#E7DFD5] rounded-full flex items-center justify-center shadow-sm hover:bg-[#FAF7F2] transition-colors"
                >
                  <Camera size={11} className="text-stone-600" />
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
                  placeholder="+1 (555) 000-0000"
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Website / Portfolio"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
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

      {/* Notifications */}
      <Card className="p-5">
        <SectionHeader
          title="Notifications"
          subtitle="Choose what emails and alerts you receive."
        />
        <Divider className="my-4" />
        <div className="space-y-3">
          {[
            {
              key: 'resume' as const,
              label: 'Resume views',
              desc: 'Get notified when an employer or recruiter views your resume.',
            },
            {
              key: 'ai' as const,
              label: 'AI suggestions',
              desc: 'Receive automated tips to optimize bullet points and keywords.',
            },
            {
              key: 'weekly' as const,
              label: 'Weekly digest',
              desc: 'A summary of your resume search performance every Monday.',
            },
            {
              key: 'marketing' as const,
              label: 'Product updates',
              desc: 'News about new features and modern ATS template releases.',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-5">
        <SectionHeader title="Appearance" subtitle="Choose your display theme." />
        <Divider className="my-4" />
        <div className="flex gap-3">
          {(
            [
              { value: 'system', icon: <Monitor size={16} />, label: 'System' },
              { value: 'light', icon: <Globe size={16} />, label: 'Golden Light' },
              { value: 'dark', icon: <Moon size={16} />, label: 'Dark' },
            ] as { value: Theme; icon: React.ReactNode; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all ${
                theme === opt.value
                  ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-semibold shadow-xs'
                  : 'border-[#E7DFD5] text-stone-600 hover:border-stone-400 bg-white'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card className="p-5">
        <SectionHeader title="Account & Cloud Sync" subtitle="Manage your cloud identity and credentials." />
        <Divider className="my-4" />
        <div className="space-y-2">
          {[
            {
              icon: <CreditCard size={16} />,
              label: 'Subscription Tier',
              value: <Badge variant="green">GCP Free Tier Active</Badge>,
            },
            {
              icon: <Shield size={16} />,
              label: 'Authentication Provider',
              value: <Badge variant="slate">Google OAuth 2.0</Badge>,
            },
            {
              icon: <Bell size={16} />,
              label: 'Cloud Infrastructure',
              value: (
                <span className="text-xs text-stone-500 font-mono">
                  Google Cloud Run & Cloud SQL
                </span>
              ),
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#FAF7F2] cursor-pointer transition-colors group"
            >
              <div className="w-8 h-8 bg-[#F5EFE6] rounded-lg flex items-center justify-center text-stone-600">
                {item.icon}
              </div>
              <span className="flex-1 text-sm text-stone-800 font-medium">
                {item.label}
              </span>
              {item.value}
              <ChevronRight
                size={14}
                className="text-stone-300 group-hover:text-stone-500 transition-colors"
              />
            </div>
          ))}
        </div>
        <Divider className="my-4" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Delete account</p>
            <p className="text-xs text-stone-500">
              Permanently remove your account and all stored resumes.
            </p>
          </div>
          <Button variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </Card>

      {/* Sign out */}
      <button
        type="button"
        onClick={() => logout()}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-stone-600 hover:text-red-600 hover:bg-red-50/50 rounded-full transition-colors border border-[#E7DFD5] bg-white shadow-xs font-medium"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  );
};

export default ProfilePage;
