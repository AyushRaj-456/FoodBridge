import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import ListingShell from '../../features/listings/ListingShell.jsx';
import FeedShell from '../../features/matching/FeedShell.jsx';
import MessShell from '../../features/mess-analytics/MessShell.jsx';
import AdminShell from '../../features/admin/AdminShell.jsx';
import InfoView from '../../features/common/InfoView.jsx';
import * as AuthHookModule from '../../features/auth/useAuth.js';

describe('Design System & Page Inventory — Calm Civic Utility', () => {
  describe('Reusable Core State & Feedback Components', () => {
    it('renders EmptyState with accessible role and action trigger', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No surplus available"
          description="Check back later."
          actionLabel="Refresh feed"
          onAction={handleAction}
        />
      );

      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText('No surplus available')).toBeDefined();
      expect(screen.getByText('Check back later.')).toBeDefined();

      const btn = screen.getByRole('button', { name: 'Refresh feed' });
      fireEvent.click(btn);
      expect(handleAction).toHaveBeenCalled();
    });

    it('renders LoadingState with aria-live="polite"', () => {
      render(<LoadingState message="Fetching records..." />);
      const el = screen.getByRole('status');
      expect(el.getAttribute('aria-live')).toBe('polite');
      expect(screen.getByText('Fetching records...')).toBeDefined();
    });

    it('renders ErrorState with alert role and retry callback', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Network Error"
          message="Could not reach Firestore emulator."
          onRetry={handleRetry}
        />
      );

      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Network Error')).toBeDefined();

      const retryBtn = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it('renders StatusBadge with explicit text for all statuses', () => {
      const { rerender } = render(<StatusBadge status="published" />);
      expect(screen.getByText('Published')).toBeDefined();

      rerender(<StatusBadge status="claimed" />);
      expect(screen.getByText('Claimed')).toBeDefined();

      rerender(<StatusBadge status="completed" />);
      expect(screen.getByText('Completed')).toBeDefined();

      rerender(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending Review')).toBeDefined();

      rerender(<StatusBadge status="suspended" />);
      expect(screen.getByText('Suspended')).toBeDefined();
    });

    it('renders ConfirmDialog and responds to Escape key and confirm action', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          title="Withdraw Listing?"
          message="This action is irreversible."
          confirmLabel="Yes, Withdraw"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isDestructive={true}
        />
      );

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByText('Withdraw Listing?')).toBeDefined();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleCancel).toHaveBeenCalled();

      // Click Confirm
      const confirmBtn = screen.getByRole('button', { name: 'Yes, Withdraw' });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalled();
    });
  });

  describe('Donor Operations Screens (ListingShell)', () => {
    it('renders active listings and supports text filtering', () => {
      render(<ListingShell activeTab="active-listings" />);

      expect(screen.getByText('Active Surplus Listings')).toBeDefined();
      expect(screen.getByText('Cooked Rice & Yellow Dal Tadka')).toBeDefined();

      const searchInput = screen.getByPlaceholderText(/Filter listings/i);
      fireEvent.change(searchInput, { target: { value: 'Roti' } });

      expect(screen.getByText('Assorted Roti & Chapati Pack')).toBeDefined();
      expect(screen.queryByText('Cooked Rice & Yellow Dal Tadka')).toBeNull();
    });

    it('validates surplus declaration form and requires positive quantities', () => {
      const { container } = render(<ListingShell activeTab="create-listing" />);

      expect(screen.getByText(/Declare Food Surplus \(New Listing\)/i)).toBeDefined();
      expect(screen.getByText(/Food Safety & Freshness Declaration/i)).toBeDefined();

      const form = container.querySelector('form');
      const titleInput = screen.getByLabelText(/Surplus Food Description/i);
      fireEvent.change(titleInput, { target: { value: 'Fresh Pulao' } });

      const qtyInput = screen.getByLabelText(/Quantity/i);
      fireEvent.change(qtyInput, { target: { value: '-5' } });

      fireEvent.submit(form);
      expect(screen.getByText(/Quantity must be a positive number/i)).toBeDefined();
    });

    it('renders pickup coordination and donation history tabs', () => {
      const { rerender } = render(<ListingShell activeTab="pickup-status" />);
      expect(screen.getByText(/Pickup Coordination & Handover/i)).toBeDefined();
      expect(screen.getByText(/Handover Checklist:/i)).toBeDefined();

      rerender(<ListingShell activeTab="donor-history" />);
      expect(screen.getByText(/Surplus Donation History/i)).toBeDefined();
      expect(screen.getByText('Mixed Vegetable Curry & Rice')).toBeDefined();
    });
  });

  describe('Recipient NGO Screens (FeedShell)', () => {
    it('renders surplus opportunities and dietary preference filters', () => {
      render(<FeedShell activeTab="available-feed" initialOrgStatus="approved" />);

      expect(screen.getByText(/Available Food Nearby/i)).toBeDefined();
      expect(screen.getByText(/Prepared Meals: Steamed Rice & Dal Tadka/i)).toBeDefined();
      expect(screen.getByText(/Approx\. 1\.2 km away/i)).toBeDefined();
    });

    it('renders active claims with exact pickup location reveal', () => {
      render(<FeedShell activeTab="my-claims" initialOrgStatus="approved" />);

      expect(screen.getByText(/My Active Claims/i)).toBeDefined();
      expect(screen.getByText(/Exact Pickup Location:/i)).toBeDefined();
      expect(screen.getByText(/North Campus Dining Complex, Kitchen Door 2/i)).toBeDefined();
    });

    it('renders dual confirmation handover panel and logs actual received quantity', () => {
      render(<FeedShell activeTab="handover-confirm" initialOrgStatus="approved" />);

      expect(screen.getByText(/Handover & Dual Confirmation/i)).toBeDefined();
      expect(screen.getByLabelText(/Actual Received Quantity/i)).toBeDefined();

      const confirmBtn = screen.getByRole('button', {
        name: /Confirm Receipt & Complete Handover/i,
      });
      fireEvent.click(confirmBtn);

      expect(screen.getByText(/Handover Recorded & Completed!/i)).toBeDefined();
    });
  });

  describe('Mess Analytics Screens (MessShell)', () => {
    it('enforces non-negative validation on meal production logging', () => {
      render(<MessShell activeTab="meal-entry" />);

      expect(screen.getByText(/Log Daily Meal Service Record/i)).toBeDefined();

      const dishInput = screen.getByLabelText(/Dish \/ Menu Item/i);
      fireEvent.change(dishInput, { target: { value: 'Dal Khichdi' } });

      const prepInput = screen.getByLabelText(/Prepared Quantity/i);
      fireEvent.change(prepInput, { target: { value: '-10' } });

      const servedInput = screen.getByLabelText(/Served \/ Consumed/i);
      fireEvent.change(servedInput, { target: { value: '5' } });

      const leftoverInput = screen.getByLabelText(/Unserved Leftover/i);
      fireEvent.change(leftoverInput, { target: { value: '0' } });

      const form = screen.getByRole('button', { name: /Save Production Record/i }).closest('form');
      fireEvent.submit(form);

      expect(screen.getByText(/All quantities must be non-negative numbers/i)).toBeDefined();
    });

    it('displays 14-day data completeness prerequisite on advisory forecast', () => {
      render(<MessShell activeTab="advisory-forecast" />);

      expect(screen.getByText(/Production Advisory & Forecasting/i)).toBeDefined();
      expect(
        screen.getByText(/Advisory Gated: Awaiting 14-Day Minimum Historical Data/i)
      ).toBeDefined();
      expect(screen.getByText(/FoodBridge does not fabricate predictive forecasts/i)).toBeDefined();
    });
  });

  describe('Admin Operations Screens (AdminShell)', () => {
    beforeEach(() => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'admin-01' },
        isAdmin: true,
      });
    });

    it('renders active listings moderation and allows administrative withdrawal', () => {
      render(<AdminShell activeTab="moderate-listings" />);

      expect(screen.getByText(/Active Listings Moderation/i)).toBeDefined();
      expect(screen.getByText('Steamed Rice & Dal Tadka')).toBeDefined();

      const withdrawBtn = screen.getAllByRole('button', { name: /Withdraw/i })[0];
      fireEvent.click(withdrawBtn);

      expect(screen.getByText(/withdrawn by administrator/i)).toBeDefined();
    });

    it('renders incident safety reports and allows marking resolved', () => {
      render(<AdminShell activeTab="incident-reports" />);

      expect(screen.getByText(/Community Incident & Safety Reports/i)).toBeDefined();
      expect(screen.getAllByText(/Hygiene Concern/i)[0]).toBeDefined();

      const resolveBtn = screen.getAllByRole('button', { name: /Mark Resolved/i })[0];
      fireEvent.click(resolveBtn);

      expect(screen.getAllByText('Resolved')[0]).toBeDefined();
    });

    it('displays the system health audit and append-only audit events', () => {
      render(<AdminShell activeTab="system-audit" />);

      expect(screen.getByText(/System Health & Security Audit Log/i)).toBeDefined();
      expect(screen.getByText(/Database Sync Operations/i)).toBeDefined();
      expect(screen.getByText(/Local Verified Snapshots/i)).toBeDefined();
      expect(screen.getByText(/Append-Only Security Audit Log/i)).toBeDefined();
    });
  });

  describe('Common Info Screens (InfoView)', () => {
    it('renders privacy, SOP help, and terms of service views', () => {
      const { rerender } = render(<InfoView type="privacy" />);
      expect(screen.getByText(/Privacy, Retention & Data Minimisation/i)).toBeDefined();

      rerender(<InfoView type="help" />);
      expect(screen.getByText(/Pilot Standard Operating Procedure \(SOP\)/i)).toBeDefined();

      rerender(<InfoView type="terms" />);
      expect(
        screen.getByText(/Community Terms of Service & Good Samaritan Protection/i)
      ).toBeDefined();
    });
  });
});
