import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              LEGAL & COMPLIANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Privacy Policy
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono">
          Last Updated: September 29, 2026 • Effective Immediately
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed card-elevation">
        
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you register on Siteon or participate in hackathons such as "WebCode: Data Under Pressure", we collect the following minimum necessary details:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Account & Identity:</strong> Full Name, Email Address, Avatar/Profile Photo (via Google OAuth or standard email registration).</li>
            <li><strong>Hackathon Registration & Payment:</strong> 12-Digit UPI Transaction Reference ID (UTR), payment amount, and optional receipt screenshots to prevent fraudulent multi-accounting.</li>
            <li><strong>Project Submissions:</strong> GitHub repository URLs, live project demonstration URLs, technical architecture notes, and team member details.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>2. How We Use Your Data</span>
          </h2>
          <p>Your information is used strictly for:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Authenticating your access to hackathons and submission portals.</li>
            <li>Reconciling UPI registrations and verifying eligibility for the ₹45,000 prize pool.</li>
            <li>Evaluating submissions by the Siteon jury and publishing scores on the official Leaderboard.</li>
            <li>Shortlisting exceptional candidates for Siteon Software Engineering & Data internships.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>3. Data Protection & Security</span>
          </h2>
          <p>
            We enforce strict security protocols. We do not sell, rent, or trade your personal information with third-party advertising brokers. All communication is encrypted via HTTPS/SSL.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>4. Contact & Inquiries</span>
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data erasure, reach out to the Siteon administration team:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
            Email: <a href="mailto:siteon.org@gmail.com" className="text-blue-600 font-bold hover:underline">siteon.org@gmail.com</a>
          </div>
        </section>

      </div>

    </div>
  );
}
