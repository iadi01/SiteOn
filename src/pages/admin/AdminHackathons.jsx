import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import StatusBadge from '../../components/common/StatusBadge';
import { Calendar, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHackathons() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [theme, setTheme] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [subDeadline, setSubDeadline] = useState('');
  const [resultsDate, setResultsDate] = useState('');
  const [status, setStatus] = useState('Upcoming');
  const [eligibility, setEligibility] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [rulesText, setRulesText] = useState('');

  const loadHackathons = () => {
    setHackathons(db.getHackathons());
  };

  useEffect(() => {
    loadHackathons();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'hackathons') loadHackathons();
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingHackathon(null);
    setName('');
    setSlug('');
    setTheme('');
    setShortDesc('');
    setDescription('');
    setStartDate('2026-10-04T09:00');
    setEndDate('2026-10-06T18:00');
    setRegDeadline('2026-10-03T23:59');
    setSubDeadline('2026-10-06T17:00');
    setResultsDate('2026-10-10T14:00');
    setStatus('Upcoming');
    setEligibility('Open to enrolled undergraduate and postgraduate students.');
    setMaxTeamSize(4);
    setRulesText('1. Original code built for event\n2. Verified GitHub repository required\n3. Working live deployment required');
    setModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHackathon(h);
    setName(h.name);
    setSlug(h.slug);
    setTheme(h.theme);
    setShortDesc(h.short_description || '');
    setDescription(h.description || '');
    setStartDate(h.start_date ? new Date(h.start_date).toISOString().slice(0, 16) : '');
    setEndDate(h.end_date ? new Date(h.end_date).toISOString().slice(0, 16) : '');
    setRegDeadline(h.registration_deadline ? new Date(h.registration_deadline).toISOString().slice(0, 16) : '');
    setSubDeadline(h.submission_deadline ? new Date(h.submission_deadline).toISOString().slice(0, 16) : '');
    setResultsDate(h.results_date ? new Date(h.results_date).toISOString().slice(0, 16) : '');
    setStatus(h.status || 'Upcoming');
    setEligibility(h.eligibility || '');
    setMaxTeamSize(h.max_team_size || 4);
    setRulesText(Array.isArray(h.rules) ? h.rules.join('\n') : '');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const payload = {
        id: editingHackathon ? editingHackathon.id : undefined,
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        theme: theme.trim(),
        short_description: shortDesc.trim(),
        description: description.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        registration_deadline: new Date(regDeadline).toISOString(),
        submission_deadline: new Date(subDeadline).toISOString(),
        results_date: new Date(resultsDate).toISOString(),
        status,
        eligibility: eligibility.trim(),
        max_team_size: Number(maxTeamSize),
        rules: rulesText.split('\n').map(r => r.trim()).filter(Boolean)
      };

      const record = db.upsertHackathon(payload);
      db.logAdminAction(user.id, editingHackathon ? 'hackathon_updated' : 'hackathon_created', 'hackathon', record.id);

      setSuccessMsg(`Hackathon "${record.name}" saved successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save hackathon.');
    }
  };

  const handleDelete = (id, hackName) => {
    if (window.confirm(`Are you sure you want to remove hackathon "${hackName}"?`)) {
      db.deleteHackathon(id);
      db.logAdminAction(user.id, 'hackathon_deleted', 'hackathon', id);
      setSuccessMsg(`Hackathon "${hackName}" removed.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">Hackathons Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, configure dates, manage eligibility, rules, and lifecycle statuses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Hackathon</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Hackathons Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Hackathon</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Start Date</th>
                <th className="px-5 py-3 font-semibold">Submission Deadline</th>
                <th className="px-5 py-3 font-semibold">Registrations</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hackathons.map((h) => {
                const regs = db.getHackathonRegistrations(h.id);
                return (
                  <tr key={h.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{h.name}</span>
                      <span className="font-mono text-[10px] text-purple-700">{h.slug}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {new Date(h.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {new Date(h.submission_deadline).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {regs.length}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                          title="Edit Hackathon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {h.id !== 'h_webcode_2026' && (
                          <button
                            onClick={() => handleDelete(h.id, h.name)}
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 font-mono mb-4">
              {editingHackathon ? `Edit Hackathon: ${editingHackathon.name}` : 'Create New Hackathon'}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hackathon Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="WebCode"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="webcode"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Theme / Subtitle</label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Full-Stack Web Systems & Developer Platforms"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Summary</label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief synopsis displayed on cards..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 leading-relaxed"
                />
              </div>

              {/* Configurable Dates */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-mono font-bold text-slate-800 uppercase block">Configurable Schedule & Cutoffs</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Registration Cutoff</label>
                    <input
                      type="datetime-local"
                      required
                      value={regDeadline}
                      onChange={(e) => setRegDeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Submission Deadline (Strict)</label>
                    <input
                      type="datetime-local"
                      required
                      value={subDeadline}
                      onChange={(e) => setSubDeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Results Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={resultsDate}
                    onChange={(e) => setResultsDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Status & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifecycle Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Running">Running / Live Now</option>
                    <option value="Submission Closed">Submission Closed</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Team Size</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rules (One per line)</label>
                <textarea
                  rows={3}
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs"
                >
                  Save Hackathon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
