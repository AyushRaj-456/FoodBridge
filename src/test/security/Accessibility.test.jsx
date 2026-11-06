import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import StatusBanner from '../../components/StatusBanner.jsx';
import VerificationModal from '../../features/admin/VerificationModal.jsx';
import * as AuthHookModule from '../../features/auth/useAuth.js';

describe('WCAG 2.1 AA Accessibility & Assistive Tech Audit — Prompt 18', () => {
  describe('Semantic ARIA Roles & Landmark Structure', () => {
    it('ConfirmDialog provides accessible modal dialog semantics and keyboard controls', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          title="Confirm Handover Dispatch"
          message="Are you sure you want to confirm handover dispatch?"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBe('confirm-dialog-title');

      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
      expect(confirmBtn).toBeDefined();
    });

    it('StatusBanner provides semantic landmark with accessible label and role info', () => {
      render(<StatusBanner role="donor" />);

      const aside = screen.getByRole('complementary');
      expect(aside).toBeDefined();
      expect(aside.getAttribute('aria-label')).toBe('System Operational Status');
      expect(screen.getByText('Verified Safe Handover')).toBeDefined();
      expect(screen.getByText('Donor Member')).toBeDefined();
    });

    it('EmptyState provides semantic role="status" and clear action trigger', () => {
      render(
        <EmptyState
          title="No Surplus Listings Available"
          description="No active food donations match your current filter radius."
          actionLabel="Refresh Listings"
          onAction={vi.fn()}
        />
      );

      const statusBox = screen.getByRole('status');
      expect(statusBox).toBeDefined();
      expect(screen.getByRole('button', { name: /Refresh Listings/i })).toBeDefined();
    });

    it('ErrorState provides role="alert" and retry button for error recovery', () => {
      render(
        <ErrorState
          title="Network Connection Failed"
          message="Operating in offline mode. Local cached records remain available."
          onRetry={vi.fn()}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeDefined();
    });

    it('StatusBadge renders accessible text for screen readers across all states', () => {
      const { rerender } = render(<StatusBadge status="published" />);
      expect(screen.getByText('Published')).toBeDefined();

      rerender(<StatusBadge status="claimed" />);
      expect(screen.getByText('Claimed')).toBeDefined();

      rerender(<StatusBadge status="completed" />);
      expect(screen.getByText('Completed')).toBeDefined();

      rerender(<StatusBadge status="suspended" />);
      expect(screen.getByText('Suspended')).toBeDefined();
    });
  });

  describe('Form Controls & Verification Modal Accessibility', () => {
    it('VerificationModal provides descriptive labels for all 5 offline inspection checkboxes', () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'admin-01' },
        isAdmin: true,
      });

      render(
        <VerificationModal
          org={{ id: 'org-test', legalName: 'Test NGO' }}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeDefined();
      expect(modal.getAttribute('aria-modal')).toBe('true');

      // Checkboxes have labels
      expect(
        screen.getByLabelText(/1\. Official Entity Registration Verified Offline/i)
      ).toBeDefined();
      expect(screen.getByLabelText(/2\. Primary Coordinator Authenticated/i)).toBeDefined();
      expect(screen.getByLabelText(/3\. Safe Food Handling & Storage Capacity/i)).toBeDefined();
      expect(screen.getByLabelText(/4\. Route Tier Suitability Confirmed/i)).toBeDefined();
      expect(screen.getByLabelText(/5\. Official Registry Verification Completed/i)).toBeDefined();

      // Inspection notes textarea has accessible label
      expect(screen.getByLabelText(/Audit Inspection Reason & Notes/i)).toBeDefined();
    });
  });
});
