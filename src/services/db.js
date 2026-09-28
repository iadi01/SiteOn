// Persistent Database Engine for Siteon Platform
// Implements relational storage schema across profiles, user_roles, hackathons, registrations, submissions, submission_members, audit_logs, and settings.
import { 
  validateGithubRepoUrl, 
  validateGithubProfileUrl, 
  validateLinkedinUrl, 
  validateLiveUrl 
} from '../utils/validators.js';

const STORAGE_KEY_PREFIX = 'siteon_db_';

const initialHackathons = [
  {
    id: 'h_webcode_2026',
    name: 'WebCode: Data Under Pressure',
    slug: 'webcode',
    subtitle: 'Can I trust what this data is telling me?',
    theme: 'Reliable Data Intelligence & Anomaly Resilience',
    short_description: 'Build a reliable data intelligence web application that can take a messy CSV dataset and turn it into meaningful, explainable and actionable insights.',
    description: 'Real-world data is never clean. Companies deal with thousands of transactions, customer records, and business events daily where raw files contain missing values, duplicate records, invalid dates, inconsistent categories, incorrect values, and unusual transactions. Your challenge is to build a reliable data intelligence web application that takes this messy CSV dataset and produces dependable, explainable, and trustworthy insights without silently discarding data.',
    start_date: '2026-10-07T11:30:00.000Z', // 07 Oct 2026, 5:00 PM IST
    end_date: '2026-10-08T11:30:00.000Z',   // 08 Oct 2026, 5:00 PM IST (24h)
    registration_deadline: '2026-10-05T18:29:59.000Z', // 05 Oct 2026, 11:59 PM IST
    submission_deadline: '2026-10-08T11:30:00.000Z',   // 08 Oct 2026, 5:00 PM IST
    results_date: '2026-10-10T12:30:00.000Z',          // 10 Oct 2026, 6:00 PM IST
    status: 'Live', // Draft, Upcoming, Live, Submissions Closed, Under Review, Completed
    eligibility: 'Open to all currently enrolled undergraduate and postgraduate students. Individual and team participation (up to 4 members) is permitted.',
    max_team_size: 4,
    entry_fee: 49,
    reveal_problem_statement: false,
    dataset: {
      name: 'WebCode Messy Transactions Dataset',
      filename: 'webcode_data_under_pressure_dataset.csv',
      download_url: '/datasets/webcode_data_under_pressure_dataset.csv',
      format: 'CSV',
      records: 256,
      columns: 9,
      version: 'v1.0',
      status: 'Live & Published',
      last_updated: '2026-09-28T17:00:00.000Z',
      description: 'Production-like messy financial dataset containing duplicate IDs, invalid calendar dates (e.g. 2026/08/45), negative amounts, extreme outliers (e.g. ₹999,999), inconsistent casing, missing merchants, and malformed rows.',
      columns_schema: [
        { name: 'transaction_id', type: 'String', problem: 'Duplicate IDs (e.g. TXN100025, TXN100100) and missing IDs in broken trailing rows' },
        { name: 'transaction_date', type: 'Date / String', problem: 'Invalid calendar dates (e.g. 2026/08/45, not_available) and missing dates' },
        { name: 'customer_age', type: 'Integer', problem: 'Missing customer ages and unusual value distributions' },
        { name: 'city', type: 'String', problem: 'Untrimmed whitespaces and missing city entries' },
        { name: 'category', type: 'String', problem: 'Inconsistent casing (grocery vs Grocery), trailing spaces (Food )' },
        { name: 'merchant', type: 'String', problem: 'Missing merchant labels and sparse partner tags' },
        { name: 'amount_inr', type: 'Float', problem: 'Negative amounts (-1865.13) and extreme outliers (₹999,999.0)' },
        { name: 'payment_method', type: 'String', problem: 'Inconsistent casing (CARD, Card, UPI, upi, Cash) and blank values' },
        { name: 'status', type: 'String', problem: 'Inconsistent statuses (Success, SUCCESS, Failed, Pending, blank)' }
      ]
    },
    pipeline: [
      { step: 1, title: 'CSV Input', desc: 'Accept raw, messy transaction CSV uploads or live ingest.' },
      { step: 2, title: 'Validation', desc: 'Schema checks, column integrity, row-level format verifications.' },
      { step: 3, title: 'Data Cleaning', desc: 'Deduplication, normalization, date parsing, whitespace trimming.' },
      { step: 4, title: 'Data Quality', desc: 'Audit metrics, anomaly tagging, trust scoring, health indexes.' },
      { step: 5, title: 'Analysis', desc: 'Financial aggregations, category distributions, failure analytics.' },
      { step: 6, title: 'Visualization', desc: 'Clean time-series, charts, interactive trend inspection.' },
      { step: 7, title: 'Insights', desc: 'Explainable business insights, detected anomalies, volume shifts.' },
      { step: 8, title: 'Evidence', desc: 'Direct drill-down to raw vs cleaned records supporting every claim.' }
    ],
    minimum_requirements: [
      { id: 'dq_dash', title: 'Data Quality Dashboard', desc: 'Show total records, valid vs invalid rows, duplicate count, missing values per column, outlier detection, negative amounts, and invalid dates.' },
      { id: 'txn_analysis', title: 'Transaction Analysis', desc: 'Total transaction volume, average spend, category breakdowns, city distributions, payment method shares, and success vs failure trends.' },
      { id: 'interactive_exp', title: 'Interactive Exploration', desc: 'Search by customer/ID, filter by date, category, status, and sort by amount with instant drill-down.' },
      { id: 'explainable_insights', title: 'Explainable Insights', desc: 'Provide clear reasons and evidence behind detected spikes, anomalies, or suspicious patterns instead of black-box graphs.' },
      { id: 'dq_handling', title: 'Data Quality Handling', desc: 'Distinguish between Raw Data and Usable/Cleaned Data. Clearly justify whether records are repaired, flagged, or isolated—never delete silently.' }
    ],
    killer_requirement: 'Judges will test your application live with edge cases: empty CSVs, missing columns, corrupted dates, extreme values (e.g. ₹999,999), and duplicate transaction IDs. Your application must not crash, misrepresent statistics, or drop records without explanation.',
    judging_criteria: [
      { criterion: 'Data Engineering & Cleaning', weight: '25%', desc: 'How intelligently the app validates, repairs, flags, and cleans messy real-world data without silent loss.' },
      { criterion: 'Analytical Depth & Insights', weight: '20%', desc: 'Quality of financial metrics, aggregations, trend discovery, and explainability.' },
      { criterion: 'Product Design & User Experience', weight: '20%', desc: 'Clarity of dashboard, intuitive navigation, responsive exploration, and visual polish.' },
      { criterion: 'Reliability & Edge Case Handling', weight: '15%', desc: 'Resilience against corrupt rows, extreme outliers, missing headers, and malformed files.' },
      { criterion: 'Performance & Architecture', weight: '10%', desc: 'Speed of processing, state management, and scalability on large datasets.' },
      { criterion: 'Technical Implementation & Code Cleanliness', weight: '10%', desc: 'Repository structure, clean commits, comprehensive README, and live deployment stability.' }
    ],
    rules: [
      'All submissions must consist of freshly built code developed for WebCode: Data Under Pressure.',
      'A valid, publicly accessible GitHub repository with committed code history and clean README is strictly required.',
      'A live, working deployment link (Vercel, Netlify, Render, AWS, or custom domain) must be operational during technical review.',
      'The application must accept the official CSV dataset and survive judge-tested edge cases without crashing.',
      'Data cleaning decisions must be transparent and explainable—no silent deletions of anomalous rows.',
      'Submissions close promptly at the deadline; no late submissions or edits beyond the 3-edit allowance are permitted.'
    ],
    submission_requirements: [
      'Working web application handling messy CSV data with interactive UI',
      'Public GitHub repository with comprehensive README and setup instructions',
      'Active live HTTPS deployment link',
      'Reliability explanation answering: "What did you do to make sure insights are reliable?"',
      'Team member roles and verified contact credentials'
    ],
    prizes: [
      { place: '1st Place Winner (1st Winner)', award: '₹20,000 + Certificate of Excellence', description: 'Awarded to the Grand Champion for outstanding technical execution and data resilience.' },
      { place: '1st Runner Up (2nd Winner)', award: '₹15,000 + Certificate of Merit', description: 'Cash prize of ₹15,000 along with verified certificate of merit.' },
      { place: '2nd Runner Up (3rd Winner)', award: '₹10,000 + Certificate of Merit', description: 'Cash prize of ₹10,000 along with verified certificate of merit.' },
      { place: 'All Finalists & Participants (Remaining)', award: 'Official Certificate', description: 'Official Certificate for verified project submission and code review.' }
    ],
    faqs: [
      { q: 'What is the core objective of WebCode: Data Under Pressure?', a: 'To build a production-grade data intelligence web app that takes raw, messy CSV transactions and produces verified, explainable business insights without crashing on anomalies.' },
      { q: 'Can our app delete invalid or anomalous rows?', a: 'Never delete silently! Your application must distinguish Raw Data vs Cleaned/Usable data, providing clear indicators, quarantine buckets, or explainable correction flags.' },
      { q: 'How will judges test our application?', a: 'Judges will upload the official dataset as well as secret edge-case test files (e.g. empty CSV, missing columns, corrupt dates, ₹999k outliers, negative numbers) to see if your app handles them gracefully.' },
      { q: 'Can I participate individually or do I need a team?', a: 'You can participate individually or in a team of up to 4 members.' },
      { q: 'Is there any registration or submission fee?', a: 'No, WebCode is completely free for all verified students.' }
    ],
    is_featured: true,
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-09-28T17:00:00.000Z'
  }
];

