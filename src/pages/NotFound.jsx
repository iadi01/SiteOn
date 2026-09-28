import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight, Layers, HelpCircle } from 'lucide-react';
import brandLogo from '../assets/brand_logo.webp';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <img
            src={brandLogo}
            alt="Siteon Logo"
            className="w-16 h-16 object-contain mx-auto drop-shadow-md"
          />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-bold text-[10px]">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The link you followed might be broken, or the page may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/hackathons"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Browse Hackathons</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
