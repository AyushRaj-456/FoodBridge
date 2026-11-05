import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as firestore from 'firebase/firestore';
import {
  updateOrganisationStatus,
  moderateListing,
  submitIncidentReport,
  resolveIncidentReport,
  logAuditEvent,
  fetchAuditEvents,
  fetchIncidentReports,
  fetchListingsForModeration,
  verifyAdminRole,
  assertAdminAuthorization,
  assertTenantOwnership,
  assertNoClientAdminWrite,
  REPORT_CATEGORIES,
  REPORT_TARGET_TYPES,
  MODERATION_ACTIONS,
  REPORT_RESOLUTIONS,
} from './adminService.js';
import AdminShell from './AdminShell.jsx';
import * as AuthHookModule from '../auth/useAuth.js';

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    connectFirestoreEmulator: vi.fn(),
    collection: vi.fn((_db, name) => ({ id: name, path: name })),
    doc: vi.fn((...args) => {
      if (args.length === 1) {
        const coll = args[0];
        const collName = coll?.id || coll?.path || 'unknown';
        return { path: `${collName}/mock-auto-id`, id: 'mock-auto-id' };
      }
      if (args.length === 2) {
        const [coll, id] = args;
        const collName = typeof coll === 'string' ? coll : coll?.id || coll?.path || 'unknown';
        return { path: `${collName}/${id || 'mock-auto-id'}`, id: id || 'mock-auto-id' };
      }
      const [, coll, id] = args;
      const collName = typeof coll === 'string' ? coll : coll?.id || coll?.path || 'unknown';
      return { path: `${collName}/${id || 'mock-auto-id'}`, id: id || 'mock-auto-id' };
    }),
    setDoc: vi.fn().mockResolvedValue(true),
    updateDoc: vi.fn().mockResolvedValue(true),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn((...args) => args),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    orderBy: vi.fn((field, dir) => ({ field, dir })),
    limit: vi.fn((count) => ({ count })),
    serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  };
});

