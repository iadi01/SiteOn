import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  validateGithubProfileUrl, 
  validateLinkedinUrl, 
  validateResumeUrl 
} from '../utils/validators';
import { cleanDisplayName } from '../utils/avatar';
import { User, School, BookOpen, Calendar, Phone, MapPin, Github, Linkedin, FileText, CheckCircle2, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ProfileSetup() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const cleanInitialName = cleanDisplayName(profile?.full_name) || cleanDisplayName(user?.name, user?.email) || (user?.email ? user.email.split('@')[0] : '');
  const [fullName, setFullName] = useState(cleanInitialName);
  const [college, setCollege] = useState(profile?.college || '');
  const [course, setCourse] = useState(profile?.course || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduation_year || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Strict validation: ALL fields are mandatory
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
      setError('Degree / Course program is mandatory.');
      return;
    }
    if (!graduationYear || graduationYear < 2020 || graduationYear > 2035) {
      setError('Valid Graduation Year is mandatory.');
      return;
    }
    if (!city.trim()) {
      setError('City is mandatory.');
      return;
    }
    if (!state.trim()) {
      setError('State is mandatory.');
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

    setLoading(true);
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

      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 bg-grid-pattern">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
            MANDATORY PARTICIPANT REGISTRATION
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            Complete Your Student Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All fields below (Phone, University, GitHub, LinkedIn, Resume) are mandatory to participate in Siteon hackathons and submit projects.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 card-elevation">
          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Primary Details */}
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-4">
                1. Personal Information <span className="text-[10px] text-rose-500 lowercase">(all mandatory)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aditya Sharma"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* University & Academics */}
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-4">
                2. Academic Background <span className="text-[10px] text-rose-500 lowercase">(all mandatory)</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / University <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Indian Institute of Technology / Delhi University"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Degree / Course <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="e.g. B.Tech, BCA, MCA"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Graduation Year <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="2020"
                        max="2035"
                        required
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        placeholder="2027"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                      />
                    </div>
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
                      placeholder="State / Region"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Presence & Resume */}
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-4">
                3. Mandatory Developer Profiles & Resume
              </h2>
              <div className="space-y-4">
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
                    Resume Link (PDF Cloud Storage URL) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      required
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-900 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Provide a valid PDF link. Resumes are kept confidential and evaluated solely by authorized Siteon reviewers.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto py-2.5 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{loading ? 'Validating & Saving...' : 'Complete Profile & Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
