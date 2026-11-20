import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight,
  Cloud,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'My Resumes', path: '/dashboard/resumes', icon: <FileText size={18} /> },
  { label: 'Templates', path: '/templates', icon: <Layers size={18} /> },
  { label: 'AI Assistant', path: '/ai', icon: <Sparkles size={18} /> },
  { label: 'Profile', path: '/profile', icon: <User size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const { pathname } = useLocation();
  const { logout, isAuthenticated } = useAuth();

  return (
    <aside
      className={`h-screen bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] text-[var(--text-primary)] flex flex-col transition-all duration-200 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-[var(--border-subtle)] px-4 gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shrink-0">
          <Cloud size={16} className="text-[var(--accent-primary)]" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight font-sans">
            CloudResumeAI
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold border border-[var(--border-subtle)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <span className={active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border-subtle)] py-4 px-2 space-y-1">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </Link>
        {isAuthenticated && (
          <button
            onClick={() => logout()}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-600 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--border-subtle)] px-2 py-3 flex justify-end">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

// ─── Top bar ─────────────────────────────────────────────────────────────────

interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ title, actions }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AM';

  return (
    <header className="h-16 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center px-6 gap-4 shrink-0 select-none transition-colors duration-200">
      {title && (
        <h1 className="text-base font-bold text-[var(--text-primary)] flex-1">{title}</h1>
      )}
      {!title && <div className="flex-1" />}
      {actions && <div className="flex items-center gap-3">{actions}</div>}

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {user?.name || 'Authenticated User'}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] mt-0.5">
              {user?.role || user?.email || 'Cloud Member'}
            </span>
          </div>
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs border border-[var(--border-subtle)]"
            title={user?.email}
          >
            {initials}
          </div>
          <button
            onClick={() => logout()}
            className="hidden sm:inline-flex text-xs px-2.5 py-1 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent"
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="text-xs px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-page)] rounded-full font-medium hover:opacity-90 transition-all shadow-xs"
        >
          Sign in
        </Link>
      )}
    </header>
  );
};

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav className="flex items-center gap-1.5 text-sm text-slate-400">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span className="text-slate-600">/</span>}
        {item.path ? (
          <Link
            to={item.path}
            className="hover:text-white transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-white font-medium">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ─── Public top nav ──────────────────────────────────────────────────────────

export const PublicNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isTemplates = location.pathname === '/templates';
  const isFeatures = location.hash === '#features';
  const isArch = location.hash === '#architecture';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-page)] backdrop-blur-xl border-b border-[var(--border-subtle)] transition-colors duration-250 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
            <Cloud size={20} className="text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[var(--text-primary)] text-base tracking-tight font-sans">
              CloudResumeAI
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono tracking-wider uppercase -mt-0.5 hidden sm:block">
              Golden Hour Architecture
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-xs bg-[var(--bg-subtle)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] shadow-inner">
          <Link
            to="/templates"
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
              isTemplates
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
            }`}
          >
            Templates
          </Link>
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
              isFeatures
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
            }`}
          >
            Features
          </a>
          <a
            href="/#architecture"
            onClick={(e) => handleNavClick(e, 'architecture')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
              isArch
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/60'
            }`}
          >
            Architecture
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/dashboard"
                className="text-xs px-3.5 py-1.5 bg-amber-100/70 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-full font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all"
              >
                {user?.name?.split(' ')[0] || 'My Workspace'}
              </Link>
              <Link
                to="/dashboard"
                className="text-xs px-4 py-2 bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-page)] rounded-full font-medium transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => logout()}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-surface)] rounded-full border border-[var(--border-subtle)] transition-all shadow-sm"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-xs px-5 py-2.5 bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-page)] rounded-full font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                Get started free ↗
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-page)] px-6 py-4 space-y-2">
          <Link
            to="/templates"
            className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-subtle)]"
            onClick={() => setOpen(false)}
          >
            Templates
          </Link>
          <a
            href="/#features"
            className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-subtle)]"
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </a>
          <a
            href="/#architecture"
            className="block px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-subtle)]"
            onClick={(e) => handleNavClick(e, 'architecture')}
          >
            Architecture
          </a>
          <div className="pt-3 flex flex-col gap-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-[var(--text-muted)]">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              to="/login"
              className="text-center text-sm py-2.5 border border-[var(--border-subtle)] rounded-full text-[var(--text-primary)] font-semibold bg-[var(--bg-surface)]"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="text-center text-sm py-2.5 bg-[var(--text-primary)] text-[var(--bg-page)] rounded-full font-semibold shadow-sm"
              onClick={() => setOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

