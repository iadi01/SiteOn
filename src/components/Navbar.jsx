import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { 
  Terminal, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  User, 
  ShieldCheck, 
  Layers, 
  Send, 
  Bell,
  Code2,
  Trophy
} from 'lucide-react';
import brandLogo from '../assets/brand_logo.webp';
import NotificationDrawer from './common/NotificationDrawer';
import { getInitialsAvatar, cleanDisplayName } from '../utils/avatar';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications
  const loadNotifications = () => {
    if (user) {
      setNotifications(db.getNotifications(user.id));
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'notifications') {
        loadNotifications();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, [user]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={brandLogo}
              alt="Siteon Logo"
              className="w-9 h-9 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight font-sans">
                  Siteon
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  PLATFORM
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/hackathons')
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Hackathons
            </Link>
            <Link
              to="/about"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              About
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/leaderboard')
                  ? 'text-amber-600 bg-amber-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Leaderboard</span>
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive('/admin')
                    ? 'text-purple-700 bg-purple-50 font-semibold border border-purple-200'
                    : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Submit Project CTA */}
            <button
              onClick={() => {
                if (user) {
                  navigate('/submit');
                } else {
                  navigate('/auth?redirect=/submit');
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Project</span>
            </button>

            {/* Authenticated user actions */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <button
                  onClick={() => setNotificationDrawerOpen(true)}
                  className="relative p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                  )}
                </button>

                {/* Profile dropdown trigger */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={
                        profile?.avatar_url && !profile.avatar_url.includes('dicebear')
                          ? profile.avatar_url
                          : (user.avatar && !user.avatar.includes('dicebear') ? user.avatar : getInitialsAvatar(cleanDisplayName(user.name, user.email) || user.email))
                      }
                      alt={cleanDisplayName(user.name, user.email) || 'User Avatar'}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getInitialsAvatar(cleanDisplayName(user.name, user.email) || user.email);
                      }}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {(cleanDisplayName(user.name, user.email) || user.email.split('@')[0]).split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setProfileDropdownOpen(false)} 
                      />
                      <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white border border-slate-200 shadow-xl py-1.5 z-40 text-slate-800 text-sm">
                        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-semibold text-slate-900 truncate">
                            {cleanDisplayName(profile?.full_name) || cleanDisplayName(user.name, user.email) || user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {isAdmin ? 'ADMIN' : 'PARTICIPANT'}
                            </span>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span>Participant Dashboard</span>
                          </Link>
                          <Link
                            to="/submit"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <Code2 className="w-4 h-4 text-slate-400" />
                            <span>Submit Project</span>
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-purple-700 font-medium"
                            >
                              <ShieldCheck className="w-4 h-4 text-purple-600" />
                              <span>Admin Operations</span>
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              navigate('/');
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-md transition-colors bg-white shadow-2xs"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/hackathons"
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Hackathons
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              About Siteon
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-amber-700 bg-amber-50/60 hover:bg-amber-100/60"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard & Winners</span>
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/submit"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 font-semibold"
                >
                  Submit Project
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  My Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-purple-700 bg-purple-50 font-semibold"
                  >
                    Admin Operations
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/auth"
                  className="w-full py-2 text-center text-sm font-semibold text-slate-700 border border-slate-300 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?tab=signup"
                  className="w-full py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-md"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Slide-over Notifications */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        userId={user?.id}
        notifications={notifications}
        onUpdate={loadNotifications}
      />
    </>
  );
}