const initialSettings = {
  site_name: 'Siteon',
  contact_email: 'siteon.org@gmail.com',
  default_team_size: 4,
  internship_inquiries_open: true,
  allow_self_registration: true,
  rules_version: 'v1.0.2',
  registration_fee: 49,
  upi_id: 'siteon@ptyes',
  upi_payee_name: 'Siteon'
};

const initialRoles = [
  { id: 'ur_admin_1', user_id: 'u_admin_default', email: 'siteon.org@gmail.com', role: 'admin', created_at: '2026-01-01T00:00:00.000Z' }
];

const initialUsers = [
  {
    id: 'u_admin_default',
    email: 'siteon.org@gmail.com',
    password: 'NihalAU@10132005',
    name: 'Siteon Administrator',
    created_at: '2026-01-01T00:00:00.000Z'
  }
];

const initialProfiles = [
  {
    id: 'p_admin_1',
    user_id: 'u_admin_default',
    full_name: 'Siteon Administrator',
    email: 'siteon.org@gmail.com',
    phone: '+91 98765 43210',
    college: 'Siteon Engineering Council',
    course: 'Operations & Engineering',
    graduation_year: '2024',
    city: 'New Delhi',
    state: 'Delhi',
    github_url: 'https://github.com/siteon-org',
    linkedin_url: 'https://linkedin.com/company/siteon',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    resume_url: '',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-09-28T00:00:00.000Z'
  }
];

const initialSubmissions = [];

