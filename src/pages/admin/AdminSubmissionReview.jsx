import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/db';
import StatusBadge from '../../components/common/StatusBadge';
import { cleanDisplayName } from '../../utils/avatar';
import { 
  ArrowLeft, 
  Github, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Linkedin, 
  MessageSquare, 
  Trophy, 
  Award, 
  Clock, 
  User, 
  School,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSubmissionReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('Submitted');
  const [adminNote, setAdminNote] = useState('');
  const [inLeaderboard, setInLeaderboard] = useState(false);
  const [rank, setRank] = useState('');
  const [score, setScore] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const sub = db.getSubmissionById(id);
    if (sub) {
      setSubmission(sub);
      setStatus(sub.status || 'Submitted');
      setAdminNote(sub.admin_note || '');
      setInLeaderboard(Boolean(sub.in_leaderboard || (typeof sub.rank === 'number' && sub.rank > 0)));
      setRank(sub.rank !== undefined && sub.rank !== null ? sub.rank : '');
      setScore(sub.score !== undefined && sub.score !== null ? sub.score : '');
      setAwardTitle(sub.award_title || '');
      setMembers(db.getSubmissionMembers(sub.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveReview = (e) => {
    e.preventDefault();
    try {
      const updated = db.updateSubmission(submission.id, {
        status,
        admin_note: adminNote.trim(),
        in_leaderboard: inLeaderboard,
        rank: inLeaderboard && rank !== '' ? parseInt(rank, 10) : null,
        score: score !== '' ? parseFloat(score) : null,
        award_title: inLeaderboard ? awardTitle.trim() : ''
      }, user.id, true);

      db.logAdminAction(user.id, 'submission_reviewed', 'submission', submission.id, {
        status,
        in_leaderboard: inLeaderboard,
        rank,
        score,
        awardTitle,
        noteLength: adminNote.length
      });

      setSubmission(updated);
      setSuccessMsg("Evaluation assessment and leaderboard ranking saved successfully.");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update submission.');
    }
  };

  const handleSetPodium = (podiumRank, label) => {
    setInLeaderboard(true);
    setRank(String(podiumRank));
    setStatus('Winner');
    setAwardTitle(label);
    if (!score) setScore(podiumRank === 1 ? '98.5' : podiumRank === 2 ? '96.0' : '93.5');
  };

  const handleQuickMark = (newStatus) => {
    setStatus(newStatus);
    try {
      const updated = db.updateSubmission(submission.id, {
        status: newStatus,
        admin_note: adminNote.trim()
      }, user.id, true);

      db.logAdminAction(user.id, 'submission_quick_marked', 'submission', submission.id, { newStatus });
      setSubmission(updated);
      setSuccessMsg(`Project marked as "${newStatus}"!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Update failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Submission Record Not Found</h2>
        <Link to="/admin/submissions" className="text-xs text-purple-700 font-semibold mt-2 inline-block">
          ← Return to Submissions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickMark('Shortlisted')}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 font-mono"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mark Shortlisted</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickMark('Winner')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 font-mono"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Award Winner</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Project & Code Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge status={submission.status} size="lg" />
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {submission.id}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{submission.project_name}</h1>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Submitted for <span className="font-bold text-purple-800">{submission.hackathon_name}</span>
                </p>
              </div>

              {/* Verified External Links */}
              <div className="flex flex-col gap-2 shrink-0">
                <a
                  href={submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-mono font-semibold"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Inspect GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={submission.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Test Live URL</span>
                  <ExternalLink className="w-3 h-3 text-blue-200" />
                </a>
              </div>
            </div>

            {/* Project Overview */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                Project Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap break-words overflow-hidden">
                {submission.description}
              </p>
            </div>

            {/* Reliability Strategy */}
            {submission.reliability_strategy && (
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-900 mb-2 flex items-center gap-2">
                  <span>Data Reliability & Verification Strategy</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    Judging Weight: 25% Data Eng + 15% Reliability
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-purple-50/40 p-4 rounded-xl border border-purple-200 whitespace-pre-wrap break-words overflow-hidden">
                  {submission.reliability_strategy}
                </p>
              </div>
            )}

            {/* Tech Stack */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                Verified Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(submission.tech_stack || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Members List */}
            {submission.participation_type === 'Team' && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Team Members: {submission.team_name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-slate-900 block">{cleanDisplayName(submission.owner_name, submission.owner_email)} (Team Lead)</span>
                    <span className="font-mono text-[11px] text-slate-500">{submission.owner_email}</span>
                  </div>
                  {members.map(m => (
                    <div key={m.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="font-mono text-[11px] text-slate-500 block">{m.email}</span>
                      <span className="text-[10px] font-mono text-purple-700">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confidential Review Panel */}
          <div className="bg-white rounded-xl border border-purple-200 p-6 card-elevation space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-700" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-900">
                  Siteon Internal Evaluation Panel
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Strictly confidential</span>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evaluation Stage / Submission Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium"
                >
                  <option value="Submitted">Submitted (Received)</option>
                  <option value="Under Review">Under Review (Inspection in progress)</option>
                  <option value="Shortlisted">Shortlisted (Selected for Next Stage)</option>
                  <option value="Winner">Winner (Official Hackathon Laureate)</option>
                  <option value="Rejected">Not Selected</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-950">
                    <input
                      type="checkbox"
                      checked={inLeaderboard}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setInLeaderboard(val);
                        if (!val) {
                          setRank('');
                        } else if (!rank) {
                          setRank('1');
                        }
                      }}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                    />
                    <span>Add to Official Public Leaderboard</span>
                  </label>
                  <span className="text-[10px] font-mono text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded">
                    Admin Only
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSetPodium(1, '1st Winner')}
                    className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold font-mono text-[11px] border border-amber-300 transition-colors"
                  >
                    🥇 Set #1 Winner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPodium(2, '2nd Winner')}
                    className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold font-mono text-[11px] border border-slate-300 transition-colors"
                  >
                    🥈 Set #2 Winner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPodium(3, '3rd Winner')}
                    className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold font-mono text-[11px] border border-amber-200 transition-colors"
                  >
                    🥉 Set #3 Winner
                  </button>
                  {inLeaderboard && (
                    <button
                      type="button"
                      onClick={() => {
                        setInLeaderboard(false);
                        setRank('');
                        setAwardTitle('');
                      }}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold font-mono text-[11px] border border-rose-200 transition-colors ml-auto"
                    >
                      Remove from Leaderboard
                    </button>
                  )}
                </div>

                {inLeaderboard && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Leaderboard Rank (1 - 10) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="e.g. 1, 2, 3... (Max 10)"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-purple-300 bg-white text-slate-900 font-mono font-bold"
                        required={inLeaderboard}
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">Top 10 strictly displayed</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Points out of 100 *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        placeholder="e.g. 98.5"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-purple-300 bg-white text-slate-900 font-mono font-bold"
                        required={inLeaderboard}
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">Official score out of 100</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Internal Review Notes & Feedback
                </label>
                <textarea
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Record architectural assessment, code quality observations, or interview recommendations..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 leading-relaxed font-sans"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Notes are stored securely and remain confidential to Siteon reviewers.
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs"
                >
                  Save Review Assessment
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right 1 Col: Participant Profile & Internship Data */}
        <div className="space-y-6">
          
          {/* Participant Credentials */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-elevation text-xs space-y-3">
            <h3 className="font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Participant Information
            </h3>
            
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Primary Contact</span>
                <span className="font-bold text-slate-900 block">{cleanDisplayName(submission.owner_name, submission.owner_email)}</span>
                <span className="font-mono text-slate-600 block">{submission.owner_email}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Institution</span>
                <span className="font-medium text-slate-900 block">{submission.college}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Degree / Course</span>
                  <span className="font-medium text-slate-800">{submission.course || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Graduation</span>
                  <span className="font-mono font-bold text-slate-900">{submission.graduation_year}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Internship Opt-In Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 card-elevation text-xs space-y-3">
            <h3 className="font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Internship Candidacy
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Interested in Internship:</span>
                <span className="font-mono font-bold text-slate-900">
                  {submission.internship_interest ? 'YES (Opted In)' : 'NO'}
                </span>
              </div>

              {submission.internship_interest && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {submission.resume_url ? (
                    <a
                      href={submission.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-purple-800 font-mono font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Candidate Resume</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-purple-500" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No resume URL provided</span>
                  )}

                  {submission.linkedin_url && (
                    <a
                      href={submission.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                        <span>LinkedIn Profile</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
