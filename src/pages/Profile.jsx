import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { 
  validateGithubProfileUrl, 
  validateLinkedinUrl, 
  validateResumeUrl 
} from '../utils/validators';
import { getInitialsAvatar, cleanDisplayName, isGitAura } from '../utils/avatar';
import { 
  User, 
  School, 
  BookOpen, 
  Calendar, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Key, 
  Lock, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Profile() {
  const { user, profile, isAdmin, updateProfile } = useAuth();

  const getCleanFallbackName = () => {
    return cleanDisplayName(profile?.full_name) || cleanDisplayName(user?.name, user?.email) || (user?.email ? user.email.split('@')[0] : '');
  };

  // Section 2: User Academic & Professional Fields
  const [fullName, setFullName] = useState(getCleanFallbackName());
  const [college, setCollege] = useState(profile?.college || '');
  const [course, setCourse] = useState(profile?.course || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduation_year || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Keep form values in sync when user or profile changes, pulling from profile or submissions
  useEffect(() => {
    if (user) {
      // Find latest profile by user_id or email
      const activeProf = profile || db.getProfileByUserId(user.id, user.email) || db.getProfileByEmail(user.email);
      // Also fallback to any recent submission by this user for missing fields
      const userSubs = db.getUserSubmissions(user.id);
      const latestSub = userSubs && userSubs.length > 0 ? userSubs[0] : null;

      const rawSubOwner = latestSub?.owner_name;
      const cleanSubOwner = isGitAura(rawSubOwner) ? '' : rawSubOwner;
      const cleanProfName = cleanDisplayName(activeProf?.full_name);
      const cleanUserName = cleanDisplayName(user?.name, user?.email);
      const finalName = cleanProfName || cleanSubOwner || cleanUserName || (user?.email ? user.email.split('@')[0] : '');

      setFullName(finalName);
      setCollege(activeProf?.college || latestSub?.college || '');
      setCourse(activeProf?.course || latestSub?.course || '');
      setGraduationYear(activeProf?.graduation_year || latestSub?.graduation_year || '');
      setPhone(activeProf?.phone || latestSub?.phone || '');
      setCity(activeProf?.city || latestSub?.city || '');
      setState(activeProf?.state || '');
      setGithubUrl(activeProf?.github_url || latestSub?.github_url || '');
      setLinkedinUrl(activeProf?.linkedin_url || latestSub?.linkedin_url || '');
      setResumeUrl(activeProf?.resume_url || latestSub?.resume_url || '');
    }
  }, [profile, user]);

  // Section 1: Login Account & Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle User Details Update (Section 2)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName.trim()) {
      setError('Full Name is mandatory.');
      return;
    }
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('A valid Phone Number with at least 10 digits is mandatory.');
      return;
    }
    if (!college.trim()) {
      setError('College / University name is mandatory.');
      return;
    }
    if (!course.trim()) {
      setError('Course / Degree program is mandatory.');
      return;
    }
    if (!graduationYear) {
      setError('Graduation Year is mandatory.');
      return;
    }
    if (!city.trim() || !state.trim()) {
      setError('City and State are mandatory.');
      return;
    }
    const ghCheck = validateGithubProfileUrl(githubUrl);
    if (!ghCheck.isValid) {
      setError(ghCheck.error);
      return;
    }
    const liCheck = validateLinkedinUrl(linkedinUrl);
    if (!liCheck.isValid) {
      setError(liCheck.error);
      return;
    }
    const resCheck = validateResumeUrl(resumeUrl);
    if (!resCheck.isValid) {
      setError(resCheck.error);
      return;
    }

    try {
      updateProfile({
        full_name: fullName.trim(),
        college: college.trim(),
        course: course.trim(),
        graduation_year: graduationYear.toString().trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        github_url: ghCheck.normalized,
        linkedin_url: liCheck.normalized,
        resume_url: resCheck.normalized || resumeUrl.trim()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  // Handle Login Password Update (Section 1)
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setPasswordLoading(true);
    try {
      db.updateUserPassword(user.id, newPassword);
      setPasswordSuccess('Login password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your authentication credentials (login email, password) and student developer details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5">
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> : <User className="w-3.5 h-3.5 text-blue-600" />}
            <span>ROLE: {isAdmin ? 'ADMINISTRATOR' : 'PARTICIPANT'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center card-elevation">
            <img
              src={
                profile?.avatar_url && !profile.avatar_url.includes('dicebear')
                  ? profile.avatar_url
                  : (user?.avatar && !user.avatar.includes('dicebear') ? user.avatar : getInitialsAvatar(fullName || user?.name || user?.email))
              }
              alt={fullName || user?.name || 'User Avatar'}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getInitialsAvatar(fullName || user?.name || user?.email);
              }}
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-slate-200 mb-4 bg-slate-100 shadow-xs"
            />
            <h2 className="text-base font-bold text-slate-900">
              {fullName || cleanDisplayName(profile?.full_name) || cleanDisplayName(user?.name, user?.email) || user?.email?.split('@')[0]}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account ID:</span>
                <span className="font-mono font-bold text-slate-900">{user?.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-medium text-slate-900 truncate max-w-[150px]">{college || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Graduation:</span>
                <span className="font-mono font-medium text-slate-900">{graduationYear || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Resume Link:</span>
                <span className="font-mono text-blue-600 truncate max-w-[150px]">
                  {resumeUrl ? 'Configured' : 'Missing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dual Sections */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ========================================================= */}
          {/* SECTION 1: LOGIN USER ACCOUNT & CREDENTIALS               */}
          {/* ========================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
            <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Section 1: Login Account & Credentials
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Authentication credentials used to access Siteon and submit projects.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                ACTIVE SESSION
              </span>
            </div>

            {/* Read-Only Account Identifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Login Email Address:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.email}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">System Role:</span>
                <span className="inline-block font-mono uppercase px-2 py-0.5 rounded text-[11px] font-bold bg-white border border-slate-200 text-slate-800">
                  {isAdmin ? 'Administrator' : 'Verified Participant'}
                </span>
              </div>
            </div>

            {/* Password Update Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Update Login Password</span>
              </h3>

              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 pr-9 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? 'Saving...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: USER PROFILE & ACADEMIC DETAILS               */}
          {/* ========================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 card-elevation">
            <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Section 2: User Details & Academic Profile
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Mandatory student contact details, university degree, and developer portfolio links.
                  </p>
                </div>
              </div>
            </div>

            {success && (
              <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>User details successfully saved!</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Linked Account Email Indicator */}
              <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Verified Account Email</span>
                    <span className="font-mono font-bold text-slate-900">{user?.email}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  LINKED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / University <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="University Name"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Degree Program <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="B.Tech Computer Science"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Graduation Year <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2027"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                  />
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
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub Profile URL <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn Profile URL <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      required
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                    />
                  </div>
                </div>

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
                      placeholder="https://drive.google.com/..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Save User Details</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
