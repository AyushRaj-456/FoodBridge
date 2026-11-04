import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  checkListingExpiry,
  createListing,
  updateListing,
  withdrawListing,
} from './listingService.js';
import ListingDetailModal from './ListingDetailModal.jsx';
import ListingShell from './ListingShell.jsx';
import { canTransitionListing } from '../../rules/stateMachines.js';

// Mock Firebase client to test service invariants in isolation
vi.mock('../../lib/firebase.js', () => ({
  db: { _mock: true },
}));

const mockDocRef = { id: 'mock-lst-999' };
const mockDocSnap = {
  exists: () => true,
  data: () => ({
    id: 'mock-lst-999',
    donorOrgId: 'org-donor-01',
    createdBy: 'donor-uid-1',
    title: 'Veg Biryani Surplus',
    status: 'draft',
    quantity: 15,
    unit: 'kg',
    consumeBy: '2026-12-01T23:59:00.000Z',
    pickupEnd: '2026-12-01T23:00:00.000Z',
  }),
};

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ type: 'collection' })),
  doc: vi.fn(() => mockDocRef),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve(mockDocSnap)),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

describe('Listing Lifecycle & Safety Checks (Prompt 08)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dynamic Runtime Expiry (checkListingExpiry)', () => {
    it('preserves published status when deadlines are in the future', () => {
      const futureTime = Date.now() + 1000 * 60 * 60 * 4; // +4 hours
      const listing = {
        id: 'lst-1',
        title: 'Fresh Dal',
        status: 'published',
        consumeBy: futureTime,
        pickupEnd: futureTime - 1000 * 60 * 60,
      };

      const result = checkListingExpiry(listing);
      expect(result.status).toBe('published');
      expect(result.isExpired).toBe(false);
    });

    it('dynamically marks listing as expired when consumeBy is in the past', () => {
      const pastTime = Date.now() - 1000 * 60; // 1 min ago
      const listing = {
        id: 'lst-2',
        title: 'Overnight Rice',
        status: 'published',
        consumeBy: pastTime,
        pickupEnd: pastTime - 1000 * 60,
      };

      const result = checkListingExpiry(listing);
      expect(result.status).toBe('expired');
      expect(result.isExpired).toBe(true);
    });

    it('dynamically marks listing as expired when pickupEnd is in the past', () => {
      const futureConsume = Date.now() + 1000 * 60 * 60; // 1 hr future
      const pastPickup = Date.now() - 1000 * 60 * 10; // 10 mins ago
      const listing = {
        id: 'lst-3',
        title: 'Chapati Crate',
        status: 'published',
        consumeBy: futureConsume,
        pickupEnd: pastPickup,
      };

      const result = checkListingExpiry(listing);
      expect(result.status).toBe('expired');
      expect(result.isExpired).toBe(true);
    });

    it('retains terminal status for completed, withdrawn, and cancelled listings', () => {
      const past = Date.now() - 10000;
      const completed = checkListingExpiry({ status: 'completed', consumeBy: past });
      const withdrawn = checkListingExpiry({ status: 'withdrawn', consumeBy: past });

      expect(completed.status).toBe('completed');
      expect(withdrawn.status).toBe('withdrawn');
    });

    it('returns null gracefully when passed null or undefined', () => {
      expect(checkListingExpiry(null)).toBeNull();
      expect(checkListingExpiry(undefined)).toBeNull();
    });
  });

  describe('State Machine Transitions (canTransitionListing)', () => {
    it('allows draft -> published and draft -> withdrawn', () => {
      expect(canTransitionListing('draft', 'published')).toBe(true);
      expect(canTransitionListing('draft', 'withdrawn')).toBe(true);
    });

    it('allows published -> claimed, published -> withdrawn, published -> expired', () => {
      expect(canTransitionListing('published', 'claimed')).toBe(true);
      expect(canTransitionListing('published', 'withdrawn')).toBe(true);
      expect(canTransitionListing('published', 'expired')).toBe(true);
    });

    it('forbids invalid transitions such as completed -> published', () => {
      expect(canTransitionListing('completed', 'published')).toBe(false);
      expect(canTransitionListing('expired', 'published')).toBe(false);
      expect(canTransitionListing('withdrawn', 'claimed')).toBe(false);
    });
  });

  describe('Service Validation & Field Rules', () => {
    const mockUser = { uid: 'donor-1', displayName: 'Mess Manager' };

    it('throws error when user is unauthenticated', async () => {
      await expect(
        createListing({ title: 'Meals', quantity: 10, consumeBy: '2026-12-01' }, null)
      ).rejects.toThrow(/User must be authenticated/i);
    });

    it('throws error if quantity is zero or negative', async () => {
      await expect(
        createListing({ title: 'Meals', quantity: 0, consumeBy: '2026-12-01' }, mockUser)
      ).rejects.toThrow(/positive number greater than 0/i);

      await expect(
        createListing({ title: 'Meals', quantity: -5, consumeBy: '2026-12-01' }, mockUser)
      ).rejects.toThrow(/positive number greater than 0/i);
    });

    it('throws error if consume-by deadline is missing', async () => {
      await expect(
        createListing({ title: 'Meals', quantity: 10, consumeBy: '' }, mockUser)
      ).rejects.toThrow(/Consume-by deadline is required/i);
    });

    it('throws error if title is shorter than 3 characters', async () => {
      await expect(
        createListing({ title: 'A', quantity: 10, consumeBy: '2026-12-01' }, mockUser)
      ).rejects.toThrow(/at least 3 characters/i);
    });

    it('successfully creates listing with all required fields and zero photo payload', async () => {
      const listingData = {
        title: 'Dal Tadka & Rice',
        category: 'cooked_meals',
        quantity: 20,
        unit: 'kg',
        portions: 60,
        preparedAt: '2026-11-04T18:00:00Z',
        consumeBy: '2026-11-04T23:00:00Z',
        pickupStart: '2026-11-04T19:00:00Z',
        pickupEnd: '2026-11-04T22:00:00Z',
        storageDeclaration: 'Stainless steel hot-holding vessels',
        dietType: 'vegetarian',
        allergens: 'None',
        location: 'Campus Mess 2 Dispatch',
        exactAddress: 'Mess 2, Rear Dock',
        contactPhone: '+91 9876543210',
      };

      const result = await createListing(listingData, mockUser, 'org-donor-01');
      expect(result.id).toBe('mock-lst-999');
      expect(result.quantity).toBe(20);
      expect(result.storageDeclaration).toBe('Stainless steel hot-holding vessels');
      expect(result.dietType).toBe('vegetarian');
      // Invariant: No photoURL or media upload field in payload
      expect(result.photoURL).toBeUndefined();
      expect(result.imageUrl).toBeUndefined();
    });

    it('forbids invalid state transitions during update', async () => {
      // Mock existing listing in completed state
      const completedSnap = {
        exists: () => true,
        data: () => ({
          id: 'mock-lst-999',
          donorOrgId: 'org-donor-01',
          status: 'completed',
        }),
      };
      const { getDoc } = await import('firebase/firestore');
      getDoc.mockResolvedValueOnce(completedSnap);

      await expect(
        updateListing('mock-lst-999', { status: 'published' }, mockUser)
      ).rejects.toThrow(/Invalid state transition/i);
    });

    it('forbids modifying food specs on claimed listings', async () => {
      const claimedSnap = {
        exists: () => true,
        data: () => ({
          id: 'mock-lst-999',
          donorOrgId: 'org-donor-01',
          status: 'claimed',
          quantity: 10,
        }),
      };
      const { getDoc } = await import('firebase/firestore');
      getDoc.mockResolvedValueOnce(claimedSnap);

      await expect(updateListing('mock-lst-999', { quantity: 15 }, mockUser)).rejects.toThrow(
        /Cannot modify food specifications on an active or claimed listing/i
      );
    });

    it('withdrawListing delegates with withdrawalReason', async () => {
      const draftSnap = {
        exists: () => true,
        data: () => ({
          id: 'mock-lst-999',
          status: 'draft',
        }),
      };
      const { getDoc } = await import('firebase/firestore');
      getDoc.mockResolvedValueOnce(draftSnap);

      const result = await withdrawListing('mock-lst-999', mockUser, 'Surplus spoiled');
      expect(result.status).toBe('withdrawn');
      expect(result.withdrawalReason).toBe('Surplus spoiled');
    });
  });

  describe('ListingDetailModal Component', () => {
    const mockDetailListing = {
      id: 'lst-detail-1',
      title: 'Steamed Basmati Rice & Mixed Veg Curry',
      donorOrgId: 'org-donor-01',
      category: 'Cooked Meals',
      quantity: 25,
      unit: 'kg',
      portions: 75,
      preparedAt: '18:00',
      consumeBy: '23:00',
      pickupStart: '19:00',
      pickupEnd: '21:30',
      storageDeclaration: 'Insulated hot containers above 65°C',
      dietType: 'Vegetarian',
      allergens: 'None',
      location: 'Central Kitchen Loading Bay',
      routeTier: 'human',
      status: 'published',
      fulfillment: {
        exactAddress: 'Door 4, Central Kitchen Loading Bay',
        contactPhone: '+91 94455 66778',
        contactName: 'Kitchen Lead',
      },
    };

    it('renders all food safety details in modal', () => {
      render(
        <ListingDetailModal
          isOpen={true}
          listing={mockDetailListing}
          onClose={vi.fn()}
          onEdit={vi.fn()}
          onWithdraw={vi.fn()}
          onPublish={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { name: /Steamed Basmati Rice/i })).toBeInTheDocument();
      expect(screen.getByText(/25 kg/i)).toBeInTheDocument();
      expect(screen.getByText(/Portions: ~75/i)).toBeInTheDocument();
      expect(screen.getByText(/Insulated hot containers above 65°C/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Central Kitchen Loading Bay/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /Withdraw/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('displays expired warning banner when listing is expired', () => {
      const expiredListing = {
        ...mockDetailListing,
        status: 'expired',
        isExpired: true,
      };

      render(
        <ListingDetailModal
          isOpen={true}
          listing={expiredListing}
          onClose={vi.fn()}
          onEdit={vi.fn()}
          onWithdraw={vi.fn()}
          onPublish={vi.fn()}
        />
      );

      expect(screen.getByText(/Listing Expired:/i)).toBeInTheDocument();
      expect(screen.getByText(/Consume-by deadline has passed/i)).toBeInTheDocument();
      // Should not show Edit button when expired
      expect(screen.queryByRole('button', { name: /Edit Listing/i })).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<ListingDetailModal isOpen={true} listing={mockDetailListing} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText(/Close details modal/i));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ListingShell Full Workflow', () => {
    it('renders active listings list and filters by keyword', () => {
      render(<ListingShell activeTab="active-listings" />);

      expect(screen.getByText(/Cooked Rice & Yellow Dal Tadka/i)).toBeInTheDocument();
      expect(screen.getByText(/Assorted Roti & Chapati Pack/i)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Filter listings/i);
      fireEvent.change(searchInput, { target: { value: 'Roti' } });

      expect(screen.getByText(/Assorted Roti & Chapati Pack/i)).toBeInTheDocument();
      expect(screen.queryByText(/Cooked Rice & Yellow Dal Tadka/i)).not.toBeInTheDocument();
    });

    it('opens detail modal when clicking Details', () => {
      render(<ListingShell activeTab="active-listings" />);

      const viewButtons = screen.getAllByRole('button', { name: /Details/i });
      fireEvent.click(viewButtons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: /Cooked Rice & Yellow Dal Tadka/i })
      ).toBeInTheDocument();
    });

    it('renders surplus declaration form and validates positive quantity', () => {
      const { container } = render(<ListingShell activeTab="create-listing" />);

      expect(screen.getByText(/Declare Food Surplus \(New Listing\)/i)).toBeInTheDocument();

      // Submit with 0 quantity
      const qtyInput = screen.getByLabelText(/Quantity/i);
      fireEvent.change(qtyInput, { target: { value: '0' } });

      const form = container.querySelector('form');
      fireEvent.submit(form);

      expect(screen.getByText(/Quantity must be a positive number/i)).toBeInTheDocument();
    });

    it('supports preview mode toggle before submitting declaration', () => {
      render(<ListingShell activeTab="create-listing" />);

      const titleInput = screen.getByLabelText(/Surplus Food Description/i);
      fireEvent.change(titleInput, { target: { value: 'Vegetable Pulao Feast' } });

      const qtyInput = screen.getByLabelText(/Quantity/i);
      fireEvent.change(qtyInput, { target: { value: '15' } });

      const previewBtn = screen.getByRole('button', { name: /Preview Declaration/i });
      fireEvent.click(previewBtn);

      expect(screen.getByText(/Listing Preview \(Recipient View\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Vegetable Pulao Feast/i)).toBeInTheDocument();

      const editBtn = screen.getByRole('button', { name: /Back to Editing/i });
      fireEvent.click(editBtn);

      expect(screen.queryByText(/Listing Preview \(Recipient View\)/i)).not.toBeInTheDocument();
    });

    it('renders donation history and shows terminal states', () => {
      render(<ListingShell activeTab="donor-history" />);

      expect(screen.getByText(/Surplus Donation History & Dispatch/i)).toBeInTheDocument();
      expect(screen.getByText(/Mixed Vegetable Curry & Rice/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);
    });
  });
});
