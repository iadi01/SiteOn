import React, { useState } from 'react';
import { db } from '../services/db';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Upload, 
  ShieldCheck, 
  Smartphone, 
  ExternalLink,
  ArrowRight,
  Clock,
  Trophy,
  Award,
  Sparkles
} from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, hackathon, user, onSuccess }) {
  if (!isOpen) return null;

  const settings = db.getSettings();
  const upiId = settings.upi_id || 'siteon@ptyes';
  const payeeName = settings.upi_payee_name || 'Siteon';
  const feeAmount = hackathon?.entry_fee || settings.registration_fee || 49;

  // Generate NPCI-standard compliant UPI URI
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(feeAmount)}&cu=INR&tn=${encodeURIComponent('WebCode Entry')}`;
  
  // Dual high-reliability QR code endpoints (primary + instant fallback)
  const primaryQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiPayload)}&margin=8`;
  const fallbackQrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiPayload)}&size=300&margin=2`;

  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotData, setScreenshotData] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUtrChange = (e) => {
    // Only allow numbers and limit to 12 digits
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

  const handleSubmit = (e) => {
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

      setSuccessMsg('Payment submitted successfully! Admin will verify your UTR shortly.');
      setTimeout(() => {
        if (onSuccess) onSuccess(res.record);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while submitting payment.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                {hackathon?.name || 'WebCode: Data Under Pressure'} Registration
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Compete for ₹45,000 in cash awards & official merit certificates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 font-mono">
                Payment Verification Submitted
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {successMsg}
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 max-w-xs mx-auto text-[11px] font-mono text-slate-700">
                UTR Number: <strong className="text-slate-900">{utrNumber}</strong>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* ─── STEP A: PRIZES & AWARDS HIGHLIGHT (PEHLE DIKHEGA) ─── */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-200/90 p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                        Prizes & Awards (Total Pool: ₹45,000 INR)
                      </h4>
                      <p className="text-[10.5px] text-slate-600">
                        Honoring exceptional technical achievement and reliable software engineering
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                    CASH PRIZES
                  </span>
                </div>

                {/* 3 Winner Podium Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* 1st Place */}
                  <div className="bg-gradient-to-b from-amber-100/90 to-amber-50/70 border-2 border-amber-400 rounded-xl p-3 text-center shadow-xs relative">
                    <div className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1">
                      <span>👑</span>
                      <span className="uppercase tracking-wider text-[10px] font-mono font-extrabold">1st Winner</span>
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-amber-950 font-mono mt-1">
                      ₹20,000
                    </div>
                    <div className="text-[10px] font-bold text-amber-800 mt-0.5">
                      + Certificate of Excellence
                    </div>
                    <p className="text-[9.5px] text-amber-800/80 mt-1 leading-tight">
                      Awarded to Grand Champion for outstanding execution.
                    </p>
                  </div>

                  {/* 2nd Place */}
                  <div className="bg-gradient-to-b from-slate-100 to-slate-50 border border-slate-300 rounded-xl p-3 text-center shadow-xs">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                      <span>🥈</span>
                      <span className="uppercase tracking-wider text-[10px] font-mono font-extrabold">2nd Winner</span>
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono mt-1">
                      ₹15,000
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 mt-0.5">
                      + Certificate of Merit
                    </div>
                    <p className="text-[9.5px] text-slate-600 mt-1 leading-tight">
                      Cash prize of ₹15,000 along with verified certificate.
                    </p>
                  </div>

                  {/* 3rd Place */}
                  <div className="bg-gradient-to-b from-amber-100/50 to-orange-50/30 border border-amber-300/80 rounded-xl p-3 text-center shadow-xs">
                    <div className="text-xs font-bold text-orange-900 flex items-center justify-center gap-1">
                      <span>🥉</span>
                      <span className="uppercase tracking-wider text-[10px] font-mono font-extrabold">3rd Winner</span>
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-orange-950 font-mono mt-1">
                      ₹10,000
                    </div>
                    <div className="text-[10px] font-bold text-orange-800 mt-0.5">
                      + Certificate of Merit
                    </div>
                    <p className="text-[9.5px] text-orange-800/80 mt-1 leading-tight">
                      Cash prize of ₹10,000 along with verified certificate.
                    </p>
                  </div>

                </div>

                {/* All Finalists Certificate Strip */}
                <div className="flex items-center justify-between bg-white/90 border border-amber-200 px-3.5 py-2.5 rounded-xl text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>All Finalists & Participants (Remaining):</strong> Official Certificate for verified project submission and code review.</span>
                  </div>
                </div>
              </div>

              {/* ─── STEP B: NOMINAL ENTRY FEE TRANSPARENCY ─── */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Entry Fee: ₹{feeAmount} Only</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 mt-0.5 leading-relaxed">
                    A nominal entry fee of ₹{feeAmount} is required to prevent fake/spam registrations and directly fund the ₹45,000 verified prize pool.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xl font-black text-blue-700">₹{feeAmount}</span>
                  <span className="block text-[9.5px] text-slate-400 font-mono">Direct UPI • Zero Fee</span>
                </div>
              </div>

              {/* Step 1: Scan & Pay */}
              <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 text-center">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 text-left">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-700 block">STEP 1</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">Scan QR Code or Pay to UPI ID</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Entry Amount</span>
                    <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-600">₹{feeAmount}.00</span>
                  </div>
                </div>

                {/* QR Code display with Dual-CDN Fallback */}
                <div className="inline-block p-3.5 bg-white rounded-2xl border-2 border-slate-800 shadow-md">
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
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">Google Pay</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">Paytm</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">BHIM UPI</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Cred</span>
                </div>

                {/* UPI ID copy box */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Or Pay Manually to UPI ID:</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">100% Free • No Gateway Fee</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 tracking-wide select-all">
                      {upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        copied 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy UPI'}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Direct Pay Button */}
                <div>
                  <a
                    href={upiPayload}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay ₹{feeAmount} via UPI App (GPay / PhonePe / Paytm)</span>
                  </a>
                </div>

                {/* Anti-Hiccup Helpful Guidance */}
                <div className="text-left bg-blue-50/70 rounded-xl p-3 border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Tips to Ensure Smooth Payment:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[10.5px]">
                    <li>UPI App me recipient name <strong>Siteon</strong> verify karein.</li>
                    <li>Amount exact <strong>₹{feeAmount}</strong> transfer karein.</li>
                    <li>Payment successful hone par receipt se <strong>12-digit UTR</strong> copy karein.</li>
                  </ul>
                </div>
              </div>

              {/* Step 2: Verification Details */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800 font-mono">
                      STEP 2: Enter 12-Digit UTR Number <span className="text-rose-500">*</span>
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
                    className="w-full px-3.5 py-2.5 text-sm font-mono tracking-wider font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Found on your payment receipt as <strong>UPI Ref No.</strong>, <strong>UTR</strong>, or <strong>Transaction ID</strong>.
                  </p>
                </div>

                {/* Optional Screenshot */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Screenshot <span className="text-slate-400 font-normal">(Optional for faster approval)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors">
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
                          className="w-9 h-9 rounded object-cover border border-slate-200"
                        />
                        <span className="text-[11px] text-emerald-600 font-semibold font-mono">
                          Receipt attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anti-Fraud Notice */}
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>Strict Anti-Fraud:</strong> Each 12-digit UTR is matched in real time. Duplicate, fabricated, or shared UTRs are rejected by the system and lead to immediate profile disqualification.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || utrNumber.length !== 12}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>{submitting ? 'Verifying...' : 'Submit 12-Digit UTR & Complete Registration'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
