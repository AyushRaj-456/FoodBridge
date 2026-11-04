import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrgOnboardingForm from './OrgOnboardingForm.jsx';
import { canRecipientClaim } from './orgService.js';
import FeedShell from '../matching/FeedShell.jsx';
import * as AuthHookModule from '../auth/useAuth.js';
import * as orgServiceModule from './orgService.js';

describe('Organisation Onboarding & Verification — ₹0 Spark Baseline', () => {
  const mockUser = {
    uid: 'user-pilot-123',
    email: 'coordinator@relief-ngo.org',
    displayName: 'Coordinator Sam',
  };

  beforeEach(() => {
    vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
      user: mockUser,
      profile: { status: 'active', displayName: 'Coordinator Sam' },
      isAdmin: false,
    });
  });

  describe('canRecipientClaim Invariant', () => {
    it('allows claiming ONLY if recipient organisation status is "approved"', () => {
      expect(canRecipientClaim('approved')).toBe(true);
      expect(canRecipientClaim('pending')).toBe(false);
      expect(canRecipientClaim('suspended')).toBe(false);
      expect(canRecipientClaim('')).toBe(false);
      expect(canRecipientClaim(null)).toBe(false);
      expect(canRecipientClaim(undefined)).toBe(false);
    });
  });

  describe('OrgOnboardingForm Component', () => {
    it('renders all four organization types: donor, recipient, farm, and facility', () => {
      render(<OrgOnboardingForm onCancel={vi.fn()} />);

      expect(screen.getByText('Food Donor')).toBeDefined();
      expect(screen.getByText('Food Relief NGO')).toBeDefined();
      expect(screen.getByText('Livestock / Cattle Farm')).toBeDefined();
      expect(screen.getByText('Compost & Bio-energy')).toBeDefined();
    });

    it('STRICT INVARIANT: does NOT contain any file or document upload inputs', () => {
      const { container } = render(<OrgOnboardingForm onCancel={vi.fn()} />);

      // FoodBridge must operate with zero cloud file storage on Spark
      const fileInputs = container.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBe(0);
    });

    it('displays the offline document verification notice highlighting ₹0 Spark compliance', () => {
      render(<OrgOnboardingForm onCancel={vi.fn()} />);

      expect(
        screen.getByText(/Offline Document Verification \(₹0 Zero-Cost Architecture\)/i)
      ).toBeDefined();
      expect(screen.getByText(/Do NOT attempt to upload scans or photos/i)).toBeDefined();
    });

    it('updates dynamic fields when switching between organisation types', () => {
      render(<OrgOnboardingForm onCancel={vi.fn()} />);

      // Default is Food Donor
      expect(screen.getByText(/FSSAI License \/ Institutional Reg No/i)).toBeDefined();

      // Click on Livestock Farm
      fireEvent.click(screen.getByText('Livestock / Cattle Farm'));
      expect(screen.getByText(/Farm Registry \/ Panchayat Animal Welfare License/i)).toBeDefined();
      expect(screen.getByText(/Cattle \/ Animal Head Count/i)).toBeDefined();

      // Click on Compost Facility
      fireEvent.click(screen.getByText('Compost & Bio-energy'));
      expect(screen.getByText(/Pollution Control \/ Solid Waste Facility Reg/i)).toBeDefined();
      expect(screen.getByText(/Daily Compost Processing Capacity/i)).toBeDefined();
    });

    it('prevents submission when offline verification declaration is not checked', async () => {
      render(<OrgOnboardingForm onCancel={vi.fn()} />);

      const submitBtn = screen.getByRole('button', { name: /Submit Application for Review/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    it('successfully calls createOrganisationApplication on valid submission', async () => {
      const mockCreate = vi
        .spyOn(orgServiceModule, 'createOrganisationApplication')
        .mockResolvedValue({
          orgId: 'org-test-777',
          legalName: 'Seva Relief Trust',
          status: 'pending',
        });

      render(<OrgOnboardingForm onCancel={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/Official Legal Entity Name/i), {
        target: { value: 'Seva Relief Trust' },
      });
      fireEvent.change(screen.getByLabelText(/Public Display \/ Common Name/i), {
        target: { value: 'Seva Kitchen' },
      });
      fireEvent.change(screen.getByLabelText(/License \/ Institutional Reg No/i), {
        target: { value: 'MH/2026/88991' },
      });
      fireEvent.change(screen.getByLabelText(/Physical Location & Street Address/i), {
        target: { value: 'Sector 4, University Road, Pune' },
      });
      fireEvent.change(screen.getByLabelText(/Authorized Contact Person/i), {
        target: { value: 'Sam Coordinator' },
      });
      fireEvent.change(screen.getByLabelText(/Contact Phone Number/i), {
        target: { value: '+91 98220 33445' },
      });
      fireEvent.change(screen.getByLabelText(/Official Entity Email/i), {
        target: { value: 'seva@relief.org' },
      });

      // Check declaration checkbox
      const declarationCheckbox = screen.getByRole('checkbox');
      fireEvent.click(declarationCheckbox);

      const submitBtn = screen.getByRole('button', { name: /Submit Application for Review/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(false);

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'donor',
            legalName: 'Seva Relief Trust',
            displayName: 'Seva Kitchen',
            addressText: 'Sector 4, University Road, Pune',
            contactPhone: '+91 98220 33445',
            contactEmail: 'seva@relief.org',
          }),
          mockUser
        );
      });

      // Verify success screen renders
      await waitFor(() => {
        expect(screen.getByText(/Application Submitted for Offline Review/i)).toBeDefined();
        expect(screen.getByText(/Status: Pending Verification/i)).toBeDefined();
      });
    });
  });

  describe('FeedShell Recipient Claiming Invariant', () => {
    it('disables claiming and displays warning banner when recipient organisation is pending', () => {
      render(<FeedShell activeTab="available-feed" initialOrgStatus="pending" />);

      expect(
        screen.getByText(/Recipient Verification Required \(Status: PENDING\)/i)
      ).toBeDefined();

      const claimBtn = screen.getAllByRole('button', {
        name: /Claims Disabled \(Unapproved\)/i,
      })[0];
      expect(claimBtn.hasAttribute('disabled')).toBe(true);
    });

    it('enables claiming when recipient organisation is approved', () => {
      render(<FeedShell activeTab="available-feed" initialOrgStatus="approved" />);

      expect(screen.queryByText(/Recipient Verification Required/i)).toBeNull();

      const claimBtn = screen.getAllByRole('button', { name: /Claim Surplus/i })[0];
      expect(claimBtn.hasAttribute('disabled')).toBe(false);

      fireEvent.click(claimBtn);
      expect(screen.getByText(/Claim initiated for/i)).toBeDefined();
    });

    it('disables claiming when recipient organisation is suspended', () => {
      render(<FeedShell activeTab="available-feed" initialOrgStatus="suspended" />);

      expect(
        screen.getByText(/Recipient Verification Required \(Status: SUSPENDED\)/i)
      ).toBeDefined();

      const claimBtn = screen.getAllByRole('button', {
        name: /Claims Disabled \(Unapproved\)/i,
      })[0];
      expect(claimBtn.hasAttribute('disabled')).toBe(true);
    });
  });
});
