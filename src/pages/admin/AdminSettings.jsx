import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Settings, Shield, CheckCircle2, History, Terminal, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(db.getSettings());
  const [auditLogs, setAuditLogs] = useState([]);
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [defaultTeamSize, setDefaultTeamSize] = useState(4);
  const [rulesVersion, setRulesVersion] = useState('v1.0.2');
  const [upiId, setUpiId] = useState('');
  const [upiPayeeName, setUpiPayeeName] = useState('');
  const [registrationFee, setRegistrationFee] = useState(49);
  const [successMsg, setSuccessMsg] = useState('');
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanedMsg, setCleanedMsg] = useState('');

  useEffect(() => {
    const s = db.getSettings();
    setSettings(s);
    setSiteName(s.site_name || 'Siteon');
    setContactEmail(s.contact_email || 'siteon.org@gmail.com');
    setDefaultTeamSize(s.default_team_size || 4);
    setRulesVersion(s.rules_version || 'v1.0.2');
    setUpiId(s.upi_id || 'siteon@ptyes');
    setUpiPayeeName(s.upi_payee_name || 'Siteon');
    setRegistrationFee(s.registration_fee || 49);
    setAuditLogs(db.getAuditLogs());
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updated = db.updateSettings({
      site_name: siteName.trim(),
      contact_email: contactEmail.trim(),
      default_team_size: Number(defaultTeamSize),
      rules_version: rulesVersion.trim(),
      upi_id: upiId.trim(),
      upi_payee_name: upiPayeeName.trim(),
      registration_fee: Number(registrationFee)
    });

    db.logAdminAction(user.id, 'platform_settings_updated', 'settings', 'global', updated);
    setSettings(updated);
    setSuccessMsg('Platform operational settings saved successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCleanData = () => {
    db.cleanAllParticipantData();
    setShowCleanModal(false);
    setAuditLogs([]);
    setCleanedMsg('All participant submissions, registrations, ₹49 UTR payments, and accounts have been wiped. Platform is now starting fresh!');
    setTimeout(() => setCleanedMsg(''), 5000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-mono">Platform Governance & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure site identity, default submission constraints, and inspect the operational audit trail.
        </p>
      </div>

      {cleanedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{cleanedMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
        <h2 className="text-sm font-bold text-slate-900 font-mono mb-4 border-b border-slate-100 pb-2">
          General Configurations
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Name</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operations Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Max Team Size</label>
              <input
                type="number"
                min={1}
                max={10}
                value={defaultTeamSize}
                onChange={(e) => setDefaultTeamSize(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Rules Version</label>
              <input
                type="text"
                value={rulesVersion}
                onChange={(e) => setRulesVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* UPI Gateway & Entry Fee Settings */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold font-mono text-purple-900 uppercase tracking-wider mb-3">
              UPI Gateway & Registration Fee Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registration Fee (INR)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Receiving UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="siteon@ptyes"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Direct to your bank account</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UPI Payee Display Name</label>
                <input
                  type="text"
                  required
                  value={upiPayeeName}
                  onChange={(e) => setUpiPayeeName(e.target.value)}
                  placeholder="Siteon Hackathons"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Shown in GPay/PhonePe scan</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs font-mono"
            >
              Save Platform Settings
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Clean Participant Data */}
      <div className="bg-rose-50/40 rounded-xl border border-rose-200 p-6 card-elevation">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-mono font-bold text-xs uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Danger Zone: Participant Data Reset</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Clean All Participant Data & Start Fresh
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Permanently purges all registered participants, project submissions, ₹49 UTR payments, notifications, and non-admin participant accounts. Platform settings and admin login remain intact.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCleanModal(true)}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clean All Data (Fresh Start)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCleanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Clean All Participant Data?
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure? This will permanently wipe all participant registrations, projects, ₹49 UTR transactions, and participant accounts. <strong>This action cannot be undone.</strong>
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                className="w-full py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-mono text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCleanData}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold shadow-xs transition-colors"
              >
                Yes, Clean Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-700" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              System Audit Trail
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {auditLogs.length} events logged
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No administrative events recorded yet. Admin actions such as status updates, reviews, and hackathon changes are automatically recorded here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-semibold">Action</th>
                  <th className="px-4 py-2 font-semibold">Entity</th>
                  <th className="px-4 py-2 font-semibold">Target ID</th>
                  <th className="px-4 py-2 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 font-bold text-purple-800">{log.action}</td>
                    <td className="px-4 py-2 text-slate-600">{log.entity_type}</td>
                    <td className="px-4 py-2 text-slate-500 truncate max-w-xs">{log.entity_id}</td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
