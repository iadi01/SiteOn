import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import Countdown from '../components/common/Countdown';
import { 
  Terminal, 
  ArrowRight, 
  Code, 
  Send, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
  CreditCard,
  Clock,
  AlertTriangle
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredHackathon, setFeaturedHackathon] = useState(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ isPaid: false, status: 'not_registered' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    activeHackathons: 1,
    verifiedSubmissions: 0,
    registeredStudents: 0
  });

  const loadData = () => {
    const list = db.getHackathons();
    const featured = list.find(h => h.is_featured) || list[0];
    setFeaturedHackathon(featured);

    if (featured) {
      const regs = db.getHackathonRegistrations(featured.id);
      setRegistrationsCount(regs.length);
      if (user) {
        const pInfo = db.isUserPaidAndVerified(user.id, featured.id);
        setPaymentInfo(pInfo);
        setIsRegistered(pInfo.isPaid);
      } else {
        setPaymentInfo({ isPaid: false, status: 'not_registered' });
        setIsRegistered(false);
      }
    }

    const allSubs = db.getSubmissions();
    const allRegs = db.getRegistrations();
    setPlatformStats({
      activeHackathons: list.filter(h => h.status !== 'Completed').length,
      verifiedSubmissions: allSubs.length,
      registeredStudents: allRegs.length
    });
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, [user]);

  const handleRegister = () => {
    navigate('/hackathons/webcode/register');
  };

  const startDateFormatted = featuredHackathon 
    ? new Date(featuredHackathon.start_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '04 October 2026';

  return (
    <div className="space-y-20 pb-20">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Crisp Header Eyebrow */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>SITEON HACKATHONS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Build. Ship. <br />
            <span className="text-blue-600">Get Noticed.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-6 leading-relaxed max-w-2xl mx-auto font-normal">
            Participate in developer-focused hackathons, build real products, submit your work, and open the door to opportunities with Siteon.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/hackathons"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Hackathons</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                if (user) navigate('/submit');
                else navigate('/auth?redirect=/submit');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Submit Your Project</span>
            </button>
          </div>
        </div>

        {/* ─── FEATURED HACKATHON: WEBCODE ─── */}
        {featuredHackathon && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-elevation relative overflow-hidden">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    FEATURED EVENT
                  </span>
                  <StatusBadge status={featuredHackathon.status} />
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{registrationsCount} Registered Participants</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {featuredHackathon.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-mono font-semibold text-blue-700 mt-1">
                    {featuredHackathon.theme}
                  </p>
                  <p className="text-xs text-slate-600 mt-3 max-w-xl leading-relaxed">
                    {featuredHackathon.short_description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Starts: <strong className="text-slate-900">{startDateFormatted}</strong>
                    </span>
                    <span>•</span>
                    <span>Max Team: <strong className="text-slate-900">{featuredHackathon.max_team_size || 4}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-3">
                  <Countdown targetDate={featuredHackathon.start_date} label="Starts in" />
                  
                  <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-200">
                    {paymentInfo.status === 'verified' ? (
                      <>
                        <div className="w-full py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Registration Verified (₹49 Paid)</span>
                        </div>
                        <Link
                          to={`/submit/${featuredHackathon.id}`}
                          className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono text-center transition-colors shadow-xs"
                        >
                          Submit Project →
                        </Link>
                      </>
                    ) : paymentInfo.status === 'pending_verification' ? (
                      <button
                        type="button"
                        onClick={() => navigate('/hackathons/webcode/register')}
                        className="w-full py-2 px-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono text-center flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Payment Under Review (₹49)</span>
                      </button>
                    ) : paymentInfo.status === 'rejected' ? (
                      <button
                        type="button"
                        onClick={() => navigate('/hackathons/webcode/register?step=2')}
                        className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Re-Submit ₹49 Payment</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRegister}
                        className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Register</span>
                      </button>
                    )}

                    <Link
                      to={`/hackathons/${featuredHackathon.slug || featuredHackathon.id}`}
                      className="w-full py-2 px-4 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold text-center transition-colors"
                    >
                      View WebCode Details
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </section>

      {/* ─── REAL METRICS STRIP ─── */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {platformStats.activeHackathons}
              </span>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
                Official Hackathons
              </p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-blue-600 font-mono">
                {platformStats.registeredStudents}
              </span>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
                Active Student Registrations
              </p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {platformStats.verifiedSubmissions}
              </span>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
                Verified Code Submissions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (Section 9) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
            THE PROCESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            From discovering a challenge to shipping verified code and gaining recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation relative">
            <span className="font-mono text-2xl font-black text-slate-300 block mb-3">01</span>
            <h3 className="text-base font-bold text-slate-900">Discover</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Find an upcoming Siteon hackathon like WebCode, review rules, timelines, and register individually or as a team.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation relative">
            <span className="font-mono text-2xl font-black text-slate-300 block mb-3">02</span>
            <h3 className="text-base font-bold text-slate-900">Build</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Create your project individually or with your team. Focus on architecture, clean code, and working functional logic.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation relative">
            <span className="font-mono text-2xl font-black text-slate-300 block mb-3">03</span>
            <h3 className="text-base font-bold text-slate-900">Submit</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Submit your GitHub repository, live HTTPS deployment URL, tech stack details, and indicate internship consideration.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation relative">
            <span className="font-mono text-2xl font-black text-slate-300 block mb-3">04</span>
            <h3 className="text-base font-bold text-slate-900">Get Reviewed</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Siteon technical panels review projects, update statuses (Shortlisted, Winner), and assess talent for opportunities.
            </p>
          </div>

        </div>
      </section>

      {/* ─── WHY SITEON (Section 10) ─── */}
      <section className="bg-slate-100/60 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded">
              ADVANTAGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              Why Siteon
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered to replace theoretical college assignments with real software engineering experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                <Code className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real Projects</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Build something functional instead of submitting theoretical assignments. You create working software that solves genuine user problems.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Public Portfolio</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Your GitHub and live project showcase your actual development ability with verified commits and production deployment links.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Team Experience</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Work with other students and developers. Practice cross-functional collaboration, git versioning, and collective delivery under deadline constraints.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Opportunity</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Participants can indicate interest in Siteon internship opportunities. Your verified code and application become directly reviewable by engineering leads.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── READY CTA STRIP ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 card-elevation">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ready to ship your next product?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-lg mx-auto">
            WebCode registrations are currently active. Join ambitious student developers building for the future.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/hackathons/webcode"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              View WebCode Hackathon
            </Link>
            <Link
              to="/hackathons"
              className="px-6 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Browse All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {featuredHackathon && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          hackathon={featuredHackathon}
          user={user}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

    </div>
  );
}
