import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import StatusBadge from '../components/common/StatusBadge';
import Countdown from '../components/common/Countdown';
import { Calendar, Users, ArrowRight, Filter, Sparkles, Terminal } from 'lucide-react';

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [filter, setFilter] = useState('all'); // all, upcoming, running, closed
  const [sort, setSort] = useState('upcoming'); // upcoming, recent, ending

  const loadHackathons = () => {
    setHackathons(db.getHackathons());
  };

  useEffect(() => {
    loadHackathons();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'hackathons' || e.detail?.table === 'registrations') {
        loadHackathons();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  const filteredHackathons = hackathons
    .filter((h) => {
      if (filter === 'all') return true;
      const statusLower = (h.status || '').toLowerCase();
      if (filter === 'upcoming') return statusLower === 'upcoming';
      if (filter === 'running') return statusLower === 'running';
      if (filter === 'closed') return statusLower === 'submission closed' || statusLower === 'completed' || statusLower === 'closed';
      return true;
    })
    .sort((a, b) => {
      if (sort === 'upcoming') {
        return new Date(a.start_date) - new Date(b.start_date);
      }
      if (sort === 'recent') {
        return new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date);
      }
      if (sort === 'ending') {
        return new Date(a.submission_deadline) - new Date(b.submission_deadline);
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>OFFICIAL COMPETITIVE HACKATHONS</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Hackathons
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Build working web products, submit verified GitHub code and live deployments, and get evaluated for developer recognition and career opportunities.
        </p>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 card-elevation">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Hackathons' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'running', label: 'Live Now' },
            { id: 'closed', label: 'Closed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs font-medium text-slate-500">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="upcoming">Upcoming Date</option>
            <option value="recent">Recently Added</option>
            <option value="ending">Ending Soon</option>
          </select>
        </div>

      </div>

      {/* Hackathons Grid */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No hackathons found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No events match the selected filter criteria. Check back soon for new Siteon hackathon announcements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((h) => {
            const registrationsCount = db.getHackathonRegistrations(h.id).length;
            const startDateFormatted = new Date(h.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const subDeadlineFormatted = new Date(h.submission_deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={h.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between card-elevation-hover card-elevation relative group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <StatusBadge status={h.status} />
                    <span className="text-[11px] font-mono font-medium text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{registrationsCount} Registered</span>
                    </span>
                  </div>

                  {/* Title & Theme */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {h.name}
                  </h3>
                  <p className="text-xs font-mono font-medium text-blue-700 mt-0.5">
                    {h.theme}
                  </p>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                    {h.short_description}
                  </p>

                  {/* Date Grid */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Starts:</span>
                      </span>
                      <span className="font-mono font-medium text-slate-900">{startDateFormatted}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Submission Closes:</span>
                      <span className="font-mono font-medium text-slate-900">{subDeadlineFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-500">
                    Max Team: {h.max_team_size || 4}
                  </div>
                  <Link
                    to={`/hackathons/${h.slug || h.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Hackathon</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
