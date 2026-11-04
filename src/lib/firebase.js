/**
 * FoodBridge Firebase Client SDK Initialisation
 * Configured strictly for Firebase Spark Plan with Local Emulator Suite support.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { env } from './env.js';

const firebaseConfig = {
  apiKey: env.apiKey,
  authDomain: env.authDomain,
  projectId: env.projectId,
  appId: env.appId,
  ...(env.messagingSenderId ? { messagingSenderId: env.messagingSenderId } : {}),
};

// Singleton App Instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Auth Service (Email/Password default; Google Sign-in optional)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Cloud Firestore Service (Spark quotas: 50k reads / 20k writes per day)
export const db = getFirestore(app);

// Connect Local Emulators if configured or in test mode
let emulatorInitialized = false;

if (env.useEmulator && !emulatorInitialized) {
  try {
    const authUrl = `http://${env.authEmulatorHost}`;
    connectAuthEmulator(auth, authUrl, { disableWarnings: true });

    const [firestoreHost, firestorePortStr] = env.firestoreEmulatorHost.split(':');
    const firestorePort = parseInt(firestorePortStr || '8080', 10);
    connectFirestoreEmulator(db, firestoreHost, firestorePort);

    emulatorInitialized = true;
  } catch (error) {
    // Prevent double-connection errors during fast-refresh or hot-reloading
    if (
      !error.message?.includes('already been connected') &&
      !error.message?.includes('has already been called')
    ) {
      console.warn('[FirebaseEmulator] Warning during emulator connection:', error.message);
    }
  }
}

export const isEmulatorActive = emulatorInitialized;
