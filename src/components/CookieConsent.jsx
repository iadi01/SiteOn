import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('siteon_cookie_consent');
    if (!consent) {
      // Show banner after brief delay
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('siteon_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('siteon_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xl text-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">
              Privacy & Cookies
            </span>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Siteon uses essential cookies and local storage to secure authentication sessions, process project submissions, and track verified UPI registrations.
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            to="/privacy"
            className="text-[11px] font-semibold text-blue-600 hover:underline"
          >
            Read Privacy Policy
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecline}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