describe('Admin & Moderation Service — Prompt 17 Security & Operations', () => {
  const mockAdminUser = {
    uid: 'admin-console-uid-001',
    email: 'admin@foodbridge.org',
    displayName: 'Console Administrator',
  };

  const mockNormalUser = {
    uid: 'normal-user-101',
    email: 'user@example.com',
    displayName: 'Regular User',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Console-Provisioned Admin Authorization & Privilege Escalation Defenses', () => {
    it('assertAdminAuthorization succeeds for console-provisioned admin', () => {
      expect(() => assertAdminAuthorization(mockAdminUser, true)).not.toThrow();
    });

    it('assertAdminAuthorization rejects non-admin users attempting privileged action', () => {
      expect(() => assertAdminAuthorization(mockNormalUser, false)).toThrow(
        /Action requires console-provisioned administrator privileges/i
      );
    });

    it('assertAdminAuthorization rejects unauthenticated requests', () => {
      expect(() => assertAdminAuthorization(null, false)).toThrow(
        /Authentication required for administrative operations/i
      );
    });

    it('assertNoClientAdminWrite permanently blocks client-side write attempts to /admins', () => {
      expect(() => assertNoClientAdminWrite()).toThrow(
        /Client writes to the admins collection are permanently forbidden/i
      );
    });

    it('verifyAdminRole returns true when admins doc exists in Firestore', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ isAdmin: true }),
      });

      const isAdmin = await verifyAdminRole('admin-console-uid-001');
      expect(isAdmin).toBe(true);
      expect(firestore.doc).toHaveBeenCalledWith(
        expect.anything(),
        'admins',
        'admin-console-uid-001'
      );
    });

    it('verifyAdminRole returns false when admins doc is missing', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const isAdmin = await verifyAdminRole('normal-user-101');
      expect(isAdmin).toBe(false);
    });
  });

  describe('IDOR & Cross-Tenant Access Protections', () => {
    it('assertTenantOwnership succeeds when user has active membership in target org', () => {
      const userMemberships = [
        { orgId: 'org-tenant-alpha', uid: mockNormalUser.uid, status: 'active' },
      ];

      expect(() =>
        assertTenantOwnership(mockNormalUser, 'org-tenant-alpha', userMemberships)
      ).not.toThrow();
    });

    it('assertTenantOwnership throws Cross-Tenant error when user belongs to different org', () => {
      const userMemberships = [
        { orgId: 'org-tenant-alpha', uid: mockNormalUser.uid, status: 'active' },
      ];

      expect(() =>
        assertTenantOwnership(mockNormalUser, 'org-tenant-beta', userMemberships)
      ).toThrow(/Cross-Tenant Access Denied/i);
    });

    it('assertTenantOwnership rejects pending or suspended memberships', () => {
      const userMemberships = [
        { orgId: 'org-tenant-alpha', uid: mockNormalUser.uid, status: 'pending' },
      ];

      expect(() =>
        assertTenantOwnership(mockNormalUser, 'org-tenant-alpha', userMemberships)
      ).toThrow(/Cross-Tenant Access Denied/i);
    });
  });

  describe('Organisation Status & Offline Verification Reviews', () => {
    const checklist = {
      legalRegistrationVerified: true,
      contactDetailsConfirmed: true,
      foodSafetyHandlingConfirmed: true,
      routeTierComplianceConfirmed: true,
      offlineInspectionVerified: true,
    };

    it('updates organisation status to approved, writes verification review, and logs audit event', async () => {
      const result = await updateOrganisationStatus({
        orgId: 'org-ngo-01',
        status: 'approved',
        reason: 'Physical site inspection completed and FSSAI hygiene certificate verified.',
        checklist,
        adminUser: mockAdminUser,
      });

      expect(result.status).toBe('approved');
      expect(result.orgId).toBe('org-ngo-01');

      // 1. Verification review recorded
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('verificationReviews') }),
        expect.objectContaining({
          orgId: 'org-ngo-01',
          reviewerUid: mockAdminUser.uid,
          decision: 'approved',
          checklist: expect.objectContaining({ legalRegistrationVerified: true }),
        })
      );

      // 2. Organisation document updated
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'organisations/org-ngo-01' }),
        expect.objectContaining({
          status: 'approved',
        })
      );

      // 3. System audit event logged
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('auditEvents') }),
        expect.objectContaining({
          actorUid: mockAdminUser.uid,
          action: 'ORG_STATUS_APPROVED',
          resourceType: 'organisations',
          resourceId: 'org-ngo-01',
        })
      );
    });

    it('updates organisation status to suspended with required notes', async () => {
      const result = await updateOrganisationStatus({
        orgId: 'org-donor-02',
        status: 'suspended',
        reason: 'Repeated late cancellations during emergency food dispatch window.',
        checklist: {},
        adminUser: mockAdminUser,
      });

      expect(result.status).toBe('suspended');
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'organisations/org-donor-02' }),
        expect.objectContaining({ status: 'suspended' })
      );
    });

    it('rejects updateOrganisationStatus when reviewer is non-admin', async () => {
      await expect(
        updateOrganisationStatus({
          orgId: 'org-ngo-01',
          status: 'approved',
          reason: 'Valid reason exceeding ten characters.',
          adminUser: null,
        })
      ).rejects.toThrow(/Authentication required for administrative operations/i);
    });

    it('rejects updateOrganisationStatus when inspection reason is shorter than 10 characters', async () => {
      await expect(
        updateOrganisationStatus({
          orgId: 'org-ngo-01',
          status: 'approved',
          reason: 'Too brief',
          adminUser: mockAdminUser,
        })
      ).rejects.toThrow(/Mandatory inspection reason must be at least 10 characters/i);
    });

    it('rejects invalid organisation status values', async () => {
      await expect(
        updateOrganisationStatus({
          orgId: 'org-ngo-01',
          status: 'invalid_status',
          reason: 'Valid inspection reason exceeds 10 characters.',
          adminUser: mockAdminUser,
        })
      ).rejects.toThrow(/Invalid organisation status/i);
    });
  });

  describe('Listing Moderation & Safety Withdrawals', () => {
    it('allows administrator to withdraw an active listing with reason and logs audit event', async () => {
      const result = await moderateListing({
        listingId: 'lst-101',
        action: 'withdrawn',
        reason: 'Reported storage temperature violation observed by kitchen staff.',
        adminUser: mockAdminUser,
      });

      expect(result.listingId).toBe('lst-101');
      expect(result.status).toBe('withdrawn');
      expect(result.withdrawalReason).toContain('Reported storage temperature violation');

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'listings/lst-101' }),
        expect.objectContaining({
          status: 'withdrawn',
          moderatedBy: mockAdminUser.uid,
        })
      );

      // Audit event
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('auditEvents') }),
        expect.objectContaining({
          actorUid: mockAdminUser.uid,
          action: 'LISTING_MODERATED_WITHDRAWN',
          resourceType: 'listings',
          resourceId: 'lst-101',
        })
      );
    });

    it('allows administrator to flag a listing', async () => {
      const result = await moderateListing({
        listingId: 'lst-102',
        action: 'flagged',
        reason: 'Under review for potential allergen omission in description.',
        adminUser: mockAdminUser,
      });

      expect(result.status).toBe('flagged');
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'listings/lst-102' }),
        expect.objectContaining({ status: 'flagged' })
      );
    });

    it('rejects listing moderation by non-admin', async () => {
      await expect(
        moderateListing({
          listingId: 'lst-101',
          action: 'withdrawn',
          reason: 'Valid withdrawal reason here.',
          adminUser: null,
        })
      ).rejects.toThrow(/Authentication required for administrative operations/i);
    });

    it('rejects moderation with invalid action or short reason', async () => {
      await expect(
        moderateListing({
          listingId: 'lst-101',
          action: 'unsupported_action',
          reason: 'Valid reason here',
          adminUser: mockAdminUser,
        })
      ).rejects.toThrow(/Invalid moderation action/i);

      await expect(
        moderateListing({
          listingId: 'lst-101',
          action: 'withdrawn',
          reason: 'Tiny',
          adminUser: mockAdminUser,
        })
      ).rejects.toThrow(/Moderation reason must be at least 5 characters/i);
    });
  });

  describe('Incident & Community Safety Reports', () => {
    it('allows authenticated users to submit incident reports and logs audit event', async () => {
      const report = await submitIncidentReport({
        targetType: 'listing',
        targetId: 'lst-202',
        category: 'Hygiene Concern',
        description: 'Food transport container did not appear sanitized upon collection.',
        reporterUid: mockNormalUser.uid,
      });

      expect(report.id).toBeDefined();
      expect(report.reporterUid).toBe(mockNormalUser.uid);
      expect(report.status).toBe('pending');
      expect(report.category).toBe('Hygiene Concern');

      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('reports') }),
        expect.objectContaining({
          reporterUid: mockNormalUser.uid,
          targetType: 'listing',
          category: 'Hygiene Concern',
          status: 'pending',
        })
      );

      // Audit event
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('auditEvents') }),
        expect.objectContaining({
          actorUid: mockNormalUser.uid,
          action: 'REPORT_SUBMITTED',
          resourceType: 'reports',
        })
      );
    });

    it('rejects report submission without authenticated user', async () => {
      await expect(
        submitIncidentReport({
          targetType: 'listing',
          category: 'Hygiene Concern',
          description: 'Long enough description for testing.',
          reporterUid: null,
        })
      ).rejects.toThrow(/Authentication required to submit an incident report/i);
    });

    it('rejects invalid category or target type', async () => {
      await expect(
        submitIncidentReport({
          targetType: 'invalid_type',
          category: 'Hygiene Concern',
          description: 'Valid length description here.',
          reporterUid: mockNormalUser.uid,
        })
      ).rejects.toThrow(/Invalid target type/i);

      await expect(
        submitIncidentReport({
          targetType: 'listing',
          category: 'FakeCategory',
          description: 'Valid length description here.',
          reporterUid: mockNormalUser.uid,
        })
      ).rejects.toThrow(/Invalid report category/i);
    });

    it('rejects report description under 10 characters', async () => {
      await expect(
        submitIncidentReport({
          targetType: 'listing',
          category: 'Hygiene Concern',
          description: 'Short',
          reporterUid: mockNormalUser.uid,
        })
      ).rejects.toThrow(/Report description must be at least 10 characters/i);
    });

    it('allows administrator to resolve incident reports and logs audit event', async () => {
      const resolved = await resolveIncidentReport({
        reportId: 'rep-99',
        resolution: 'resolved',
        resolutionNotes: 'Donor kitchen re-inspected; corrective hygiene training completed.',
        adminUser: mockAdminUser,
      });

      expect(resolved.id).toBe('rep-99');
      expect(resolved.status).toBe('resolved');
      expect(resolved.resolvedBy).toBe(mockAdminUser.uid);

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'reports/rep-99' }),
        expect.objectContaining({
          status: 'resolved',
          resolvedBy: mockAdminUser.uid,
        })
      );

      // Audit event
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('auditEvents') }),
        expect.objectContaining({
          actorUid: mockAdminUser.uid,
          action: 'REPORT_RESOLVED',
          resourceType: 'reports',
          resourceId: 'rep-99',
        })
      );
    });

    it('rejects report resolution by non-admin', async () => {
      await expect(
        resolveIncidentReport({
          reportId: 'rep-99',
          resolution: 'resolved',
          adminUser: null,
        })
      ).rejects.toThrow(/Authentication required for administrative operations/i);
    });

    it('rejects invalid report resolution status', async () => {
      await expect(
        resolveIncidentReport({
          reportId: 'rep-99',
          resolution: 'invalid_resolution',
          adminUser: mockAdminUser,
        })
      ).rejects.toThrow(/Invalid resolution/i);
    });
  });

  describe('Append-Only Audit Log Invariants', () => {
    it('records valid audit events with required actor and action', async () => {
      const event = await logAuditEvent({
        actorUid: mockAdminUser.uid,
        action: 'ORG_VERIFIED_APPROVED',
        resourceType: 'organisations',
        resourceId: 'org-test-1',
        summary: 'Manually verified via FSSAI database.',
      });

      expect(event.id).toBeDefined();
      expect(event.actorUid).toBe(mockAdminUser.uid);
      expect(event.action).toBe('ORG_VERIFIED_APPROVED');
      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: expect.stringContaining('auditEvents') }),
        expect.objectContaining({
          actorUid: mockAdminUser.uid,
          action: 'ORG_VERIFIED_APPROVED',
        })
      );
    });

    it('rejects audit event creation missing required fields', async () => {
      await expect(
        logAuditEvent({
          actorUid: '',
          action: 'TEST',
          resourceType: 'listings',
          resourceId: 'lst-1',
        })
      ).rejects.toThrow(/requires actorUid/i);

      await expect(
        logAuditEvent({
          actorUid: 'usr-1',
          action: '',
          resourceType: 'listings',
          resourceId: 'lst-1',
        })
      ).rejects.toThrow(/requires action/i);

      await expect(
        logAuditEvent({
          actorUid: 'usr-1',
          action: 'TEST',
          resourceType: '',
          resourceId: 'lst-1',
        })
      ).rejects.toThrow(/requires resourceType/i);

      await expect(
        logAuditEvent({
          actorUid: 'usr-1',
          action: 'TEST',
          resourceType: 'listings',
          resourceId: '',
        })
      ).rejects.toThrow(/requires resourceId/i);
    });

    it('fetches audit events using ordered query with quota-safe limits', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'aud-1',
            data: () => ({
              action: 'ORG_STATUS_APPROVED',
              actorUid: 'admin-1',
              createdAt: '2026-11-05T10:00:00Z',
            }),
          },
        ],
      });

      const events = await fetchAuditEvents({ limitCount: 20 });
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('aud-1');
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(firestore.limit).toHaveBeenCalledWith(20);
    });
  });

  describe('Query Functions & Data Retrieval', () => {
    it('fetchIncidentReports queries reports with optional status filter', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'rep-1',
            data: () => ({ category: 'Hygiene Concern', status: 'pending' }),
          },
        ],
      });

      const reports = await fetchIncidentReports({ statusFilter: 'pending' });
      expect(reports).toHaveLength(1);
      expect(firestore.where).toHaveBeenCalledWith('status', '==', 'pending');
    });

    it('fetchListingsForModeration queries listings with optional status filter', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'lst-1',
            data: () => ({ title: 'Dal Makhani', status: 'published' }),
          },
        ],
      });

      const listings = await fetchListingsForModeration({ statusFilter: 'published' });
      expect(listings).toHaveLength(1);
      expect(firestore.where).toHaveBeenCalledWith('status', '==', 'published');
    });

    it('exports all standard categories and types', () => {
      expect(REPORT_CATEGORIES).toContain('Hygiene Concern');
      expect(REPORT_CATEGORIES).toContain('Late Collection');
      expect(REPORT_TARGET_TYPES).toContain('listing');
      expect(REPORT_TARGET_TYPES).toContain('recipient');
      expect(MODERATION_ACTIONS).toEqual(['withdrawn', 'flagged']);
      expect(REPORT_RESOLUTIONS).toEqual(['resolved', 'investigated', 'dismissed']);
    });
  });

  describe('AdminShell UI Integration', () => {
    it('blocks non-admin users and shows Firebase Console instructions', () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockNormalUser,
        isAdmin: false,
      });

      render(<AdminShell activeTab="moderate-listings" />);

      expect(screen.getByText(/Console Admin Provisioning Required/i)).toBeDefined();
      expect(
        screen.getByText(
          /administrator privileges are strictly provisioned manually in the Firebase Console/i
        )
      ).toBeDefined();
    });

    it('allows admin to withdraw a listing via UI and updates notice', async () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockAdminUser,
        isAdmin: true,
      });

      render(<AdminShell activeTab="moderate-listings" />);

      expect(screen.getByText(/Active Listings Moderation/i)).toBeDefined();
      expect(screen.getByText('Steamed Rice & Dal Tadka')).toBeDefined();

      const withdrawBtns = screen.getAllByRole('button', { name: /Withdraw/i });
      fireEvent.click(withdrawBtns[0]);

      expect(screen.getByText(/withdrawn by administrator/i)).toBeDefined();
    });

    it('allows admin to mark an incident report resolved via UI', async () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockAdminUser,
        isAdmin: true,
      });

      render(<AdminShell activeTab="incident-reports" />);

      expect(screen.getByText(/Community Incident & Safety Reports/i)).toBeDefined();

      const resolveBtns = screen.getAllByRole('button', { name: /Mark Resolved/i });
      fireEvent.click(resolveBtns[0]);

      await waitFor(() => {
        expect(screen.getAllByText('Resolved')[0]).toBeDefined();
      });
    });

    it('displays the Spark quota headroom and append-only audit trail in system audit tab', () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockAdminUser,
        isAdmin: true,
      });

      render(<AdminShell activeTab="system-audit" />);

      expect(screen.getByText(/System Audit & Firebase Spark ₹0 Quota Checklist/i)).toBeDefined();
      expect(screen.getByText(/Firestore Reads \(50k limit\)/i)).toBeDefined();
      expect(screen.getByText(/Append-Only Security Audit Log/i)).toBeDefined();
      expect(screen.getByText(/Events emitted on sensitive status transitions/i)).toBeDefined();
    });
  });
});
