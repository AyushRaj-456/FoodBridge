import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  ALLOWED_FIELDS,
  USER_STATUSES,
  ORG_TYPES,
  ORG_STATUSES,
  MEMBERSHIP_ROLES,
  LISTING_STATUSES,
  ROUTE_TIERS,
  CLAIM_STATUSES,
} from '../../rules/schema.js';
import {
  canTransitionListing,
  canTransitionClaim,
  canTransitionOrg,
} from '../../rules/stateMachines.js';

describe('Firestore Schema & Domain Security Invariants', () => {
  const rootDir = path.resolve(__dirname, '../../../');
  const rules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf-8');

  describe('Rules Architecture & Helper Predicates', () => {
    it('enforces deny-by-default for all undefined collections', () => {
      expect(rules).toContain('match /{document=**}');
      expect(rules).toContain('allow read, write: if false;');
    });

    it('verifies that admin privilege is checked via console-provisioned admins collection', () => {
      expect(rules).toContain('function isAdmin()');
      expect(rules).toContain(
        'exists(/databases/$(database)/documents/admins/$(request.auth.uid))'
      );
      expect(rules).toContain('match /admins/{userId}');
      expect(rules).toContain('allow write: if false;');
    });

    it('verifies that active organisation membership is strictly required', () => {
      expect(rules).toContain('function isOrgMember(orgId)');
      expect(rules).toContain("getMembership(orgId).status == 'active'");
    });

    it('verifies that approved organisation status is verified before listing operations', () => {
      expect(rules).toContain('function isApprovedOrg(orgId)');
      expect(rules).toContain("getOrg(orgId).status == 'approved'");
    });
  });

  describe('Users Collection Rules Gaps & Protections', () => {
    it('restricts user profile update to safe non-privileged fields', () => {
      expect(rules).toContain('match /users/{userId}');
      expect(rules).toContain('displayName');
      expect(rules).toContain('photoURL');
      expect(rules).toContain('updatedAt');
      // Forbids self-promotion to admin
      expect(rules).toContain("!('isAdmin' in request.resource.data)");
    });
  });

  describe('Listing & Location Privacy Partition', () => {
    it('partitions exact pickup address into a secured subcollection', () => {
      expect(rules).toContain('match /listings/{listingId}');
      expect(rules).toContain('match /fulfillment/{docId}');
    });

    it('denies hard delete on listings (soft-deactivation only)', () => {
      // Must not allow client delete
      const listingSection = rules.slice(rules.indexOf('match /listings/{listingId}'));
      expect(listingSection).toContain('allow delete: if false;');
    });

    it('enforces consumeBy deadline during claim transition', () => {
      expect(rules).toContain('request.time <= resource.data.consumeBy');
      expect(rules).toContain('request.time <= resource.data.pickupEnd');
    });
  });

  describe('Claims Collection & Handover Concurrency', () => {
    it('denies claim delete operations', () => {
      const claimsSection = rules.slice(rules.indexOf('match /claims/{claimId}'));
      expect(claimsSection).toContain('allow delete: if false;');
    });

    it('requires approved recipient organization status to claim', () => {
      expect(rules).toContain('isApprovedOrg(request.resource.data.recipientOrgId)');
    });
  });

  describe('Mess Records & Audit Integrity', () => {
    it('rejects negative quantities on mess records', () => {
      expect(rules).toContain('request.resource.data.preparedQty >= 0');
      expect(rules).toContain('request.resource.data.leftoverQty >= 0');
    });

    it('enforces append-only semantics on audit events', () => {
      const auditSection = rules.slice(rules.indexOf('match /auditEvents/{eventId}'));
      expect(auditSection).toContain('allow update, delete: if false;');
      expect(auditSection).toContain('request.resource.data.actorUid == request.auth.uid');
      expect(auditSection).toContain('request.resource.data.createdAt == request.time');
    });

    it('restricts verification reviews to administrators only', () => {
      const reviewSection = rules.slice(rules.indexOf('match /verificationReviews/{reviewId}'));
      expect(reviewSection).toContain('allow read, write: if isAdmin();');
    });

    it('protects incident reports: authenticated create, admin update and delete', () => {
      const reportsSection = rules.slice(rules.indexOf('match /reports/{reportId}'));
      expect(reportsSection).toContain('allow create: if isAuthenticated() &&');
      expect(reportsSection).toContain('request.resource.data.reporterUid == request.auth.uid;');
      expect(reportsSection).toContain('allow update, delete: if isAdmin();');
    });

    it('prevents privilege escalation by denying client writes to /admins', () => {
      const adminsSection = rules.slice(rules.indexOf('match /admins/{userId}'));
      expect(adminsSection).toContain('allow write: if false;');
      expect(adminsSection).toContain('allow read: if isAuthenticated();');
    });

    it('enforces cross-tenant isolation on organisation status and member profile modifications', () => {
      const orgSection = rules.slice(rules.indexOf('match /organisations/{orgId}'));
      expect(orgSection).toContain('allow update: if isAdmin() || (');
      expect(orgSection).toContain('isOrgMember(orgId)');
      expect(orgSection).toContain('allow delete: if false;');
    });
  });

  describe('State Machine & Transition Logic', () => {
    it('validates allowed listing lifecycle state transitions', () => {
      expect(canTransitionListing('draft', 'published')).toBe(true);
      expect(canTransitionListing('published', 'claimed')).toBe(true);
      expect(canTransitionListing('claimed', 'handover_pending')).toBe(true);
      expect(canTransitionListing('handover_pending', 'completed')).toBe(true);

      // Terminal and invalid transitions
      expect(canTransitionListing('completed', 'published')).toBe(false);
      expect(canTransitionListing('draft', 'completed')).toBe(false);
      expect(canTransitionListing('expired', 'claimed')).toBe(false);
    });

    it('validates allowed claim handover state transitions', () => {
      expect(canTransitionClaim('claimed', 'donor_confirmed')).toBe(true);
      expect(canTransitionClaim('claimed', 'recipient_confirmed')).toBe(true);
      expect(canTransitionClaim('donor_confirmed', 'completed')).toBe(true);
      expect(canTransitionClaim('completed', 'claimed')).toBe(false);
    });

    it('validates organisation status transitions', () => {
      expect(canTransitionOrg('pending', 'approved')).toBe(true);
      expect(canTransitionOrg('approved', 'suspended')).toBe(true);
      expect(canTransitionOrg('suspended', 'approved')).toBe(true);
      expect(canTransitionOrg('pending', 'completed')).toBe(false);
    });
  });

  describe('Schema Constants Integrity', () => {
    it('defines valid statuses and roles matching PRD and Database Schema', () => {
      expect(USER_STATUSES).toEqual(['pending', 'active', 'suspended']);
      expect(ORG_TYPES).toEqual(['donor', 'recipient', 'farm', 'facility']);
      expect(ORG_STATUSES).toEqual(['pending', 'approved', 'suspended']);
      expect(MEMBERSHIP_ROLES).toContain('donor');
      expect(MEMBERSHIP_ROLES).toContain('recipient');
      expect(MEMBERSHIP_ROLES).toContain('mess_operator');
      expect(LISTING_STATUSES).toContain('published');
      expect(ROUTE_TIERS).toEqual(['human', 'animal', 'organic']);
      expect(CLAIM_STATUSES).toContain('completed');
    });

    it('contains complete field allowlists for all 10 collections', () => {
      expect(ALLOWED_FIELDS.users).toBeDefined();
      expect(ALLOWED_FIELDS.organisations).toBeDefined();
      expect(ALLOWED_FIELDS.memberships).toBeDefined();
      expect(ALLOWED_FIELDS.listings).toBeDefined();
      expect(ALLOWED_FIELDS.listingFulfillment).toBeDefined();
      expect(ALLOWED_FIELDS.claims).toBeDefined();
      expect(ALLOWED_FIELDS.messRecords).toBeDefined();
      expect(ALLOWED_FIELDS.notifications).toBeDefined();
      expect(ALLOWED_FIELDS.reports).toBeDefined();
      expect(ALLOWED_FIELDS.verificationReviews).toBeDefined();
      expect(ALLOWED_FIELDS.auditEvents).toBeDefined();
      expect(ALLOWED_FIELDS.impactFactors).toBeDefined();
    });
  });
});
