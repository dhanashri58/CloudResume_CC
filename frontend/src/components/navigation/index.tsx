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
      className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-slate-100 px-4 gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Cloud size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-slate-900 text-sm tracking-tight">
            CloudResumeAI
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className={active ? 'text-blue-600' : ''}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-100 py-4 px-2 space-y-0.5">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors ${
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
      <div className="border-t border-slate-100 px-2 py-3 flex justify-end">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
      {title && (
        <h1 className="text-base font-semibold text-slate-900 flex-1">{title}</h1>
      )}
      {!title && <div className="flex-1" />}
      {actions && <div className="flex items-center gap-3">{actions}</div>}

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-900">
              {user?.name || 'Authenticated User'}
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.email || 'Entra ID'}
            </span>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
            title={user?.email}
          >
            {initials}
          </div>
        </div>
      ) : (
        <button
          onClick={() => login()}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
  <nav className="flex items-center gap-1.5 text-sm text-slate-500">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span className="text-slate-300">/</span>}
        {item.path ? (
          <Link
            to={item.path}
            className="hover:text-slate-900 transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-slate-900 font-medium">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ─── Public top nav ──────────────────────────────────────────────────────────

export const PublicNav: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cloud size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">CloudResumeAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/templates" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            Templates
          </Link>
          <a href="#features" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            How it works
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/dashboard"
            className="text-sm px-3 py-1.5 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-600"
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <Link to="/templates" className="block px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100">Templates</Link>
          <a href="#features" className="block px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100" onClick={() => setOpen(false)}>How it works</a>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/dashboard" className="text-center text-sm py-2 border border-slate-300 rounded-lg text-slate-700 font-medium">Sign in</Link>
            <Link to="/dashboard" className="text-center text-sm py-2 bg-blue-600 text-white rounded-lg font-medium">Get started free</Link>
          </div>
        </div>
      )}
    </header>
  );
};

