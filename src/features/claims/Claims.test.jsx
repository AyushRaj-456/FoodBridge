import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeClaimTransaction,
  confirmHandoverByRecipient,
  confirmHandoverByDonor,
  cancelClaim,
  raiseClaimDispute,
  resolveClaimDispute,
} from './claimService.js';
import { canTransitionClaim } from '../../rules/stateMachines.js';

// Mock Firebase client to test transaction mechanics and concurrency in isolation
vi.mock('../../lib/firebase.js', () => ({
  db: { _mock: true },
}));

vi.mock('firebase/firestore', () => {
  return {
    doc: vi.fn((...args) => ({
      id: args[args.length - 1] || 'mock-claim-id',
      path: args.join('/'),
    })),
    collection: vi.fn(() => ({
      type: 'collection',
    })),
    runTransaction: vi.fn(),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
  };
});

describe('Atomic Claims, Dual Handover & Concurrency (Prompt 11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Claim State Machine Transitions', () => {
    it('allows valid transitions for dual confirmation flow', () => {
      expect(canTransitionClaim('claimed', 'recipient_confirmed')).toBe(true);
      expect(canTransitionClaim('claimed', 'donor_confirmed')).toBe(true);
      expect(canTransitionClaim('recipient_confirmed', 'completed')).toBe(true);
      expect(canTransitionClaim('donor_confirmed', 'completed')).toBe(true);
    });

    it('allows cancellation and dispute from active states', () => {
      expect(canTransitionClaim('claimed', 'cancelled')).toBe(true);
      expect(canTransitionClaim('claimed', 'disputed')).toBe(true);
      expect(canTransitionClaim('recipient_confirmed', 'cancelled')).toBe(true);
      expect(canTransitionClaim('donor_confirmed', 'disputed')).toBe(true);
    });

    it('forbids invalid transitions once in terminal state', () => {
      expect(canTransitionClaim('completed', 'claimed')).toBe(false);
      expect(canTransitionClaim('cancelled', 'claimed')).toBe(false);
      expect(canTransitionClaim('completed', 'disputed')).toBe(false);
    });
  });

  describe('Atomic Claim Transaction Preconditions', () => {
    const mockUser = { uid: 'user-recip-1' };

    it('rejects claim when listing is already claimed or not published', async () => {
      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-claimed') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({
                  status: 'claimed',
                  activeClaimId: 'clm-existing',
                  consumeBy: Date.now() + 100000,
                }),
              });
            }
            return Promise.resolve({ exists: () => true, data: () => ({ status: 'approved' }) });
          }),
          set: vi.fn(),
          update: vi.fn(),
        };
        return fn(mockTx);
      });

      await expect(
        executeClaimTransaction('lst-claimed', 'org-approved', mockUser)
      ).rejects.toThrow(/no longer available/i);
    });

    it('rejects claim when listing has expired past its consume-by deadline', async () => {
      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-expired') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({
                  status: 'published',
                  activeClaimId: null,
                  consumeBy: Date.now() - 10000, // Expired in past
                }),
              });
            }
            return Promise.resolve({ exists: () => true, data: () => ({ status: 'approved' }) });
          }),
          set: vi.fn(),
          update: vi.fn(),
        };
        return fn(mockTx);
      });

      await expect(
        executeClaimTransaction('lst-expired', 'org-approved', mockUser)
      ).rejects.toThrow(/expired past its consume-by deadline/i);
    });

    it('rejects claim when recipient organisation is unapproved', async () => {
      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'org-pending') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ status: 'pending', category: 'ngo' }),
              });
            }
            return Promise.resolve({
              exists: () => true,
              data: () => ({
                status: 'published',
                activeClaimId: null,
                consumeBy: Date.now() + 100000,
              }),
            });
          }),
          set: vi.fn(),
          update: vi.fn(),
        };
        return fn(mockTx);
      });

      await expect(executeClaimTransaction('lst-valid', 'org-pending', mockUser)).rejects.toThrow(
        /Recipient organisation is not approved/i
      );
    });

    it('rejects claim when route tier is incompatible (e.g. farm claiming human meals)', async () => {
      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'org-farm') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ status: 'approved', category: 'farm' }),
              });
            }
            if (ref.id.includes('_')) {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ status: 'active', role: 'member' }),
              });
            }
            return Promise.resolve({
              exists: () => true,
              data: () => ({
                status: 'published',
                activeClaimId: null,
                routeTier: 'human',
                consumeBy: Date.now() + 100000,
              }),
            });
          }),
          set: vi.fn(),
          update: vi.fn(),
        };
        return fn(mockTx);
      });

      await expect(executeClaimTransaction('lst-valid', 'org-farm', mockUser)).rejects.toThrow(
        /Route tier mismatch/i
      );
    });

    it('successfully commits transaction and writes claim atomically when all conditions pass', async () => {
      const mockSet = vi.fn();
      const mockUpdate = vi.fn();

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-101') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({
                  status: 'published',
                  activeClaimId: null,
                  donorOrgId: 'org-donor-1',
                  quantity: 20,
                  unit: 'kg',
                  consumeBy: Date.now() + 100000,
                  pickupEnd: Date.now() + 80000,
                }),
              });
            }
            if (ref.id.includes('_')) {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ status: 'active', role: 'member' }),
              });
            }
            return Promise.resolve({
              exists: () => true,
              data: () => ({ status: 'approved', category: 'ngo' }),
            });
          }),
          set: mockSet,
          update: mockUpdate,
        };
        return fn(mockTx);
      });

      const result = await executeClaimTransaction('lst-101', 'org-recip-1', mockUser);
      expect(result.status).toBe('claimed');
      expect(result.listingId).toBe('lst-101');
      expect(mockSet).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('Concurrent Claim Race Simulation (Single Winner Guarantee)', () => {
    it('proves exactly one winner when two recipients claim the same listing simultaneously', async () => {
      let listingState = {
        id: 'lst-hot-rice',
        status: 'published',
        activeClaimId: null,
        donorOrgId: 'org-donor-1',
        consumeBy: Date.now() + 100000,
        pickupEnd: Date.now() + 80000,
      };

      const { runTransaction } = await import('firebase/firestore');

      // Realistic transaction concurrency simulation:
      // First transaction succeeds and commits new state;
      // Second transaction sees updated state and aborts.
      runTransaction.mockImplementation((_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-hot-rice') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ ...listingState }),
              });
            }
            if (ref.id.includes('_')) {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ status: 'active', role: 'member' }),
              });
            }
            return Promise.resolve({
              exists: () => true,
              data: () => ({ status: 'approved', category: 'ngo' }),
            });
          }),
          set: vi.fn(),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'lst-hot-rice') {
              listingState = { ...listingState, ...updates };
            }
          }),
        };

        return fn(mockTx);
      });

      const claimPromise1 = executeClaimTransaction('lst-hot-rice', 'org-recip-1', {
        uid: 'user-1',
      });
      const claimPromise2 = executeClaimTransaction('lst-hot-rice', 'org-recip-2', {
        uid: 'user-2',
      });

      const results = await Promise.allSettled([claimPromise1, claimPromise2]);

      const winners = results.filter((r) => r.status === 'fulfilled');
      const losers = results.filter((r) => r.status === 'rejected');

      // Crucial Safety Proof: Exactly one winner, exactly one rejection
      expect(winners.length).toBe(1);
      expect(losers.length).toBe(1);
      expect(losers[0].reason.message).toMatch(/no longer available/i);
      expect(listingState.status).toBe('claimed');
      expect(listingState.activeClaimId).toBeDefined();
    });
  });

  describe('Dual Handover Confirmation Protocol', () => {
    it('recipient confirms first -> transitions claim to recipient_confirmed', async () => {
      let claimState = {
        id: 'clm-1',
        listingId: 'lst-1',
        status: 'claimed',
        donorConfirmedAt: null,
      };

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn(() =>
            Promise.resolve({
              exists: () => true,
              data: () => ({ ...claimState }),
            })
          ),
          update: vi.fn((_, updates) => {
            claimState = { ...claimState, ...updates };
          }),
        };
        return fn(mockTx);
      });

      const result = await confirmHandoverByRecipient(
        'clm-1',
        { uid: 'recip-lead' },
        {
          actualQuantity: 18,
          notes: 'Food verified fresh and warm',
        }
      );

      expect(result.status).toBe('recipient_confirmed');
      expect(result.isDualConfirmed).toBe(false);
      expect(claimState.status).toBe('recipient_confirmed');
      expect(claimState.actualQuantity).toBe(18);
    });

    it('donor confirms after recipient -> triggers dual confirmation and completes claim & listing', async () => {
      let claimState = {
        id: 'clm-1',
        listingId: 'lst-1',
        status: 'recipient_confirmed',
        recipientConfirmedAt: '2026-11-04T12:00:00Z',
      };
      let listingState = {
        id: 'lst-1',
        status: 'claimed',
      };

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-1') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ ...listingState }),
              });
            }
            return Promise.resolve({
              exists: () => true,
              data: () => ({ ...claimState }),
            });
          }),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'clm-1') claimState = { ...claimState, ...updates };
            if (ref.id === 'lst-1') listingState = { ...listingState, ...updates };
          }),
        };
        return fn(mockTx);
      });

      const result = await confirmHandoverByDonor('clm-1', { uid: 'donor-mgr' });

      expect(result.status).toBe('completed');
      expect(result.isDualConfirmed).toBe(true);
      expect(claimState.status).toBe('completed');
      expect(listingState.status).toBe('completed');
    });
  });

  describe('Claim Cancellation & Reopening Workflow', () => {
    it('cancels active claim and reopens unexpired listing back to published', async () => {
      let claimState = { id: 'clm-1', listingId: 'lst-1', status: 'claimed' };
      let listingState = {
        id: 'lst-1',
        status: 'claimed',
        activeClaimId: 'clm-1',
        consumeBy: Date.now() + 1000 * 60 * 60, // 1 hour future (unexpired)
        pickupEnd: Date.now() + 1000 * 60 * 30,
      };

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-1') {
              return Promise.resolve({ exists: () => true, data: () => ({ ...listingState }) });
            }
            return Promise.resolve({ exists: () => true, data: () => ({ ...claimState }) });
          }),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'clm-1') claimState = { ...claimState, ...updates };
            if (ref.id === 'lst-1') listingState = { ...listingState, ...updates };
          }),
        };
        return fn(mockTx);
      });

      const result = await cancelClaim('clm-1', { uid: 'user-1' }, 'Vehicle breakdown');
      expect(result.status).toBe('cancelled');
      expect(claimState.status).toBe('cancelled');
      expect(listingState.status).toBe('published');
      expect(listingState.activeClaimId).toBeNull();
    });

    it('cancels active claim and marks listing as expired if deadline passed', async () => {
      let claimState = { id: 'clm-2', listingId: 'lst-2', status: 'claimed' };
      let listingState = {
        id: 'lst-2',
        status: 'claimed',
        activeClaimId: 'clm-2',
        consumeBy: Date.now() - 10000, // Expired
      };

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-2') {
              return Promise.resolve({ exists: () => true, data: () => ({ ...listingState }) });
            }
            return Promise.resolve({ exists: () => true, data: () => ({ ...claimState }) });
          }),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'clm-2') claimState = { ...claimState, ...updates };
            if (ref.id === 'lst-2') listingState = { ...listingState, ...updates };
          }),
        };
        return fn(mockTx);
      });

      const result = await cancelClaim('clm-2', { uid: 'user-1' }, 'Cancelled by recipient');
      expect(result.status).toBe('cancelled');
      expect(listingState.status).toBe('expired');
    });
  });

  describe('Claim Dispute Protocol', () => {
    it('transitions claim and listing to disputed state', async () => {
      let claimState = { id: 'clm-3', listingId: 'lst-3', status: 'claimed' };
      let listingState = { id: 'lst-3', status: 'claimed' };

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn(() =>
            Promise.resolve({ exists: () => true, data: () => ({ ...claimState }) })
          ),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'clm-3') claimState = { ...claimState, ...updates };
            if (ref.id === 'lst-3') listingState = { ...listingState, ...updates };
          }),
        };
        return fn(mockTx);
      });

      const result = await raiseClaimDispute(
        'clm-3',
        { uid: 'user-recip' },
        {
          reason: 'Food smell off; rejected during visual inspection',
        }
      );

      expect(result.status).toBe('disputed');
      expect(claimState.status).toBe('disputed');
      expect(listingState.status).toBe('disputed');
    });

    it('allows admin to resolve dispute as cancelled', async () => {
      let claimState = { id: 'clm-3', listingId: 'lst-3', status: 'disputed' };
      let listingState = { id: 'lst-3', status: 'disputed' };

      const { runTransaction } = await import('firebase/firestore');
      runTransaction.mockImplementationOnce(async (_, fn) => {
        const mockTx = {
          get: vi.fn(() =>
            Promise.resolve({ exists: () => true, data: () => ({ ...claimState }) })
          ),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'clm-3') claimState = { ...claimState, ...updates };
            if (ref.id === 'lst-3') listingState = { ...listingState, ...updates };
          }),
        };
        return fn(mockTx);
      });

      const result = await resolveClaimDispute(
        'clm-3',
        { uid: 'admin-1' },
        'cancelled',
        'Food spoiled'
      );
      expect(result.status).toBe('cancelled');
      expect(claimState.status).toBe('cancelled');
      expect(listingState.status).toBe('cancelled');
    });
  });
});
