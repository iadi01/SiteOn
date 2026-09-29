import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Shield, CheckCircle } from 'lucide-react';
import brandLogo from '../assets/brand_logo.webp';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src={brandLogo}
                alt="Siteon Logo"
                className="w-8 h-8 object-contain drop-shadow-xs"
              />
              <span className="font-extrabold text-lg text-slate-900 tracking-tight font-sans">
                Siteon
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Build. Ship. Get Noticed.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              A developer-focused platform where students build real-world products, participate in competitive hackathons, submit verified repositories with live deployments, and get considered for career and internship opportunities.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>WebCode Registration Open</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/hackathons" className="hover:text-blue-600 transition-colors">
                  All Hackathons
                </Link>
              </li>
              <li>
                <Link to="/hackathons/webcode" className="hover:text-blue-600 transition-colors">
                  WebCode 2026
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-blue-600 transition-colors">
                  Project Submission
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                  Participant Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  About Siteon
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Operations & Trust
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href="mailto:siteon.org@gmail.com" className="hover:text-blue-600 font-mono transition-colors">
                  siteon.org@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Zero Fake Statistics Policy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified Deployment Audits</span>
              </li>
              <li className="pt-2 flex items-center gap-3">
                <a 
                  href="https://github.com/siteon-org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/siteon-org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Siteon. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
            <Link to="/leaderboard" className="hover:text-blue-600 transition-colors">Leaderboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
