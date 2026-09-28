import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Terminal, 
  LayoutDashboard, 
  Calendar, 
  Code, 
  Users, 
  Download, 
  Settings, 
  ShieldAlert, 
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Database,
  CreditCard
} from 'lucide-react';

import brandLogo from '../../assets/brand_logo.webp';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Database-verified role security check
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center card-elevation">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Administrative privileges required. Your current account does not have permission to access the Siteon internal console.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => navigate('/auth?tab=login')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Sign in with Admin Credentials
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
            >
              Return to Public Platform
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Users & Directory', path: '/admin/users', icon: Users },
    { label: 'Hackathons', path: '/admin/hackathons', icon: Calendar },
    { label: 'Challenge & Dataset', path: '/admin/challenge', icon: Database },
    { label: 'Submissions', path: '/admin/submissions', icon: Code },
    { label: 'Payments & UTR (₹49)', path: '/admin/payments', icon: CreditCard },
    { label: 'Internship Pipeline', path: '/admin/internships', icon: Briefcase },
    { label: 'CSV Exports', path: '/admin/exports', icon: Download },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={brandLogo}
              alt="Siteon Logo"
              className="w-8 h-8 object-contain drop-shadow-xs"
            />
            <div>
              <span className="font-bold text-sm text-slate-900 block font-mono">Siteon Admin</span>
              <span className="text-[10px] text-purple-700 font-mono font-bold block uppercase tracking-wider">Internal Operations</span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-purple-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          <div className="px-2 py-1.5 text-[11px] text-slate-500 font-mono">
            Auth: <strong className="text-slate-800">{user.email}</strong>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Siteon Public</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

    </div>
  );
}
