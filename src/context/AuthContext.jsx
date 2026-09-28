import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { googleSheetService } from '../services/googleSheetService';
import { getInitialsAvatar, cleanDisplayName, isGitAura } from '../utils/avatar';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'siteon_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(true);

  // Sync auth state
  const refreshAuthState = (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setRole('guest');
      return;
    }

    const cleanName = cleanDisplayName(currentUser.name, currentUser.email) || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
    currentUser.name = cleanName;
    if (!currentUser.avatar || currentUser.avatar.includes('dicebear')) {
      currentUser.avatar = getInitialsAvatar(cleanName);
    }

    const resolvedRole = db.getUserRole(currentUser.id, currentUser.email);
    let resolvedProfile = db.getProfileByUserId(currentUser.id, currentUser.email);

    // If profile not yet created, create minimal base profile
    if (!resolvedProfile) {
      resolvedProfile = db.upsertProfile({
        user_id: currentUser.id,
        email: currentUser.email,
        full_name: cleanName,
        avatar_url: currentUser.avatar || getInitialsAvatar(cleanName)
      });
    } else {
      let needsProfileUpdate = false;
      const profilePatch = {};
      if (isGitAura(resolvedProfile.full_name)) {
        resolvedProfile.full_name = cleanName;
        profilePatch.full_name = cleanName;
        needsProfileUpdate = true;
      }
      if (!resolvedProfile.avatar_url || resolvedProfile.avatar_url.includes('dicebear')) {
        resolvedProfile.avatar_url = getInitialsAvatar(cleanName);
        profilePatch.avatar_url = resolvedProfile.avatar_url;
        needsProfileUpdate = true;
      }
      if (needsProfileUpdate) {
        resolvedProfile = db.upsertProfile({
          user_id: currentUser.id,
          email: currentUser.email,
          ...profilePatch
        });
      }
    }

    setUser(currentUser);
    setProfile(resolvedProfile);
    setRole(resolvedRole);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        refreshAuthState(parsed);
      }
    } catch (e) {
      console.error("Auth init error:", e);
    } finally {
      setLoading(false);
    }

    // Listen to db changes
    const handleDbUpdate = (e) => {
      if (['profiles', 'user_roles'].includes(e.detail?.table)) {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          refreshAuthState(JSON.parse(stored));
        }
      }
    };
    window.addEventListener('siteon_db_updated', handleDbUpdate);
    return () => window.removeEventListener('siteon_db_updated', handleDbUpdate);
  }, []);

  // Login with Email / Password
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if account exists
    const existingUser = db.getUserByEmail(cleanEmail);
    if (!existingUser) {
      throw new Error("No account found with this email. Please click 'Create Account' to sign up first.");
    }

    if (existingUser.password && existingUser.password !== password) {
      throw new Error("Incorrect password. Please verify your credentials.");
    }

    const userId = existingUser.id;
    const rawName = existingUser.name || cleanEmail.split('@')[0];
    const name = cleanDisplayName(rawName, cleanEmail) || cleanEmail.split('@')[0];

    const authUser = {
      id: userId,
      email: cleanEmail,
      name: name,
      avatar: getInitialsAvatar(name)
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    refreshAuthState(authUser);

    // Check if profile is complete
    const currentProf = db.getProfileByUserId(userId);
    const isProfileComplete = Boolean(
      currentProf &&
      currentProf.college &&
      currentProf.course &&
      currentProf.phone &&
      currentProf.graduation_year &&
      currentProf.city &&
      currentProf.state &&
      currentProf.github_url &&
      currentProf.linkedin_url
    );

    return { user: authUser, role: db.getUserRole(userId, cleanEmail), isProfileComplete };
  };

  // Sign up with Email / Password
  const signup = async (fullName, email, password, confirmPassword) => {
    if (!fullName || !email || !password) {
      throw new Error("All fields are required.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = db.getUserByEmail(cleanEmail);
    if (existingUser) {
      throw new Error("An account with this email already exists. Please log in instead.");
    }

    const sanitizedName = cleanDisplayName(fullName, cleanEmail) || cleanEmail.split('@')[0];
    const userId = 'u_' + Math.random().toString(36).substring(2, 10);
    db.createUser({
      id: userId,
      name: sanitizedName,
      email: cleanEmail,
      password: password
    });

    const authUser = {
      id: userId,
      email: cleanEmail,
      name: sanitizedName,
      avatar: getInitialsAvatar(sanitizedName)
    };

    // Store base profile with empty city/state so nothing is prefilled
    db.setUserRole(userId, cleanEmail === 'siteon.org@gmail.com' ? 'admin' : 'participant', cleanEmail);
    const baseProfile = db.upsertProfile({
      user_id: userId,
      full_name: sanitizedName,
      email: cleanEmail,
      avatar_url: authUser.avatar,
      city: '',
      state: '',
      college: '',
      course: '',
      graduation_year: '',
      phone: ''
    });

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    refreshAuthState(authUser);

    // Sync new user registration to Google Sheet in background
    googleSheetService.syncUserRegistration(authUser, baseProfile).catch(err => {
      console.warn('Google Sheet signup sync notice:', err);
    });

    return { user: authUser, role: 'participant', isProfileComplete: false };
  };

  // Google OAuth managed sign-in
  const loginWithGoogle = async (googleUserOrEmail, isSignUpMode = false) => {
    let cleanEmail = '';
    let displayName = '';
    let avatarUrl = '';

    if (typeof googleUserOrEmail === 'object' && googleUserOrEmail !== null) {
      cleanEmail = (googleUserOrEmail.email || '').trim().toLowerCase();
      displayName = cleanDisplayName(googleUserOrEmail.name, cleanEmail);
      avatarUrl = googleUserOrEmail.picture || '';
    } else {
      const emailStr = googleUserOrEmail || (window.__googleLoginEmail || 'student.developer@gmail.com');
      cleanEmail = emailStr.trim().toLowerCase();
    }

    if (!cleanEmail) {
      throw new Error("No Google email account received.");
    }

    let existingUser = db.getUserByEmail(cleanEmail);

    if (!existingUser) {
      if (!isSignUpMode && cleanEmail !== 'siteon.org@gmail.com') {
        throw new Error("No Siteon account associated with this Google email. Please create an account first under the 'Create Account' tab.");
      }

      // Create new user for Google Sign-up
      if (!displayName || isGitAura(displayName)) {
        displayName = cleanEmail === 'siteon.org@gmail.com' ? 'Siteon Administrator' : cleanEmail.split('@')[0].replace('.', ' ');
        displayName = displayName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      const userId = cleanEmail === 'siteon.org@gmail.com' ? 'u_admin_default' : 'u_g_' + Math.random().toString(36).substring(2, 10);
      existingUser = db.createUser({
        id: userId,
        email: cleanEmail,
        name: displayName,
        password: 'google_oauth_managed'
      });

      const userAvatar = avatarUrl && !avatarUrl.includes('dicebear') ? avatarUrl : getInitialsAvatar(displayName);

      db.setUserRole(userId, cleanEmail === 'siteon.org@gmail.com' ? 'admin' : 'participant', cleanEmail);
      const baseProfile = db.upsertProfile({
        user_id: userId,
        full_name: displayName,
        email: cleanEmail,
        avatar_url: userAvatar,
        city: '',
        state: '',
        college: '',
        course: '',
        graduation_year: '',
        phone: ''
      });

      // Sync new Google registration to Users Google Sheet in background
      googleSheetService.syncUserRegistration(
        { id: userId, email: cleanEmail, name: displayName, avatar: userAvatar },
        baseProfile
      ).catch(err => {
        console.warn('Google Sheet signup sync notice:', err);
      });
    }

    const userId = existingUser.id;
    let finalDisplayName = cleanDisplayName(existingUser.name, cleanEmail) || displayName || cleanEmail.split('@')[0];
    if (isGitAura(finalDisplayName)) {
      finalDisplayName = cleanEmail.split('@')[0];
    }
    const finalAvatar = (avatarUrl && !avatarUrl.includes('dicebear')) || (existingUser.avatar && !existingUser.avatar.includes('dicebear')) 
      ? (avatarUrl || existingUser.avatar) 
      : getInitialsAvatar(finalDisplayName);

    const authUser = {
      id: userId,
      email: cleanEmail,
      name: finalDisplayName,
      avatar: finalAvatar,
      provider: 'google'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    refreshAuthState(authUser);

    const currentProf = db.getProfileByUserId(userId);
    const isProfileComplete = Boolean(
      currentProf &&
      currentProf.college &&
      currentProf.course &&
      currentProf.phone &&
      currentProf.graduation_year &&
      currentProf.city &&
      currentProf.state &&
      currentProf.github_url &&
      currentProf.linkedin_url
    );

    return { user: authUser, role: db.getUserRole(userId, cleanEmail), isProfileComplete };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setProfile(null);
    setRole('guest');
  };

  // Update profile
  const updateProfile = (profileData) => {
    if (!user) throw new Error("Must be logged in to update profile.");
    const updated = db.upsertProfile({
      ...profileData,
      user_id: user.id,
      email: user.email
    });
    setProfile(updated);

    // Sync updated student profile details to Google Sheet in background
    googleSheetService.syncUserRegistration(user, updated).catch(err => {
      console.warn('Google Sheet user update sync notice:', err);
    });

    return updated;
  };

  const isAdmin = role === 'admin';
  const isParticipant = role === 'participant' || role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isParticipant,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
