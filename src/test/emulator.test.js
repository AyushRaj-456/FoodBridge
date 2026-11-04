import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Firebase Local Emulator & Configuration Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies firebase.json contains valid Spark emulator configuration', () => {
    const firebaseJsonPath = path.join(rootDir, 'firebase.json');
    expect(fs.existsSync(firebaseJsonPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf-8'));

    // Verify hosting
    expect(config.hosting).toBeDefined();
    expect(config.hosting.public).toBe('dist');

    // Verify emulators ports
    expect(config.emulators).toBeDefined();
    expect(config.emulators.auth.port).toBe(9099);
    expect(config.emulators.firestore.port).toBe(8080);
    expect(config.emulators.hosting.port).toBe(5000);
    expect(config.emulators.ui.port).toBe(4000);

    // ZERO-COST CONTRACT: Verify no Blaze-only services configured
    expect(config.storage).toBeUndefined();
    expect(config.functions).toBeUndefined();
    expect(config.scheduler).toBeUndefined();
    expect(config.apphosting).toBeUndefined();
    expect(config.emulators.storage).toBeUndefined();
    expect(config.emulators.functions).toBeUndefined();
  });

  it('verifies firestore.rules implements deny-by-default and console-admin protection', () => {
    const rulesPath = path.join(rootDir, 'firestore.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);

    const rules = fs.readFileSync(rulesPath, 'utf-8');

    // Version and service definition
    expect(rules).toContain("rules_version = '2'");
    expect(rules).toContain('service cloud.firestore');

    // Core helper functions
    expect(rules).toContain('function isAuthenticated()');
    expect(rules).toContain('function isAdmin()');
    expect(rules).toContain('function isOrgMember(orgId)');

    // Admin collection protection
    expect(rules).toContain('match /admins/{userId}');
    expect(rules).toContain('allow write: if false');

    // Deny all fallback
    expect(rules).toContain('match /{document=**}');
    expect(rules).toContain('allow read, write: if false');
  });

  it('verifies firestore.indexes.json defines required composite queries', () => {
    const indexesPath = path.join(rootDir, 'firestore.indexes.json');
    expect(fs.existsSync(indexesPath)).toBe(true);

    const indexConfig = JSON.parse(fs.readFileSync(indexesPath, 'utf-8'));
    expect(Array.isArray(indexConfig.indexes)).toBe(true);

    const indexedCollections = indexConfig.indexes.map((idx) => idx.collectionGroup);
    expect(indexedCollections).toContain('listings');
    expect(indexedCollections).toContain('claims');
    expect(indexedCollections).toContain('messRecords');
    expect(indexedCollections).toContain('notifications');
  });

  it('verifies .firebaserc targets foodbridge-spark', () => {
    const rcPath = path.join(rootDir, '.firebaserc');
    expect(fs.existsSync(rcPath)).toBe(true);

    const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    expect(rc.projects.default).toBe('foodbridge-spark');
  });
});