function getTable(table, defaultVal = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + table);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PREFIX + table, JSON.stringify(defaultVal));
      return defaultVal;
    }
    const data = JSON.parse(raw);
    
    // Auto-clean any legacy or mock 'git_aura' entries
    if (Array.isArray(data) && ['users', 'profiles', 'submissions'].includes(table)) {
      let changed = false;
      const isAura = (str) => typeof str === 'string' && str.toLowerCase().replace(/[^a-z0-9]/g, '').includes('gitaura');
      
      data.forEach(item => {
        if (!item) return;
        if (table === 'users' && isAura(item.name)) {
          item.name = item.email ? item.email.split('@')[0] : 'Participant';
          changed = true;
        } else if (table === 'profiles' && isAura(item.full_name)) {
          item.full_name = item.email ? item.email.split('@')[0] : 'Participant';
          changed = true;
        } else if (table === 'submissions' && isAura(item.owner_name)) {
          item.owner_name = item.owner_email ? item.owner_email.split('@')[0] : 'Participant';
          changed = true;
        }
      });

      // Filter out any mock/benchmark submissions so only genuine real submissions exist
      if (table === 'submissions') {
        const genuine = data.filter(item => item && !item.id?.startsWith('SC-WC-10') && !item.owner_id?.startsWith('u_lead_'));
        if (genuine.length !== data.length) {
          data.length = 0;
          data.push(...genuine);
          changed = true;
        }
      }
      
      if (changed) {
        localStorage.setItem(STORAGE_KEY_PREFIX + table, JSON.stringify(data));
      }
    }
    
    return data;
  } catch (err) {
    console.error(`DB read error for table ${table}:`, err);
    return defaultVal;
  }
}

function setTable(table, data) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + table, JSON.stringify(data));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('siteon_db_updated', { detail: { table } }));
    }
  } catch (err) {
    console.error(`DB write error for table ${table}:`, err);
  }
}

// Clean and reset all participant data for a fresh platform start
const DB_FRESH_START_KEY = 'siteon_db_fresh_start_2026_09_29_v3';
if (typeof localStorage !== 'undefined' && localStorage.getItem(DB_FRESH_START_KEY) !== 'done') {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'submissions', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'registrations', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'submission_members', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'audit_logs', JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'profiles', JSON.stringify(initialProfiles));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'user_roles', JSON.stringify(initialRoles));

    const rawAuth = localStorage.getItem('siteon_auth_user');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      if (parsed?.email && parsed.email.toLowerCase() !== 'siteon.org@gmail.com') {
        localStorage.removeItem('siteon_auth_user');
      }
    }
    localStorage.setItem(DB_FRESH_START_KEY, 'done');
  } catch (cleanErr) {
    console.warn('Fresh start cleanup error:', cleanErr);
  }
}

// Ensure admin password is unconditionally synced to current value
if (typeof localStorage !== 'undefined') {
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    if (rawUsers) {
      const usersList = JSON.parse(rawUsers);
      let updated = false;
      for (const u of usersList) {
        if (u.email?.toLowerCase() === 'siteon.org@gmail.com' && u.password !== 'NihalAU@10132005') {
          u.password = 'NihalAU@10132005';
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(usersList));
      }
    }
  } catch (err) {
    console.warn('Admin password sync error:', err);
  }
}

// Initialize tables if missing or update default hackathon timeline
const currentHacks = getTable('hackathons');
if (!currentHacks || currentHacks.length === 0) {
  setTable('hackathons', initialHackathons);
} else {
  // Ensure default WebCode event receives updated official challenge specifications
  const webcodeIndex = currentHacks.findIndex(h => h.id === 'h_webcode_2026' || h.slug === 'webcode');
  if (webcodeIndex >= 0) {
    currentHacks[webcodeIndex] = {
      ...currentHacks[webcodeIndex],
      name: initialHackathons[0].name,
      subtitle: initialHackathons[0].subtitle,
      theme: initialHackathons[0].theme,
      short_description: initialHackathons[0].short_description,
      description: initialHackathons[0].description,
      start_date: initialHackathons[0].start_date,
      end_date: initialHackathons[0].end_date,
      registration_deadline: initialHackathons[0].registration_deadline,
      submission_deadline: initialHackathons[0].submission_deadline,
      results_date: initialHackathons[0].results_date,
      dataset: initialHackathons[0].dataset,
      pipeline: initialHackathons[0].pipeline,
      minimum_requirements: initialHackathons[0].minimum_requirements,
      killer_requirement: initialHackathons[0].killer_requirement,
      judging_criteria: initialHackathons[0].judging_criteria,
      prizes: initialHackathons[0].prizes,
      entry_fee: 49,
      reveal_problem_statement: currentHacks[webcodeIndex].reveal_problem_statement !== undefined ? currentHacks[webcodeIndex].reveal_problem_statement : false,
      rules: initialHackathons[0].rules,
      submission_requirements: initialHackathons[0].submission_requirements,
      faqs: initialHackathons[0].faqs
    };
    setTable('hackathons', currentHacks);
  }
}
const currentSettings = getTable('settings', initialSettings);
if (!currentSettings || !currentSettings.upi_id || currentSettings.upi_id === 'siteon.org@okaxis') {
  setTable('settings', { ...initialSettings, ...currentSettings, upi_id: 'siteon@ptyes', upi_payee_name: 'Siteon' });
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'user_roles')) {
  setTable('user_roles', initialRoles);
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'users')) {
  setTable('users', initialUsers);
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'profiles')) {
  setTable('profiles', initialProfiles);
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'registrations')) {
  setTable('registrations', []);
}
let existingSubs = getTable('submissions');
if (Array.isArray(existingSubs)) {
  const genuineSubs = existingSubs.filter(s => s && !s.id?.startsWith('SC-WC-10') && !s.owner_id?.startsWith('u_lead_'));
  if (genuineSubs.length !== existingSubs.length) {
    setTable('submissions', genuineSubs);
  }
} else {
  setTable('submissions', []);
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'submission_members')) {
  setTable('submission_members', []);
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'audit_logs')) {
  setTable('audit_logs', []);
}
if (!localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications')) {
  setTable('notifications', []);
}

