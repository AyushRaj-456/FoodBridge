import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  NOTIFICATION_TYPES,
  createNotification,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  notifyClaimCreated,
  notifyHandoverUpdate,
  notifyClaimDispute,
} from './notificationService.js';
import NotificationInboxModal from './NotificationInboxModal.jsx';

// Mock Firebase client
vi.mock('../../lib/firebase.js', () => ({
  db: { _mock: true },
}));

// Mock Firebase Firestore methods
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_, colName) => ({ id: colName })),
    doc: vi.fn((_, colName, id) => ({ id: id || 'doc-id', path: `${colName}/${id || 'doc-id'}` })),
    addDoc: vi.fn(() => Promise.resolve({ id: 'mock-notif-123' })),
    updateDoc: vi.fn(() => Promise.resolve()),
    deleteDoc: vi.fn(() => Promise.resolve()),
    query: vi.fn((...args) => ({ args })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    orderBy: vi.fn((field, dir) => ({ field, dir })),
    limit: vi.fn((lim) => ({ lim })),
    onSnapshot: vi.fn((q, opts, onNext) => {
      // Mock snapshot emission
      const mockSnapshot = {
        forEach: (cb) => {
          cb({
            id: 'mock-notif-1',
            data: () => ({
              userId: 'user-recipient-1',
              type: 'claim_created',
              title: 'Surplus Listing Claimed',
              body: 'Your surplus listing "Rice & Dal" has been claimed.',
              readAt: null,
              createdAt: '2026-11-04T12:00:00.000Z',
              channel: 'in_app_only',
            }),
          });
          cb({
            id: 'mock-notif-2',
            data: () => ({
              userId: 'user-recipient-1',
              type: 'handover_confirmed',
              title: 'Handover Completed',
              body: 'Both parties confirmed receipt.',
              readAt: '2026-11-04T12:30:00.000Z',
              createdAt: '2026-11-04T12:15:00.000Z',
              channel: 'in_app_only',
            }),
          });
        },
        metadata: {
          fromCache: false,
          hasPendingWrites: false,
        },
      };
      if (typeof opts === 'function') {
        opts(mockSnapshot);
      } else if (typeof onNext === 'function') {
        onNext(mockSnapshot);
      }
      return vi.fn(); // Unsubscribe mock
    }),
    serverTimestamp: vi.fn(() => 'MOCK_SERVER_TIMESTAMP'),
    writeBatch: vi.fn(() => ({
      update: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    })),
  };
});

