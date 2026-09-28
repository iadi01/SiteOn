import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';

// Core Pages
import Home from './pages/Home';
const Hackathons = lazy(() => import('./pages/Hackathons'));
const HackathonDetail = lazy(() => import('./pages/HackathonDetail'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const SubmitProject = lazy(() => import('./pages/SubmitProject'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SubmissionDetail = lazy(() => import('./pages/SubmissionDetail'));
const About = lazy(() => import('./pages/About'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Register = lazy(() => import('./pages/Register'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminHackathons = lazy(() => import('./pages/admin/AdminHackathons'));
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'));
const AdminSubmissionReview = lazy(() => import('./pages/admin/AdminSubmissionReview'));
const AdminInternships = lazy(() => import('./pages/admin/AdminInternships'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminExports = lazy(() => import('./pages/admin/AdminExports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminChallenge = lazy(() => import('./pages/admin/AdminChallenge'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));

// Clean light-mode loading spinner
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-slate-50" role="status" aria-label="Loading platform">
    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 bg-grid-pattern text-slate-900 overflow-x-hidden relative font-sans">
          
          {/* Global Sticky Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow relative z-10" id="main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Platform Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/hackathons/:slug" element={<HackathonDetail />} />
                <Route path="/hackathons/:slug/register" element={<Register />} />
                <Route path="/register/:slug" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Participant Authenticated Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/setup" element={<ProfileSetup />} />
                <Route path="/submit" element={<SubmitProject />} />
                <Route path="/submit/:hackathonId" element={<SubmitProject />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/submissions/:id" element={<SubmissionDetail />} />

                {/* Admin Operations Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="hackathons" element={<AdminHackathons />} />
                  <Route path="challenge" element={<AdminChallenge />} />
                  <Route path="submissions" element={<AdminSubmissions />} />
                  <Route path="submissions/:id" element={<AdminSubmissionReview />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="internships" element={<AdminInternships />} />
                  <Route path="exports" element={<AdminExports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Custom 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          {/* Global Cookie Consent Banner */}
          <CookieConsent />

          {/* Global Footer */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}
