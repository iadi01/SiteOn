import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import StatusBadge from '../components/common/StatusBadge';
import Countdown from '../components/common/Countdown';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  FileCode, 
  HelpCircle, 
  Send, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  Download,
  FileSpreadsheet,
  Layers,
  Flame,
  Award,
  Eye,
  AlertTriangle,
  Database,
  Lock,
  Medal,
  FileCheck,
  CreditCard
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function HackathonDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ isPaid: false, status: 'not_registered' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');
  
  // CSV Preview State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [loadingCsv, setLoadingCsv] = useState(false);

  const loadData = () => {
    const found = db.getHackathonByIdOrSlug(slug);
    if (found) {
      setHackathon(found);
      const regs = db.getHackathonRegistrations(found.id);
      setRegistrationsCount(regs.length);
      if (user) {
        const pInfo = db.isUserPaidAndVerified(user.id, found.id);
        setPaymentInfo(pInfo);
        setIsRegistered(pInfo.isPaid);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'hackathons' || e.detail?.table === 'registrations') {
        loadData();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, [slug, user]);

  const loadCsvPreview = async () => {
    setLoadingCsv(true);
    try {
      const res = await fetch('/datasets/webcode_data_under_pressure_dataset.csv');
      if (!res.ok) throw new Error('Dataset file not found');
      const text = await res.text();
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        setPreviewHeaders(headers);
        const rows = lines.slice(1, 36).map((line, idx) => ({
          id: idx + 1,
          data: line.split(',')
        }));
        setPreviewRows(rows);
      }
    } catch (err) {
      console.error('Failed to parse CSV preview:', err);
    } finally {
      setLoadingCsv(false);
    }
  };

  const handleRegister = () => {
    navigate(`/hackathons/${slug}/register`);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Hackathon Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested hackathon could not be identified or is currently unavailable.</p>
        <Link to="/hackathons" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← Back to all hackathons
        </Link>
      </div>
    );
  }

  const isDeadlinePassed = new Date(hackathon.submission_deadline).getTime() < Date.now();
  const startDateStr = new Date(hackathon.start_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const subDeadlineStr = new Date(hackathon.submission_deadline).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isProblemRevealed = !!hackathon.reveal_problem_statement;

  const dataset = hackathon.dataset || {
    name: 'WebCode Messy Transactions Dataset',
    filename: 'webcode_data_under_pressure_dataset.csv',
    download_url: '/datasets/webcode_data_under_pressure_dataset.csv',
    records: 256,
    columns: 9,
    version: 'v1.0'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Breadcrumb */}
      <div>
        <Link to="/hackathons" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
          ← All Hackathons
        </Link>
      </div>

      {registerSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{registerSuccessMsg}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 card-elevation relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <StatusBadge status={hackathon.status} size="lg" />
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              ORGANIZED BY SITEON
            </span>
            <span className="text-xs font-mono text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>₹45,000 TOTAL PRIZE POOL</span>
            </span>
            <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md font-bold">
              24-HOUR SPRINT
            </span>
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{registrationsCount} Registered</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {hackathon.name}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-blue-700 mt-2 font-mono">
            {hackathon.subtitle || '"Can I trust what this data is telling me?"'}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-3xl">
            {hackathon.short_description || hackathon.description}
          </p>

          {/* Key Dates & Countdown */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Official Timeline:</span>
              <p className="text-xs font-medium text-slate-900">
                <span className="font-bold">Build Phase:</span> 07 Oct, 5:00 PM – 08 Oct, 5:00 PM (24h)
              </p>
              <p className="text-xs font-medium text-slate-900">
                <span className="font-bold">Final Submission Cutoff:</span> 08 Oct 2026, 5:00 PM
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Countdown targetDate={hackathon.start_date} label="Event Launch" />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            {/* Payment & Registration Status */}
            {paymentInfo.status === 'verified' ? (
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>REGISTRATION CONFIRMED (₹49 VERIFIED)</span>
              </div>
            ) : paymentInfo.status === 'pending_verification' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>PAYMENT UNDER REVIEW</span>
                </div>
                <button
                  onClick={() => navigate(`/hackathons/${slug}/register`)}
                  className="px-3 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold shadow-xs text-center"
                >
                  Update UTR
                </button>
              </div>
            ) : paymentInfo.status === 'rejected' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>UTR REJECTED</span>
                </div>
                <button
                  onClick={() => navigate(`/hackathons/${slug}/register?step=2`)}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs text-center"
                >
                  Re-Submit Payment
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Register</span>
              </button>
            )}

            {!isDeadlinePassed ? (
              paymentInfo.isPaid ? (
                <button
                  onClick={() => navigate(`/submit/${hackathon.id}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Project</span>
                </button>
              ) : paymentInfo.status === 'pending_verification' ? (
                <button
                  onClick={() => navigate(`/hackathons/${slug}/register`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>View Verification Status</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/hackathons/${slug}/register?step=2`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pay ₹49 to Unlock Submission</span>
                </button>
              )
            ) : (
              <span className="w-full sm:w-auto text-xs font-mono text-slate-500 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-center">
                Submissions Closed
              </span>
            )}

            {isProblemRevealed && (
              <>
                <a
                  href="/datasets/webcode_data_under_pressure_dataset.csv"
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Dataset (.CSV)</span>
                </a>

                <button
                  onClick={() => {
                    setShowCsvModal(true);
                    if (previewRows.length === 0) loadCsvPreview();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Inspect Sample CSV</span>
                </button>
              </>
            )}

            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-xs transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Leaderboard & Winners</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* PRIZES & AWARDS — GRAND SPOTLIGHT CENTERPIECE SECTION         */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-b from-amber-50/60 via-white to-slate-50/70 rounded-2xl border-2 border-amber-300 p-6 sm:p-10 card-elevation relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Section Header */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Official Event Rewards & Recognition</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Prizes & Awards
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
            Total cash pool of <span className="font-bold text-amber-900">₹45,000 INR</span> along with verified Siteon certificates to honor exceptional technical achievement and reliable software engineering.
          </p>
        </div>

        {/* 4 Grand Prize Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1st Place Winner */}
          <div className="relative rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-100/90 via-amber-50/60 to-white p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              👑 Grand Champion
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-700 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 fill-amber-500 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 text-center uppercase tracking-wide">
                1st Place Winner
              </h3>
              <span className="text-[11px] font-mono text-amber-800 font-bold block text-center mb-3">
                (1st Winner)
              </span>

              <div className="text-center my-4 py-3 rounded-xl bg-white/80 border border-amber-200">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono block tracking-tight">
                  ₹20,000
                </span>
                <span className="text-xs font-bold text-blue-700 font-mono block mt-1">
                  + Certificate of Excellence
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center leading-relaxed mt-2 pt-3 border-t border-amber-200/60">
              Awarded to the Grand Champion for outstanding technical execution and data resilience.
            </p>
          </div>

          {/* 1st Runner Up */}
          <div className="relative rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-100/90 via-slate-50/60 to-white p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              🥈 1st Runner Up
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Medal className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 text-center uppercase tracking-wide">
                1st Runner Up
              </h3>
              <span className="text-[11px] font-mono text-slate-600 font-bold block text-center mb-3">
                (2nd Winner)
              </span>

              <div className="text-center my-4 py-3 rounded-xl bg-white/80 border border-slate-200">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block tracking-tight">
                  ₹15,000
                </span>
                <span className="text-xs font-bold text-blue-700 font-mono block mt-1">
                  + Certificate of Merit
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center leading-relaxed mt-2 pt-3 border-t border-slate-200/80">
              Cash prize of ₹15,000 along with verified certificate of merit.
            </p>
          </div>

          {/* 2nd Runner Up */}
          <div className="relative rounded-2xl border-2 border-orange-300 bg-gradient-to-b from-orange-100/70 via-amber-50/40 to-white p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-700 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              🥉 2nd Runner Up
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 text-orange-800 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <Medal className="w-6 h-6 text-orange-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 text-center uppercase tracking-wide">
                2nd Runner Up
              </h3>
              <span className="text-[11px] font-mono text-orange-800 font-bold block text-center mb-3">
                (3rd Winner)
              </span>

              <div className="text-center my-4 py-3 rounded-xl bg-white/80 border border-orange-200">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono block tracking-tight">
                  ₹10,000
                </span>
                <span className="text-xs font-bold text-blue-700 font-mono block mt-1">
                  + Certificate of Merit
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center leading-relaxed mt-2 pt-3 border-t border-orange-200/60">
              Cash prize of ₹10,000 along with verified certificate of merit.
            </p>
          </div>

          {/* All Finalists & Participants */}
          <div className="relative rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-100/70 via-emerald-50/40 to-white p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              📜 Verified Certificate
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 text-center uppercase tracking-wide">
                All Finalists & Participants
              </h3>
              <span className="text-[11px] font-mono text-emerald-800 font-bold block text-center mb-3">
                (Remaining Participants)
              </span>

              <div className="text-center my-4 py-3 rounded-xl bg-white/80 border border-emerald-200">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-mono block tracking-tight">
                  Official Certificate
                </span>
                <span className="text-xs font-medium text-slate-600 font-mono block mt-1">
                  Participation & Review
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center leading-relaxed mt-2 pt-3 border-t border-emerald-200/60">
              Official Certificate for verified project submission and code review.
            </p>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* IF PROBLEM STATEMENT IS UNHIDDEN: SHOW DATASET HERO SPOTLIGHT  */}
      {/* ============================================================== */}
      {isProblemRevealed && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Official Hackathon Dataset
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Release {dataset.version || 'v1.0'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                <span>WebCode Messy Transactions Dataset</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Contains 256 real-world transaction records across 9 columns with intentionally injected data quality problems: invalid dates (e.g. <code>2026/08/45</code>), negative amounts, ₹999k outliers, duplicate IDs, missing merchants, and inconsistent casing.
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 text-xs font-mono text-slate-300">
                <span><strong>Records:</strong> 256 rows</span>
                <span><strong>Columns:</strong> 9 features</span>
                <span><strong>Format:</strong> RFC 4180 CSV</span>
                <span><strong>Encoding:</strong> UTF-8</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href="/datasets/webcode_data_under_pressure_dataset.csv"
                download
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV (18 KB)</span>
              </a>
              <button
                onClick={() => {
                  setShowCsvModal(true);
                  if (previewRows.length === 0) loadCsvPreview();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Explore Raw Sample</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN GRID: Details, Timeline, Requirements, and Rules          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROBLEM STATEMENT: VISIBLE OR LOCKED */}
          {isProblemRevealed ? (
            <>
              {/* Problem Statement Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>The Problem Statement</span>
                  </h2>
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                    DATA UNDER PRESSURE
                  </span>
                </div>
                
                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">
                    Real-world data is never clean.
                  </p>
                  <p>
                    Companies deal with thousands of transactions, customer records, and business events daily. Raw CSV files contain missing values, duplicate records, invalid dates, inconsistent categories, incorrect values, and unusual transactions.
                  </p>
                  <p>
                    Your challenge is to build a <strong>reliable data intelligence web application</strong> that can take this messy CSV dataset and turn it into meaningful, explainable, and actionable insights.
                  </p>
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 font-medium text-xs sm:text-sm">
                    The goal is <strong>not just to create charts or a dashboard</strong>. Your application should help a business decision-maker answer:
                    <span className="block font-bold text-blue-900 text-sm sm:text-base mt-1.5 font-mono">
                      “Can I trust what this data is telling me?”
                    </span>
                  </div>
                </div>
              </div>

              {/* Mandatory 8-Step Pipeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
                <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Mandatory 8-Step Application Architecture Pipeline</span>
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                  Your web application should follow this end-to-end data intelligence lifecycle:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { step: '1. CSV Input', desc: 'Accept messy transaction CSV uploads or live stream file drop.' },
                    { step: '2. Validation', desc: 'Schema checks, column header integrity, row-level format verifications.' },
                    { step: '3. Data Cleaning', desc: 'Deduplication, normalization, date parsing, whitespace trimming.' },
                    { step: '4. Data Quality', desc: 'Audit metrics, anomaly tagging, trust scoring, health indexes.' },
                    { step: '5. Analysis', desc: 'Financial aggregations, category distributions, failure analytics.' },
                    { step: '6. Visualization', desc: 'Clean time-series, charts, interactive trend inspection.' },
                    { step: '7. Insights', desc: 'Explainable business insights, detected anomalies, volume shifts.' },
                    { step: '8. Evidence', desc: 'Direct drill-down to raw vs cleaned records supporting every claim.' },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 font-mono">{p.step}</h4>
                      </div>
                      <p className="text-xs text-slate-600 pl-7 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Killer Requirement Alert Box */}
              <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-6 sm:p-7 relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-rose-950 font-mono uppercase tracking-wider">
                        The Killer Requirement (Judge Stress Test)
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-900">
                        Live Audit
                      </span>
                    </div>
                    <p className="text-xs text-rose-950 leading-relaxed">
                      Judges will test your live application with extreme and adversarial edge cases during the review:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-rose-900">
                      <div className="bg-white/80 p-2 rounded border border-rose-200">• Empty CSV files & zero rows</div>
                      <div className="bg-white/80 p-2 rounded border border-rose-200">• Missing or corrupted columns</div>
                      <div className="bg-white/80 p-2 rounded border border-rose-200">• Broken dates (e.g. 2026/08/45)</div>
                      <div className="bg-white/80 p-2 rounded border border-rose-200">• Extreme outlier amounts (₹999,999)</div>
                      <div className="bg-white/80 p-2 rounded border border-rose-200">• Negative transaction values</div>
                      <div className="bg-white/80 p-2 rounded border border-rose-200">• Duplicate transaction IDs</div>
                    </div>
                    <p className="text-xs font-semibold text-rose-900 pt-1">
                      Rule: Your application must never crash, miscalculate global totals, or silently purge rows without an explainable audit flag.
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimum Functional Requirements */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Minimum Requirements Checklist</span>
                </h2>
                <div className="space-y-4">
                  {[
                    { 
                      title: '1. Data Quality Dashboard', 
                      desc: 'Summary of total records, valid rows, invalid rows, duplicate count, missing values per column, outlier detection, negative amounts, and invalid dates.' 
                    },
                    { 
                      title: '2. Transaction Analysis', 
                      desc: 'Total transaction volume, average transaction amount, breakdown by category, city, payment method, and success vs failure trends.' 
                    },
                    { 
                      title: '3. Interactive Exploration', 
                      desc: 'Search by customer or transaction ID, filter by date range, category, status, and sort by amount with instant responsive feedback.' 
                    },
                    { 
                      title: '4. Explainable Insights', 
                      desc: 'Provide reasons behind anomalies and patterns (e.g. high spending spikes, failure patterns) instead of generic black-box charts.' 
                    },
                    { 
                      title: '5. Data Quality Handling (Raw vs Usable)', 
                      desc: 'Clearly distinguish between Raw Data and Usable/Cleaned Data. Justify why records are repaired, quarantined, or tagged—never silently delete data.' 
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ======================================================= */
            /* LOCKED / HIDDEN STATE WHEN PROBLEM IS HIDDEN BY ADMIN   */
            /* ======================================================= */
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 sm:p-10 border border-slate-700 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      Confidential Challenge
                    </span>
                    <span className="text-xs font-mono text-slate-400">Releases at Build Phase</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Problem Statement & Dataset Locked
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The official hackathon problem statement, messy financial CSV dataset, and evaluation test cases are kept strictly confidential by the Siteon technical committee. This ensures equal preparation time and genuine 24-hour development for all teams.
                  </p>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 mt-4 text-xs font-sans">
                    <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                      <Clock className="w-4 h-4" />
                      <span>Release Schedule: 07 Oct 2026 at 5:00 PM IST</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      The dataset and full architectural requirements will be unlocked directly on this page the moment the 24-Hour Build sprint kicks off.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {!isRegistered && (
                      <button
                        onClick={handleRegister}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        Register Now to Reserve Slot
                      </button>
                    )}
                    <Link
                      to="/leaderboard"
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
                    >
                      View Leaderboard & Past Standings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Timeline Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Official Event Timeline</span>
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {[
                { 
                  title: 'Registration & Initial Submission', 
                  desc: 'Register and submit initial details, GitHub, LinkedIn, and Resume for preliminary evaluation.', 
                  date: 'Till 05 Oct 2026', 
                  active: true 
                },
                { 
                  title: 'Profile & Resume Shortlisting', 
                  desc: 'Siteon panel evaluates GitHub repositories, Resumes, and LinkedIn profiles. Top 50 teams / individuals are shortlisted for the 24h Hackathon.', 
                  date: '07 Oct 2026, 12:00 PM', 
                  active: false 
                },
                { 
                  title: 'Build Phase (24-Hour Hackathon)', 
                  desc: 'Intense 24-hour sprint. Develop the full web product, push code commits, and deploy live.', 
                  date: '07 Oct, 5:00 PM – 08 Oct, 5:00 PM', 
                  active: false 
                },
                { 
                  title: 'Final Submission Deadline', 
                  desc: 'Strict 24-hour cutoff at 5:00 PM. All project links, GitHub commits, and live deployments locked.', 
                  date: '08 Oct 2026, 5:00 PM', 
                  active: false 
                },
                { 
                  title: 'Technical Review & Code Inspection', 
                  desc: 'Siteon engineering committee audits code quality, architecture, database design, and live performance.', 
                  date: '08 – 10 Oct 2026', 
                  active: false 
                },
                { 
                  title: 'Shortlist & Winners Announced', 
                  desc: 'Top projects recognized, podium awards granted, and high performers reviewed for Siteon internship roles.', 
                  date: '10 Oct 2026, 6:00 PM', 
                  active: false 
                }
              ].map((step, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-[29px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${step.active ? 'border-blue-600 ring-4 ring-blue-100' : 'border-slate-300'}`} />
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                      <span className="self-start sm:self-auto text-[10.5px] font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {step.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Official Rules & Standards</span>
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {hackathon.rules && hackathon.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQs Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-3.5">
              {hackathon.faqs && hackathon.faqs.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900">{faq.q}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Judging Rubric, Eligibility, Quick Actions */}
        <div className="space-y-6">
          
          {/* Judging Criteria Rubric Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Judging Criteria (100 Pts)</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Data Engineering & Cleaning', weight: '25%', desc: 'Validation, repairing corrupted rows, quarantine logic' },
                { label: 'Analytical Depth & Insights', weight: '20%', desc: 'Financial metrics, trend discovery, explainability' },
                { label: 'Product & UX Design', weight: '20%', desc: 'Intuitive dashboard, filters, responsive exploration' },
                { label: 'Reliability & Edge Cases', weight: '15%', desc: 'Resilience under judge stress tests and empty files' },
                { label: 'Performance & Architecture', weight: '10%', desc: 'Speed of processing, clean state management' },
                { label: 'Technical Implementation', weight: '10%', desc: 'Clean GitHub commits, README, stable deployment' }
              ].map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.label}</span>
                    <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {c.weight}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-3">
              Eligibility & Format
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hackathon.eligibility}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Maximum Team Size:</span>
                <span className="font-mono font-bold text-slate-900">{hackathon.max_team_size || 4} members</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Entry Fee:</span>
                <span className="font-mono font-bold text-emerald-600">₹49 (Direct UPI)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Allowed Edits:</span>
                <span className="font-mono font-bold text-slate-900">3 Edits Max</span>
              </div>
            </div>
          </div>

          {/* Dataset Schema Quick Reference (Only if unhidden) */}
          {isProblemRevealed && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Dataset Columns (9)</span>
              </h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                {[
                  'transaction_id',
                  'transaction_date',
                  'customer_age',
                  'city',
                  'category',
                  'merchant',
                  'amount_inr',
                  'payment_method',
                  'status'
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 text-slate-700">
                    <span>{c}</span>
                    <span className="text-[10px] text-slate-400">col {i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href="/datasets/webcode_data_under_pressure_dataset.csv"
                  download
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Dataset CSV</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CSV Sample Preview Modal (Only if unhidden) */}
      {isProblemRevealed && showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono text-slate-900">
                  Dataset Sample Preview (First 35 Rows of 256)
                </h3>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-xs px-2 py-1 rounded hover:bg-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {loadingCsv ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Reading CSV file from server...</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 border-b border-slate-200 font-mono text-slate-700 sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5 text-slate-400">#</th>
                        {previewHeaders.map((h, i) => (
                          <th key={i} className="py-2 px-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {previewRows.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/40">
                          <td className="py-1.5 px-2.5 text-slate-400">{row.id}</td>
                          {row.data.map((cell, cIdx) => {
                            const trimmed = cell.trim();
                            const isNegative = trimmed.startsWith('-');
                            const isOutlier = trimmed === '999999.0' || trimmed === '125000.0' || trimmed === '85000.0';
                            const isCorruptDate = trimmed.includes('45') || trimmed === 'not_available';
                            const isMissing = trimmed === '';
                            return (
                              <td 
                                key={cIdx} 
                                className={`py-1.5 px-2.5 ${
                                  isMissing ? 'bg-amber-50 text-amber-700 italic font-sans' :
                                  isNegative ? 'bg-rose-50 text-rose-700 font-bold' :
                                  isOutlier ? 'bg-purple-50 text-purple-700 font-bold' :
                                  isCorruptDate ? 'bg-rose-100 text-rose-800 font-bold' :
                                  'text-slate-800'
                                }`}
                              >
                                {isMissing ? '[BLANK]' : trimmed}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Corrupted Date / Negative Amount</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Extreme Outlier</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Blank / Missing Field</span>
              </div>
              <a
                href="/datasets/webcode_data_under_pressure_dataset.csv"
                download
                className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full CSV</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        hackathon={hackathon}
        user={user}
        onSuccess={() => {
          loadData();
          setRegisterSuccessMsg("₹49 payment submitted! Your 12-digit UTR is under verification by Siteon admin.");
          setTimeout(() => setRegisterSuccessMsg(''), 5000);
        }}
      />

    </div>
  );
}
