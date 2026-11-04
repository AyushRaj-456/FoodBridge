import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminShell from './AdminShell.jsx';
import VerificationQueue from './VerificationQueue.jsx';
import VerificationModal from './VerificationModal.jsx';
import * as AuthHookModule from '../auth/useAuth.js';
import * as orgServiceModule from '../organisations/orgService.js';

describe('Admin Verification & Moderation — Spark ₹0 Baseline', () => {
  const mockAdminUser = {
    uid: 'admin-console-uid-001',
    email: 'admin@foodbridge.org',
    displayName: 'Console Administrator',
  };

  const sampleOrg = {
    id: 'org-test-99',
    type: 'recipient',
    legalName: 'Jan Kalyan Trust',
    displayName: 'Jan Kalyan Kitchen',
    regNumber: 'TRUST-DEL-2022-19',
    addressText: '44 Civil Lines, New Delhi',
    contactPerson: 'Mr. Arvind Gupta',
    contactPhone: '+91 99112 23344',
    contactEmail: 'arvind@jankalyan.org',
    capacity: '150 meals/day',
    status: 'pending',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Admin Access & Console-Provisioning Invariant', () => {
    it('blocks non-admin users and displays console-provisioning instructions', () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'normal-user-1', email: 'user@example.com' },
        isAdmin: false,
      });

      render(<AdminShell activeTab="verification-queue" />);

      expect(screen.getByText(/Console Admin Provisioning Required/i)).toBeDefined();
      expect(
        screen.getByText(
          /administrator privileges are strictly provisioned manually in the Firebase Console/i
        )
      ).toBeDefined();
      expect(screen.getByText(/admins\/\{uid\}/i)).toBeDefined();
    });

    it('grants access when user has isAdmin: true', () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockAdminUser,
        isAdmin: true,
      });

      render(<AdminShell activeTab="verification-queue" />);

      expect(screen.getByText(/Administrative & Moderation Console/i)).toBeDefined();
      expect(screen.getByText(/Offline Organisation Verification Queue/i)).toBeDefined();
    });
  });

  describe('VerificationModal Component', () => {
    beforeEach(() => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockAdminUser,
        isAdmin: true,
      });
    });

    it('renders all offline inspection checklist items', () => {
      render(
        <VerificationModal org={sampleOrg} isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByText(/Offline Verification Review Checklist/i)).toBeDefined();
      expect(screen.getByText(/1\. Official Entity Registration Verified Offline/i)).toBeDefined();
      expect(screen.getByText(/2\. Primary Coordinator Authenticated/i)).toBeDefined();
      expect(screen.getByText(/3\. Safe Food Handling & Storage Capacity/i)).toBeDefined();
      expect(screen.getByText(/4\. Route Tier Suitability Confirmed/i)).toBeDefined();
      expect(screen.getByText(/5\. Strict Zero-Cost ₹0 Architecture Invariant/i)).toBeDefined();
    });

    it('requires minimum 10-character inspection reason before enabling submission', () => {
      render(
        <VerificationModal org={sampleOrg} isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const submitBtn = screen.getByRole('button', { name: /Record Verification Decision/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);

      const reasonInput = screen.getByLabelText(/Audit Inspection Reason & Notes/i);
      fireEvent.change(reasonInput, { target: { value: 'Too short' } });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);

      fireEvent.change(reasonInput, {
        target: {
          value: 'Verified registration with Delhi Trust portal and confirmed cold storage pantry.',
        },
      });
      expect(submitBtn.hasAttribute('disabled')).toBe(false);
    });

    it('calls submitVerificationReview with reviewer UID, checklist, decision, and reason', async () => {
      const mockSubmit = vi.spyOn(orgServiceModule, 'submitVerificationReview').mockResolvedValue({
        reviewId: 'rev-101',
        orgId: sampleOrg.id,
        decision: 'approved',
      });

      const handleSuccess = vi.fn();
      const handleClose = vi.fn();

      render(
        <VerificationModal
          org={sampleOrg}
          isOpen={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      );

      const reasonInput = screen.getByLabelText(/Audit Inspection Reason & Notes/i);
      fireEvent.change(reasonInput, {
        target: { value: 'Inspected physical premises and verified FSSAI credentials on call.' },
      });

      const submitBtn = screen.getByRole('button', { name: /Record Verification Decision/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          orgId: sampleOrg.id,
          reviewerUid: mockAdminUser.uid,
          checklist: expect.objectContaining({
            legalRegistrationVerified: true,
            contactDetailsConfirmed: true,
            foodSafetyHandlingConfirmed: true,
            routeTierComplianceConfirmed: true,
            offlineInspectionVerified: true,
          }),
          decision: 'approved',
          reason: 'Inspected physical premises and verified FSSAI credentials on call.',
        });
      });

      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('VerificationQueue Component', () => {
    beforeEach(() => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: mockAdminUser,
        isAdmin: true,
      });
      vi.spyOn(orgServiceModule, 'fetchAllOrganisations').mockResolvedValue([
        sampleOrg,
        {
          id: 'org-test-approved',
          type: 'donor',
          legalName: 'Campus Dining Ltd',
          displayName: 'Dining Hall 1',
          status: 'approved',
          addressText: 'Campus Centre',
        },
      ]);
    });

    it('displays the list of organisations and filters by status tab', async () => {
      render(<VerificationQueue />);

      await waitFor(() => {
        expect(screen.getByText('Jan Kalyan Kitchen')).toBeDefined();
      });

      // Filter by Approved
      const approvedTab = screen.getByRole('tab', { name: /Approved/i });
      fireEvent.click(approvedTab);

      await waitFor(() => {
        expect(screen.getByText('Dining Hall 1')).toBeDefined();
        expect(screen.queryByText('Jan Kalyan Kitchen')).toBeNull();
      });
    });

    it('opens the review modal when clicking Review & Verify on a pending organisation', async () => {
      render(<VerificationQueue />);

      await waitFor(() => {
        expect(screen.getByText('Jan Kalyan Kitchen')).toBeDefined();
      });

      const reviewBtn = screen.getByRole('button', { name: /Review & Verify/i });
      fireEvent.click(reviewBtn);

      await waitFor(() => {
        expect(screen.getByText(/Offline Verification Review Checklist/i)).toBeDefined();
      });
    });

    it('displays the Spark ₹0 quota safety budget card', async () => {
      render(<VerificationQueue />);

      expect(screen.getByText(/Daily Spark ₹0 Quota Safety Budget/i)).toBeDefined();
      expect(screen.getByText(/Firestore Reads \(Spark Limit 50k\/day\)/i)).toBeDefined();
      expect(screen.getByText(/Document Scans & Uploads/i)).toBeDefined();
    });
  });
});
