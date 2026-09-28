import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Upload, 
  ShieldCheck, 
  Smartphone, 
  AlertCircle, 
  Clock, 
  Sparkles,
  QrCode,
  FileCheck,
  Zap,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Register() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1 = Prizes & Benefits, 2 = Payment & UTR
  
  // Payment Form States
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotData, setScreenshotData] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ isPaid: false, status: 'not_registered' });
  const [refreshing, setRefreshing] = useState(false);

  const hackathonSlug = slug || 'webcode';

  const loadData = () => {
    const found = db.getHackathonByIdOrSlug(hackathonSlug);
    if (found) {
      setHackathon(found);
      if (user) {
        const pInfo = db.isUserPaidAndVerified(user.id, found.id);
        setPaymentInfo(pInfo);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Check if URL specifies step 2
    if (searchParams.get('step') === '2') {
      if (!user) {
        navigate(`/auth?redirect=/hackathons/${hackathonSlug}/register?step=2`);
        return;
      }
      setCurrentStep(2);
    }

    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'registrations' || e.detail?.table === 'hackathons') {
        loadData();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, [hackathonSlug, user, searchParams]);

  const handleProceedToStep2 = () => {
    if (!user) {
      navigate(`/auth?redirect=/hackathons/${hackathonSlug}/register?step=2`);
      return;
    }
    setCurrentStep(2);
    setSearchParams({ step: '2' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const settings = db.getSettings();
  const upiId = settings.upi_id || 'siteon@ptyes';
  const payeeName = settings.upi_payee_name || 'Siteon';
  const feeAmount = hackathon?.entry_fee || settings.registration_fee || 49;

  // NPCI-compliant UPI URI
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(feeAmount)}&cu=INR&tn=${encodeURIComponent('WebCode Entry')}`;
  const primaryQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayload)}&margin=8`;
  const fallbackQrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiPayload)}&size=300&margin=2`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUtrChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
    setUtrNumber(cleaned);
    setErrorMsg('');
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setScreenshotData(uploadEvent.target.result);
      setScreenshotPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (utrNumber.length !== 12) {
      setErrorMsg('UTR / UPI Reference ID must be exactly 12 numeric digits (e.g. 427189023411).');
      return;
    }

    setSubmitting(true);

    try {
      const res = db.createPaidRegistration(user.id, hackathon.id, {
        utr_number: utrNumber,
        screenshot_url: screenshotData,
        amount: feeAmount
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to submit payment.');
        setSubmitting(false);
        return;
      }

      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while submitting payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshStatus = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Hackathon Not Found</h2>
        <Link to="/hackathons" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← Back to Hackathons
        </Link>
      </div>
    );
  }

  // ─── IF PAYMENT ALREADY UNDER REVIEW OR VERIFIED ───
  if (paymentInfo.status === 'verified') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          REGISTRATION CONFIRMED
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
          You're Registered for {hackathon.name}!
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Your ₹49 entry fee payment has been verified by the Siteon committee. You have full access to participate and submit up to 3 projects.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/submit/${hackathon.id}`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Go to Project Submission Portal →
          </Link>
          <Link
            to={`/hackathons/${hackathonSlug}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            View Hackathon Details
          </Link>
        </div>
      </div>
    );
  }

  if (paymentInfo.status === 'pending_verification') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 border border-amber-200 shadow-xs">
          <Clock className="w-8 h-8 animate-pulse text-amber-600" />
        </div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          PAYMENT UNDER REVIEW
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
          Payment Verification in Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
          We have received your ₹49 entry fee with UTR. Our team verifies the 12-digit UTR against our bank statement before unlocking your project submission.
        </p>

        {/* Verification Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6 text-left text-xs space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Hackathon:</span>
            <span className="font-bold text-slate-900">{hackathon.name}</span>
          </div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Submitted 12-Digit UTR:</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
              {paymentInfo.registration?.utr_number || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Amount:</span>
            <span className="font-mono font-bold text-slate-900">₹49 (Direct UPI)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Pending Admin Match
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{refreshing ? 'Checking...' : 'Refresh Status'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentStep(2);
              setPaymentInfo({ isPaid: false, status: 'not_registered' });
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Re-enter / Update UTR
          </button>
          <Link
            to={`/hackathons/${hackathonSlug}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* ─── STEP PROGRESS BAR ─── */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs font-mono font-semibold text-slate-500 mb-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className={`px-2 py-0.5 rounded font-bold transition-colors ${
              currentStep === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-700'
            }`}>
              1. PRIZES & BENEFITS
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`px-2 py-0.5 rounded font-bold transition-colors ${
              currentStep === 2 ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-slate-200 text-slate-700'
            }`}>
              2. ENTRY FEE (₹49)
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[10px] sm:text-xs">Step {currentStep} of 2</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: currentStep === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── PAGE 1: PRIZES & AWARDS SHOWCASE (PEHLE YEH DIKHEGA) ─── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto px-1">
            <span className="inline-block text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
              👑 TOTAL CASH PRIZE POOL: ₹45,000 INR
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 sm:mt-4 tracking-tight">
              Prizes & Awards Showcase
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Total cash pool of ₹45,000 INR along with verified Siteon certificates to honor exceptional technical achievement and reliable software engineering.
            </p>
          </div>

          {/* 3 Main Winner Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1st Place - Grand Champion */}
            <div className="bg-gradient-to-b from-amber-100/90 via-amber-50/70 to-white border-2 border-amber-400 rounded-2xl p-6 text-center shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300/80 mb-4">
                  <span>👑</span>
                  <span>Grand Champion</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">1st Place Winner</h3>
                <span className="text-xs font-mono text-amber-800 font-semibold block mt-0.5">(1st Winner)</span>
                
                <div className="my-5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-amber-950 block">₹20,000</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block mt-2">
                    + Certificate of Excellence
                  </span>
                </div>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed border-t border-amber-200/80 pt-4">
                Awarded to the Grand Champion for outstanding technical execution and data resilience.
              </p>
            </div>

            {/* 2nd Place - 1st Runner Up */}
            <div className="bg-gradient-to-b from-slate-100 via-slate-50 to-white border border-slate-300 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-400" />
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-slate-700 bg-slate-200/80 px-3 py-1 rounded-full border border-slate-300 mb-4">
                  <span>🥈</span>
                  <span>1st Runner Up</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">1st Runner Up</h3>
                <span className="text-xs font-mono text-slate-600 font-semibold block mt-0.5">(2nd Winner)</span>
                
                <div className="my-5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 block">₹15,000</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full inline-block mt-2">
                    + Certificate of Merit
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-4">
                Cash prize of ₹15,000 along with verified certificate of merit.
              </p>
            </div>

            {/* 3rd Place - 2nd Runner Up */}
            <div className="bg-gradient-to-b from-orange-100/60 via-orange-50/40 to-white border border-orange-200 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-orange-400" />
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-orange-800 bg-orange-200/70 px-3 py-1 rounded-full border border-orange-300 mb-4">
                  <span>🥉</span>
                  <span>2nd Runner Up</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">2nd Runner Up</h3>
                <span className="text-xs font-mono text-orange-700 font-semibold block mt-0.5">(3rd Winner)</span>
                
                <div className="my-5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-orange-950 block">₹10,000</span>
                  <span className="text-xs font-bold text-orange-900 bg-orange-100 border border-orange-300 px-2.5 py-0.5 rounded-full inline-block mt-2">
                    + Certificate of Merit
                  </span>
                </div>
              </div>
              <p className="text-xs text-orange-800/80 leading-relaxed border-t border-orange-200 pt-4">
                Cash prize of ₹10,000 along with verified certificate of merit.
              </p>
            </div>

          </div>

          {/* All Participants Certificate Card */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 card-elevation flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  All Finalists & Participants (Remaining)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Official Certificate for verified project submission and code review by Siteon panel.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
              OFFICIAL CERTIFICATE
            </span>
          </div>

          {/* Participation Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <FileCheck className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-slate-900">Engineering Code Review</h5>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Receive structured evaluations of your GitHub code architecture and live deployment.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-slate-900">Internship Priority</h5>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Top submissions are directly reviewed for engineering opportunities at Siteon.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-slate-900">3 Submissions Allowed</h5>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Build solo or in teams of up to 4 members with up to 3 project iterations.
              </p>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Link
              to={`/hackathons/${hackathonSlug}`}
              className="w-full sm:w-auto text-center py-2 sm:py-0 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hackathon Details</span>
            </Link>

            <button
              type="button"
              onClick={handleProceedToStep2}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Proceed to Complete Registration (₹49 Fee)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ─── PAGE 2: PAYMENT & UTR VERIFICATION (THORRA PAISA WALA) ─ */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              STEP 2: UPI PAYMENT & UTR SUBMISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Complete ₹{feeAmount} Registration
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Scan the QR Code or pay directly to the UPI ID, then enter your 12-digit UTR reference number below.
            </p>
          </div>

          {/* Nominal Fee Explanation Banner */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Why is there a nominal ₹{feeAmount} entry fee?
                </h4>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  To prevent automated bot/spam entries, maintain serious competition, and directly fund the <strong>₹45,000 cash prize pool (₹20,000 for 1st Winner)</strong>.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 border-t sm:border-t-0 sm:border-l border-blue-200/80 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-2xl font-black font-mono text-blue-700">₹{feeAmount}</span>
              <span className="block text-[10px] text-slate-400 font-mono">100% Direct UPI</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Two-Column Grid: Left QR / Right Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Scan & Pay */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-center card-elevation flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-left">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-700 block">METHOD 1</span>
                    <span className="text-xs font-bold text-slate-900">Scan QR Code with Any UPI App</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-emerald-600">₹{feeAmount}.00</span>
                </div>

                {/* QR Code Container */}
                <div className="my-4 inline-block p-3.5 bg-white rounded-2xl border-2 border-slate-800 shadow-md">
                  <img
                    src={primaryQrCodeUrl}
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackQrCodeUrl) {
                        e.currentTarget.src = fallbackQrCodeUrl;
                      }
                    }}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                  />
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10.5px] font-mono text-slate-700 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>UPI ID: <strong className="text-slate-900">{upiId}</strong></span>
                  </div>
                </div>

                {/* Supported Apps Pills */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono mb-4">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">Google Pay</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">Paytm</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">BHIM</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Cred</span>
                </div>

                {/* UPI ID Copy Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Or Pay to UPI ID:</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">Zero Platform Fee</span>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <span className="font-mono font-extrabold text-sm text-slate-900 select-all">
                      {upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                        copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Mobile Link */}
              <div className="pt-2">
                <a
                  href={upiPayload}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open & Pay in Mobile UPI App</span>
                </a>
              </div>
            </div>

            {/* Right: Enter 12-Digit UTR Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 card-elevation flex flex-col justify-between text-xs">
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-700 block">METHOD 2</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    Submit 12-Digit UTR Reference ID
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    After paying ₹{feeAmount}, enter the 12-digit transaction ID / UTR shown on your payment receipt.
                  </p>
                </div>

                {/* UTR Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 font-mono">
                      12-Digit UTR Number <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[11px] font-mono font-bold ${
                      utrNumber.length === 12 ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {utrNumber.length}/12 Digits
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={utrNumber}
                    onChange={handleUtrChange}
                    placeholder="e.g. 427189023411"
                    maxLength={12}
                    className="w-full px-3.5 py-3 text-base font-mono tracking-wider font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 bg-slate-50/50"
                  />
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Found as <strong>UPI Ref No.</strong>, <strong>UTR</strong>, or <strong>Transaction ID</strong> on GPay / PhonePe / Paytm receipts.
                  </p>
                </div>

                {/* Optional Screenshot Receipt */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Screenshot <span className="text-slate-400 font-normal">(Optional for faster approval)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{screenshotPreview ? 'Change Screenshot' : 'Upload Receipt'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                    {screenshotPreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={screenshotPreview}
                          alt="Receipt Preview"
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                        />
                        <span className="text-[11px] text-emerald-600 font-semibold font-mono">
                          Receipt attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anti-Fraud Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Strict Anti-Fraud Protection:</strong> Each 12-digit UTR is verified against bank credits. Duplicate or invalid UTRs are rejected by the system.
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting || utrNumber.length !== 12}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{submitting ? 'Verifying...' : 'Submit 12-Digit UTR & Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

              {/* Back to Step 1 */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setSearchParams({ step: '1' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Prizes & Awards</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
