import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  Users, 
  Calendar, 
  Code, 
  Award, 
  Trophy, 
  Briefcase, 
  Eye, 
  Download, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalHackathons: 0,
    activeHackathons: 0,
    totalRegistrations: 0,
    totalSubmissions: 0,
    underReview: 0,
    shortlisted: 0,
    winners: 0,
    internshipInterested: 0
  });

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    const loadMetrics = () => {
      const profiles = db.getProfiles();
      const hacks = db.getHackathons();
      const registrations = db.getRegistrations();
      const submissions = db.getSubmissions();

      const activeHacks = hacks.filter(h => (h.status || '').toLowerCase() === 'upcoming' || (h.status || '').toLowerCase() === 'running').length;
      const underReviewCount = submissions.filter(s => (s.status || '').toLowerCase() === 'under review' || (s.status || '').toLowerCase() === 'submitted').length;
      const shortlistedCount = submissions.filter(s => (s.status || '').toLowerCase() === 'shortlisted').length;
      const winnersCount = submissions.filter(s => (s.status || '').toLowerCase() === 'winner').length;
      const internshipCount = submissions.filter(s => s.internship_interest).length;

      setMetrics({
        totalUsers: Math.max(profiles.length, 1),
        totalHackathons: hacks.length,
        activeHackathons: activeHacks,
        totalRegistrations: registrations.length,
        totalSubmissions: submissions.length,
        underReview: underReviewCount,
        shortlisted: shortlistedCount,
        winners: winnersCount,
        internshipInterested: internshipCount
      });

      setRecentSubmissions(submissions.slice(0, 5));
      setHackathons(hacks);
    };

    loadMetrics();
    const handleDbUpdate = () => loadMetrics();
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">Operations Command</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform metrics, participant submissions, and evaluation pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/exports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Data</span>
          </Link>
          <Link
            to="/admin/hackathons"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Hackathons</span>
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Total Users</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{metrics.totalUsers}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered profiles</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Active Hackathons</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{metrics.activeHackathons}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Upcoming / live events</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Registrations</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{metrics.totalRegistrations}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Confirmed participants</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Submissions</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{metrics.totalSubmissions}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Shipped projects</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Under Review</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-2">{metrics.underReview}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting evaluation</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Shortlisted</span>
          <p className="text-2xl font-bold font-mono text-indigo-600 mt-2">{metrics.shortlisted}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Selected for phase 2</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Winners</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">{metrics.winners}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Podium laureates</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 card-elevation">
          <span className="text-xs font-mono font-medium text-slate-500 block">Internship Opt-ins</span>
          <p className="text-2xl font-bold font-mono text-purple-700 mt-2">{metrics.internshipInterested}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Candidates in pipeline</span>
        </div>

      </div>

      {/* Featured Hackathon Operational Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-mono">Current Featured Event: WebCode</h2>
            <p className="text-xs text-slate-500 mt-0.5">Organized by Siteon • Scheduled Start: 04 October 2026</p>
          </div>
          <Link
            to="/admin/hackathons"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 font-mono"
          >
            Configure Dates & Rules →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Registration Status</span>
            <span className="font-bold text-emerald-700 block mt-1">OPEN & ACTIVE</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Submissions Deadline</span>
            <span className="font-bold text-slate-800 block mt-1 font-mono">06 Oct 2026, 17:00 UTC</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Enforcement Mode</span>
            <span className="font-bold text-slate-800 block mt-1">Strict Server-side Cutoff</span>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-elevation">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-mono">Recent Project Submissions</h2>
          <Link
            to="/admin/submissions"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 font-mono"
          >
            View All ({metrics.totalSubmissions}) →
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No projects submitted yet. Projects will appear here as participants submit their repositories and live deployments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">ID / Project</th>
                  <th className="px-5 py-3 font-semibold">Participant</th>
                  <th className="px-5 py-3 font-semibold">College</th>
                  <th className="px-5 py-3 font-semibold">Internship</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{sub.project_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sub.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-900 block">{sub.owner_name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{sub.owner_email}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700 max-w-xs truncate">
                      {sub.college}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {sub.internship_interest ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">YES</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">NO</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/submissions/${sub.id}`}
                        className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
