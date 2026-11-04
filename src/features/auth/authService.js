/**
 * FoodBridge Authentication & Profile Service
 * Conforms to architecture/AUTHENTICATION_AND_AUTHORIZATION.md and security/AUTH_SECURITY.md.
 * Pure Firebase Auth Email/Password & optional Google sign-in. Zero SMS OTP, zero custom password hashing.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../lib/firebase.js';

/**
 * Format auth error codes into safe messages without enabling account enumeration
 */
export function formatAuthError(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access is temporarily paused for security. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return 'Authentication failed. Please verify your details and try again.';
  }
}

/**
 * Register user with Email and Password
 * Auto-forces status: 'pending'. User cannot choose admin or verified role.
 */
export async function registerWithEmail(email, password, displayName) {
  if (!email || !password || !displayName) {
    throw new Error('Display name, email, and password are required.');
  }

  // 1. Create Auth account
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  // 2. Set Firebase Auth profile display name
  await updateProfile(user, { displayName: displayName.trim() });

  // 3. Create initial Firestore user profile with status=pending
  const userRef = doc(db, 'users', user.uid);
  const initialProfile = {
    displayName: displayName.trim(),
    email: user.email,
    status: 'pending', // Immutable initial state: pending approval
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, initialProfile);

  return { user, profile: { ...initialProfile, createdAt: new Date(), updatedAt: new Date() } };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await fetchUserProfile(credential.user.uid, credential.user);
  const isAdmin = await checkAdminStatus(credential.user.uid);

  return { user: credential.user, profile, isAdmin };
}

/**
 * Optional Google Sign-In within Spark
 */
export async function signInWithGoogleProvider() {
  const credential = await signInWithPopup(auth, googleProvider);
  let profile = await fetchUserProfile(credential.user.uid, credential.user);

  // If first time Google sign-in, initialize profile with pending status
  if (!profile) {
    const userRef = doc(db, 'users', credential.user.uid);
    profile = {
      displayName: credential.user.displayName || 'Google User',
      email: credential.user.email,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);
  }

  const isAdmin = await checkAdminStatus(credential.user.uid);
  return { user: credential.user, profile, isAdmin };
}

/**
 * Send password reset email via Firebase Auth system
 */
export async function sendPasswordReset(email) {
  if (!email) {
    throw new Error('Email is required.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out user
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Fetch Firestore user profile
 */
export async function fetchUserProfile(uid, fallbackUser = null) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  if (fallbackUser) {
    return {
      displayName: fallbackUser.displayName || 'User',
      email: fallbackUser.email,
      status: 'pending',
    };
  }
  return null;
}

/**
 * Check console-provisioned admin status via admins/{uid}
 */
export async function checkAdminStatus(uid) {
  if (!uid) return false;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

/**
 * Update allowed profile fields (displayName)
 */
export async function updateUserProfile(uid, { displayName }) {
  if (!uid || !displayName) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    displayName: displayName.trim(),
    updatedAt: serverTimestamp(),
  });
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: displayName.trim() });
  }
}
