import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { googleSheetService } from '../services/googleSheetService';
import { 
  validateGithubRepoUrl, 
  validateLinkedinUrl, 
  validateLiveUrl, 
  validateResumeUrl 
} from '../utils/validators';
import { cleanDisplayName } from '../utils/avatar';
import { 
  CheckCircle2, 
  AlertCircle, 
  Github, 
  Globe, 
  Plus, 
  Trash2, 
  FileText, 
  Linkedin, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  Terminal,
  Lock,
  Send,
  Layers,
  ExternalLink,
  CreditCard,
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const COMMON_TECH_STACK = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS',
  'PostgreSQL', 'MongoDB', 'Python', 'FastAPI', 'Django', 'Docker',
  'Vite', 'Firebase', 'Supabase', 'GraphQL', 'Redis', 'AWS'
];

export default function SubmitProject() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [userSubmissionCount, setUserSubmissionCount] = useState(0);

  // Payment Verification State
  const [paymentInfo, setPaymentInfo] = useState({ isPaid: false, status: 'not_registered' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [refreshingPayment, setRefreshingPayment] = useState(false);

  // Form Fields
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [reliabilityStrategy, setReliabilityStrategy] = useState('');
  const [techStack, setTechStack] = useState(['React', 'Node.js', 'Tailwind CSS']);
  const [customTech, setCustomTech] = useState('');
  
  // Links
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  
  // Team
  const [participationType, setParticipationType] = useState('Individual'); // Individual or Team
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([]);
  
  // Education
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [city, setCity] = useState('');
  
  // Internship
  const [internshipInterest, setInternshipInterest] = useState('Yes');
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
    } else {
      const subs = db.getUserSubmissions(user.id, user.email);
      setUserSubmissionCount(subs.length);
    }
  }, [user, navigate]);

  // Load hackathons and populate defaults from user profile
  useEffect(() => {
    const list = db.getHackathons();
    setHackathons(list);

    if (hackathonId) {
      const match = list.find(h => h.id === hackathonId || h.slug === hackathonId);
      if (match) setSelectedHackathonId(match.id);
    } else if (list.length > 0) {
      setSelectedHackathonId(list[0].id);
    }

    if (profile) {
      setCollege(profile.college || '');
      setCourse(profile.course || '');
      setGraduationYear(profile.graduation_year || '');
      setCity(profile.city || '');
      setResumeUrl(profile.resume_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
      if (profile.github_url) setGithubUrl(profile.github_url);
    }
  }, [hackathonId, profile]);

  const refreshPaymentStatus = (showSpinner = false) => {
    if (showSpinner) setRefreshingPayment(true);
    if (user && selectedHackathonId) {
      const pInfo = db.isUserPaidAndVerified(user.id, selectedHackathonId);
      setPaymentInfo(pInfo);
    }
    if (showSpinner) {
      setTimeout(() => setRefreshingPayment(false), 500);
    }
  };

  useEffect(() => {
    refreshPaymentStatus();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'registrations' || e.detail?.table === 'submissions') {
        refreshPaymentStatus();
        if (user) {
          const subs = db.getUserSubmissions(user.id, user.email);
          setUserSubmissionCount(subs.length);
        }
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, [user, selectedHackathonId]);

  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);
  const isDeadlinePassed = selectedHackathon && new Date(selectedHackathon.submission_deadline).getTime() < Date.now();

  // Tech stack toggling
  const toggleTech = (tech) => {
    if (techStack.includes(tech)) {
      setTechStack(techStack.filter(t => t !== tech));
    } else {
      setTechStack([...techStack, tech]);
    }
  };

  const handleAddCustomTech = (e) => {
    e.preventDefault();
    if (customTech.trim() && !techStack.includes(customTech.trim())) {
      setTechStack([...techStack, customTech.trim()]);
      setCustomTech('');
    }
  };

  // Team Member Management
  const addMember = () => {
    const max = selectedHackathon?.max_team_size || 4;
    if (members.length + 1 >= max) {
      setError(`Maximum team size for this hackathon is ${max} members.`);
      return;
    }
    setMembers([
      ...members,
      { name: '', email: '', college: college || '', role: 'Frontend' }
    ]);
  };

  const updateMember = (index, field, val) => {
    const updated = [...members];
    updated[index][field] = val;
    setMembers(updated);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // Step Validation
  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!selectedHackathonId) {
        setError('Please select an active hackathon.');
        return false;
      }
      if (isDeadlinePassed) {
        setError('Submissions are closed because the submission deadline has passed.');
        return false;
      }
      if (!projectName.trim() || projectName.length < 3 || projectName.length > 100) {
        setError('Project name must be between 3 and 100 characters.');
        return false;
      }
      if (!description.trim() || description.length < 100 || description.length > 1000) {
        setError(`Project description must be between 100 and 1,000 characters (Currently: ${description.length} chars).`);
        return false;
      }
      if (techStack.length === 0) {
        setError('Select at least one technology used in your tech stack.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      const ghCheck = validateGithubRepoUrl(githubUrl);
      if (!ghCheck.isValid) {
        setError(ghCheck.error);
        return false;
      }
      const liveCheck = validateLiveUrl(liveUrl);
      if (!liveCheck.isValid) {
        setError(liveCheck.error);
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (participationType === 'Team') {
        if (!teamName.trim()) {
          setError('Team name is required for team submissions.');
          return false;
        }
        for (const m of members) {
          if (!m.name.trim() || !m.email.trim()) {
            setError('All added team members must have a valid name and email address.');
            return false;
          }
        }
      }
      return true;
    }

    if (step === 4) {
      if (!college.trim()) {
        setError('College / University is mandatory.');
        return false;
      }
      if (!course.trim()) {
        setError('Degree / Course program is mandatory.');
        return false;
      }
      if (!graduationYear || graduationYear < 2020 || graduationYear > 2035) {
        setError('Valid graduation year is mandatory.');
        return false;
      }
      if (!city.trim()) {
        setError('City is mandatory.');
        return false;
      }
      return true;
    }

    if (step === 5) {
      const liCheck = validateLinkedinUrl(linkedinUrl);
      if (!liCheck.isValid) {
        setError(liCheck.error);
        return false;
      }
      if (internshipInterest === 'Yes') {
        const resCheck = validateResumeUrl(resumeUrl);
        if (!resCheck.isValid) {
          setError(resCheck.error);
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  // Live validator statuses
  const ghValidation = githubUrl ? validateGithubRepoUrl(githubUrl) : null;
  const liveValidation = liveUrl ? validateLiveUrl(liveUrl) : null;
  const liValidation = linkedinUrl ? validateLinkedinUrl(linkedinUrl) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted) {
      setError('You must confirm and accept the submission terms to proceed.');
      return;
    }

    // Strict pre-submission link verification
    const ghCheck = validateGithubRepoUrl(githubUrl);
    if (!ghCheck.isValid) {
      setError(ghCheck.error);
      setCurrentStep(2);
      return;
    }

    const liveCheck = validateLiveUrl(liveUrl);
    if (!liveCheck.isValid) {
      setError(liveCheck.error);
      setCurrentStep(2);
      return;
    }

    const liCheck = validateLinkedinUrl(linkedinUrl);
    if (!liCheck.isValid) {
      setError(liCheck.error);
      setCurrentStep(5);
      return;
    }

    if (internshipInterest === 'Yes') {
      const resCheck = validateResumeUrl(resumeUrl);
      if (!resCheck.isValid) {
        setError(resCheck.error);
        setCurrentStep(5);
        return;
      }
    }

    setLoading(true);
    try {
      const submissionData = {
        hackathon_id: selectedHackathonId,
        owner_id: user.id,
        owner_name: cleanDisplayName(profile?.full_name) || cleanDisplayName(user.name, user.email) || user.email.split('@')[0],
        owner_email: user.email,
        avatar_url: profile?.avatar_url || user?.avatar || '',
        project_name: projectName.trim(),
        participation_type: participationType,
        team_name: participationType === 'Team' ? teamName.trim() : 'Solo',
        description: description.trim(),
        reliability_strategy: reliabilityStrategy.trim(),
        tech_stack: techStack,
        github_url: ghCheck.normalized,
        live_url: liveCheck.normalized,
        college: college.trim(),
        course: course.trim(),
        graduation_year: graduationYear,
        city: city.trim(),
        internship_interest: internshipInterest === 'Yes',
        resume_url: resumeUrl.trim(),
        linkedin_url: liCheck.normalized,
        members: participationType === 'Team' ? members : []
      };

      const record = db.createSubmission(submissionData);
      setSubmittedRecord(record);

      // Background sync to Google Sheet if configured in .env
      googleSheetService.syncSubmission(record).catch(syncErr => {
        console.warn('Google Sheet background sync notice:', syncErr);
      });
    } catch (err) {
      setError(err.message || 'Submission failed. Please check the fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedRecord) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          SUBMISSION RECEIVED
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
          Project submitted successfully.
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Your project has been recorded by Siteon. The engineering review panel will inspect your GitHub repository and live deployment.
        </p>

        {/* Submission Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-8 text-left space-y-3 card-elevation text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Submission ID:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
              {submittedRecord.id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Project:</span>
            <span className="font-bold text-slate-900">{submittedRecord.project_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Hackathon:</span>
            <span className="font-medium text-slate-800">{submittedRecord.hackathon_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Participation:</span>
            <span className="font-mono text-slate-800">
              {submittedRecord.participation_type} {submittedRecord.participation_type === 'Team' ? `(${submittedRecord.team_name})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              SUBMITTED
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <a
              href={submittedRecord.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-slate-900 font-mono flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href={submittedRecord.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-mono flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Deployment</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/dashboard/submissions/${submittedRecord.id}`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            View Submission
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // SUBMISSION LIMIT LOCK: Max 3 submissions per user
  if (userSubmissionCount >= 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          SUBMISSION QUOTA REACHED (3/3)
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
          Project Submission Locked
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          You have reached the maximum submission limit. Each participant account is permitted to submit up to <strong>3 projects</strong>.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mt-8 text-left space-y-3 card-elevation text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-semibold text-slate-600">Total Submitted Projects:</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
              3 / 3 Projects (Limit Reached)
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed pt-1">
            If you wish to update the repository link, live deployment URL, or description of an existing project, you can do so from your Dashboard via <strong>Edit Submission</strong>. <em>(Note: Each submission can only be edited up to a maximum of <strong>3 times</strong>, after which it is permanently locked.)</em>
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard#submissions"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Manage Existing Submissions
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // PAYMENT GATEKEEPER: ₹49 UPI Verification Required
  if (!paymentInfo.isPaid) {
    const isPending = paymentInfo.status === 'pending_verification';
    const isRejected = paymentInfo.status === 'rejected';

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
          {/* Top highlight bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${isPending ? 'bg-amber-500' : isRejected ? 'bg-rose-500' : 'bg-blue-600'}`} />

          {/* Status Icon */}
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-xs ${
            isPending ? 'bg-amber-50 text-amber-600 border border-amber-200' :
            isRejected ? 'bg-rose-50 text-rose-600 border border-rose-200' :
            'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {isPending ? (
              <Clock className="w-8 h-8 animate-pulse text-amber-600" />
            ) : isRejected ? (
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            ) : (
              <CreditCard className="w-8 h-8 text-blue-600" />
            )}
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            isPending ? 'text-amber-800 bg-amber-50 border-amber-200' :
            isRejected ? 'text-rose-800 bg-rose-50 border-rose-200' :
            'text-blue-700 bg-blue-50 border-blue-200'
          }`}>
            {isPending && 'PAYMENT VERIFICATION PENDING'}
            {isRejected && 'PAYMENT VERIFICATION FAILED'}
            {!isPending && !isRejected && '₹49 ENTRY FEE REQUIRED'}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {isPending && 'Payment Verification in Progress'}
            {isRejected && 'Payment Verification Could Not Be Completed'}
            {!isPending && !isRejected && 'Complete ₹49 Entry Fee to Unlock Submission'}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            {isPending && 'Your ₹49 registration fee has been received with UTR. Our team matches the 12-digit UTR with bank records before unlocking the project submission portal.'}
            {isRejected && (paymentInfo.registration?.rejection_reason || 'The 12-digit UTR provided did not match any credit entry on our bank account statement. Please verify and submit the correct UTR.')}
            {!isPending && !isRejected && 'Participation in this hackathon requires a one-time ₹49 entry fee via UPI to prevent spam and fund verified cash prize pools (₹20,000 for 1st Place).'}
          </p>

          {/* Verification Details Box for Pending or Rejected */}
          {(isPending || isRejected) && paymentInfo.registration && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-6 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-medium text-slate-500">Hackathon:</span>
                <span className="font-semibold text-slate-800">{selectedHackathon?.name || 'WebCode: Data Under Pressure'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-medium text-slate-500">Submitted 12-Digit UTR:</span>
                <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {paymentInfo.registration.utr_number || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-medium text-slate-500">Fee Amount:</span>
                <span className="font-mono font-bold text-slate-900">₹49 (Direct UPI)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Submitted At:</span>
                <span className="font-mono text-slate-600">
                  {paymentInfo.registration.payment_submitted_at ? new Date(paymentInfo.registration.payment_submitted_at).toLocaleString() : 'Just now'}
                </span>
              </div>
            </div>
          )}

          {/* Features Highlights for Unregistered */}
          {!isPending && !isRejected && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mt-6 text-left text-xs space-y-3">
              <div className="flex items-center justify-between font-semibold text-slate-900 pb-2 border-b border-slate-200">
                <span>Entry Fee Details</span>
                <span className="font-mono text-blue-600 font-bold text-sm">₹49 only</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Direct UPI Transfer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 3 Project Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Eligible for ₹20,000 Cash Prize</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Merit Certificate</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isPending ? (
              <>
                <button
                  type="button"
                  onClick={() => refreshPaymentStatus(true)}
                  disabled={refreshingPayment}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingPayment ? 'animate-spin' : ''}`} />
                  <span>{refreshingPayment ? 'Checking...' : 'Refresh Verification Status'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/hackathons/${selectedHackathon?.slug || selectedHackathonId || 'webcode'}/register`)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Update Payment / Re-upload Receipt
                </button>
              </>
            ) : isRejected ? (
              <button
                type="button"
                onClick={() => navigate(`/hackathons/${selectedHackathon?.slug || selectedHackathonId || 'webcode'}/register?step=2`)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Re-submit ₹49 Payment / Correct UTR</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/hackathons/${selectedHackathon?.slug || selectedHackathonId || 'webcode'}/register`)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Register</span>
              </button>
            )}
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 mt-5">
            Admin verifies 12-digit UTR against bank credits. Zero platform fee, funds go directly to the prize organizer.
          </p>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          hackathon={selectedHackathon}
          user={user}
          onSuccess={() => {
            refreshPaymentStatus();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Wizard Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              PROJECT SUBMISSION
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              Quota: {userSubmissionCount}/3 Used ({3 - userSubmissionCount} remaining)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Submit Your Project
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete the required sections below. Maximum 3 projects allowed per user.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-500 mb-2">
          <span>STEP {currentStep} OF 6</span>
          <span>
            {currentStep === 1 && 'Project Details'}
            {currentStep === 2 && 'Repositories & Deployment'}
            {currentStep === 3 && 'Team Setup'}
            {currentStep === 4 && 'Education'}
            {currentStep === 5 && 'Internship Opportunity'}
            {currentStep === 6 && 'Review & Confirm'}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Deadline Notice if closed */}
      {isDeadlinePassed && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong className="block font-semibold">Submissions are closed for this hackathon.</strong>
            <span>The deadline for {selectedHackathon?.name} has elapsed. New submissions are no longer accepted.</span>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Form Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
        
        {/* STEP 1: PROJECT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Hackathon <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
              >
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — Starts {new Date(h.start_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Omnisearch AI or FlowState Engine"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                {projectName.length}/100 characters (min. 3)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what problem your project solves, key architectural decisions, and why it is production-ready..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>Min 100 characters</span>
                <span className={description.length < 100 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                  {description.length}/1000 characters
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <label className="block text-xs font-bold text-blue-950 mb-1">
                Data Reliability & Insights Verification Strategy <span className="text-blue-700 font-mono text-[11px]">(WebCode Challenge)</span>
              </label>
              <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                What did you do to make sure the insights generated by your application are reliable? Explain how your pipeline handled duplicate records, corrupt dates (e.g. 2026/08/45), extreme outliers, and negative amounts without silently dropping data.
              </p>
              <textarea
                rows={4}
                maxLength={1000}
                value={reliabilityStrategy}
                onChange={(e) => setReliabilityStrategy(e.target.value)}
                placeholder="Explain your validation logic, deduplication rules, outlier detection methods, and how your application answers: 'Can I trust what this data is telling me?'..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 leading-relaxed font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>Evaluated under Data Engineering (25%) & Reliability (15%)</span>
                <span>{reliabilityStrategy.length}/1000 characters</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tech Stack <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {COMMON_TECH_STACK.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                      techStack.includes(tech)
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

              {/* Add Custom Tech */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  placeholder="Add custom library or framework..."
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTech}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REPOSITORIES & DEPLOYMENTS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  GitHub Repository URL <span className="text-rose-500">*</span>
                </label>
                {githubUrl && (
                  ghValidation.isValid ? (
                    <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid GitHub Repository
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Invalid Repository Link
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  required
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username/your-repository"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border font-mono ${
                    githubUrl
                      ? ghValidation.isValid
                        ? 'border-emerald-500 focus:ring-emerald-500/20 text-slate-900 bg-emerald-50/20'
                        : 'border-rose-400 focus:ring-rose-500/20 text-slate-900 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-600 text-slate-900'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {githubUrl && !ghValidation.isValid ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{ghValidation.error}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be a publicly accessible GitHub repository (e.g. <code>https://github.com/owner/repo</code>). LinkedIn or other domains will be rejected.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Live Deployment URL <span className="text-rose-500">*</span>
                </label>
                {liveUrl && (
                  liveValidation.isValid ? (
                    <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid Web Deployment
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Invalid Deployment Link
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  required
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border font-mono ${
                    liveUrl
                      ? liveValidation.isValid
                        ? 'border-emerald-500 focus:ring-emerald-500/20 text-slate-900 bg-emerald-50/20'
                        : 'border-rose-400 focus:ring-rose-500/20 text-slate-900 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-600 text-slate-900'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {liveUrl && !liveValidation.isValid ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{liveValidation.error}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Working HTTPS deployment (Vercel, Netlify, Render, Firebase, or custom domain). Cannot be a GitHub or LinkedIn link.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: TEAM SETUP */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Participation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setParticipationType('Individual')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    participationType === 'Individual'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Individual Submission</span>
                  <span className="text-[11px] text-slate-500 font-normal">Solo developer working independently</span>
                </button>

                <button
                  type="button"
                  onClick={() => setParticipationType('Team')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    participationType === 'Team'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Team Submission</span>
                  <span className="text-[11px] text-slate-500 font-normal">Group of up to {selectedHackathon?.max_team_size || 4} members</span>
                </button>
              </div>
            </div>

            {participationType === 'Team' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Team Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. ByteCraft Studio"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Team Members ({members.length + 1}/{selectedHackathon?.max_team_size || 4})
                    </label>
                    <button
                      type="button"
                      onClick={addMember}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  {/* Team leader card */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{user.name} (Team Leader)</span>
                      <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        LEADER
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
                  </div>

                  {/* Additional members list */}
                  <div className="space-y-3">
                    {members.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">Member #{idx + 2}</span>
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={m.name}
                            onChange={(e) => updateMember(idx, 'name', e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900"
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={m.email}
                            onChange={(e) => updateMember(idx, 'email', e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="College / University"
                            value={m.college}
                            onChange={(e) => updateMember(idx, 'college', e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900"
                          />
                          <select
                            value={m.role}
                            onChange={(e) => updateMember(idx, 'role', e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white text-slate-900"
                          >
                            <option value="Frontend">Frontend Developer</option>
                            <option value="Backend">Backend Developer</option>
                            <option value="Full Stack">Full Stack Engineer</option>
                            <option value="UI/UX">UI/UX Designer</option>
                            <option value="Product">Product Lead</option>
                            <option value="Other">Contributor</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: EDUCATION */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / University <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Indian Institute of Technology Delhi"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course / Degree Program <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, BCA"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  required
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="2027"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
              />
            </div>
          </div>
        )}

        {/* STEP 5: INTERNSHIP OPPORTUNITY & PROFESSIONAL PROFILES */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  LinkedIn Profile URL <span className="text-rose-500 font-bold">*</span>
                </label>
                {linkedinUrl && (
                  liValidation.isValid ? (
                    <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid LinkedIn Profile
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Invalid Profile Link
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  required
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourusername"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border font-mono ${
                    linkedinUrl
                      ? liValidation.isValid
                        ? 'border-emerald-500 focus:ring-emerald-500/20 text-slate-900 bg-emerald-50/20'
                        : 'border-rose-400 focus:ring-rose-500/20 text-slate-900 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-600 text-slate-900'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {linkedinUrl && !liValidation.isValid ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{liValidation.error}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be your verified personal LinkedIn profile (e.g. <code>https://linkedin.com/in/yourname</code>). GitHub links or invalid domains are not accepted.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                Interested in Siteon Internship Opportunities?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setInternshipInterest('Yes')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    internshipInterest === 'Yes'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Yes, I want to be considered</span>
                  <span className="text-[11px] text-slate-500 font-normal">Share my portfolio with Siteon reviewers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInternshipInterest('No')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    internshipInterest === 'No'
                      ? 'border-slate-600 bg-slate-100 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">No</span>
                  <span className="text-[11px] text-slate-500 font-normal">Compete strictly for hackathon evaluation</span>
                </button>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed">
                <strong>Notice:</strong> Selecting <em>Yes</em> does not guarantee an internship. It only allows Siteon to consider your profile, repository, and technical implementation for relevant developer positions.
              </div>
            </div>

            {internshipInterest === 'Yes' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resume Link (PDF Cloud Drive URL) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      required
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: REVIEW & CONFIRM */}
        {currentStep === 6 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Review Before Final Submission
            </h2>

            {/* Summary preview */}
            <div className="bg-slate-50/70 rounded-lg border border-slate-200 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Project Name:</span>
                <span className="font-bold text-slate-900">{projectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hackathon:</span>
                <span className="font-medium text-slate-800">{selectedHackathon?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Participation:</span>
                <span className="font-mono text-slate-800">
                  {participationType} {participationType === 'Team' ? `(${teamName})` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">College:</span>
                <span className="font-medium text-slate-800">{college} ({graduationYear})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tech Stack:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {techStack.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">GitHub:</span>
                <span className="font-mono text-blue-600 truncate max-w-xs">{githubUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Live URL:</span>
                <span className="font-mono text-blue-600 truncate max-w-xs">{liveUrl}</span>
              </div>
              {reliabilityStrategy && (
                <div className="border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 block mb-1">Data Reliability Strategy:</span>
                  <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-200 text-[11px] leading-relaxed line-clamp-3">
                    {reliabilityStrategy}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Internship Interest:</span>
                <span className="font-mono font-bold text-slate-900">{internshipInterest}</span>
              </div>
            </div>

            {/* Terms confirmation checkbox */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm that the information submitted is accurate and that I have permission to submit the linked project. I certify that the code is original and complies with the Siteon Code of Conduct.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg"
              >
                Back to Edit
              </button>

              <button
                type="submit"
                disabled={loading || !termsAccepted || isDeadlinePassed}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Transmitting Submission...' : 'Submit Project'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Navigation Buttons for Steps 1 - 5 */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={isDeadlinePassed}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
