import React from 'react';
import { Terminal, ShieldCheck, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>ABOUT SITEON</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Developer-First Competitive Platform
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Siteon is an engineering-first platform where students and developers discover hackathons, build production-quality web products, submit verified GitHub code and live deployments, and get evaluated for developer opportunities.
        </p>
      </div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
          <h2 className="text-base font-bold text-slate-900 mb-2">Our Mission</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminate vanity metrics and generic theoretical homework. We believe genuine developer talent is proven through working software, committed repositories, and real user-accessible deployments.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
          <h2 className="text-base font-bold text-slate-900 mb-2">Zero Fake Data Policy</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Siteon strictly displays verifiable metrics. Participant counts, submissions, and statuses reflect genuine database entries and audited submissions.
          </p>
        </div>
      </div>

      {/* Code of Conduct */}
      <div id="rules" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-mono">Participant Standards & Code of Conduct</h2>
        <ul className="space-y-2.5 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Original Work:</strong> All projects submitted must be created by the registered participant or team members during the hackathon timeline.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Verified Code History:</strong> GitHub repositories must be public and contain meaningful commit histories showcasing actual authorship.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Live Deployment:</strong> A working HTTPS link must be kept live throughout the review cycle for manual auditing by reviewers.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Strict Deadlines:</strong> Submissions and edits automatically lock at the deadline timestamp to preserve fair competition.</span>
          </li>
        </ul>
      </div>

      {/* Privacy Policy */}
      <div id="privacy" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation space-y-3">
        <h2 className="text-base font-bold text-slate-900 font-mono">Privacy Policy</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Siteon respects student privacy. Academic credentials, phone numbers, and private resume documents are stored in secure storage and accessible solely to the student and authorized Siteon evaluation administrators. We do not sell or monetize participant personal data.
        </p>
      </div>

      {/* Terms of Service */}
      <div id="terms" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation space-y-3">
        <h2 className="text-base font-bold text-slate-900 font-mono">Terms of Service</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          By registering for Siteon events or submitting projects, you warrant that all submitted code is your own and that you possess all necessary rights. Expressing internship interest permits Siteon reviewers to evaluate your submissions for prospective recruitment but does not constitute an employment guarantee.
        </p>
      </div>

      {/* Contact */}
      <div className="bg-slate-100 rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-slate-900 block font-mono">Administrative Inquiries</span>
          <span className="text-slate-500">Contact Siteon team for university partnerships or review inquiries.</span>
        </div>
        <a
          href="mailto:siteon.org@gmail.com"
          className="inline-flex items-center gap-1.5 font-mono font-semibold text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>siteon.org@gmail.com</span>
        </a>
      </div>

    </div>
  );
}