describe('In-App Notifications — Prompt 13 (Spark ₹0 Baseline)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Notification Service — Document Creation & Zero-Cost Guards', () => {
    it('creates an in-app notification with valid fields and channel="in_app_only"', async () => {
      const { addDoc } = await import('firebase/firestore');

      const id = await createNotification({
        userId: 'user-donor-99',
        type: NOTIFICATION_TYPES.CLAIM_CREATED,
        title: 'New Claim Received',
        body: 'Recipient Org A has claimed surplus portions.',
        relatedId: 'lst-101',
      });

      expect(id).toBe('mock-notif-123');
      expect(addDoc).toHaveBeenCalledTimes(1);

      const payload = addDoc.mock.calls[0][1];
      expect(payload.userId).toBe('user-donor-99');
      expect(payload.type).toBe(NOTIFICATION_TYPES.CLAIM_CREATED);
      expect(payload.title).toBe('New Claim Received');
      expect(payload.body).toBe('Recipient Org A has claimed surplus portions.');
      expect(payload.channel).toBe('in_app_only');
      expect(payload.readAt).toBeNull();
      expect(payload.relatedId).toBe('lst-101');
    });

    it('rejects forbidden communication channels (SMS, WhatsApp, Email, FCM push)', async () => {
      await expect(
        createNotification({
          userId: 'user-donor-99',
          type: NOTIFICATION_TYPES.CLAIM_CREATED,
          title: 'SMS Attempt',
          body: 'Test',
          channel: 'sms',
        })
      ).rejects.toThrow(/Forbidden channel "sms"/i);

      await expect(
        createNotification({
          userId: 'user-donor-99',
          type: NOTIFICATION_TYPES.CLAIM_CREATED,
          title: 'WhatsApp Attempt',
          body: 'Test',
          channel: 'whatsapp',
        })
      ).rejects.toThrow(/Forbidden channel "whatsapp"/i);

      await expect(
        createNotification({
          userId: 'user-donor-99',
          type: NOTIFICATION_TYPES.CLAIM_CREATED,
          title: 'Push Attempt',
          body: 'Test',
          channel: 'fcm_push',
        })
      ).rejects.toThrow(/Forbidden channel "fcm_push"/i);
    });

    it('validates mandatory fields on notification creation', async () => {
      await expect(
        createNotification({
          userId: '',
          type: NOTIFICATION_TYPES.CLAIM_CREATED,
          title: 'Title',
          body: 'Body',
        })
      ).rejects.toThrow(/valid target userId/i);

      await expect(
        createNotification({
          userId: 'uid-1',
          type: 'invalid_type',
          title: 'Title',
          body: 'Body',
        })
      ).rejects.toThrow(/Invalid notification type/i);

      await expect(
        createNotification({
          userId: 'uid-1',
          type: NOTIFICATION_TYPES.CLAIM_CREATED,
          title: '',
          body: 'Body',
        })
      ).rejects.toThrow(/title is required/i);
    });

    it('dispatches claim created notification with standard text', async () => {
      const { addDoc } = await import('firebase/firestore');

      await notifyClaimCreated({
        donorUid: 'donor-1',
        listingTitle: '50 Meals Pulao',
        recipientOrgName: 'Seva Shelter',
        claimId: 'clm-1',
        listingId: 'lst-1',
      });

      expect(addDoc).toHaveBeenCalledTimes(1);
      const call = addDoc.mock.calls[0][1];
      expect(call.title).toBe('Surplus Listing Claimed');
      expect(call.body).toContain('50 Meals Pulao');
      expect(call.body).toContain('Seva Shelter');
    });

    it('dispatches handover update and dispute notifications', async () => {
      const { addDoc } = await import('firebase/firestore');

      await notifyHandoverUpdate({
        targetUid: 'recip-1',
        listingTitle: 'Apples',
        confirmedByRole: 'donor',
        isComplete: false,
        claimId: 'clm-2',
      });

      await notifyClaimDispute({
        targetUid: 'donor-1',
        listingTitle: 'Apples',
        reason: 'Quantity mismatch',
        claimId: 'clm-2',
      });

      expect(addDoc).toHaveBeenCalledTimes(2);
      expect(addDoc.mock.calls[0][1].type).toBe(NOTIFICATION_TYPES.HANDOVER_CONFIRMED);
      expect(addDoc.mock.calls[1][1].type).toBe(NOTIFICATION_TYPES.CLAIM_DISPUTED);
    });
  });

  describe('Live Listener & State Updates', () => {
    it('subscribes to live Firestore updates and computes unreadCount', () => {
      let result = null;
      const unsubscribe = subscribeToNotifications('user-recipient-1', (data) => {
        result = data;
      });

      expect(result).not.toBeNull();
      expect(result.notifications).toHaveLength(2);
      expect(result.unreadCount).toBe(1); // One unread (readAt: null)
      expect(result.fromCache).toBe(false);
      expect(typeof unsubscribe).toBe('function');
    });

    it('correctly reports offline cache state when fromCache is true', async () => {
      const { onSnapshot } = await import('firebase/firestore');
      onSnapshot.mockImplementationOnce((q, opts, onNext) => {
        const cachedSnapshot = {
          forEach: (cb) => {
            cb({
              id: 'cached-1',
              data: () => ({
                userId: 'user-cached',
                type: 'system_alert',
                title: 'Cached Notice',
                body: 'Offline content',
                readAt: null,
                createdAt: '2026-11-04T10:00:00.000Z',
              }),
            });
          },
          metadata: {
            fromCache: true,
            hasPendingWrites: false,
          },
        };
        onNext(cachedSnapshot);
        return vi.fn();
      });

      let callbackData = null;
      subscribeToNotifications('user-cached', (data) => {
        callbackData = data;
      });

      expect(callbackData.fromCache).toBe(true);
      expect(callbackData.unreadCount).toBe(1);
      expect(callbackData.notifications[0].title).toBe('Cached Notice');
    });

    it('marks a single notification as read', async () => {
      const { updateDoc } = await import('firebase/firestore');
      await markNotificationAsRead('notif-to-read');

      expect(updateDoc).toHaveBeenCalledTimes(1);
      const call = updateDoc.mock.calls[0];
      expect(call[0].path).toBe('notifications/notif-to-read');
      expect(call[1].readAt).toBe('MOCK_SERVER_TIMESTAMP');
    });

    it('batch marks all unread notifications as read', async () => {
      const { writeBatch } = await import('firebase/firestore');
      const testList = [
        { id: 'notif-1', readAt: null },
        { id: 'notif-2', readAt: '2026-11-04T10:00:00Z' },
        { id: 'notif-3', readAt: null },
      ];

      const count = await markAllNotificationsAsRead(testList);
      expect(count).toBe(2);
      expect(writeBatch).toHaveBeenCalledTimes(1);
    });

    it('deletes a notification document from the inbox', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteNotification('notif-to-delete');

      expect(deleteDoc).toHaveBeenCalledTimes(1);
      expect(deleteDoc.mock.calls[0][0].path).toBe('notifications/notif-to-delete');
    });
  });

  describe('NotificationInboxModal Component', () => {
    const mockNotifications = [
      {
        id: 'n-1',
        type: NOTIFICATION_TYPES.CLAIM_CREATED,
        title: 'Listing Claimed',
        body: 'Your surplus listing "Curry" was claimed by Ashraya NGO.',
        readAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'n-2',
        type: NOTIFICATION_TYPES.CLAIM_COMPLETED,
        title: 'Donation Handover Completed',
        body: 'Dual handover confirmation complete.',
        readAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    it('renders modal with clear "In-App Only" zero-cost disclaimer', () => {
      render(
        <NotificationInboxModal
          isOpen={true}
          onClose={vi.fn()}
          notifications={mockNotifications}
          unreadCount={1}
          fromCache={false}
        />
      );

      expect(screen.getByText(/In-App Notification Inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/In-App Only:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/operates without paid SMS, WhatsApp, email, or background push workers/i)
      ).toBeInTheDocument();
    });

    it('displays offline sync banner when fromCache is true', () => {
      render(
        <NotificationInboxModal
          isOpen={true}
          onClose={vi.fn()}
          notifications={mockNotifications}
          unreadCount={1}
          fromCache={true}
        />
      );

      expect(screen.getByText(/Offline Mode:/i)).toBeInTheDocument();
      expect(screen.getByText(/Showing cached notifications/i)).toBeInTheDocument();
    });

    it('filters between All and Unread notifications', () => {
      render(
        <NotificationInboxModal
          isOpen={true}
          onClose={vi.fn()}
          notifications={mockNotifications}
          unreadCount={1}
          fromCache={false}
        />
      );

      // Initially shows both
      expect(screen.getByText('Listing Claimed')).toBeInTheDocument();
      expect(screen.getByText('Donation Handover Completed')).toBeInTheDocument();

      // Click Unread tab
      fireEvent.click(screen.getByRole('button', { name: /Unread \(1\)/i }));

      expect(screen.getByText('Listing Claimed')).toBeInTheDocument();
      expect(screen.queryByText('Donation Handover Completed')).not.toBeInTheDocument();
    });

    it('marks a notification as read and calls service', async () => {
      const { updateDoc } = await import('firebase/firestore');

      render(
        <NotificationInboxModal
          isOpen={true}
          onClose={vi.fn()}
          notifications={mockNotifications}
          unreadCount={1}
          fromCache={false}
        />
      );

      const markReadBtn = screen.getByRole('button', { name: /Mark read/i });
      fireEvent.click(markReadBtn);

      await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledTimes(1);
      });
    });

    it('deletes / dismisses a notification', async () => {
      const { deleteDoc } = await import('firebase/firestore');

      render(
        <NotificationInboxModal
          isOpen={true}
          onClose={vi.fn()}
          notifications={mockNotifications}
          unreadCount={1}
          fromCache={false}
        />
      );

      const dismissBtn = screen.getByRole('button', {
        name: /Delete notification Listing Claimed/i,
      });
      fireEvent.click(dismissBtn);

      await waitFor(() => {
        expect(deleteDoc).toHaveBeenCalledTimes(1);
      });
    });

    it('renders empty state when there are no notifications', () => {
      render(
        <NotificationInboxModal
          isOpen={true}
          onClose={vi.fn()}
          notifications={[]}
          unreadCount={0}
          fromCache={false}
        />
      );

      expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /You will receive real-time notifications here while FoodBridge is active/i
        )
      ).toBeInTheDocument();
    });
  });

  describe('Non-Functional & Cost Contract Invariant Checks', () => {
    it('proves zero external communication SDK imports or dependencies', async () => {
      // Static proof that package.json has zero prohibited communications packages
      const pkg = await import('../../../package.json');
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      const prohibitedPackages = [
        'twilio',
        'msg91',
        'whatsapp',
        '@sendgrid/mail',
        'nodemailer',
        'firebase-admin',
        'pusher',
        'onesignal',
        '@onesignal/node-onesignal',
      ];

      prohibitedPackages.forEach((pkgName) => {
        expect(allDeps[pkgName]).toBeUndefined();
      });
    });
  });
});
