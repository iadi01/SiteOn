import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Trophy, Scale, ShieldAlert, Code2 } from 'lucide-react';

export default function Terms() {
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
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              LEGAL & RULES
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Terms & Conditions
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
            <Scale className="w-4 h-4 text-purple-600" />
            <span>1. Platform Usage & Eligibility</span>
          </h2>
          <p>
            By accessing or creating an account on Siteon, you agree to comply with these terms. The platform is open to students, developers, freshers, and professionals globally. Participants must provide authentic details during registration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>2. Hackathon Registration & Entry Fees</span>
          </h2>
          <p>
            To maintain serious competition integrity and eliminate automated spam bots, hackathons may require a nominal registration fee (e.g. ₹49 INR). All entry fee proceeds contribute toward event infrastructure, official certificates, and the <strong>₹45,000 INR prize pool</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Each 12-digit UTR is verified against official bank records. Duplicate or fraudulent UTR entries result in immediate disqualification.</li>
            <li>Registration fees are non-refundable once the build phase commences.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>3. Intellectual Property Rights</span>
          </h2>
          <p>
            <strong>Participants retain 100% full intellectual property ownership</strong> of all code, applications, and designs created during Siteon hackathons. Siteon does not claim ownership over participant repositories.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>4. Code of Conduct & Jury Decisions</span>
          </h2>
          <p>
            All submitted projects must represent original work created for the event. Plagiarism, offensive content, or attempted tampering with the scoring leaderboard will result in account ban. The Siteon Jury’s evaluation scores out of 100 are final.
          </p>
        </section>

      </div>

    </div>
  );
}
