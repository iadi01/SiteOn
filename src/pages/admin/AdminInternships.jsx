import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { 
  Briefcase, 
  FileText, 
  Github, 
  Globe, 
  ExternalLink, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2,
  Linkedin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminInternships() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hackathons, setHackathons] = useState([]);
  const [hackathonFilter, setHackathonFilter] = useState('all');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    const allSubs = db.getSubmissions();
    const interested = allSubs.filter(s => s.internship_interest);
    setCandidates(interested);
    setHackathons(db.getHackathons());
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'submissions') loadData();
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  const handleStageChange = (subId, newStage) => {
    try {
      db.updateSubmission(subId, { internship_status: newStage }, user.id, true);
      db.logAdminAction(user.id, 'internship_stage_changed', 'submission', subId, { newStage });
      setSuccessMsg(`Candidate pipeline stage updated to "${newStage}"`);
      setTimeout(() => setSuccessMsg(''), 2500);
      loadData();
    } catch (err) {
      alert(err.message || 'Update failed.');
    }
  };

  const filtered = candidates.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (c.owner_name || '').toLowerCase().includes(q) ||
                    (c.owner_email || '').toLowerCase().includes(q) ||
                    (c.college || '').toLowerCase().includes(q) ||
                    (c.project_name || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (hackathonFilter !== 'all' && c.hackathon_id !== hackathonFilter) return false;
    if (pipelineFilter !== 'all' && (c.internship_status || 'New').toLowerCase() !== pipelineFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">Internship Talent Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review candidates who explicitly opted-in for Siteon engineering and product internship opportunities.
          </p>
        </div>

        <Link
          to="/admin/exports"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-mono"
        >
          <Download className="w-3.5 h-3.5 text-purple-600" />
          <span>Export Candidates CSV</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 card-elevation text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, email, university, or project..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pipeline Stage</label>
            <select
              value={pipelineFilter}
              onChange={(e) => setPipelineFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
            >
              <option value="all">All Stages</option>
              <option value="new">New Candidate</option>
              <option value="reviewing">Reviewing</option>
              <option value="contacted">Contacted</option>
              <option value="interview">Interview Scheduled</option>
              <option value="selected">Selected / Extended Offer</option>
              <option value="not selected">Not Selected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hackathon</label>
            <select
              value={hackathonFilter}
              onChange={(e) => setHackathonFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
            >
              <option value="all">All Events</option>
              {hackathons.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">University & Course</th>
                <th className="px-4 py-3 font-semibold">Project & Stack</th>
                <th className="px-4 py-3 font-semibold">Credentials & Links</th>
                <th className="px-4 py-3 font-semibold">Pipeline Stage</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No internship candidates found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">{c.owner_name}</span>
                      <span className="font-mono text-[10px] text-slate-500 block">{c.owner_email}</span>
                      <span className="font-mono text-[10px] text-purple-700 block">{c.hackathon_name}</span>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="font-medium text-slate-900 block">{c.college}</span>
                      <span className="text-[11px] text-slate-500 block">{c.course || 'N/A'} (Class of {c.graduation_year})</span>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="font-semibold text-slate-900 block">{c.project_name}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(c.tech_stack || []).slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {c.resume_url ? (
                          <a
                            href={c.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded"
                            title="View Resume"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Resume</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">No Resume</span>
                        )}

                        <a
                          href={c.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                          title="GitHub"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={c.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-blue-600"
                          title="Live Deployment"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={c.internship_status || 'New'}
                        onChange={(e) => handleStageChange(c.id, e.target.value)}
                        className="text-xs font-mono font-semibold px-2 py-1 rounded border border-slate-300 bg-white text-slate-800"
                      >
                        <option value="New">New Candidate</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Not Selected">Not Selected</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/admin/submissions/${c.id}`}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-900 font-mono"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
