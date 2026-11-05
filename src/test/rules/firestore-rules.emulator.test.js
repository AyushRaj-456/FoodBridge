import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import fs from 'node:fs';
import path from 'node:path';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const PROJECT_ID = 'foodbridge-spark';

describe('Firestore Security Rules — Comprehensive Emulator Integration Tests', () => {
  let testEnv;

  beforeAll(async () => {
    const rulesPath = path.resolve(__dirname, '../../../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf-8');

    try {
      testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
          rules,
          host: '127.0.0.1',
          port: 8080,
        },
      });
    } catch (err) {
      console.warn(
        '[RulesEmulator] Emulator not reachable on 127.0.0.1:8080 during test registration. Live emulator tests will skip gracefully if daemon is inactive:',
        err.message
      );
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async (context) => {
    if (!testEnv) {
      context.skip();
      return;
    }
    await testEnv.clearFirestore();
  });

  describe('Unauthenticated Access (Deny-by-Default)', () => {
    it('denies unauthenticated read and write to all private collections', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();

      await assertFails(getDoc(doc(unauthedDb, 'users', 'user_123')));
      await assertFails(setDoc(doc(unauthedDb, 'users', 'user_123'), { name: 'Hacker' }));
      await assertFails(getDoc(doc(unauthedDb, 'listings', 'listing_123')));
      await assertFails(getDoc(doc(unauthedDb, 'claims', 'claim_123')));
      await assertFails(getDoc(doc(unauthedDb, 'reports', 'report_123')));
      await assertFails(getDoc(doc(unauthedDb, 'auditEvents', 'audit_123')));
      await assertFails(getDoc(doc(unauthedDb, 'unknownCollection', 'doc_123')));
    });
  });

  describe('Users Collection & Self-Promotion Prevention', () => {
    it('allows user to create their own pending profile', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertSucceeds(
        setDoc(doc(aliceDb, 'users', 'alice'), {
          displayName: 'Alice Donor',
          email: 'alice@foodbridge.org',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    });

    it('denies user self-promoting to admin upon registration', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(aliceDb, 'users', 'alice'), {
          displayName: 'Alice Admin',
          email: 'alice@foodbridge.org',
          status: 'pending',
          isAdmin: true, // Prohibited self-promotion
          createdAt: new Date().toISOString(),
        })
      );
    });

    it('denies cross-user profile write (Alice cannot modify Bob)', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(aliceDb, 'users', 'bob'), {
          displayName: 'Bob Hacked',
          email: 'bob@foodbridge.org',
          status: 'pending',
        })
      );
    });

    it('denies cross-user profile read (Alice cannot read Bob private profile)', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'users', 'bob'), {
          displayName: 'Bob Private',
          email: 'bob@foodbridge.org',
          status: 'pending',
        });
      });

      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();
      await assertFails(getDoc(doc(aliceDb, 'users', 'bob')));
    });

    it('allows console-provisioned admin to read any user profile', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore();
        await setDoc(doc(adminDb, 'admins', 'admin_uid'), { role: 'admin' });
        await setDoc(doc(adminDb, 'users', 'bob'), { displayName: 'Bob User' });
      });

      const adminDb = testEnv
        .authenticatedContext('admin_uid', { email: 'admin@foodbridge.org' })
        .firestore();
      await assertSucceeds(getDoc(doc(adminDb, 'users', 'bob')));
    });
  });

  describe('Admin Console-Only Provisioning', () => {
    it('denies client writes to admins collection (must be console-provisioned)', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(aliceDb, 'admins', 'alice'), {
          role: 'admin',
        })
      );
    });
  });

  describe('Organisations & Memberships', () => {
    it('allows user to submit organisation application with status=pending', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertSucceeds(
        setDoc(doc(aliceDb, 'organisations', 'org_mess_1'), {
          type: 'donor',
          legalName: 'Hostel Mess 1',
          displayName: 'Central Mess',
          status: 'pending',
          createdBy: 'alice',
          createdAt: new Date().toISOString(),
        })
      );
    });

    it('denies user self-approving organisation application', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(aliceDb, 'organisations', 'org_mess_1'), {
          type: 'donor',
          legalName: 'Hostel Mess 1',
          displayName: 'Central Mess',
          status: 'approved',
          createdBy: 'alice',
        })
      );
    });

    it('denies user creating membership for someone else', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(aliceDb, 'memberships', 'org_mess_1_bob'), {
          orgId: 'org_mess_1',
          uid: 'bob',
          role: 'member',
          status: 'pending',
        })
      );
    });
  });

  describe('Listings & Field-Level Privacy Partition', () => {
    beforeEach(async () => {
      if (testEnv) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const rawDb = context.firestore();
          await setDoc(doc(rawDb, 'organisations', 'org_donor'), {
            status: 'approved',
            type: 'donor',
          });
          await setDoc(doc(rawDb, 'memberships', 'org_donor_alice'), {
            orgId: 'org_donor',
            uid: 'alice',
            role: 'donor',
            status: 'active',
          });
        });
      }
    });

    it('allows active member of approved donor org to create listing', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertSucceeds(
        setDoc(doc(aliceDb, 'listings', 'listing_1'), {
          donorOrgId: 'org_donor',
          createdBy: 'alice',
          title: 'Leftover Rice',
          category: 'cooked',
          quantity: 10,
          unit: 'kg',
          status: 'published',
          activeClaimId: null,
          consumeBy: new Date(Date.now() + 3600000).toISOString(),
          pickupEnd: new Date(Date.now() + 3600000).toISOString(),
        })
      );
    });

    it('denies non-member from creating listing for donor org', async () => {
      const eveDb = testEnv
        .authenticatedContext('eve', { email: 'eve@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(eveDb, 'listings', 'listing_2'), {
          donorOrgId: 'org_donor',
          createdBy: 'eve',
          title: 'Unauthorized Food',
          status: 'published',
          activeClaimId: null,
        })
      );
    });

    it('denies unclaimed user from reading exact pickup fulfillment details', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const rawDb = context.firestore();
        await setDoc(doc(rawDb, 'listings', 'listing_secret'), {
          donorOrgId: 'org_donor',
          status: 'published',
          activeClaimId: null,
        });
        await setDoc(doc(rawDb, 'listings', 'listing_secret', 'fulfillment', 'pickup'), {
          exactAddress: 'Room 101, Kitchen B, Private Street 12',
          contactPhone: '+91 9999999999',
        });
      });

      // Bob (unclaimed recipient) attempts to read exact address
      const bobDb = testEnv.authenticatedContext('bob', { email: 'bob@ngo.org' }).firestore();
      await assertFails(getDoc(doc(bobDb, 'listings', 'listing_secret', 'fulfillment', 'pickup')));

      // Alice (donor org member) can read exact address
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();
      await assertSucceeds(
        getDoc(doc(aliceDb, 'listings', 'listing_secret', 'fulfillment', 'pickup'))
      );
    });

    it('denies client deletion of listings (soft-deactivation only)', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();
      await assertFails(deleteDoc(doc(aliceDb, 'listings', 'listing_1')));
    });
  });

  describe('Mess Records & Food Waste Analytics', () => {
    beforeEach(async () => {
      if (testEnv) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const rawDb = context.firestore();
          await setDoc(doc(rawDb, 'memberships', 'org_mess_alice'), {
            orgId: 'org_mess',
            uid: 'alice',
            role: 'mess_operator',
            status: 'active',
          });
        });
      }
    });

    it('rejects mess record with negative quantity', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertFails(
        setDoc(doc(aliceDb, 'messRecords', 'rec_neg'), {
          orgId: 'org_mess',
          preparedQty: -10,
          servedQty: 5,
          leftoverQty: 0,
        })
      );
    });

    it('allows active mess operator to create valid record', async () => {
      const aliceDb = testEnv
        .authenticatedContext('alice', { email: 'alice@foodbridge.org' })
        .firestore();

      await assertSucceeds(
        setDoc(doc(aliceDb, 'messRecords', 'rec_valid'), {
          orgId: 'org_mess',
          mealDate: '2026-11-04',
          mealType: 'dinner',
          dishName: 'Rice & Sambar',
          preparedQty: 100,
          servedQty: 90,
          leftoverQty: 10,
          unit: 'kg',
        })
      );
    });
  });

  describe('Notifications Access Control', () => {
    beforeEach(async () => {
      if (testEnv) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const rawDb = context.firestore();
          await setDoc(doc(rawDb, 'notifications', 'notif_alice'), {
            userId: 'alice',
            title: 'New Surplus Nearby',
            readAt: null,
          });
        });
      }
    });

    it('allows owner to read own notification', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(getDoc(doc(aliceDb, 'notifications', 'notif_alice')));
    });

    it('denies other user from reading alice notification', async () => {
      const bobDb = testEnv.authenticatedContext('bob').firestore();
      await assertFails(getDoc(doc(bobDb, 'notifications', 'notif_alice')));
    });
  });

  describe('Admin Moderation, Incident Reports & Append-Only Audit Integrity', () => {
    beforeEach(async () => {
      if (testEnv) {
        await testEnv.withSecurityRulesDisabled(async (context) => {
          const rawDb = context.firestore();
          await setDoc(doc(rawDb, 'admins', 'admin_uid'), { role: 'admin' });
          await setDoc(doc(rawDb, 'organisations', 'org_pending'), {
            displayName: 'Pending NGO',
            status: 'pending',
            createdBy: 'bob',
          });
          await setDoc(doc(rawDb, 'reports', 'rep_alice'), {
            reporterUid: 'alice',
            category: 'Hygiene Concern',
            description: 'Food hygiene issue observed at dispatch counter.',
            status: 'pending',
          });
        });
      }
    });

    it('denies non-admin from approving organisation status', async () => {
      const bobDb = testEnv.authenticatedContext('bob').firestore();
      await assertFails(
        setDoc(doc(bobDb, 'organisations', 'org_pending'), { status: 'approved' }, { merge: true })
      );
    });

    it('allows console-provisioned admin to approve organisation status', async () => {
      const adminDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertSucceeds(
        setDoc(
          doc(adminDb, 'organisations', 'org_pending'),
          { status: 'approved' },
          { merge: true }
        )
      );
    });

    it('allows user to create their own incident report', async () => {
      const aliceDb = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(
        setDoc(doc(aliceDb, 'reports', 'rep_new'), {
          reporterUid: 'alice',
          category: 'Late Collection',
          description: 'Recipient arrived 60 minutes after agreed pickup window.',
          status: 'pending',
        })
      );
    });

    it('denies non-admin from resolving or updating another user report (IDOR protection)', async () => {
      const bobDb = testEnv.authenticatedContext('bob').firestore();
      await assertFails(
        setDoc(doc(bobDb, 'reports', 'rep_alice'), { status: 'resolved' }, { merge: true })
      );
    });

    it('allows admin to update incident report status', async () => {
      const adminDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertSucceeds(
        setDoc(doc(adminDb, 'reports', 'rep_alice'), { status: 'resolved' }, { merge: true })
      );
    });

    it('denies non-admin from reading verification reviews', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const rawDb = context.firestore();
        await setDoc(doc(rawDb, 'verificationReviews', 'rev_1'), {
          orgId: 'org_pending',
          reviewerUid: 'admin_uid',
          decision: 'approved',
        });
      });

      const bobDb = testEnv.authenticatedContext('bob').firestore();
      await assertFails(getDoc(doc(bobDb, 'verificationReviews', 'rev_1')));

      const adminDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertSucceeds(getDoc(doc(adminDb, 'verificationReviews', 'rev_1')));
    });

    it('denies all clients (including admin) from updating or deleting append-only audit events', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const rawDb = context.firestore();
        await setDoc(doc(rawDb, 'auditEvents', 'audit_immutable'), {
          actorUid: 'admin_uid',
          action: 'ORG_VERIFIED_APPROVED',
          summary: 'Approved pending NGO',
        });
      });

      const adminDb = testEnv.authenticatedContext('admin_uid').firestore();
      await assertFails(
        setDoc(
          doc(adminDb, 'auditEvents', 'audit_immutable'),
          { summary: 'Forged audit summary' },
          { merge: true }
        )
      );
      await assertFails(deleteDoc(doc(adminDb, 'auditEvents', 'audit_immutable')));
    });
  });
});
