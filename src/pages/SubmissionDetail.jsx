import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { validateGithubRepoUrl, validateLiveUrl } from '../utils/validators';
import { cleanDisplayName } from '../utils/avatar';
import StatusBadge from '../components/common/StatusBadge';
import { 
  Github, 
  Globe, 
  Calendar, 
  Users, 
  School, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  ExternalLink, 
  Layers,
  ArrowLeft,
  MessageSquare,
  Lock
} from 'lucide-react';

export default function SubmissionDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [members, setMembers] = useState([]);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Editable fields
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [techStackStr, setTechStackStr] = useState('');

  const loadData = () => {
    const sub = db.getSubmissionById(id);
    if (sub) {
      // Permission check: participants can only view their own submissions
      if (user && sub.owner_id !== user.id && user.email !== 'siteon.org@gmail.com') {
        setError('Unauthorized: You do not have permission to view this submission.');
        setLoading(false);
        return;
      }

      setSubmission(sub);
      const hack = db.getHackathonByIdOrSlug(sub.hackathon_id);
      setHackathon(hack);
      setMembers(db.getSubmissionMembers(sub.id));

      setProjectName(sub.project_name);
      setDescription(sub.description);
      setGithubUrl(sub.github_url);
      setLiveUrl(sub.live_url);
      setTechStackStr(Array.isArray(sub.tech_stack) ? sub.tech_stack.join(', ') : sub.tech_stack);

      const deadlinePassed = hack && new Date(hack.submission_deadline).getTime() < Date.now();
      const limitReached = (sub.edit_count || 0) >= 3;

      if (searchParams.get('edit') === 'true' && !deadlinePassed && !limitReached) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate(`/auth?redirect=/dashboard/submissions/${id}`);
      return;
    }
    loadData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Submission Not Found'}</h2>
        <p className="text-xs text-slate-500 mt-1">Verify your submission ID or return to the participant dashboard.</p>
        <Link to="/dashboard" className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const editCount = submission?.edit_count || 0;
  const isEditLimitReached = editCount >= 3;
  const remainingEdits = Math.max(0, 3 - editCount);
  const isDeadlinePassed = hackathon && new Date(hackathon.submission_deadline).getTime() < Date.now();
  const canEdit = !isDeadlinePassed && !isEditLimitReached;

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setError('');

    if (isDeadlinePassed) {
      setError('Editing is closed because the submission deadline has passed.');
      return;
    }

    if (isEditLimitReached) {
      setError('Edit Lock Active: This project has already been edited 3 times. Submissions can only be edited a maximum of 3 times, after which editing is permanently locked.');
      return;
    }

    const ghCheck = validateGithubRepoUrl(githubUrl);
    if (!ghCheck.isValid) {
      setError(ghCheck.error);
      return;
    }

    const liveCheck = validateLiveUrl(liveUrl);
    if (!liveCheck.isValid) {
      setError(liveCheck.error);
      return;
    }

    try {
      const updated = db.updateSubmission(submission.id, {
        project_name: projectName.trim(),
        description: description.trim(),
        github_url: ghCheck.normalized,
        live_url: liveCheck.normalized,
        tech_stack: techStackStr.split(',').map(s => s.trim()).filter(Boolean)
      }, user.id);

      setSubmission(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update submission.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {!isEditing && (
          <div className="flex items-center gap-3">
            {canEdit ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Submission</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                  {remainingEdits} of 3 edits left
                </span>
              </button>
            ) : isEditLimitReached ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Editing Locked (3/3 Edits Used)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Deadline Closed</span>
              </span>
            )}
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Submission successfully updated!</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-elevation">
        
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={submission.status} size="lg" />
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                ID: {submission.id}
              </span>
              <span className={`font-mono text-xs px-2.5 py-0.5 rounded border inline-flex items-center gap-1.5 ${
                isEditLimitReached
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {isEditLimitReached ? <Lock className="w-3 h-3 text-amber-600" /> : <Edit3 className="w-3 h-3 text-slate-500" />}
                <span>Edits Used: {editCount} / 3 {isEditLimitReached ? '(Locked)' : `(${remainingEdits} left)`}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {submission.project_name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Submitted for <span className="font-bold text-slate-800">{submission.hackathon_name}</span> on {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={submission.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors font-mono"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={submission.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors font-mono shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Open Project</span>
              <ExternalLink className="w-3 h-3 text-blue-200" />
            </a>
          </div>
        </div>

        {/* Edit Lock Notice if reached 3 edits */}
        {isEditLimitReached && (
          <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block text-sm">Submission Editing Locked (3/3 Edits Used)</span>
              <p className="mt-1 text-amber-800 leading-relaxed">
                You have reached the maximum allowed limit of <strong>3 edits</strong> for this submission. Each project can only be edited up to 3 times. This submission is now permanently locked and no further modifications can be made.
              </p>
            </div>
          </div>
        )}

        {/* Deadline Notice */}
        {isDeadlinePassed && (
          <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Editing is closed because the submission deadline has passed.</span>
          </div>
        )}

        {/* Admin Feedback note if any */}
        {submission.admin_note && (
          <div className="my-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-900 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-800 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Siteon Evaluation Feedback</span>
            </div>
            <p className="leading-relaxed">{submission.admin_note}</p>
          </div>
        )}

        {/* Content Body: View vs Edit */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="py-6 space-y-5">
            {/* 3-Edit Limit Warning Notice */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-900 block text-sm">
                  Strict Edit Policy: Maximum 3 Edits Allowed
                </span>
                <p className="leading-relaxed text-amber-800">
                  You can edit this submission a maximum of <strong>3 times</strong>. You have used <strong>{editCount} of 3</strong> edits (<strong>{remainingEdits}</strong> edits remaining). 
                  Clicking Save Changes will consume 1 edit. <strong>Once 3 edits are reached, the project will be permanently locked</strong>.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Live Project URL</label>
                <input
                  type="url"
                  required
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Stack (comma separated)</label>
              <input
                type="text"
                value={techStackStr}
                onChange={(e) => setTechStackStr(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditLimitReached}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes ({remainingEdits} of 3 Edits Left)</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 space-y-6">
            
            {/* Description */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                Project Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {submission.description}
              </p>
            </div>

            {/* Reliability Strategy */}
            {submission.reliability_strategy && (
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
                  <span>Data Reliability & Insights Strategy</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Challenge Criteria</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden bg-blue-50/40 p-4 rounded-xl border border-blue-200">
                  {submission.reliability_strategy}
                </p>
              </div>
            )}

            {/* Tech Stack */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                Tech Stack & Libraries
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

            {/* Academic & Team info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div>
                <h3 className="font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Academic Credentials
                </h3>
                <div className="space-y-1.5 text-slate-600">
                  <p><strong className="text-slate-800">Institution:</strong> {submission.college}</p>
                  <p><strong className="text-slate-800">Course:</strong> {submission.course || 'N/A'}</p>
                  <p><strong className="text-slate-800">Graduation:</strong> {submission.graduation_year}</p>
                  {submission.city && <p><strong className="text-slate-800">City:</strong> {submission.city}</p>}
                </div>
              </div>

              <div>
                <h3 className="font-mono font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Team Composition ({submission.participation_type})
                </h3>
                <div className="space-y-1.5 text-slate-600">
                  <p><strong className="text-slate-800">Lead:</strong> {cleanDisplayName(submission.owner_name, submission.owner_email)} ({submission.owner_email})</p>
                  {submission.participation_type === 'Team' && (
                    <p><strong className="text-slate-800">Team Name:</strong> {submission.team_name}</p>
                  )}
                  {members.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="font-semibold text-slate-800">Members:</span>
                      {members.map(m => (
                        <div key={m.id} className="pl-2 border-l-2 border-slate-200 text-[11px]">
                          {m.name} — <span className="font-mono">{m.role}</span> ({m.email})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Internship Interest info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">Considered for Siteon Internship:</span>
              <span className="font-mono font-bold text-slate-900">
                {submission.internship_interest ? 'YES (Opted In)' : 'NO'}
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
