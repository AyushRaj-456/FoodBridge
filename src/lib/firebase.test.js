import { describe, it, expect } from 'vitest';
import { app, auth, db, googleProvider } from './firebase.js';

describe('Firebase Client SDK — Spark Plan Setup', () => {
  it('initializes Firebase app with target project ID', () => {
    expect(app).toBeDefined();
    expect(app.name).toBe('[DEFAULT]');
    expect(app.options.projectId).toBe('foodbridge-spark');
  });

  it('initializes Firebase Auth with Google provider option', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBe(app);
    expect(googleProvider).toBeDefined();
    expect(googleProvider.providerId).toBe('google.com');
  });

  it('initializes Cloud Firestore client SDK', () => {
    expect(db).toBeDefined();
    expect(db.app).toBe(app);
    expect(db.type).toBe('firestore');
  });
});
