import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Medal, 
  Award, 
  ArrowLeft,
  Settings,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { cleanDisplayName, getInitialsAvatar } from '../utils/avatar';

export default function Leaderboard() {
  const { isAdmin } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState({
    top10: [],
    winners: [],
    firstPlace: null,
    secondPlace: null,
    thirdPlace: null
  });

  const loadLeaderboard = () => {
    const data = db.getLeaderboard('h_webcode_2026');
    setLeaderboardData(data);
  };

  useEffect(() => {
    loadLeaderboard();
    const handleDbUpdate = (e) => {
      if (e.detail?.table === 'submissions' || e.detail?.table === 'profiles') {
        loadLeaderboard();
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  const { top10, firstPlace, secondPlace, thirdPlace } = leaderboardData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Navigation & Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            to="/hackathons/webcode"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to WebCode</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/submissions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-semibold font-mono shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage Leaderboard in Admin</span>
            </Link>
          )}
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Official WebCode 2026 Results</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Leaderboard & Winners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official winners and finalists ranked by jury evaluation points out of 100.
          </p>
        </div>
      </div>

      {/* Official Prize Pool & Rewards Showcase */}
      <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 rounded-2xl border border-amber-300 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Event Rewards</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              ₹45,000 Cash Prizes + Verified Certificates
            </h2>
          </div>

          {/* Quick Badges for Prizes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 text-center">
              <span className="block text-[10px] uppercase font-bold text-amber-800">1st Winner</span>
              <span className="font-extrabold text-sm sm:text-base">₹20,000</span>
              <span className="block text-[10px] text-amber-900 font-semibold">+ Certificate</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-600">2nd Winner</span>
              <span className="font-extrabold text-sm sm:text-base">₹15,000</span>
              <span className="block text-[10px] text-slate-700 font-semibold">+ Certificate</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-center">
              <span className="block text-[10px] uppercase font-bold text-amber-700">3rd Winner</span>
              <span className="font-extrabold text-sm sm:text-base">₹10,000</span>
              <span className="block text-[10px] text-amber-900 font-semibold">+ Certificate</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-center shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-slate-500">Remaining</span>
              <span className="font-extrabold text-xs sm:text-sm text-blue-700">Official</span>
              <span className="block text-[10px] text-slate-600 font-semibold">Certificate</span>
            </div>
          </div>
        </div>
      </div>

      {top10.length === 0 ? (
        /* Empty State when Admin hasn't added projects to Leaderboard yet */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Leaderboard Evaluation in Progress
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Submissions are currently under technical review. As soon as the Siteon administrator evaluates submissions and assigns ranks, verified winners will appear here automatically.
          </p>
          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/admin/submissions"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs font-mono transition-colors"
              >
                <span>Go to Admin Panel & Assign Ranks</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Top 3 Podium Winners Showcase */}
          {(firstPlace || secondPlace || thirdPlace) && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                
                {/* 2nd Place: 1st Runner Up (Silver) */}
                {secondPlace && (
                  <div className="order-2 md:order-1 bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center relative">
                    <div className="absolute -top-3.5 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold px-3 py-0.5 rounded-full border border-slate-300 shadow-xs flex items-center gap-1">
                      <Medal className="w-3 h-3 text-slate-500" />
                      <span>#2 Winner</span>
                    </div>

                    {/* Image (Real-time Gmail picture or SVG initials) */}
                    <div className="mt-2 mb-3 relative">
                      <img
                        src={secondPlace.avatar_url || getInitialsAvatar(secondPlace.owner_name)}
                        alt={cleanDisplayName(secondPlace.owner_name, secondPlace.owner_email)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getInitialsAvatar(secondPlace.owner_name);
                        }}
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-md"
                      />
                      <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-mono font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                        2
                      </span>
                    </div>

                    {/* Prize Badge */}
                    <div className="mb-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 font-mono font-bold text-xs text-slate-800 shadow-2xs">
                      🥈 ₹15,000 + Certificate
                    </div>

                    {/* Name (Phle) */}
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {cleanDisplayName(secondPlace.owner_name, secondPlace.owner_email)}
                    </h3>

                    {/* Points (100 me kitna point) */}
                    <div className="mt-3">
                      <span className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 font-mono font-extrabold text-base text-slate-800">
                        {secondPlace.score !== undefined && secondPlace.score !== null ? secondPlace.score : 0} / 100 Points
                      </span>
                    </div>
                  </div>
                )}

                {/* 1st Place: Grand Champion (Gold - Center & Elevated) */}
                {firstPlace && (
                  <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/40 rounded-3xl border-2 border-amber-400 p-8 shadow-lg md:-translate-y-4 text-center flex flex-col items-center relative">
                    <div className="absolute -top-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 text-xs font-mono font-extrabold px-4 py-1 rounded-full border border-amber-300 shadow-md flex items-center gap-1.5 uppercase">
                      <Trophy className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
                      <span>#1 Winner</span>
                    </div>

                    {/* Image (Real-time Gmail picture or SVG initials) */}
                    <div className="mt-2 mb-3 relative">
                      <img
                        src={firstPlace.avatar_url || getInitialsAvatar(firstPlace.owner_name)}
                        alt={cleanDisplayName(firstPlace.owner_name, firstPlace.owner_email)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getInitialsAvatar(firstPlace.owner_name);
                        }}
                        className="w-28 h-28 rounded-full object-cover border-4 border-amber-400 shadow-lg ring-4 ring-amber-100"
                      />
                      <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-mono font-extrabold text-sm flex items-center justify-center border-2 border-white shadow-xs">
                        1
                      </span>
                    </div>

                    {/* Prize Badge */}
                    <div className="mb-2 px-3.5 py-1 rounded-full bg-amber-200/90 border border-amber-400 font-mono font-extrabold text-xs text-amber-950 shadow-2xs">
                      🏆 ₹20,000 + Certificate
                    </div>

                    {/* Name (Phle) */}
                    <h3 className="font-extrabold text-xl text-slate-900">
                      {cleanDisplayName(firstPlace.owner_name, firstPlace.owner_email)}
                    </h3>

                    {/* Points (100 me kitna point) */}
                    <div className="mt-3">
                      <span className="inline-block px-4 py-1.5 rounded-xl bg-amber-100 border border-amber-300 font-mono font-extrabold text-lg text-amber-900 shadow-xs">
                        {firstPlace.score !== undefined && firstPlace.score !== null ? firstPlace.score : 0} / 100 Points
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place: 2nd Runner Up (Bronze) */}
                {thirdPlace && (
                  <div className="order-3 md:order-3 bg-white rounded-2xl border-2 border-amber-600/30 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center relative">
                    <div className="absolute -top-3.5 bg-amber-50 text-amber-900 text-[11px] font-mono font-bold px-3 py-0.5 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-700" />
                      <span>#3 Winner</span>
                    </div>

                    {/* Image (Real-time Gmail picture or SVG initials) */}
                    <div className="mt-2 mb-3 relative">
                      <img
                        src={thirdPlace.avatar_url || getInitialsAvatar(thirdPlace.owner_name)}
                        alt={cleanDisplayName(thirdPlace.owner_name, thirdPlace.owner_email)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getInitialsAvatar(thirdPlace.owner_name);
                        }}
                        className="w-24 h-24 rounded-full object-cover border-4 border-amber-700/30 shadow-md"
                      />
                      <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-mono font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                        3
                      </span>
                    </div>

                    {/* Prize Badge */}
                    <div className="mb-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 font-mono font-bold text-xs text-amber-900 shadow-2xs">
                      🥉 ₹10,000 + Certificate
                    </div>

                    {/* Name (Phle) */}
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {cleanDisplayName(thirdPlace.owner_name, thirdPlace.owner_email)}
                    </h3>

                    {/* Points (100 me kitna point) */}
                    <div className="mt-3">
                      <span className="inline-block px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-mono font-extrabold text-base text-amber-900">
                        {thirdPlace.score !== undefined && thirdPlace.score !== null ? thirdPlace.score : 0} / 100 Points
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* Top 10 Official Leaderboard (Strictly 10 entries) */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Top 10 Rankings & Awards
              </h2>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Top 10 Only
              </span>
            </div>

            {/* Clean list cards */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {top10.map((item, index) => {
                const rank = item.display_rank || index + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;

                return (
                  <div
                    key={item.id || index}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 transition-colors hover:bg-slate-50/80 ${
                      isGold ? 'bg-amber-50/20' : isSilver ? 'bg-slate-50/30' : isBronze ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    {/* Left Side: Rank, Image & Name */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Rank Badge */}
                      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs sm:text-sm shrink-0 shadow-xs ${
                        isGold
                          ? 'bg-amber-400 text-amber-950 border border-amber-500'
                          : isSilver
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : isBronze
                          ? 'bg-amber-700 text-amber-100 border border-amber-800'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        #{rank}
                      </span>

                      {/* Image (Real-time Gmail picture or SVG initials) */}
                      <img
                        src={item.avatar_url || getInitialsAvatar(item.owner_name)}
                        alt={cleanDisplayName(item.owner_name, item.owner_email)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getInitialsAvatar(item.owner_name);
                        }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                      />

                      {/* Name (Phle) & Prize Tag */}
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                          {cleanDisplayName(item.owner_name, item.owner_email)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isGold ? 'bg-amber-100 text-amber-950 border border-amber-300' :
                            isSilver ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                            isBronze ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {item.prize_label || (
                              rank === 1 ? '₹20,000 + Certificate' :
                              rank === 2 ? '₹15,000 + Certificate' :
                              rank === 3 ? '₹10,000 + Certificate' :
                              'Official Certificate'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Score out of 100 */}
                    <div className="self-end sm:self-auto shrink-0">
                      <span className={`inline-block font-mono font-extrabold px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-base ${
                        isGold
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isSilver
                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                          : isBronze
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.score !== undefined && item.score !== null ? item.score : 0} / 100 Points
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

    </div>
  );
}
