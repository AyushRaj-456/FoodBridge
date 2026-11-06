#!/usr/bin/env node
/**
 * FoodBridge Local Demo Testing Sandbox — Reset Script
 * Safely purges demo data from the local Firebase Emulator.
 * Guarded strictly against non-demo projects.
 */

const FIRESTORE_EMULATOR_HOST = process.env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_EMULATOR_HOST = process.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'demo-foodbridge-local';

// Production safety guard: Refuse execution if not an explicit demo project
if (!PROJECT_ID.startsWith('demo-')) {
  console.error(`\x1b[31m[CRITICAL SAFETY ERROR]\x1b[0m Refusing to reset non-demo project: "${PROJECT_ID}".`);
  console.error('Reset operations are strictly forbidden on production projects.');
  process.exit(1);
}

async function reset() {
  console.log(`\x1b[33m=== FoodBridge Local Demo Sandbox Reset ===\x1b[0m`);
  console.log(`Targeting Project: \x1b[32m${PROJECT_ID}\x1b[0m\n`);

  // 1. Clear Firestore emulator data
  try {
    const firestoreUrl = `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
    const res = await fetch(firestoreUrl, { method: 'DELETE' });
    if (res.ok) {
      console.log(`\x1b[32m✓\x1b[0m Cleared Firestore emulator documents.`);
    } else {
      console.warn(`[reset] Note on Firestore emulator: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error(`\x1b[31m[Error]\x1b[0m Failed to connect to Firestore emulator:`, err.message);
  }

  // 2. Clear Auth emulator accounts
  try {
    const authUrl = `http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`;
    const res = await fetch(authUrl, { method: 'DELETE' });
    if (res.ok) {
      console.log(`\x1b[32m✓\x1b[0m Cleared Auth emulator user accounts.`);
    } else {
      console.warn(`[reset] Note on Auth emulator: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error(`\x1b[31m[Error]\x1b[0m Failed to connect to Auth emulator:`, err.message);
  }

  console.log(`\n\x1b[32mDemo sandbox reset completed cleanly.\x1b[0m`);
  console.log(`Run \x1b[36mnpm run demo:seed\x1b[0m to repopulate fresh test data.`);
}

reset().catch((err) => {
  console.error('\x1b[31m[Reset Failed]:\x1b[0m', err.message);
  process.exit(1);
});
