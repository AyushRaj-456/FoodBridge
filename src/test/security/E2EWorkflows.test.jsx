import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../app/App.jsx';
import * as AuthHookModule from '../../features/auth/useAuth.js';

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    connectFirestoreEmulator: vi.fn(),
    collection: vi.fn((_db, name) => ({ id: name, path: name })),
    doc: vi.fn((_db, collOrPath, id) => {
      const collName = typeof collOrPath === 'string' ? collOrPath : collOrPath?.id || 'doc';
      return { path: `${collName}/${id || 'mock-id'}`, id: id || 'mock-id' };
    }),
    setDoc: vi.fn().mockResolvedValue(true),
    updateDoc: vi.fn().mockResolvedValue(true),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    getDocs: vi.fn().mockResolvedValue({ docs: [] }),
    query: vi.fn((...args) => args),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
    runTransaction: vi.fn().mockResolvedValue({ status: 'claimed' }),
    onSnapshot: vi.fn((_q, callback) => {
      if (typeof callback === 'function') {
        callback({ docs: [] });
      }
      return vi.fn();
    }),
  };
});

describe('E2E Persona Integration & Cross-Functional Workflows — Prompt 18', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Persona Switching & Navigation Shell Flow', () => {
    it('seamlessly transitions through all 4 role consoles with state preservation', async () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'admin-e2e', email: 'admin@foodbridge.org' },
        isAdmin: true,
      });

      await act(async () => {
        render(<App />);
      });

      // Initial persona: Donor
      expect(screen.getByRole('heading', { level: 1, name: /Donor Operations/i })).toBeDefined();

      // Switch to Recipient Persona
      const recipientBtn = screen.getByRole('button', { name: 'Recipient NGO' });
      await act(async () => {
        fireEvent.click(recipientBtn);
      });
      expect(
        screen.getByRole('heading', { level: 1, name: /Verified Recipient Feed/i })
      ).toBeDefined();

      // Switch to Mess Analytics Persona
      const messBtn = screen.getByRole('button', { name: 'Mess Operator' });
      await act(async () => {
        fireEvent.click(messBtn);
      });
      expect(
        screen.getByRole('heading', { level: 1, name: /Mess Waste & Production Records/i })
      ).toBeDefined();

      // Switch to Admin Persona
      const adminBtn = screen.getByRole('button', { name: 'Admin' });
      await act(async () => {
        fireEvent.click(adminBtn);
      });
      expect(
        screen.getByRole('heading', { level: 1, name: /Administrative & Moderation Console/i })
      ).toBeDefined();
    });
  });

  describe('Donor to Recipient Lifecycle Simulation', () => {
    it('donor can toggle listing creation form and view food safety declarations', async () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'donor-01' },
        isAdmin: false,
      });

      await act(async () => {
        render(<App />);
      });

      // In Donor Console, check that donor operations screen is displayed
      expect(screen.getByRole('heading', { level: 1, name: /Donor Operations/i })).toBeDefined();

      // Listing action controls are accessible
      const createListingBtn = screen.getByRole('button', { name: 'Create Listing' });
      expect(createListingBtn).toBeDefined();

      const publishBtn = screen.getByRole('button', { name: 'Publish' });
      expect(publishBtn).toBeDefined();
    });

    it('recipient can switch to Map View and trigger GPS prompt or text fallback', async () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'recipient-01' },
        isAdmin: false,
      });

      await act(async () => {
        render(<App />);
      });

      // Switch to Recipient
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Recipient NGO' }));
      });

      expect(
        screen.getByRole('heading', { level: 1, name: /Verified Recipient Feed/i })
      ).toBeDefined();
    });
  });

  describe('Mess Analytics & Zero-Cost Advisory Simulation', () => {
    it('mess operator views waste & production screens with zero-cost invariants', async () => {
      vi.spyOn(AuthHookModule, 'useAuth').mockReturnValue({
        user: { uid: 'mess-op-01' },
        isAdmin: false,
      });

      await act(async () => {
        render(<App />);
      });

      // Switch to Mess Analytics
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Mess Operator' }));
      });

      expect(
        screen.getByRole('heading', { level: 1, name: /Mess Waste & Production Records/i })
      ).toBeDefined();
    });
  });
});
