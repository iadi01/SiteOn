/**
 * Siteon Google Sheets Sync Service
 * Transmits project submission and user signup/profile data directly to private Google Sheets
 * using Google Apps Script Webhooks.
 * 
 * Supports:
 * - Single Webhook (Automatic multi-tab: "Submissions" and "Users")
 * - Dedicated Webhooks:
 *   - VITE_GOOGLE_SHEET_WEBHOOK_URL (Submissions)
 *   - VITE_GOOGLE_SHEET_USERS_WEBHOOK_URL (Users / Signups)
 */

import { db } from './db.js';

export const googleSheetService = {
  getWebhookUrl() {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEET_WEBHOOK_URL) ||
      db.getSetting('google_sheet_webhook_url') ||
      ''
    ).trim();
  },

  getUsersWebhookUrl() {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEET_USERS_WEBHOOK_URL) ||
      this.getWebhookUrl()
    ).trim();
  },

  isConfigured() {
    const url = this.getWebhookUrl();
    return Boolean(url && url.startsWith('https://script.google.com/macros/s/'));
  },

  isUsersConfigured() {
    const url = this.getUsersWebhookUrl();
    return Boolean(url && url.startsWith('https://script.google.com/macros/s/'));
  },

  /**
   * Sync a single project submission to Google Sheet in real-time
   */
  async syncSubmission(submission) {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      return { 
        success: false, 
        message: 'Google Sheet Webhook URL not configured. Add VITE_GOOGLE_SHEET_WEBHOOK_URL in .env' 
      };
    }

    const payload = {
      action: 'NEW_SUBMISSION',
      timestamp: new Date().toISOString(),
      submission_id: submission.id || '',
      hackathon_name: submission.hackathon_name || 'WebCode',
      project_name: submission.project_name || '',
      participation_type: submission.participation_type || 'Individual',
      team_name: submission.team_name || 'Solo',
      owner_name: submission.owner_name || '',
      owner_email: submission.owner_email || '',
      phone: submission.phone || '',
      college: submission.college || '',
      course: submission.course || '',
      graduation_year: submission.graduation_year || '',
      city: submission.city || '',
      tech_stack: Array.isArray(submission.tech_stack) ? submission.tech_stack.join(', ') : (submission.tech_stack || ''),
      github_url: submission.github_url || '',
      live_url: submission.live_url || '',
      linkedin_url: submission.linkedin_url || '',
      resume_url: submission.resume_url || '',
      internship_interest: submission.internship_interest ? 'Yes' : 'No',
      status: submission.status || 'Submitted',
      submitted_at: submission.submitted_at || new Date().toISOString()
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      return { success: true, message: 'Submission successfully synced to Google Sheet!' };
    } catch (err) {
      console.error('Google Sheet Sync Error:', err);
      return { success: false, message: err.message || 'Failed to sync with Google Sheet' };
    }
  },

  /**
   * Sync all existing submissions to Google Sheet in batch
   */
  async syncAllSubmissions(submissions) {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      return { 
        success: false, 
        message: 'Google Sheet Webhook URL not configured in .env' 
      };
    }

    const list = submissions || db.getSubmissions();
    if (!list || list.length === 0) {
      return { success: false, message: 'No submissions found to sync.' };
    }

    const payload = {
      action: 'BATCH_SYNC',
      timestamp: new Date().toISOString(),
      count: list.length,
      submissions: list.map(s => ({
        submission_id: s.id || '',
        hackathon_name: s.hackathon_name || 'WebCode',
        project_name: s.project_name || '',
        participation_type: s.participation_type || 'Individual',
        team_name: s.team_name || 'Solo',
        owner_name: s.owner_name || '',
        owner_email: s.owner_email || '',
        college: s.college || '',
        course: s.course || '',
        graduation_year: s.graduation_year || '',
        city: s.city || '',
        tech_stack: Array.isArray(s.tech_stack) ? s.tech_stack.join(', ') : (s.tech_stack || ''),
        github_url: s.github_url || '',
        live_url: s.live_url || '',
        linkedin_url: s.linkedin_url || '',
        resume_url: s.resume_url || '',
        internship_interest: s.internship_interest ? 'Yes' : 'No',
        status: s.status || 'Submitted',
        submitted_at: s.submitted_at || ''
      }))
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      return { 
        success: true, 
        count: list.length, 
        message: `Successfully synchronized ${list.length} submissions to Google Sheet!` 
      };
    } catch (err) {
      console.error('Google Sheet Batch Sync Error:', err);
      return { success: false, message: err.message || 'Batch sync failed.' };
    }
  },

  /**
   * Sync a single user registration or profile update to Google Sheet
   */
  async syncUserRegistration(user, profile) {
    const webhookUrl = this.getUsersWebhookUrl();
    if (!webhookUrl) {
      return { 
        success: false, 
        message: 'Google Sheet Users Webhook URL not configured.' 
      };
    }

    const userId = user?.id || profile?.user_id || '';
    const userEmail = user?.email || profile?.email || '';

    const payload = {
      action: 'NEW_USER_REGISTRATION',
      timestamp: new Date().toISOString(),
      userId: userId,
      name: profile?.full_name || user?.name || '',
      email: userEmail,
      phone: profile?.phone || '',
      college: profile?.college || '',
      course: profile?.course || '',
      gradYear: profile?.graduation_year || '',
      city: profile?.city || '',
      state: profile?.state || '',
      github: profile?.github_url || '',
      linkedin: profile?.linkedin_url || '',
      resumeLink: profile?.resume_url || '',
      bio: profile?.bio || '',
      skills: profile?.skills || [],
      role: db.getUserRole(userId, userEmail),
      createdAt: profile?.created_at || user?.created_at || new Date().toISOString()
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      return { success: true, message: 'User details synced to Google Sheet!' };
    } catch (err) {
      console.error('Google Sheet User Sync Error:', err);
      return { success: false, message: err.message || 'Failed to sync user with Google Sheet' };
    }
  },

  /**
   * Sync all registered users & profiles to Google Sheet in batch
   */
  async syncAllUsers() {
    const webhookUrl = this.getUsersWebhookUrl();
    if (!webhookUrl) {
      return { 
        success: false, 
        message: 'Google Sheet Users Webhook URL not configured in .env' 
      };
    }

    const users = db.getUsers();
    const profiles = db.getProfiles();

    if (!users || users.length === 0) {
      return { success: false, message: 'No registered users found to sync.' };
    }

    const merged = users.map(u => {
      const p = profiles.find(prof => prof.user_id === u.id || prof.email?.toLowerCase() === u.email.toLowerCase()) || {};
      return {
        userId: u.id,
        name: p.full_name || u.name || 'Participant',
        email: u.email,
        phone: p.phone || '',
        college: p.college || '',
        course: p.course || '',
        gradYear: p.graduation_year || '',
        city: p.city || '',
        state: p.state || '',
        github: p.github_url || '',
        linkedin: p.linkedin_url || '',
        resumeLink: p.resume_url || '',
        bio: p.bio || '',
        skills: p.skills || [],
        role: db.getUserRole(u.id, u.email),
        createdAt: u.created_at || ''
      };
    });

    const payload = {
      action: 'BATCH_USERS_SYNC',
      timestamp: new Date().toISOString(),
      count: merged.length,
      items: merged
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      return { 
        success: true, 
        count: merged.length, 
        message: `Successfully synchronized ${merged.length} users to Google Sheet!` 
      };
    } catch (err) {
      console.error('Google Sheet Batch Users Sync Error:', err);
      return { success: false, message: err.message || 'Batch user sync failed.' };
    }
  }
};
