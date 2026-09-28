import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { googleSheetService } from '../../services/googleSheetService';
import { getInitialsAvatar, cleanDisplayName } from '../../utils/avatar';
import { 
  Users, 
  Key, 
  UserCheck, 
  ShieldCheck, 
  Mail, 
  Phone, 
  School, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Github, 
  Linkedin, 
  FileText, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  UserPlus,
  RefreshCw
} from 'lucide-react';

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('login_accounts'); // 'login_accounts' or 'user_details'
  const [usersList, setUsersList] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [notification, setNotification] = useState('');
  const [syncingSheet, setSyncingSheet] = useState(false);

  const loadData = () => {
    setUsersList(db.getUsers());
    setProfilesList(db.getProfiles());
  };

  const handleSyncUsersToSheet = async () => {
    setSyncingSheet(true);
    try {
      const res = await googleSheetService.syncAllUsers();
      setNotification(res.message);
      setTimeout(() => setNotification(''), 4500);
    } catch (err) {
      setNotification(err.message || 'Failed to sync users');
      setTimeout(() => setNotification(''), 4500);
    } finally {
      setSyncingSheet(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleRoleChange = (userId, userEmail, newRole) => {
    try {
      db.setUserRole(userId, newRole, userEmail);
      setNotification(`Role updated to ${newRole.toUpperCase()} for ${userEmail}`);
      setTimeout(() => setNotification(''), 3500);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = (userId, email) => {
    if (email === 'siteon.org@gmail.com') {
      alert('The primary Siteon administrator account cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user account: ${email}? This will remove login credentials and profile records.`)) {
      try {
        db.deleteUser(userId);
        setNotification(`Account ${email} deleted successfully.`);
        setTimeout(() => setNotification(''), 3500);
        loadData();
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  // Filter users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const role = db.getUserRole(u.id, u.email);
    const matchesRole = selectedRoleFilter === 'all' || role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter profiles - ensure all registered users show up with their latest profile and submission data
  const mergedProfiles = usersList.map(u => {
    const prof = profilesList.find(p => p.user_id === u.id || (p.email && p.email.toLowerCase() === u.email.toLowerCase())) || {};
    const userSubs = db.getUserSubmissions(u.id);
    const latestSub = userSubs && userSubs.length > 0 ? userSubs[0] : null;

    return {
      id: prof.id || u.id,
      user_id: u.id,
      full_name: cleanDisplayName(prof.full_name) || cleanDisplayName(latestSub?.owner_name) || cleanDisplayName(u.name, u.email) || u.email.split('@')[0],
      email: u.email,
      phone: prof.phone || latestSub?.phone || '',
      college: prof.college || latestSub?.college || '',
      course: prof.course || latestSub?.course || '',
      graduation_year: prof.graduation_year || latestSub?.graduation_year || '',
      city: prof.city || latestSub?.city || '',
      state: prof.state || '',
      github_url: prof.github_url || latestSub?.github_url || '',
      linkedin_url: prof.linkedin_url || latestSub?.linkedin_url || '',
      resume_url: prof.resume_url || latestSub?.resume_url || '',
      avatar_url: prof.avatar_url && !prof.avatar_url.includes('dicebear') ? prof.avatar_url : getInitialsAvatar(cleanDisplayName(prof.full_name) || u.email)
    };
  });

  const filteredProfiles = mergedProfiles.filter(p => {
    return (
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.college || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.course || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Users & Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated login accounts and verified participant profile records.
          </p>
        </div>

        {/* Section Toggle Pill */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('login_accounts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'login_accounts'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Section 1: Login Accounts ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('user_details')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'user_details'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Section 2: User Details ({profilesList.length})</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Total Login Accounts</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{usersList.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Verified Profiles</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{profilesList.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Admin Role Accounts</span>
          <span className="text-2xl font-extrabold text-purple-600 mt-1 block">
            {usersList.filter(u => db.getUserRole(u.id, u.email) === 'admin').length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 card-elevation">
          <span className="text-[11px] font-mono text-slate-500 block uppercase">Student Participants</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {usersList.filter(u => db.getUserRole(u.id, u.email) !== 'admin').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'login_accounts' ? "Search by email, name, user ID..." : "Search by name, college, city, course..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {activeTab === 'login_accounts' && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="participant">Participants Only</option>
                <option value="admin">Administrators Only</option>
              </select>
            </div>
          )}

          <button
            onClick={handleSyncUsersToSheet}
            disabled={syncingSheet}
            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingSheet ? 'animate-spin' : ''}`} />
            <span>{syncingSheet ? 'Syncing...' : 'Sync Users to Google Sheet'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: LOGIN ACCOUNTS (Email & Passwords) */}
      {activeTab === 'login_accounts' && (
        <div className="bg-white rounded-xl border border-slate-200 card-elevation overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Section 1: Login Accounts & Passwords Database
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Table: <code>siteon_db_users</code> ({filteredUsers.length} records)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Login Email</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No login accounts matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const role = db.getUserRole(u.id, u.email);
                    const isVisible = showPasswords[u.id];

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {u.id}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          {u.name || 'Participant'}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-900">
                              {isVisible ? (u.password || '••••••••') : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-700 transition-colors"
                              title={isVisible ? "Hide Password" : "Show Password"}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={role}
                            disabled={u.email === 'siteon.org@gmail.com'}
                            onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                            className={`text-[11px] font-mono font-bold uppercase rounded px-2 py-1 border ${
                              role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <option value="participant">Participant</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            disabled={u.email === 'siteon.org@gmail.com'}
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className={`p-1.5 rounded text-slate-400 hover:text-rose-600 transition-colors ${
                              u.email === 'siteon.org@gmail.com' ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: USER DETAILS (Academic & Profile Records) */}
      {activeTab === 'user_details' && (
        <div className="bg-white rounded-xl border border-slate-200 card-elevation overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Section 2: User Details & Academic Profiles
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Table: <code>siteon_db_profiles</code> ({filteredProfiles.length} records)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">College / University</th>
                  <th className="py-3 px-4">Course & Year</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">GitHub Profile</th>
                  <th className="py-3 px-4">LinkedIn</th>
                  <th className="py-3 px-4 text-right">Resume Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No user profile details matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => (
                    <tr key={p.id || p.user_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.avatar_url && !p.avatar_url.includes('dicebear') ? p.avatar_url : getInitialsAvatar(p.full_name || p.email)}
                            alt={p.full_name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getInitialsAvatar(p.full_name || p.email);
                            }}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.full_name || 'Participant'}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{p.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        {p.phone || <span className="text-slate-400">Not provided</span>}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-[180px] truncate" title={p.college}>
                        {p.college || <span className="text-slate-400">Not set</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="block text-slate-800 font-medium">{p.course || 'B.Tech CS'}</span>
                        <span className="block text-[11px] font-mono text-slate-500">Grad: {p.graduation_year || '2027'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {p.city ? `${p.city}${p.state ? `, ${p.state}` : ''}` : <span className="text-slate-400">Not set</span>}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.github_url ? (
                          <a
                            href={p.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-[11px]"
                          >
                            <Github className="w-3 h-3" />
                            <span>GitHub</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.linkedin_url ? (
                          <a
                            href={p.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-[11px]"
                          >
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn</span>
                            <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.resume_url ? (
                          <a
                            href={p.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded text-[11px] font-semibold"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Resume</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Missing</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
