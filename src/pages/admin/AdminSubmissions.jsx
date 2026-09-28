import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Github, 
  Globe, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hackathonFilter, setHackathonFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');
  const [gradYearFilter, setGradYearFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [statusChangeMsg, setStatusChangeMsg] = useState('');

  const loadData = () => {
    setSubmissions(db.getSubmissions());
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

  // Quick inline status change
  const handleQuickStatusChange = (subId, newStatus) => {
    try {
      db.updateSubmission(subId, { status: newStatus }, user.id, true);
      db.logAdminAction(user.id, 'status_changed', 'submission', subId, { newStatus });
      setStatusChangeMsg(`Submission status changed to "${newStatus}"`);
      setTimeout(() => setStatusChangeMsg(''), 2500);
      loadData();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  // Filtering logic
  const filtered = submissions.filter((s) => {
    // Search query: project name, participant name, email, team name, college
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (s.project_name || '').toLowerCase().includes(q) ||
                    (s.owner_name || '').toLowerCase().includes(q) ||
                    (s.owner_email || '').toLowerCase().includes(q) ||
                    (s.team_name || '').toLowerCase().includes(q) ||
                    (s.college || '').toLowerCase().includes(q) ||
                    (s.id || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && (s.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    if (hackathonFilter !== 'all' && s.hackathon_id !== hackathonFilter) {
      return false;
    }

    if (internshipFilter !== 'all') {
      const wantsInternship = s.internship_interest;
      if (internshipFilter === 'yes' && !wantsInternship) return false;
      if (internshipFilter === 'no' && wantsInternship) return false;
    }

    if (gradYearFilter !== 'all' && String(s.graduation_year) !== String(gradYearFilter)) {
      return false;
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSubmissions = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Collect unique graduation years for filter
  const gradYears = Array.from(new Set(submissions.map(s => s.graduation_year).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">Submission Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, review code repositories, test deployments, and assign evaluation stages.
          </p>
        </div>

        <Link
          to="/admin/exports"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-mono"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Submissions CSV</span>
        </Link>
      </div>

      {statusChangeMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusChangeMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 card-elevation text-xs">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by project name, participant, email, college, team, or submission ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="winner">Winner</option>
              <option value="rejected">Not Selected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hackathon</label>
            <select
              value={hackathonFilter}
              onChange={(e) => { setHackathonFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
            >
              <option value="all">All Events</option>
              {hackathons.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Internship Opt-in</label>
            <select
              value={internshipFilter}
              onChange={(e) => { setInternshipFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
            >
              <option value="all">All</option>
              <option value="yes">Interested (Yes)</option>
              <option value="no">Not Interested (No)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Graduation Year</label>
            <select
              value={gradYearFilter}
              onChange={(e) => { setGradYearFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-900"
            >
              <option value="all">All Years</option>
              {gradYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Project & ID</th>
                <th className="px-4 py-3 font-semibold">Participant & College</th>
                <th className="px-4 py-3 font-semibold">Team</th>
                <th className="px-4 py-3 font-semibold">Links</th>
                <th className="px-4 py-3 font-semibold">Internship</th>
                <th className="px-4 py-3 font-semibold">Status Stage</th>
                <th className="px-4 py-3 font-semibold">Leaderboard</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No submissions found matching the criteria.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">{sub.project_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sub.id}</span>
                      <span className="text-[10px] font-mono text-purple-700 block">{sub.hackathon_name}</span>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="font-medium text-slate-900 block">{sub.owner_name}</span>
                      <span className="font-mono text-[10px] text-slate-400 block">{sub.owner_email}</span>
                      <span className="text-[11px] text-slate-500 truncate block mt-0.5">{sub.college} ({sub.graduation_year})</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      {sub.participation_type === 'Team' ? (
                        <span className="text-slate-800 font-semibold">{sub.team_name}</span>
                      ) : (
                        <span className="text-slate-400">Solo</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                          title="Open GitHub"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={sub.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-slate-100 text-blue-600"
                          title="Open Live Deployment"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      {sub.internship_interest ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          YES
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">NO</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={sub.status}
                        onChange={(e) => handleQuickStatusChange(sub.id, e.target.value)}
                        className="text-xs font-mono font-semibold px-2 py-1 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Winner">Winner</option>
                        <option value="Rejected">Not Selected</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5">
                      {sub.in_leaderboard || (sub.rank && sub.rank <= 10) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>Rank #{sub.rank} ({sub.score !== undefined && sub.score !== null ? sub.score : 0} pts)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">
                          Not Added
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/admin/submissions/${sub.id}`}
                        className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold font-mono text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Review & Rank</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} submissions
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-bold text-slate-900">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
