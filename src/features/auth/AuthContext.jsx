import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase.js';
import { AuthContext } from './useAuth.js';
import {
  registerWithEmail,
  signInWithEmail,
  signInWithGoogleProvider,
  sendPasswordReset,
  signOutUser,
  fetchUserProfile,
  checkAdminStatus,
  formatAuthError,
  updateUserProfile,
} from './authService.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await fetchUserProfile(currentUser.uid, currentUser);
          setProfile(userProfile);
          const adminCheck = await checkAdminStatus(currentUser.uid);
          setIsAdmin(adminCheck);
        } catch (err) {
          console.warn('[AuthContext] Failed to load user profile or admin status:', err.message);
          setProfile({
            displayName: currentUser.displayName || 'User',
            email: currentUser.email,
            status: 'pending',
          });
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, displayName) => {
    setError(null);
    try {
      const res = await registerWithEmail(email, password, displayName);
      setUser(res.user);
      setProfile(res.profile);
      setIsAdmin(false);
      return res;
    } catch (err) {
      const msg = formatAuthError(err.code || err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await signInWithEmail(email, password);
      setUser(res.user);
      setProfile(res.profile);
      setIsAdmin(res.isAdmin);
      return res;
    } catch (err) {
      const msg = formatAuthError(err.code || err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const res = await signInWithGoogleProvider();
      setUser(res.user);
      setProfile(res.profile);
      setIsAdmin(res.isAdmin);
      return res;
    } catch (err) {
      const msg = formatAuthError(err.code || err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err) {
      const msg = formatAuthError(err.code || err.message);
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateProfileData = async (fields) => {
    if (!user) return;
    await updateUserProfile(user.uid, fields);
    const updated = await fetchUserProfile(user.uid, user);
    setProfile(updated);
  };

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    error,
    clearError: () => setError(null),
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
