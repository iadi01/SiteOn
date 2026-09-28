import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Terminal, 
  Layers, 
  Code, 
  Trophy, 
  Award, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Eye, 
  Plus, 
  Clock, 
  Github, 
  Globe,
  Lock 
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/dashboard');
      return;
    }

    const loadData = () => {
      const userRegs = db.getUserRegistrations(user.id);
      const userSubs = db.getUserSubmissions(user.id, user.email);
      const allHacks = db.getHackathons();
      setRegistrations(userRegs);
      setSubmissions(userSubs);
      setHackathons(allHacks);
    };

    loadData();
    const handleDbUpdate = (e) => {
      if (['submissions', 'registrations', 'hackathons'].includes(e.detail?.table)) {
        loadData();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, [user, navigate]);

  if (!user) return null;

  const firstName = (profile?.full_name || user.name || 'Participant').split(' ')[0];

  // Stats calculation
  const shortlistedCount = submissions.filter(s => (s.status || '').toLowerCase() === 'shortlisted').length;
  const winsCount = submissions.filter(s => (s.status || '').toLowerCase() === 'winner').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
            PARTICIPANT CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Welcome, {firstName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your registered hackathons, active project submissions, and review statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {submissions.length >= 3 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Submission Quota Reached (3/3)</span>
            </div>
          ) : (
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit New Project ({3 - submissions.length} left)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500">Registered</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{registrations.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active event entries</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500">Submissions</span>
            <Code className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{submissions.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Shipped projects</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500">Shortlisted</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{shortlistedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Selected for next phase</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500">Wins</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{winsCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Podium achievements</span>
        </div>
      </div>

      {/* Active Hackathons Section */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Active Hackathon Registrations</span>
        </h2>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No active hackathon registrations</p>
            <p className="text-xs text-slate-500 mt-0.5">Explore available hackathons and register to participate.</p>
            <Link
              to="/hackathons"
              className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse Hackathons →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((reg) => {
              const hack = hackathons.find(h => h.id === reg.hackathon_id);
              if (!hack) return null;
              const hasSubmitted = submissions.some(s => s.hackathon_id === hack.id);

              const isPaymentVerified = reg.payment_status === 'verified' || (reg.status === 'confirmed' && !reg.payment_status);
              const isPaymentPending = reg.payment_status === 'pending_verification';
              const isPaymentRejected = reg.payment_status === 'rejected';

              return (
                <div key={reg.id} className="bg-white rounded-xl border border-slate-200 p-5 card-elevation flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <StatusBadge status={hack.status} />
                      <span className="text-[10px] font-mono text-slate-400">
                        Registered {new Date(reg.registered_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{hack.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-mono">{hack.theme}</p>

                    {/* Registration Fee Status */}
                    <div className="mt-3 flex items-center gap-2">
                      {isPaymentVerified && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          ₹49 Fee: Verified ✓
                        </span>
                      )}
                      {isPaymentPending && (
                        <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                          <span>₹49 Fee: Under Review ({reg.utr_number || 'Pending'})</span>
                        </span>
                      )}
                      {isPaymentRejected && (
                        <span className="text-[10px] font-mono font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          Payment Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/hackathons/${hack.slug || hack.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View Details
                    </Link>

                    {hasSubmitted ? (
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Project Submitted ✓
                      </span>
                    ) : submissions.length >= 3 ? (
                      <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Limit Reached (3/3)</span>
                      </span>
                    ) : isPaymentPending ? (
                      <Link
                        to={`/submit/${hack.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded transition-colors"
                      >
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Review Pending</span>
                      </Link>
                    ) : isPaymentRejected ? (
                      <Link
                        to={`/submit/${hack.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded transition-colors"
                      >
                        <span>Retry Fee</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/submit/${hack.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Submit Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Submissions Section */}
      <div id="submissions">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          <span>My Project Submissions</span>
        </h2>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center card-elevation">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No submissions yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Find a hackathon, build your project, and submit your GitHub repository and live deployment.
            </p>
            <Link
              to="/submit"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              Submit Your First Project
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Project & ID</th>
                    <th className="px-5 py-3 font-semibold">Hackathon</th>
                    <th className="px-5 py-3 font-semibold">Team</th>
                    <th className="px-5 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => {
                    const hack = hackathons.find(h => h.id === sub.hackathon_id);
                    const isDeadlinePassed = hack && new Date(hack.submission_deadline).getTime() < Date.now();
                    const editCount = sub.edit_count || 0;
                    const isEditLocked = editCount >= 3;
                    const remainingEdits = Math.max(0, 3 - editCount);

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 block">{sub.project_name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{sub.id}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className={`font-mono text-[10px] ${isEditLocked ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                              {editCount}/3 Edits {isEditLocked ? '(Locked)' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {sub.hackathon_name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                          {sub.participation_type} {sub.participation_type === 'Team' ? `(${sub.team_name})` : ''}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/dashboard/submissions/${sub.id}`}
                              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>View</span>
                            </Link>

                            {isDeadlinePassed ? (
                              <span className="text-[10px] font-mono text-slate-400 px-2 py-1">
                                Deadline Closed
                              </span>
                            ) : isEditLocked ? (
                              <span
                                className="px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-900 text-[10px] font-mono font-bold inline-flex items-center gap-1"
                                title="Maximum 3 allowed edits have been used. This project is permanently locked."
                              >
                                <Lock className="w-2.5 h-2.5 text-amber-600" />
                                <span>Locked (3/3)</span>
                              </span>
                            ) : (
                              <Link
                                to={`/dashboard/submissions/${sub.id}?edit=true`}
                                className="px-2.5 py-1 rounded border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-medium inline-flex items-center gap-1 text-xs"
                                title={`Edit project (Max 3 edits • ${remainingEdits} left)`}
                              >
                                <Edit3 className="w-3 h-3 text-blue-600" />
                                <span>Edit {editCount > 0 ? `(${remainingEdits} left)` : ''}</span>
                              </Link>
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
        )}
      </div>

    </div>
  );
}
