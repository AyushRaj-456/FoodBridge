import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

/**
 * In-App Notification Types (Spark ₹0 Baseline)
 * No SMS, WhatsApp, email provider, FCM server sender, or Cloud Functions.
 */
export const NOTIFICATION_TYPES = {
  CLAIM_CREATED: 'claim_created',
  HANDOVER_CONFIRMED: 'handover_confirmed',
  CLAIM_COMPLETED: 'claim_completed',
  CLAIM_CANCELLED: 'claim_cancelled',
  CLAIM_DISPUTED: 'claim_disputed',
  LISTING_PUBLISHED: 'listing_published',
  ORG_VERIFIED: 'org_verified',
  SYSTEM_ALERT: 'system_alert',
};

/**
 * Creates an in-app notification document in Firestore.
 *
 * Invariants:
 * 1. Must be in-app only ('in_app_only' channel).
 * 2. External channels (SMS, WhatsApp, Email, FCM push) are strictly forbidden.
 * 3. Includes target userId, type, title, body, and related entity ID.
 *
 * @param {object} params
 * @param {string} params.userId Target recipient user UID
 * @param {string} params.type One of NOTIFICATION_TYPES
 * @param {string} params.title Short descriptive title
 * @param {string} params.body Human-readable notification body
 * @param {string} [params.relatedId] ID of related listing, claim, or organisation
 * @param {object} [params.metadata] Supplementary display metadata
 * @returns {Promise<string>} Document ID of created notification
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  relatedId = null,
  metadata = {},
  channel = 'in_app_only',
}) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Notification requires a valid target userId.');
  }

  if (!type || !Object.values(NOTIFICATION_TYPES).includes(type)) {
    throw new Error(`Invalid notification type "${type}".`);
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('Notification title is required.');
  }

  if (!body || typeof body !== 'string' || !body.trim()) {
    throw new Error('Notification body is required.');
  }

  // Cost and security invariant: Reject any request to route via external paid channels
  if (channel !== 'in_app_only') {
    throw new Error(
      `Forbidden channel "${channel}". FoodBridge operates strictly within Spark ₹0 quota. SMS, WhatsApp, Email, and Push providers are prohibited.`
    );
  }

  const notificationPayload = {
    userId,
    type,
    title: title.trim(),
    body: body.trim(),
    relatedId: relatedId || null,
    channel: 'in_app_only',
    metadata: metadata || {},
    readAt: null,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'notifications'), notificationPayload);
  return docRef.id;
}

/**
 * Subscribes to live in-app notifications for the authenticated user.
 * Operates only while the application is active in the browser.
 * Captures offline sync status via Firestore snapshot metadata.
 *
 * @param {string} userId Target user UID
 * @param {Function} onUpdate Callback receiving ({ notifications, unreadCount, fromCache, hasPendingWrites })
 * @param {Function} onError Error callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotifications(userId, onUpdate, onError) {
  if (!userId) {
    if (onUpdate)
      onUpdate({ notifications: [], unreadCount: 0, fromCache: false, hasPendingWrites: false });
    return () => {};
  }

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const notifications = [];
      let unreadCount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const notification = {
          id: docSnap.id,
          ...data,
          // Format Firestore timestamp or fallback to ISO string
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
          readAt: data.readAt?.toDate ? data.readAt.toDate().toISOString() : data.readAt,
        };

        if (!notification.readAt) {
          unreadCount += 1;
        }

        notifications.push(notification);
      });

      const fromCache = snapshot.metadata ? snapshot.metadata.fromCache : false;
      const hasPendingWrites = snapshot.metadata ? snapshot.metadata.hasPendingWrites : false;

      if (onUpdate) {
        onUpdate({
          notifications,
          unreadCount,
          fromCache,
          hasPendingWrites,
        });
      }
    },
    (err) => {
      // In tests or offline environments, handle gracefully
      if (onError) onError(err);
    }
  );
}

/**
 * Marks a single notification as read by setting readAt timestamp.
 *
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationAsRead(notificationId) {
  if (!notificationId) throw new Error('Notification ID is required.');
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, {
    readAt: serverTimestamp(),
  });
}

/**
 * Marks all unread notifications as read using a Firestore batch write.
 *
 * @param {Array<{ id: string, readAt: any }>} notifications
 * @returns {Promise<number>} Count of notifications marked as read
 */
export async function markAllNotificationsAsRead(notifications = []) {
  const unreadList = notifications.filter((n) => !n.readAt && n.id);
  if (unreadList.length === 0) return 0;

  const batch = writeBatch(db);
  const now = serverTimestamp();

  unreadList.forEach((notif) => {
    const notifRef = doc(db, 'notifications', notif.id);
    batch.update(notifRef, { readAt: now });
  });

  await batch.commit();
  return unreadList.length;
}

/**
 * Deletes a notification document from the in-app inbox.
 *
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  if (!notificationId) throw new Error('Notification ID is required.');
  const notifRef = doc(db, 'notifications', notificationId);
  await deleteDoc(notifRef);
}

/**
 * Dispatch helper: Notification on new claim creation.
 */
export async function notifyClaimCreated({
  donorUid,
  listingTitle,
  recipientOrgName,
  claimId,
  listingId,
}) {
  if (!donorUid) return null;
  return createNotification({
    userId: donorUid,
    type: NOTIFICATION_TYPES.CLAIM_CREATED,
    title: 'Surplus Listing Claimed',
    body: `Your surplus listing "${listingTitle || 'Surplus Food'}" has been claimed by ${recipientOrgName || 'an approved recipient'}. Please prepare for pickup within the scheduled window.`,
    relatedId: claimId || listingId,
    metadata: { listingId, claimId },
  });
}

/**
 * Dispatch helper: Notification on handover confirmation or completion.
 */
export async function notifyHandoverUpdate({
  targetUid,
  listingTitle,
  confirmedByRole,
  isComplete,
  claimId,
}) {
  if (!targetUid) return null;

  const type = isComplete
    ? NOTIFICATION_TYPES.CLAIM_COMPLETED
    : NOTIFICATION_TYPES.HANDOVER_CONFIRMED;

  const title = isComplete ? 'Donation Handover Completed' : 'Handover Receipt Confirmed';
  const body = isComplete
    ? `Dual handover confirmation complete for "${listingTitle || 'Surplus Food'}". Both donor and recipient have confirmed receipt.`
    : `${confirmedByRole === 'donor' ? 'Donor' : 'Recipient'} has confirmed handover receipt for "${listingTitle || 'Surplus Food'}". Final confirmation pending.`;

  return createNotification({
    userId: targetUid,
    type,
    title,
    body,
    relatedId: claimId,
    metadata: { claimId, isComplete },
  });
}

/**
 * Dispatch helper: Notification on claim dispute.
 */
export async function notifyClaimDispute({ targetUid, listingTitle, reason, claimId }) {
  if (!targetUid) return null;
  return createNotification({
    userId: targetUid,
    type: NOTIFICATION_TYPES.CLAIM_DISPUTED,
    title: 'Handover Disputed',
    body: `A dispute was raised for listing "${listingTitle || 'Surplus Food'}": "${reason || 'Safety or quantity mismatch'}". Admin review may be required.`,
    relatedId: claimId,
    metadata: { claimId, reason },
  });
}
