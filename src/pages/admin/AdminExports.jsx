import React, { useState } from 'react';
import { db } from '../../services/db';
import { googleSheetService } from '../../services/googleSheetService';
import { 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck, 
  Cloud, 
  RefreshCw, 
  ExternalLink, 
  Code2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  AlertCircle,
  Table
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminExports() {
  const { user } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [sheetStatus, setSheetStatus] = useState('');
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isSheetConfigured = googleSheetService.isConfigured();
  const webhookUrl = googleSheetService.getWebhookUrl();

  const exportAllSubmissionsCSV = () => {
    const submissions = db.getSubmissions();
    const headers = [
      'Submission ID',
      'Hackathon',
      'Project Name',
      'Team Name',
      'Participant Name',
      'Email',
      'College',
      'Course',
      'Graduation Year',
      'GitHub URL',
      'Live URL',
      'Tech Stack',
      'Internship Interest',
      'Resume URL',
      'Status',
      'Submitted At',
      'Updated At'
    ];

    const rows = submissions.map(s => [
      `"${s.id || ''}"`,
      `"${s.hackathon_name || ''}"`,
      `"${(s.project_name || '').replace(/"/g, '""')}"`,
      `"${(s.team_name || '').replace(/"/g, '""')}"`,
      `"${(s.owner_name || '').replace(/"/g, '""')}"`,
      `"${s.owner_email || ''}"`,
      `"${(s.college || '').replace(/"/g, '""')}"`,
      `"${(s.course || '').replace(/"/g, '""')}"`,
      `"${s.graduation_year || ''}"`,
      `"${s.github_url || ''}"`,
      `"${s.live_url || ''}"`,
      `"${(Array.isArray(s.tech_stack) ? s.tech_stack.join('; ') : s.tech_stack || '').replace(/"/g, '""')}"`,
      `"${s.internship_interest ? 'Yes' : 'No'}"`,
      `"${s.resume_url || ''}"`,
      `"${s.status || ''}"`,
      `"${s.submitted_at || ''}"`,
      `"${s.updated_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `siteon_all_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    db.logAdminAction(user.id, 'csv_exported_all_submissions', 'export', 'all');
    setDownloadSuccess('All Submissions CSV successfully generated and downloaded.');
    setTimeout(() => setDownloadSuccess(''), 3500);
  };

  const exportInternshipCandidatesCSV = () => {
    const candidates = db.getSubmissions().filter(s => s.internship_interest);
    const headers = [
      'Candidate Name',
      'Email',
      'College / University',
      'Course',
      'Graduation Year',
      'Project Name',
      'GitHub URL',
      'Live URL',
      'Resume URL',
      'Pipeline Status',
      'Hackathon',
      'Submitted At'
    ];

    const rows = candidates.map(c => [
      `"${(c.owner_name || '').replace(/"/g, '""')}"`,
      `"${c.owner_email || ''}"`,
      `"${(c.college || '').replace(/"/g, '""')}"`,
      `"${(c.course || '').replace(/"/g, '""')}"`,
      `"${c.graduation_year || ''}"`,
      `"${(c.project_name || '').replace(/"/g, '""')}"`,
      `"${c.github_url || ''}"`,
      `"${c.live_url || ''}"`,
      `"${c.resume_url || ''}"`,
      `"${c.internship_status || 'New'}"`,
      `"${c.hackathon_name || ''}"`,
      `"${c.submitted_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `siteon_internship_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    db.logAdminAction(user.id, 'csv_exported_internships', 'export', 'internships');
    setDownloadSuccess('Internship Candidates CSV successfully generated and downloaded.');
    setTimeout(() => setDownloadSuccess(''), 3500);
  };

  const handleSyncToGoogleSheet = async () => {
    setSheetSyncing(true);
    setSheetStatus('');

    try {
      const submissions = db.getSubmissions();
      const res = await googleSheetService.syncAllSubmissions(submissions);
      if (res.success) {
        setSheetStatus(`Success: ${res.count} submissions successfully synchronized to your Google Sheet!`);
        db.logAdminAction(user.id, 'google_sheet_synced', 'export', `${res.count}_rows`);
      } else {
        setSheetStatus(`Notice: ${res.message}`);
      }
    } catch (err) {
      setSheetStatus(`Error: ${err.message || 'Failed to sync with Google Sheet'}`);
    } finally {
      setSheetSyncing(false);
    }
  };

  const appsScriptTemplate = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Initialize header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Submission ID", "Hackathon", "Project Name", "Team Name", 
        "Participant Name", "Email", "College", "Course", 
        "Grad Year", "City", "Tech Stack", "GitHub URL", 
        "Live URL", "LinkedIn", "Resume URL", "Internship", 
        "Status", "Submitted At"
      ]);
      sheet.getRange(1, 1, 1, 18).setFontWeight("bold").setBackground("#f1f5f9");
    }

    if (data.action === "BATCH_SYNC" && data.submissions) {
      data.submissions.forEach(function(s) {
        sheet.appendRow([
          s.submission_id, s.hackathon_name, s.project_name, s.team_name,
          s.owner_name, s.owner_email, s.college, s.course,
          s.graduation_year, s.city, s.tech_stack, s.github_url,
          s.live_url, s.linkedin_url, s.resume_url, s.internship_interest,
          s.status, s.submitted_at
        ]);
      });
    } else {
      sheet.appendRow([
        data.submission_id, data.hackathon_name, data.project_name, data.team_name,
        data.owner_name, data.owner_email, data.college, data.course,
        data.graduation_year, data.city, data.tech_stack, data.github_url,
        data.live_url, data.linkedin_url, data.resume_url, data.internship_interest,
        data.status, data.submitted_at
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(appsScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-mono">Data Exports & Cloud Sync</h1>
        <p className="text-xs text-slate-500 mt-1">
          Export verified platform submission records or stream live submissions directly into a private Google Sheet.
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: GOOGLE SHEETS CLOUD INTEGRATION                  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Google Sheets Live Cloud Sync</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically push project submission entries directly into your private Google Sheet without public exposure.
              </p>
            </div>
          </div>

          <div>
            {isSheetConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active via .env</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending .env Setup</span>
              </span>
            )}
          </div>
        </div>

        {/* Sync Status Banner */}
        {sheetStatus && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            sheetStatus.startsWith('Success')
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}>
            {sheetStatus.startsWith('Success') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{sheetStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="text-xs text-slate-600 space-y-1">
            <span className="block font-semibold text-slate-800">Environment Storage:</span>
            <p className="font-mono text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 truncate">
              {isSheetConfigured ? `VITE_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/••••••••/exec` : `VITE_GOOGLE_SHEET_WEBHOOK_URL=<your-script-url>`}
            </p>
            <p className="text-[11px] text-slate-400">
              Saved strictly in local <code>.env</code> file. No participant or visitor can see your Google Sheet link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
            <button
              onClick={handleSyncToGoogleSheet}
              disabled={sheetSyncing}
              className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sheetSyncing ? 'animate-spin' : ''}`} />
              <span>{sheetSyncing ? 'Syncing...' : 'Sync All Submissions to Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Step-by-Step Setup Guide */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowScriptGuide(!showScriptGuide)}
            className="w-full flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>How to connect your Google Sheet in 2 minutes (Step-by-Step Guide)</span>
            </span>
            {showScriptGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showScriptGuide && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-4">
              <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                <li>Ek naya <strong>Google Sheet</strong> banayein apne Google Drive me.</li>
                <li>Upar menu me <strong>Extensions → Apps Script</strong> par click karein.</li>
                <li>Pehle se likha hua code delete karke niche diya gaya script paste karein:</li>
              </ol>

              {/* Code Snippet Box */}
              <div className="relative bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] overflow-x-auto">
                <button
                  type="button"
                  onClick={copyScriptToClipboard}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-mono flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
                <pre>{appsScriptTemplate}</pre>
              </div>

              <ol start={4} className="list-decimal list-inside space-y-2 leading-relaxed">
                <li>Upar blue <strong>"Deploy"</strong> button par click karein → <strong>"New deployment"</strong>.</li>
                <li>Select type me gear icon par click karke <strong>"Web app"</strong> chunein.</li>
                <li>
                  Set karein:
                  <ul className="list-disc list-inside pl-4 mt-1 text-slate-600 space-y-0.5">
                    <li>Execute as: <strong>Me</strong></li>
                    <li>Who has access: <strong>Anyone</strong> (taaki Siteon backend bina login issue ke data post kar sake)</li>
                  </ul>
                </li>
                <li>Deploy par click karein aur milne wala <strong>Web App URL</strong> copy karein.</li>
                <li>
                  Apne project ke <code>.env</code> file me paste karein:
                  <div className="mt-1 font-mono p-1.5 rounded bg-white border border-slate-200 text-slate-900">
                    VITE_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION: CSV DATASETS DOWNLOAD                             */}
      {/* ========================================================= */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider mb-4">
          Direct CSV Downloads
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1: All Submissions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Master Submissions Dataset</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Contains all project records across every hackathon: IDs, owner credentials, team rosters, GitHub repositories, live URLs, and evaluation statuses.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Columns: 17 standardized data attributes
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={exportAllSubmissionsCSV}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Submissions CSV</span>
              </button>
            </div>
          </div>

          {/* Card 2: Internship Candidates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 card-elevation flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Internship Candidates Dataset</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Filtered exclusively for participants who marked "Yes, I want to be considered". Includes direct resume links, academic details, and pipeline stages.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Includes: Confidential resume links & LinkedIn URLs
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={exportInternshipCandidatesCSV}
                className="w-full py-2.5 px-4 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Candidates CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Confidentiality Notice:</strong> Exported files and synced Google Sheets contain sensitive academic and contact credentials of student participants. Maintain these records securely in accordance with the Siteon Privacy Policy.
        </p>
      </div>

    </div>
  );
}