export const db = {
  // Users (Registered Accounts)
  getUsers() {
    return getTable('users', initialUsers);
  },
  getUserByEmail(email) {
    if (!email) return null;
    return getTable('users', initialUsers).find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  createUser(userData) {
    const users = getTable('users', initialUsers);
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error("An account with this email already exists. Please log in.");
    }
    const newUser = {
      id: userData.id || 'u_' + Math.random().toString(36).substring(2, 10),
      email: userData.email.toLowerCase(),
      name: userData.name,
      password: userData.password,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setTable('users', users);
    return newUser;
  },
  updateUserPassword(userId, newPassword) {
    const users = getTable('users', initialUsers);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User account not found.");
    users[index].password = newPassword;
    users[index].updated_at = new Date().toISOString();
    setTable('users', users);
    return users[index];
  },
  deleteUser(userId) {
    const users = getTable('users', initialUsers).filter(u => u.id !== userId);
    setTable('users', users);
    const profiles = getTable('profiles').filter(p => p.user_id !== userId);
    setTable('profiles', profiles);
  },

  // Profiles
  getProfiles() {
    return getTable('profiles');
  },
  getProfileByUserId(userId, email) {
    const list = getTable('profiles');
    if (!userId && !email) return null;
    let found = list.find(p => p.user_id === userId);
    if (!found && email) {
      found = list.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
    }
    return found || null;
  },
  getProfileByEmail(email) {
    if (!email) return null;
    return getTable('profiles').find(p => p.email && p.email.toLowerCase() === email.toLowerCase()) || null;
  },
  upsertProfile(profileData) {
    if (profileData.github_url) {
      const ghCheck = validateGithubProfileUrl(profileData.github_url);
      if (!ghCheck.isValid) throw new Error(ghCheck.error);
      profileData.github_url = ghCheck.normalized;
    }
    if (profileData.linkedin_url) {
      const liCheck = validateLinkedinUrl(profileData.linkedin_url);
      if (!liCheck.isValid) throw new Error(liCheck.error);
      profileData.linkedin_url = liCheck.normalized;
    }

    const profiles = getTable('profiles');
    const existingIndex = profiles.findIndex(p => 
      (profileData.user_id && p.user_id === profileData.user_id) ||
      (profileData.email && p.email && p.email.toLowerCase() === profileData.email.toLowerCase())
    );
    const now = new Date().toISOString();
    let updated;
    if (existingIndex >= 0) {
      updated = {
        ...profiles[existingIndex],
        ...profileData,
        // Ensure email and user_id are never wiped
        email: profileData.email || profiles[existingIndex].email || '',
        user_id: profileData.user_id || profiles[existingIndex].user_id,
        updated_at: now
      };
      profiles[existingIndex] = updated;
    } else {
      updated = {
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        created_at: now,
        updated_at: now,
        ...profileData
      };
      profiles.push(updated);
    }
    setTable('profiles', profiles);
    return updated;
  },

  // Roles
  getUserRole(userId, email) {
    const roles = getTable('user_roles');
    if (email && email.toLowerCase() === 'siteon.org@gmail.com') {
      return 'admin';
    }
    const found = roles.find(r => r.user_id === userId || (email && r.email?.toLowerCase() === email.toLowerCase()));
    return found ? found.role : 'participant';
  },
  setUserRole(userId, role, email) {
    const roles = getTable('user_roles');
    const existingIndex = roles.findIndex(r => r.user_id === userId);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      roles[existingIndex].role = role;
    } else {
      roles.push({
        id: 'ur_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        email: email || '',
        role: role,
        created_at: now
      });
    }
    setTable('user_roles', roles);
  },

  // Hackathons
  getHackathons() {
    return getTable('hackathons');
  },
  getHackathonByIdOrSlug(idOrSlug) {
    const list = getTable('hackathons');
    return list.find(h => h.id === idOrSlug || h.slug === idOrSlug) || null;
  },
  upsertHackathon(hackathonData) {
    const list = getTable('hackathons');
    const existingIndex = list.findIndex(h => h.id === hackathonData.id);
    const now = new Date().toISOString();
    let record;
    if (existingIndex >= 0) {
      record = {
        ...list[existingIndex],
        ...hackathonData,
        updated_at: now
      };
      list[existingIndex] = record;
    } else {
      record = {
        id: hackathonData.id || 'h_' + Math.random().toString(36).substring(2, 9),
        slug: hackathonData.slug || hackathonData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        is_featured: false,
        created_at: now,
        updated_at: now,
        ...hackathonData
      };
      list.unshift(record);
    }
    setTable('hackathons', list);
    return record;
  },
  deleteHackathon(id) {
    const list = getTable('hackathons').filter(h => h.id !== id);
    setTable('hackathons', list);
  },
  updateChallengeStatus(hackathonId, status, adminUserId = 'admin') {
    const list = getTable('hackathons');
    const idx = list.findIndex(h => h.id === hackathonId || h.slug === hackathonId);
    if (idx === -1) return { success: false, error: 'Challenge not found' };
    const prevStatus = list[idx].status;
    list[idx].status = status;
    list[idx].updated_at = new Date().toISOString();
    setTable('hackathons', list);
    
    db.logAudit({
      actor_id: adminUserId,
      actor_role: 'admin',
      action: 'UPDATE_CHALLENGE_STATUS',
      entity_type: 'hackathon',
      entity_id: list[idx].id,
      description: `Challenge "${list[idx].name}" status transitioned from ${prevStatus} to ${status}`
    });
    
    return { success: true, hackathon: list[idx] };
  },
  updateChallengeDataset(hackathonId, datasetUpdate, adminUserId = 'admin') {
    const list = getTable('hackathons');
    const idx = list.findIndex(h => h.id === hackathonId || h.slug === hackathonId);
    if (idx === -1) return { success: false, error: 'Challenge not found' };
    list[idx].dataset = {
      ...(list[idx].dataset || {}),
      ...datasetUpdate,
      last_updated: new Date().toISOString()
    };
    list[idx].updated_at = new Date().toISOString();
    setTable('hackathons', list);

    db.logAudit({
      actor_id: adminUserId,
      actor_role: 'admin',
      action: 'UPDATE_CHALLENGE_DATASET',
      entity_type: 'hackathon',
      entity_id: list[idx].id,
      description: `Challenge "${list[idx].name}" dataset updated (version ${datasetUpdate.version || 'custom'})`
    });

    return { success: true, hackathon: list[idx] };
  },
  toggleProblemStatementVisibility(hackathonId, isRevealed, adminUserId = 'admin') {
    const list = getTable('hackathons');
    const idx = list.findIndex(h => h.id === hackathonId || h.slug === hackathonId);
    if (idx === -1) return { success: false, error: 'Challenge not found' };
    list[idx].reveal_problem_statement = !!isRevealed;
    list[idx].updated_at = new Date().toISOString();
    setTable('hackathons', list);

    db.logAudit({
      actor_id: adminUserId,
      actor_role: 'admin',
      action: isRevealed ? 'REVEAL_PROBLEM_STATEMENT' : 'HIDE_PROBLEM_STATEMENT',
      entity_type: 'hackathon',
      entity_id: list[idx].id,
      description: `Challenge "${list[idx].name}" problem statement & dataset visibility set to: ${isRevealed ? 'REVEALED / PUBLIC' : 'HIDDEN / LOCKED'}`
    });

    return { success: true, hackathon: list[idx] };
  },

  // Registrations
  getRegistrations() {
    return getTable('registrations');
  },
  getRegistration(userId, hackathonId) {
    return getTable('registrations').find(r => r.user_id === userId && r.hackathon_id === hackathonId) || null;
  },
  getUserRegistrations(userId) {
    return getTable('registrations').filter(r => r.user_id === userId);
  },
  getHackathonRegistrations(hackathonId) {
    return getTable('registrations').filter(r => r.hackathon_id === hackathonId);
  },
  createRegistration(userId, hackathonId) {
    // Registrations require ₹49 UPI entry fee verification via createPaidRegistration
    return { 
      success: false, 
      message: "Direct registration requires payment of the ₹49 entry fee via UPI. Please use the payment modal." 
    };
  },

  createPaidRegistration(userId, hackathonId, paymentData) {
    const utr = (paymentData?.utr_number || '').trim();
    
    // Strict 12-digit numeric validation
    if (!/^\d{12}$/.test(utr)) {
      return { 
        success: false, 
        error: 'Invalid UTR: UPI Reference ID must be exactly 12 numeric digits (e.g. 427189023411).' 
      };
    }

    // Anti-Fraud Duplicate Check: Ensure UTR is not already used across any registration
    const allRegs = getTable('registrations');
    const duplicate = allRegs.find(r => r.utr_number === utr && r.user_id !== userId);
    if (duplicate) {
      return { 
        success: false, 
        error: `Fraud Alert: This 12-digit UTR (${utr}) has already been used for another participant. Duplicate transaction IDs are strictly prohibited.` 
      };
    }

    const existingIndex = allRegs.findIndex(r => r.user_id === userId && r.hackathon_id === hackathonId);
    let record;

    if (existingIndex >= 0) {
      const existing = allRegs[existingIndex];
      if (existing.payment_status === 'verified') {
        return { success: false, error: 'Your registration fee is already verified for this hackathon.', record: existing };
      }
      record = {
        ...existing,
        fee_amount: 49,
        utr_number: utr,
        screenshot_url: paymentData.screenshot_url || existing.screenshot_url || '',
        payment_status: 'pending_verification',
        status: 'pending_verification',
        payment_submitted_at: new Date().toISOString(),
        rejection_reason: ''
      };
      allRegs[existingIndex] = record;
    } else {
      record = {
        id: 'reg_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        hackathon_id: hackathonId,
        registered_at: new Date().toISOString(),
        fee_amount: 49,
        utr_number: utr,
        screenshot_url: paymentData.screenshot_url || '',
        payment_status: 'pending_verification',
        status: 'pending_verification',
        payment_submitted_at: new Date().toISOString(),
        verified_at: null,
        verified_by: null,
        rejection_reason: ''
      };
      allRegs.push(record);
    }

    setTable('registrations', allRegs);

    // Notify user
    db.addNotification(userId, {
      title: "₹49 Payment Submitted for Review",
      message: `Your payment with UTR ${utr} has been submitted. Admin will verify it shortly to unlock project submission.`,
      type: 'payment',
      link: `/hackathons/${hackathonId}`
    });

    db.logAudit({
      actor_id: userId,
      actor_role: 'user',
      action: 'PAYMENT_SUBMITTED',
      entity_type: 'registration',
      entity_id: record.id,
      description: `Participant submitted ₹49 registration payment with UTR ${utr}`
    });

    return { success: true, record };
  },

  verifyRegistrationPayment(registrationId, newStatus, adminUserId = 'admin', rejectionReason = '') {
    const allRegs = getTable('registrations');
    const idx = allRegs.findIndex(r => r.id === registrationId);
    if (idx === -1) return { success: false, error: 'Registration not found' };

    const reg = allRegs[idx];
    reg.payment_status = newStatus; // 'verified' or 'rejected'
    reg.status = (newStatus === 'verified' ? 'confirmed' : 'rejected');
    reg.verified_at = new Date().toISOString();
    reg.verified_by = adminUserId;
    reg.rejection_reason = rejectionReason || '';
    allRegs[idx] = reg;

    setTable('registrations', allRegs);

    // Notify the participant
    db.addNotification(reg.user_id, {
      title: newStatus === 'verified' ? "Payment Verified (₹49) ✅" : "Payment Verification Failed ⚠️",
      message: newStatus === 'verified'
        ? "Your ₹49 registration payment has been verified by Siteon admin! You now have full access to submit your project."
        : `Your payment (UTR: ${reg.utr_number}) could not be verified: ${rejectionReason || 'UTR not matched in bank statement'}. Please re-submit valid payment details.`,
      type: 'payment',
      link: `/hackathons/${reg.hackathon_id}`
    });

    db.logAudit({
      actor_id: adminUserId,
      actor_role: 'admin',
      action: newStatus === 'verified' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
      entity_type: 'registration',
      entity_id: reg.id,
      description: `Admin marked payment for registration ${reg.id} as ${newStatus} (UTR: ${reg.utr_number})`
    });

    return { success: true, record: reg };
  },

  getAllPayments() {
    const regs = getTable('registrations');
    const users = getTable('users');
    const profiles = getTable('profiles');
    const hacks = getTable('hackathons');

    return regs.map(r => {
      const u = users.find(user => user.id === r.user_id) || {};
      const p = profiles.find(prof => prof.user_id === r.user_id) || {};
      const h = hacks.find(hack => hack.id === r.hackathon_id || hack.slug === r.hackathon_id) || {};
      return {
        ...r,
        user_name: p.full_name || u.name || 'Participant',
        user_email: p.email || u.email || '',
        user_phone: p.phone || '',
        hackathon_name: h.name || 'WebCode Hackathon'
      };
    }).reverse();
  },

  isUserPaidAndVerified(userId, hackathonId) {
    if (!userId || !hackathonId) return { isPaid: false, status: 'not_registered' };
    const reg = db.getRegistration(userId, hackathonId);
    if (!reg) return { isPaid: false, status: 'not_registered' };
    
    if (reg.payment_status === 'verified') {
      return { isPaid: true, status: 'verified', registration: reg };
    }
    if (reg.payment_status === 'pending_verification') {
      return { isPaid: false, status: 'pending_verification', registration: reg };
    }
    if (reg.payment_status === 'rejected') {
      return { isPaid: false, status: 'rejected', registration: reg };
    }
    // Backward compatibility for pre-existing confirmed registrations
    if (reg.status === 'confirmed' && !reg.payment_status) {
      return { isPaid: true, status: 'verified', registration: reg };
    }
    return { isPaid: false, status: 'not_registered', registration: reg };
  },

  // Submissions
  getSubmissions() {
    return getTable('submissions');
  },
  getSubmissionById(id) {
    return getTable('submissions').find(s => s.id === id) || null;
  },
  getUserSubmissions(userId, email) {
    const list = getTable('submissions');
    if (!userId && !email) return [];
    return list.filter(s => 
      (userId && s.owner_id === userId) ||
      (email && s.owner_email && s.owner_email.toLowerCase() === email.toLowerCase())
    );
  },
  getHackathonSubmissions(hackathonId) {
    return getTable('submissions').filter(s => s.hackathon_id === hackathonId);
  },
  getLeaderboard(hackathonId = 'h_webcode_2026') {
    const list = getTable('submissions');
    
    // Strict Admin Rule: ONLY include submissions that an Admin has explicitly added/ranked for Leaderboard
    const filtered = list.filter(s => {
      const matchHack = !hackathonId || s.hackathon_id === hackathonId || s.hackathon_id === 'h_webcode_2026' || s.hackathon_name === 'WebCode';
      const adminApproved = s.in_leaderboard === true || (typeof s.rank === 'number' && s.rank >= 1 && s.rank <= 10);
      return matchHack && adminApproved;
    });

    const profiles = getTable('profiles');
    const users = getTable('users');

    const sorted = [...filtered].sort((a, b) => {
      const rankA = (typeof a.rank === 'number' && a.rank > 0) ? a.rank : 999;
      const rankB = (typeof b.rank === 'number' && b.rank > 0) ? b.rank : 999;
      if (rankA !== rankB) return rankA - rankB;

      const scoreA = typeof a.score === 'number' ? a.score : 0;
      const scoreB = typeof b.score === 'number' ? b.score : 0;
      return scoreB - scoreA;
    });

    // Strictly limit display to Top 10 entries as requested
    const top10 = sorted.slice(0, 10).map((item, index) => {
      const userProfile = profiles.find(p => 
        (item.owner_id && p.user_id === item.owner_id) || 
        (item.owner_email && p.email && p.email.toLowerCase() === item.owner_email.toLowerCase())
      );
      const authUser = users.find(u => 
        (item.owner_id && u.id === item.owner_id) || 
        (item.owner_email && u.email && u.email.toLowerCase() === item.owner_email.toLowerCase())
      );

      // Real-time Gmail/Google account profile picture:
      const rawAvatar = userProfile?.avatar_url || authUser?.avatar || item.avatar_url || '';
      const isFake = rawAvatar.includes('unsplash.com') || rawAvatar.includes('dicebear');
      const avatar_url = (!isFake && rawAvatar) ? rawAvatar : '';

      const rank = (typeof item.rank === 'number' && item.rank > 0) ? item.rank : index + 1;
      const prize_label = 
        rank === 1 ? '₹20,000 + Certificate' :
        rank === 2 ? '₹15,000 + Certificate' :
        rank === 3 ? '₹10,000 + Certificate' :
        'Official Certificate';

      return {
        ...item,
        avatar_url,
        display_rank: rank,
        prize_label,
        award_title: item.award_title || (
          rank === 1 ? '1st Winner (₹20,000 + Certificate)' :
          rank === 2 ? '2nd Winner (₹15,000 + Certificate)' :
          rank === 3 ? '3rd Winner (₹10,000 + Certificate)' :
          `Rank #${rank} (Certificate)`
        )
      };
    });

    return {
      top10,
      winners: top10.filter(item => item.display_rank <= 3),
      firstPlace: top10.find(item => item.display_rank === 1) || top10[0] || null,
      secondPlace: top10.find(item => item.display_rank === 2) || top10[1] || null,
      thirdPlace: top10.find(item => item.display_rank === 3) || top10[2] || null
    };
  },
  addToLeaderboard(submissionId, { rank, score, award_title } = {}, adminUserId) {
    const defaultAward = 
      rank == 1 ? '1st Winner (₹20,000 + Certificate)' :
      rank == 2 ? '2nd Winner (₹15,000 + Certificate)' :
      rank == 3 ? '3rd Winner (₹10,000 + Certificate)' :
      'Certificate Finalist';
    return db.updateSubmission(submissionId, {
      in_leaderboard: true,
      rank: rank !== undefined && rank !== '' ? parseInt(rank, 10) : null,
      score: score !== undefined && score !== '' ? parseFloat(score) : null,
      award_title: award_title || defaultAward,
      status: (rank >= 1 && rank <= 3) ? 'Winner' : 'Shortlisted'
    }, adminUserId, true);
  },
  removeFromLeaderboard(submissionId, adminUserId) {
    return db.updateSubmission(submissionId, {
      in_leaderboard: false,
      rank: null
    }, adminUserId, true);
  },
  createSubmission(submissionData) {
    const hackathon = db.getHackathonByIdOrSlug(submissionData.hackathon_id);
    if (!hackathon) {
      throw new Error("Specified hackathon does not exist.");
    }

    // Strict URL validation: Block non-GitHub repos, non-LinkedIn profiles, or swapped links
    const ghCheck = validateGithubRepoUrl(submissionData.github_url);
    if (!ghCheck.isValid) {
      throw new Error(ghCheck.error);
    }

    const liveCheck = validateLiveUrl(submissionData.live_url);
    if (!liveCheck.isValid) {
      throw new Error(liveCheck.error);
    }

    const liCheck = validateLinkedinUrl(submissionData.linkedin_url);
    if (!liCheck.isValid) {
      throw new Error(liCheck.error);
    }

    // Check submission deadline
    const deadline = new Date(hackathon.submission_deadline).getTime();
    if (deadline && Date.now() > deadline) {
      throw new Error("Submissions are closed because the deadline has passed for this hackathon.");
    }

    const submissions = getTable('submissions');

    // Enforce 3-submission maximum limit per user (Lock submission once 3 projects are submitted)
    const userSubmissions = submissions.filter(s => s.owner_id === submissionData.owner_id);
    if (userSubmissions.length >= 3) {
      throw new Error("Submission Limit Reached: You have reached the maximum limit of 3 submitted projects. Each participant account can submit up to 3 projects.");
    }

    // Enforce entry fee payment verification before allowing project submission
    const paymentCheck = db.isUserPaidAndVerified(submissionData.owner_id, submissionData.hackathon_id);
    if (!paymentCheck.isPaid) {
      if (paymentCheck.status === 'pending_verification') {
        throw new Error(`Payment Verification Pending: Your ₹49 registration fee payment (UTR: ${paymentCheck.registration?.utr_number || 'N/A'}) is currently being verified by an admin. You will be able to submit as soon as it is approved.`);
      } else {
        throw new Error("Payment Required: You must register and complete the ₹49 entry fee payment to submit a project for this hackathon.");
      }
    }

    // Prevent duplicate submission by same user for same hackathon
    const duplicate = submissions.find(s => s.owner_id === submissionData.owner_id && s.hackathon_id === submissionData.hackathon_id);
    if (duplicate) {
      throw new Error("You have already submitted a project for this hackathon. You can edit your existing submission.");
    }

    // Generate production format submission code: SC-WC-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `SC-WC-${randomHex}`;
    const now = new Date().toISOString();

    const newRecord = {
      id: submissionId,
      hackathon_id: submissionData.hackathon_id,
      hackathon_name: hackathon.name,
      owner_id: submissionData.owner_id,
      owner_name: submissionData.owner_name || 'Participant',
      owner_email: submissionData.owner_email || '',
      college: submissionData.college || '',
      course: submissionData.course || '',
      graduation_year: submissionData.graduation_year || '',
      city: submissionData.city || '',
      project_name: submissionData.project_name,
      participation_type: submissionData.participation_type || 'Individual',
      team_name: submissionData.participation_type === 'Team' ? submissionData.team_name : 'Solo',
      description: submissionData.description,
      tech_stack: Array.isArray(submissionData.tech_stack) ? submissionData.tech_stack : (submissionData.tech_stack || '').split(',').map(s => s.trim()),
      github_url: ghCheck.normalized,
      live_url: liveCheck.normalized,
      internship_interest: submissionData.internship_interest === 'Yes' || submissionData.internship_interest === true,
      internship_status: (submissionData.internship_interest === 'Yes' || submissionData.internship_interest === true) ? 'New' : 'N/A',
      resume_url: submissionData.resume_url || '',
      linkedin_url: liCheck.normalized,
      terms_accepted: true,
      terms_accepted_at: now,
      status: 'Submitted', // Submitted, Under Review, Shortlisted, Winner, Rejected
      edit_count: 0,
      admin_note: '',
      submitted_at: now,
      updated_at: now
    };

    submissions.unshift(newRecord);
    setTable('submissions', submissions);

    // Automatically sync submitted academic & professional details into the user's permanent profile
    if (submissionData.owner_id || submissionData.owner_email) {
      try {
        db.upsertProfile({
          user_id: submissionData.owner_id,
          email: submissionData.owner_email,
          college: submissionData.college,
          course: submissionData.course,
          graduation_year: submissionData.graduation_year,
          city: submissionData.city,
          github_url: submissionData.github_url,
          linkedin_url: submissionData.linkedin_url,
          resume_url: submissionData.resume_url
        });
      } catch (e) {
        console.warn('Auto profile update notice:', e);
      }
    }

    // Save team members if provided
    if (submissionData.members && Array.isArray(submissionData.members) && submissionData.members.length > 0) {
      const allMembers = getTable('submission_members');
      submissionData.members.forEach(m => {
        allMembers.push({
          id: 'sm_' + Math.random().toString(36).substring(2, 9),
          submission_id: submissionId,
          name: m.name,
          email: m.email,
          college: m.college || submissionData.college,
          role: m.role || 'Member',
          created_at: now
        });
      });
      setTable('submission_members', allMembers);
    }

    // Add in-app notification
    db.addNotification(submissionData.owner_id, {
      title: "Project Submitted",
      message: `Your project "${newRecord.project_name}" (${submissionId}) has been successfully submitted to ${hackathon.name}.`,
      type: 'submission',
      link: `/dashboard/submissions/${submissionId}`
    });

    return newRecord;
  },

  updateSubmission(id, updates, userId, isAdmin = false) {
    const submissions = getTable('submissions');
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Submission not found.");

    const current = submissions[index];

    // If participant is editing, verify ownership, submission deadline, and 3-edit maximum limit
    if (!isAdmin) {
      if (current.owner_id !== userId) {
        throw new Error("Unauthorized to edit this submission.");
      }
      const hackathon = db.getHackathonByIdOrSlug(current.hackathon_id);
      if (hackathon) {
        const deadline = new Date(hackathon.submission_deadline).getTime();
        if (deadline && Date.now() > deadline) {
          throw new Error("Editing is closed because the submission deadline has passed.");
        }
      }

      const currentEdits = current.edit_count || 0;
      if (currentEdits >= 3) {
        throw new Error("Edit Lock Active: This project has already been edited 3 times. A submission can only be edited up to 3 times, after which it is permanently locked.");
      }
    }

    const validatedUpdates = { ...updates };
    if (!isAdmin) {
      delete validatedUpdates.in_leaderboard;
      delete validatedUpdates.rank;
      delete validatedUpdates.score;
      delete validatedUpdates.award_title;
    }
    if (validatedUpdates.github_url !== undefined) {
      const ghCheck = validateGithubRepoUrl(validatedUpdates.github_url);
      if (!ghCheck.isValid) throw new Error(ghCheck.error);
      validatedUpdates.github_url = ghCheck.normalized;
    }
    if (validatedUpdates.live_url !== undefined) {
      const liveCheck = validateLiveUrl(validatedUpdates.live_url);
      if (!liveCheck.isValid) throw new Error(liveCheck.error);
      validatedUpdates.live_url = liveCheck.normalized;
    }
    if (validatedUpdates.linkedin_url !== undefined && validatedUpdates.linkedin_url) {
      const liCheck = validateLinkedinUrl(validatedUpdates.linkedin_url);
      if (!liCheck.isValid) throw new Error(liCheck.error);
      validatedUpdates.linkedin_url = liCheck.normalized;
    }

    const now = new Date().toISOString();
    const updated = {
      ...current,
      ...validatedUpdates,
      edit_count: !isAdmin ? (current.edit_count || 0) + 1 : (current.edit_count || 0),
      updated_at: now
    };

    // If status changed by admin, notify participant
    if (isAdmin && updates.status && updates.status !== current.status) {
      db.addNotification(current.owner_id, {
        title: "Submission Status Updated",
        message: `Your project "${current.project_name}" status has been updated to "${updates.status}".`,
        type: 'status_update',
        link: `/dashboard/submissions/${current.id}`
      });
    }

    submissions[index] = updated;
    setTable('submissions', submissions);
    return updated;
  },

  getSubmissionMembers(submissionId) {
    return getTable('submission_members').filter(m => m.submission_id === submissionId);
  },

  // Audit Logs
  getAuditLogs() {
    return getTable('audit_logs');
  },
  logAdminAction(adminUserId, action, entityType, entityId, metadata = {}) {
    const logs = getTable('audit_logs');
    logs.unshift({
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      admin_user_id: adminUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString()
    });
    setTable('audit_logs', logs);
  },

  // Notifications
  getNotifications(userId) {
    return getTable('notifications').filter(n => n.user_id === userId);
  },
  addNotification(userId, { title, message, type = 'general', link = '' }) {
    const list = getTable('notifications');
    list.unshift({
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      title,
      message,
      type,
      link,
      read: false,
      created_at: new Date().toISOString()
    });
    setTable('notifications', list);
  },
  markNotificationAsRead(id) {
    const list = getTable('notifications');
    const index = list.findIndex(n => n.id === id);
    if (index >= 0) {
      list[index].read = true;
      setTable('notifications', list);
    }
  },

  // Settings
  getSettings() {
    return getTable('settings', initialSettings);
  },
  getSetting(key) {
    const s = getTable('settings', initialSettings);
    return s[key] || '';
  },
  updateSettings(newSettings) {
    const current = getTable('settings', initialSettings);
    const updated = { ...current, ...newSettings };
    setTable('settings', updated);
    return updated;
  },

  // Purge / Reset all participant data for a fresh start
  cleanAllParticipantData() {
    setTable('submissions', []);
    setTable('registrations', []);
    setTable('submission_members', []);
    setTable('notifications', []);
    setTable('audit_logs', []);
    setTable('users', initialUsers);
    setTable('profiles', initialProfiles);
    setTable('user_roles', initialRoles);

    try {
      const rawAuth = localStorage.getItem('siteon_auth_user');
      if (rawAuth) {
        const parsed = JSON.parse(rawAuth);
        if (parsed?.email && parsed.email.toLowerCase() !== 'siteon.org@gmail.com') {
          localStorage.removeItem('siteon_auth_user');
        }
      }
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('siteon_db_updated', { detail: { table: 'all' } }));
    }

    return { success: true };
  }
};
