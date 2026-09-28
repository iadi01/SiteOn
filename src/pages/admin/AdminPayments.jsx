import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  AlertCircle,
  Eye,
  Filter,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';

export default function AdminPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('pending_verification'); // 'all', 'pending_verification', 'verified', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, regId: null, utr: '' });
  const [rejectionReason, setRejectionReason] = useState('UTR not found in bank statement');
  const [actionSuccess, setActionSuccess] = useState('');
  const [copiedUtr, setCopiedUtr] = useState('');

  const loadPayments = () => {
    const list = db.getAllPayments();
    setPayments(list);
  };

  useEffect(() => {
    loadPayments();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'registrations') {
        loadPayments();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  const handleVerify = (regId, utr) => {
    const res = db.verifyRegistrationPayment(regId, 'verified', user?.id || 'admin');
    if (res.success) {
      setActionSuccess(`Payment with UTR ${utr} marked as VERIFIED! Participant unlocked.`);
      loadPayments();
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleOpenReject = (regId, utr) => {
    setRejectionModal({ open: true, regId, utr });
    setRejectionReason('UTR not matched in bank statement');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    const { regId, utr } = rejectionModal;
    const res = db.verifyRegistrationPayment(regId, 'rejected', user?.id || 'admin', rejectionReason.trim());
    if (res.success) {
      setRejectionModal({ open: false, regId: null, utr: '' });
      setActionSuccess(`Payment with UTR ${utr} marked as REJECTED.`);
      loadPayments();
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleCopyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(''), 2000);
  };

  // Stats calculation
  const totalVerified = payments.filter(p => p.payment_status === 'verified').length;
  const totalPending = payments.filter(p => p.payment_status === 'pending_verification').length;
  const totalRejected = payments.filter(p => p.payment_status === 'rejected').length;
  const totalCollections = totalVerified * 49;

  // Filter & Search
  const filteredPayments = payments.filter((item) => {
    if (filter !== 'all') {
      if (filter === 'pending_verification' && item.payment_status !== 'pending_verification') return false;
      if (filter === 'verified' && item.payment_status !== 'verified') return false;
      if (filter === 'rejected' && item.payment_status !== 'rejected') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.user_name?.toLowerCase().includes(q);
      const matchEmail = item.user_email?.toLowerCase().includes(q);
      const matchUtr = item.utr_number?.toLowerCase().includes(q);
      return matchName || matchEmail || matchUtr;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
              Payments & UTR Verification
            </span>
            <span className="text-xs text-slate-400 font-mono">₹49 Entry Model</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Participant Payments & UTR Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify 12-digit transaction references against your bank SMS/app notifications to approve hackathon participation.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Total Collections</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 mt-1 block">
            ₹{totalCollections}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{totalVerified} paid registrations</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/20 card-elevation">
          <span className="text-[11px] font-mono text-amber-700 uppercase tracking-wider block">Pending Verification</span>
          <span className="text-2xl font-extrabold font-mono text-amber-900 mt-1 block">
            {totalPending}
          </span>
          <span className="text-[11px] text-amber-700 mt-0.5 block">Awaiting admin match</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Verified & Unlocked</span>
          <span className="text-2xl font-extrabold font-mono text-blue-700 mt-1 block">
            {totalVerified}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Full submission access</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Rejected / Failed</span>
          <span className="text-2xl font-extrabold font-mono text-slate-700 mt-1 block">
            {totalRejected}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Invalid UTR / unpaid</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 card-elevation">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending_verification', label: `Pending (${totalPending})` },
            { id: 'verified', label: `Verified (${totalVerified})` },
            { id: 'rejected', label: `Rejected (${totalRejected})` },
            { id: 'all', label: `All (${payments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by UTR, Name, or Email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">12-Digit UTR Number</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Screenshot</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    No payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => {
                  const isPending = item.payment_status === 'pending_verification';
                  const isVerified = item.payment_status === 'verified';
                  const isRejected = item.payment_status === 'rejected';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Participant */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.user_name}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">{item.user_email}</span>
                      </td>

                      {/* 12-Digit UTR */}
                      <td className="py-3 px-4">
                        {item.utr_number ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                              {item.utr_number}
                            </span>
                            <button
                              onClick={() => handleCopyUtr(item.utr_number)}
                              title="Copy UTR to clipboard"
                              className="text-slate-400 hover:text-slate-700 p-1 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedUtr === item.utr_number && (
                              <span className="text-[10px] text-emerald-600 font-mono">Copied!</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono italic">No UTR entered</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₹{item.fee_amount || 49}
                      </td>

                      {/* Screenshot */}
                      <td className="py-3 px-4">
                        {item.screenshot_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedScreenshot(item.screenshot_url)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No receipt</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {item.payment_submitted_at ? new Date(item.payment_submitted_at).toLocaleString() : new Date(item.registered_at).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleVerify(item.id, item.utr_number)}
                                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                              >
                                Verify Payment
                              </button>
                              <button
                                onClick={() => handleOpenReject(item.id, item.utr_number)}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {isVerified && (
                            <span className="text-[11px] font-mono text-emerald-700 font-bold">
                              Verified
                            </span>
                          )}
                          {isRejected && (
                            <button
                              onClick={() => handleVerify(item.id, item.utr_number)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              Re-Approve
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-4 overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold font-mono text-slate-800">Payment Receipt Screenshot</span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 p-2 rounded-xl">
              <img
                src={selectedScreenshot}
                alt="Receipt Full Preview"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">
                Reject Payment (UTR: {rejectionModal.utr})
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              State the reason why this payment cannot be approved. The participant will be notified so they can submit a genuine transaction reference.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rejection Reason
                </label>
                <input
                  type="text"
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. UTR not found in bank SMS, Amount mismatch..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-600/20 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModal({ open: false, regId: null, utr: '' })}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
