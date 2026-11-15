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
      className={`h-screen bg-[#0d1427]/90 backdrop-blur-xl border-r border-white/[0.08] flex flex-col transition-all duration-200 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-white/[0.08] px-4 gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 p-[1px] shadow-glow-sm shadow-blue-500/20 shrink-0">
          <div className="w-full h-full bg-[#0a0f1d] rounded-[7px] flex items-center justify-center">
            <Cloud size={16} className="text-blue-400" />
          </div>
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-sm tracking-tight font-sans">
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
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-indigo-500/30 shadow-glow-sm shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className={active ? 'text-indigo-400' : ''}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.08] py-4 px-2 space-y-1">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors ${
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors ${
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
      <div className="border-t border-white/[0.08] px-2 py-3 flex justify-end">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
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
  const { user, isAuthenticated, login } = useAuth();
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AM';

  return (
    <header className="h-16 bg-[#0a0f1d]/85 backdrop-blur-xl border-b border-white/[0.08] flex items-center px-6 gap-4 shrink-0 select-none">
      {title && (
        <h1 className="text-base font-semibold text-white flex-1">{title}</h1>
      )}
      {!title && <div className="flex-1" />}
      {actions && <div className="flex items-center gap-3">{actions}</div>}

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-white">
              {user?.name || 'Authenticated User'}
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.email || 'Entra ID'}
            </span>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm shadow-blue-500/20 border border-white/20"
            title={user?.email}
          >
            {initials}
          </div>
        </div>
      ) : (
        <button
          onClick={() => login()}
          className="text-xs px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-glow-sm shadow-blue-500/20"
        >
          Sign in
        </button>
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

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 p-[1px] shadow-glow-sm shadow-blue-500/20 group-hover:shadow-glow-md transition-all">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center">
              <Cloud size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base tracking-tight font-sans">
              CloudResumeAI
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase -mt-1 hidden sm:block">
              Cloud-Native Engine
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.08] backdrop-blur-md">
          <Link
            to="/templates"
            className="px-3.5 py-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all"
          >
            Templates
          </Link>
          <a
            href="#features"
            className="px-3.5 py-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-3.5 py-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/[0.06] transition-all"
          >
            How it works
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm px-4 py-2 text-slate-300 hover:text-white font-medium hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/10 transition-all"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="text-sm px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-violet-500 transition-all shadow-glow-sm shadow-blue-500/25 hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98] border border-white/15"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white bg-white/[0.05] rounded-lg border border-white/10"
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
        <div className="md:hidden border-t border-white/[0.08] bg-[#0a0f1d]/95 backdrop-blur-2xl px-6 py-4 space-y-2">
          <Link
            to="/templates"
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/[0.05]"
            onClick={() => setOpen(false)}
          >
            Templates
          </Link>
          <a
            href="#features"
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/[0.05]"
            onClick={() => setOpen(false)}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/[0.05]"
            onClick={() => setOpen(false)}
          >
            How it works
          </a>
          <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.08]">
            <Link
              to="/dashboard"
              className="text-center text-sm py-2.5 border border-white/10 rounded-xl text-slate-300 hover:text-white font-medium bg-white/[0.03]"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="text-center text-sm py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-glow-sm"
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

