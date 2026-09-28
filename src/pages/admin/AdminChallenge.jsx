import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  Database, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Eye, 
  Radio, 
  Sliders, 
  Sparkles, 
  RefreshCw,
  FileCode,
  Flame,
  Award,
  Lock
} from 'lucide-react';

export default function AdminChallenge() {
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [datasetVersion, setDatasetVersion] = useState('v1.0');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newVersionInput, setNewVersionInput] = useState('');

  const loadChallenge = () => {
    const found = db.getHackathonByIdOrSlug('webcode') || db.getHackathonByIdOrSlug('h_webcode_2026');
    if (found) {
      setHackathon(found);
      if (found.dataset?.version) {
        setDatasetVersion(found.dataset.version);
      }
    }
  };

  useEffect(() => {
    loadChallenge();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'hackathons') {
        loadChallenge();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  // Fetch real CSV preview from public directory
  const loadCsvPreview = async () => {
    setLoadingDataset(true);
    try {
      const res = await fetch('/datasets/webcode_data_under_pressure_dataset.csv');
      if (!res.ok) throw new Error('Failed to load dataset file');
      const text = await res.text();
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        setPreviewHeaders(headers);
        const rows = lines.slice(1, 41).map((line, idx) => {
          // Basic CSV row parsing
          const parts = line.split(',');
          return { id: idx + 1, data: parts };
        });
        setPreviewRows(rows);
      }
    } catch (err) {
      console.error('Error reading CSV preview:', err);
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!hackathon) return;
    setStatusMessage('');
    setStatusError('');
    const res = db.updateChallengeStatus(hackathon.id, newStatus, user?.id || 'admin');
    if (res.success) {
      setStatusMessage(`Challenge status updated to "${newStatus}" successfully.`);
      loadChallenge();
      setTimeout(() => setStatusMessage(''), 4000);
    } else {
      setStatusError(res.error || 'Failed to update challenge status.');
    }
  };

  const handleUpdateDatasetMetadata = (e) => {
    e.preventDefault();
    if (!newVersionInput.trim()) return;
    const res = db.updateChallengeDataset(hackathon.id, {
      version: newVersionInput.trim(),
      status: 'Live & Published'
    }, user?.id || 'admin');

    if (res.success) {
      setDatasetVersion(newVersionInput.trim());
      setUploadModalOpen(false);
      setStatusMessage(`Dataset updated to version ${newVersionInput.trim()}.`);
      loadChallenge();
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleToggleVisibility = (shouldReveal) => {
    if (!hackathon) return;
    setStatusMessage('');
    setStatusError('');
    const res = db.toggleProblemStatementVisibility(hackathon.id, shouldReveal, user?.id || 'admin');
    if (res.success) {
      setStatusMessage(
        shouldReveal 
          ? "Problem Statement & Dataset are now UNHIDDEN and PUBLICLY VISIBLE to participants."
          : "Problem Statement & Dataset are now HIDDEN from public view."
      );
      loadChallenge();
      setTimeout(() => setStatusMessage(''), 4000);
    } else {
      setStatusError(res.error || 'Failed to update visibility.');
    }
  };

  if (!hackathon) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-mono">Loading WebCode challenge...</p>
      </div>
    );
  }

  const dataset = hackathon.dataset || {};
  const isCurrentlyLive = hackathon.status === 'Live';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-purple-100 text-purple-800">
              Admin Challenge Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {hackathon.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            WebCode: Data Under Pressure
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Problem Statement, Dataset Governance, Pipeline Verification & Go-Live Controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/hackathons/webcode"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Preview Participant Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Quick Go Live Button */}
          {isCurrentlyLive ? (
            <button
              onClick={() => handleStatusChange('Submissions Closed')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-700" />
              <span>Close Submissions</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('Live')}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm ring-2 ring-emerald-500/20"
            >
              <Radio className="w-3.5 h-3.5 animate-ping text-white" />
              <span>Go Live / Publish Challenge</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {statusError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Primary Status Lifecycle Controller Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>CHALLENGE LIFECYCLE & STATE TRANSITIONS</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control participant visibility, timer states, and submission acceptance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Current Status:</span>
            <StatusBadge status={hackathon.status} size="lg" />
          </div>
        </div>

        {/* Transition Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          {[
            { key: 'Draft', label: 'Draft', desc: 'Hidden from public index', color: 'slate' },
            { key: 'Upcoming', label: 'Upcoming', desc: 'Registration only', color: 'blue' },
            { key: 'Live', label: 'Live / Active', desc: 'Submissions accepted', color: 'emerald' },
            { key: 'Submissions Closed', label: 'Closed', desc: 'Locks all submissions', color: 'amber' },
            { key: 'Completed', label: 'Completed', desc: 'Leaderboard finalized', color: 'purple' },
          ].map((item) => {
            const isSelected = hackathon.status === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleStatusChange(item.key)}
                className={`p-3 text-left rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {item.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Statement Visibility Control Card */}
      <div className={`rounded-xl border p-6 card-elevation transition-all ${
        hackathon.reveal_problem_statement 
          ? 'bg-emerald-50/50 border-emerald-300' 
          : 'bg-amber-50/60 border-amber-300'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              hackathon.reveal_problem_statement 
                ? 'bg-emerald-600 text-white' 
                : 'bg-amber-600 text-white'
            }`}>
              {hackathon.reveal_problem_statement ? <Eye className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-mono">
                  PROBLEM STATEMENT & DATASET PUBLIC VISIBILITY
                </h2>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase ${
                  hackathon.reveal_problem_statement 
                    ? 'bg-emerald-200 text-emerald-900 border border-emerald-300' 
                    : 'bg-amber-200 text-amber-900 border border-amber-300'
                }`}>
                  {hackathon.reveal_problem_statement ? 'UNHIDDEN / PUBLIC' : 'HIDDEN FROM PARTICIPANTS'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {hackathon.reveal_problem_statement 
                  ? 'The Problem Statement, 256-row CSV dataset download, 8-step pipeline, and killer requirements are currently UNHIDDEN and visible to all participants on the hackathon page.'
                  : 'The Problem Statement and CSV dataset are currently HIDDEN. Participants only see the Prizes & Awards, Timeline, Registration, and a "Revealing Soon" teaser.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {hackathon.reveal_problem_statement ? (
              <button
                type="button"
                onClick={() => handleToggleVisibility(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Hide Problem Statement</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleVisibility(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all ring-2 ring-emerald-500/20"
              >
                <Eye className="w-4 h-4" />
                <span>Unhide / Reveal to Public</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Governance Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-mono">
                  OFFICIAL DATASET GOVERNANCE
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-800">
                  {dataset.status || 'Live & Published'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {dataset.filename || 'webcode_data_under_pressure_dataset.csv'} — Version {datasetVersion}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setShowPreviewModal(true);
                if (previewRows.length === 0) loadCsvPreview();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Inspect Raw CSV (40 Rows)</span>
            </button>

            <a
              href="/datasets/webcode_data_under_pressure_dataset.csv"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>

            <button
              onClick={() => {
                setNewVersionInput(datasetVersion);
                setUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Version / Replace</span>
            </button>
          </div>
        </div>

        {/* Dataset Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Total Records</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
              {dataset.records || 256} Rows
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Schema Width</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
              {dataset.columns || 9} Columns
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Format</span>
            <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
              RFC 4180 CSV
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Current Release</span>
            <span className="text-xl font-bold font-mono text-blue-700 mt-1 block">
              {datasetVersion}
            </span>
          </div>
        </div>

        {/* Column Schema & Problem Matrix */}
        <div className="mt-6">
          <h3 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider mb-3">
            Dataset Schema & Real-World Anomaly Matrix
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Column Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Real-World Anomaly Injected</th>
                  <th className="py-2.5 px-3">Required Participant Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {[
                  { name: 'transaction_id', type: 'String', problem: 'Duplicate IDs (TXN100025, TXN100100) & missing values in trailing rows', action: 'Deduplicate, flag conflicting amounts, quarantine broken records' },
                  { name: 'transaction_date', type: 'Date / String', problem: 'Invalid calendar dates (e.g. 2026/08/45, not_available) & blank cells', action: 'Validate ISO 8601, flag corrupt dates, separate time-series valid bucket' },
                  { name: 'customer_age', type: 'Integer', problem: 'Missing customer ages and unusual distribution bounds', action: 'Audit missing rate, compute robust median without corrupting age cohorts' },
                  { name: 'city', type: 'String', problem: 'Untrimmed whitespace & empty city records', action: 'Trim whitespaces, normalize capitalization, categorize missing as "Unknown"' },
                  { name: 'category', type: 'String', problem: 'Inconsistent casing (grocery vs Grocery) & trailing space (Food )', action: 'Standardize canonical categories via lowercase mapping' },
                  { name: 'merchant', type: 'String', problem: 'Missing merchant labels across multiple transactions', action: 'Flag unassigned merchants, audit counterparty concentration' },
                  { name: 'amount_inr', type: 'Float', problem: 'Negative amounts (-1865.13) & extreme outliers (₹999,999.0)', action: 'Flag negative values as refund/reversal or anomaly; detect outliers via IQR/Z-score' },
                  { name: 'payment_method', type: 'String', problem: 'Inconsistent casing (CARD, Card, UPI, upi, Cash) & blank values', action: 'Normalize payment channels, audit gateway share cleanly' },
                  { name: 'status', type: 'String', problem: 'Inconsistent statuses (Success, SUCCESS, Failed, Pending, blank)', action: 'Normalize to canonical status enums, measure real success vs fail ratios' },
                ].map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{col.name}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{col.type}</td>
                    <td className="py-2 px-3 text-slate-700">{col.problem}</td>
                    <td className="py-2 px-3 text-emerald-700 font-medium">{col.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Challenge Architecture & The Killer Requirement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pipeline Stages */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-mono mb-4">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>MANDATORY 8-STAGE DATA PIPELINE</span>
          </h2>
          <div className="space-y-3">
            {[
              { step: 1, title: 'CSV Input', desc: 'Accept messy transaction CSV uploads or live file drop' },
              { step: 2, title: 'Validation', desc: 'Schema checks, column integrity, row-level format verifications' },
              { step: 3, title: 'Data Cleaning', desc: 'Deduplication, normalization, date parsing, whitespace trimming' },
              { step: 4, title: 'Data Quality', desc: 'Audit metrics, anomaly tagging, trust scoring, health indexes' },
              { step: 5, title: 'Analysis', desc: 'Financial aggregations, category distributions, failure analytics' },
              { step: 6, title: 'Visualization', desc: 'Clean time-series, charts, interactive trend inspection' },
              { step: 7, title: 'Insights', desc: 'Explainable business insights, detected anomalies, volume shifts' },
              { step: 8, title: 'Evidence', desc: 'Direct drill-down to raw vs cleaned records supporting every claim' },
            ].map((p) => (
              <div key={p.step} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {p.step}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Killer Requirement & Judging Rubric */}
        <div className="space-y-6">
          
          {/* Killer Requirement Alert */}
          <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl border border-rose-200 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-800 block">
                  The Killer Requirement (Judge Stress Test)
                </span>
                <p className="text-xs text-rose-950 font-medium leading-relaxed mt-2">
                  Judges will test applications live by injecting adversarial test cases: empty CSVs, missing columns, corrupt dates (e.g. 2026/08/45), extreme outlier amounts (e.g. ₹999,999), and duplicate IDs.
                </p>
                <div className="mt-3 p-3 rounded-lg bg-white/80 border border-rose-200 text-[11px] text-slate-700">
                  <span className="font-bold text-rose-900">Zero Crash Policy:</span> Applications must never crash, misrepresent aggregated sums, or silently purge rows without clear visual audit notes.
                </div>
              </div>
            </div>
          </div>

          {/* Weighted Judging Criteria */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Official Judging Breakdown (100 Points Total)</span>
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Data Engineering & Cleaning', weight: '25%', desc: 'Validation, deduplication, repairing corrupt rows transparently' },
                { label: 'Analytical Depth & Insights', weight: '20%', desc: 'Meaningful financial aggregations & anomaly detection' },
                { label: 'Product Design & User Experience', weight: '20%', desc: 'Clarity, interactive filters, drill-downs, responsive UI' },
                { label: 'Reliability & Edge Cases', weight: '15%', desc: 'Zero-crash resilience under judge stress tests' },
                { label: 'Performance & Architecture', weight: '10%', desc: 'Speed of CSV processing and clean state management' },
                { label: 'Technical Implementation & Git', weight: '10%', desc: 'Clean commits, comprehensive README, live deployment stability' },
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{c.label}</span>
                    <span className="text-[11px] text-slate-500 block">{c.desc}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 shrink-0 ml-3">
                    {c.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CSV Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono text-slate-900">
                  Raw CSV Ingest Preview (First 40 Rows)
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-xs px-2 py-1 rounded hover:bg-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {loadingDataset ? (
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

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Corrupted Date / Negative</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Extreme Outlier</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Missing / Blank</span>
              </div>
              <a
                href="/datasets/webcode_data_under_pressure_dataset.csv"
                download
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Download Full CSV
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Version Update Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Update Dataset Version</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Updating the dataset version records an audit entry and updates the version badge for all participants.
            </p>

            <form onSubmit={handleUpdateDatasetMetadata} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Version Tag (e.g. v1.1 or v2.0)
                </label>
                <input
                  type="text"
                  required
                  value={newVersionInput}
                  onChange={(e) => setNewVersionInput(e.target.value)}
                  placeholder="v1.1"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  The static dataset is served from <code className="font-mono font-bold">/datasets/webcode_data_under_pressure_dataset.csv</code>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
