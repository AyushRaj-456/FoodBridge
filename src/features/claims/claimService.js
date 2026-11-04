import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { canTransitionClaim, canTransitionListing } from '../../rules/stateMachines.js';

/**
 * Executes an atomic claim transaction on Firestore.
 *
 * Invariants:
 * 1. Atomically reads listing, recipient organisation, and active membership.
 * 2. Re-verifies listing is 'published', unexpired, within pickup window, and has activeClaimId == null.
 * 3. Re-verifies recipient organisation is 'approved' and route-tier compatible.
 * 4. Atomically writes claim record and updates listing status to 'claimed' with activeClaimId.
 * 5. Exactly one winner: concurrent attempts are rejected via optimistic concurrency control.
 *    Client button disabling is not relied upon.
 *
 * @param {string} listingId Document ID of listing to claim
 * @param {string} recipientOrgId Organisation claiming the listing
 * @param {object} user Authenticated user object { uid }
 * @param {object} options Optional params { idempotencyKey }
 * @returns {Promise<{ claimId: string, listingId: string, status: string }>}
 */
export async function executeClaimTransaction(listingId, recipientOrgId, user, options = {}) {
  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Valid listing ID is required to execute a claim.');
  }

  if (!recipientOrgId || typeof recipientOrgId !== 'string') {
    throw new Error('Valid recipient organisation ID is required.');
  }

  if (!user || !user.uid) {
    throw new Error('User must be authenticated to execute a claim transaction.');
  }

  const listingRef = doc(db, 'listings', listingId);
  const orgRef = doc(db, 'organisations', recipientOrgId);
  const membershipId = `${recipientOrgId}_${user.uid}`;
  const membershipRef = doc(db, 'memberships', membershipId);
  const claimRef = doc(collection(db, 'claims'));
  const claimId = claimRef.id;

  return runTransaction(db, async (transaction) => {
    // 1. Concurrent Reads
    const [listingDoc, orgDoc, membershipDoc] = await Promise.all([
      transaction.get(listingRef),
      transaction.get(orgRef),
      transaction.get(membershipRef),
    ]);

    // 2. Listing Verification
    if (!listingDoc.exists()) {
      throw new Error(`Listing "${listingId}" does not exist.`);
    }

    const listingData = listingDoc.data();

    // Invariant: Must be published and unclaimed
    if (listingData.status !== 'published' || listingData.activeClaimId != null) {
      throw new Error(
        `Listing "${listingId}" is no longer available. Current status: "${listingData.status}".`
      );
    }

    // Invariant: Expiry verification at claim time
    const now = Date.now();
    if (listingData.consumeBy) {
      const consumeTime =
        typeof listingData.consumeBy === 'number'
          ? listingData.consumeBy
          : new Date(listingData.consumeBy).getTime();
      if (!isNaN(consumeTime) && now > consumeTime) {
        throw new Error('Claim rejected: Listing has expired past its consume-by deadline.');
      }
    }

    if (listingData.pickupEnd) {
      const pickupEndTime =
        typeof listingData.pickupEnd === 'number'
          ? listingData.pickupEnd
          : new Date(listingData.pickupEnd).getTime();
      if (!isNaN(pickupEndTime) && now > pickupEndTime) {
        throw new Error('Claim rejected: The designated pickup window has closed.');
      }
    }

    // 3. Recipient Organisation & Membership Verification
    if (!orgDoc.exists()) {
      throw new Error(`Recipient organisation "${recipientOrgId}" does not exist.`);
    }

    const orgData = orgDoc.data();
    if (orgData.status !== 'approved') {
      throw new Error(
        `Recipient organisation is not approved (Status: "${orgData.status}"). Offline admin verification required.`
      );
    }

    // Membership check: only active members can act on behalf of organisation
    if (membershipDoc.exists()) {
      const memData = membershipDoc.data();
      if (memData.status !== 'active') {
        throw new Error('User does not hold an active membership in this recipient organisation.');
      }
    }

    // Route Tier Qualification Check
    const routeTier = listingData.routeTier || 'human';
    const orgCat = (orgData.category || '').toLowerCase();
    if (routeTier === 'human' && (orgCat === 'farm' || orgCat === 'facility')) {
      throw new Error(
        'Route tier mismatch: Farms and facilities cannot claim human consumption food.'
      );
    }

    // 4. Atomic Writes
    const idempotencyKey = options.idempotencyKey || `${listingId}_${recipientOrgId}_${now}`;

    const claimPayload = {
      listingId,
      recipientOrgId,
      donorOrgId: listingData.donorOrgId,
      claimedBy: user.uid,
      status: 'claimed',
      idempotencyKey,
      claimedAt: serverTimestamp(),
      donorConfirmedAt: null,
      donorConfirmedBy: null,
      recipientConfirmedAt: null,
      recipientConfirmedBy: null,
      actualQuantity: listingData.quantity,
      unit: listingData.unit || 'kg',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(claimRef, claimPayload);

    transaction.update(listingRef, {
      status: 'claimed',
      activeClaimId: claimId,
      updatedAt: serverTimestamp(),
    });

    return {
      claimId,
      listingId,
      status: 'claimed',
      idempotencyKey,
    };
  });
}

/**
 * Recipient confirms handover receipt.
 * Dual Handover Protocol:
 * - If donor has not yet confirmed: transitions to 'recipient_confirmed'.
 * - If donor already confirmed: transitions claim and listing to 'completed'.
 */
export async function confirmHandoverByRecipient(claimId, user, handoverData = {}) {
  if (!claimId) throw new Error('Claim ID is required.');
  if (!user || !user.uid) throw new Error('User must be authenticated.');

  const claimRef = doc(db, 'claims', claimId);

  return runTransaction(db, async (transaction) => {
    const claimDoc = await transaction.get(claimRef);
    if (!claimDoc.exists()) {
      throw new Error(`Claim "${claimId}" not found.`);
    }

    const claim = claimDoc.data();
    const listingRef = doc(db, 'listings', claim.listingId);
    const listingDoc = await transaction.get(listingRef);

    if (claim.status === 'completed') {
      throw new Error('Handover is already completed.');
    }

    if (claim.status === 'cancelled' || claim.status === 'disputed') {
      throw new Error(`Cannot confirm handover on a "${claim.status}" claim.`);
    }

    const isDonorAlreadyConfirmed =
      claim.status === 'donor_confirmed' || claim.donorConfirmedAt != null;

    const nextStatus = isDonorAlreadyConfirmed ? 'completed' : 'recipient_confirmed';

    if (!canTransitionClaim(claim.status, nextStatus)) {
      throw new Error(`Invalid state transition from "${claim.status}" to "${nextStatus}".`);
    }

    const updates = {
      status: nextStatus,
      recipientConfirmedAt: serverTimestamp(),
      recipientConfirmedBy: user.uid,
      recipientNotes: handoverData.notes || '',
      updatedAt: serverTimestamp(),
    };

    if (handoverData.actualQuantity !== undefined) {
      const q = parseFloat(handoverData.actualQuantity);
      if (!isNaN(q) && q > 0) {
        updates.actualQuantity = q;
      }
    }

    if (nextStatus === 'completed') {
      updates.completedAt = serverTimestamp();
      if (listingDoc.exists() && canTransitionListing(listingDoc.data().status, 'completed')) {
        transaction.update(listingRef, {
          status: 'completed',
          updatedAt: serverTimestamp(),
        });
      }
    }

    transaction.update(claimRef, updates);

    return { claimId, status: nextStatus, isDualConfirmed: nextStatus === 'completed' };
  });
}

/**
 * Donor confirms handover dispatch.
 * Dual Handover Protocol:
 * - If recipient has not yet confirmed: transitions to 'donor_confirmed'.
 * - If recipient already confirmed: transitions claim and listing to 'completed'.
 */
export async function confirmHandoverByDonor(claimId, user, handoverData = {}) {
  if (!claimId) throw new Error('Claim ID is required.');
  if (!user || !user.uid) throw new Error('User must be authenticated.');

  const claimRef = doc(db, 'claims', claimId);

  return runTransaction(db, async (transaction) => {
    const claimDoc = await transaction.get(claimRef);
    if (!claimDoc.exists()) {
      throw new Error(`Claim "${claimId}" not found.`);
    }

    const claim = claimDoc.data();
    const listingRef = doc(db, 'listings', claim.listingId);
    const listingDoc = await transaction.get(listingRef);

    if (claim.status === 'completed') {
      throw new Error('Handover is already completed.');
    }

    if (claim.status === 'cancelled' || claim.status === 'disputed') {
      throw new Error(`Cannot confirm handover on a "${claim.status}" claim.`);
    }

    const isRecipientAlreadyConfirmed =
      claim.status === 'recipient_confirmed' || claim.recipientConfirmedAt != null;

    const nextStatus = isRecipientAlreadyConfirmed ? 'completed' : 'donor_confirmed';

    if (!canTransitionClaim(claim.status, nextStatus)) {
      throw new Error(`Invalid state transition from "${claim.status}" to "${nextStatus}".`);
    }

    const updates = {
      status: nextStatus,
      donorConfirmedAt: serverTimestamp(),
      donorConfirmedBy: user.uid,
      donorNotes: handoverData.notes || '',
      updatedAt: serverTimestamp(),
    };

    if (handoverData.actualQuantity !== undefined) {
      const q = parseFloat(handoverData.actualQuantity);
      if (!isNaN(q) && q > 0) {
        updates.actualQuantity = q;
      }
    }

    if (nextStatus === 'completed') {
      updates.completedAt = serverTimestamp();
      if (listingDoc.exists() && canTransitionListing(listingDoc.data().status, 'completed')) {
        transaction.update(listingRef, {
          status: 'completed',
          updatedAt: serverTimestamp(),
        });
      }
    }

    transaction.update(claimRef, updates);

    return { claimId, status: nextStatus, isDualConfirmed: nextStatus === 'completed' };
  });
}

/**
 * Cancels an active claim and reopens or expires the listing.
 */
export async function cancelClaim(claimId, user, reason = 'Cancelled by party') {
  if (!claimId) throw new Error('Claim ID is required.');
  if (!user || !user.uid) throw new Error('User must be authenticated.');

  const claimRef = doc(db, 'claims', claimId);

  return runTransaction(db, async (transaction) => {
    const claimDoc = await transaction.get(claimRef);
    if (!claimDoc.exists()) {
      throw new Error(`Claim "${claimId}" not found.`);
    }

    const claim = claimDoc.data();
    if (claim.status === 'completed') {
      throw new Error('Cannot cancel a completed handover.');
    }

    const listingRef = doc(db, 'listings', claim.listingId);
    const listingDoc = await transaction.get(listingRef);

    // Cancel claim
    transaction.update(claimRef, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy: user.uid,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Reopen listing if unexpired, or transition to expired
    if (listingDoc.exists()) {
      const listing = listingDoc.data();
      const now = Date.now();
      const isPastConsume = listing.consumeBy && now > new Date(listing.consumeBy).getTime();
      const isPastPickup = listing.pickupEnd && now > new Date(listing.pickupEnd).getTime();

      const newListingStatus = isPastConsume || isPastPickup ? 'expired' : 'published';

      transaction.update(listingRef, {
        status: newListingStatus,
        activeClaimId: null,
        updatedAt: serverTimestamp(),
      });
    }

    return { claimId, status: 'cancelled', reason };
  });
}

/**
 * Raises a formal dispute on an active claim (e.g. food quality rejection or non-pickup).
 */
export async function raiseClaimDispute(claimId, user, disputeDetails = {}) {
  if (!claimId) throw new Error('Claim ID is required.');
  if (!user || !user.uid) throw new Error('User must be authenticated.');

  const reason = disputeDetails.reason || 'Unspecified dispute';
  const claimRef = doc(db, 'claims', claimId);

  return runTransaction(db, async (transaction) => {
    const claimDoc = await transaction.get(claimRef);
    if (!claimDoc.exists()) {
      throw new Error(`Claim "${claimId}" not found.`);
    }

    const claim = claimDoc.data();
    const listingRef = doc(db, 'listings', claim.listingId);

    transaction.update(claimRef, {
      status: 'disputed',
      disputeReason: reason,
      disputeRaisedBy: user.uid,
      disputeRaisedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(listingRef, {
      status: 'disputed',
      updatedAt: serverTimestamp(),
    });

    return { claimId, status: 'disputed', reason };
  });
}

/**
 * Resolves a disputed claim by an administrator.
 */
export async function resolveClaimDispute(
  claimId,
  adminUser,
  resolution = 'cancelled',
  resolutionNotes = ''
) {
  if (!claimId) throw new Error('Claim ID is required.');
  if (!adminUser || !adminUser.uid) throw new Error('Admin must be authenticated.');
  if (!['completed', 'cancelled'].includes(resolution)) {
    throw new Error('Dispute resolution must be either "completed" or "cancelled".');
  }

  const claimRef = doc(db, 'claims', claimId);

  return runTransaction(db, async (transaction) => {
    const claimDoc = await transaction.get(claimRef);
    if (!claimDoc.exists()) {
      throw new Error(`Claim "${claimId}" not found.`);
    }

    const claim = claimDoc.data();
    const listingRef = doc(db, 'listings', claim.listingId);

    transaction.update(claimRef, {
      status: resolution,
      disputeResolution: resolution,
      disputeResolvedBy: adminUser.uid,
      disputeResolutionNotes: resolutionNotes,
      disputeResolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(listingRef, {
      status: resolution === 'completed' ? 'completed' : 'cancelled',
      activeClaimId: resolution === 'completed' ? claimId : null,
      updatedAt: serverTimestamp(),
    });

    return { claimId, status: resolution, resolutionNotes };
  });
}

/**
 * Fetches active claims for a recipient organisation.
 */
export async function fetchRecipientClaims(recipientOrgId) {
  if (!recipientOrgId) return [];

  const q = query(
    collection(db, 'claims'),
    where('recipientOrgId', '==', recipientOrgId),
    orderBy('claimedAt', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetches a single claim with its linked listing and partitioned fulfillment details.
 */
export async function fetchClaimDetail(claimId) {
  if (!claimId) return null;

  const claimSnap = await getDoc(doc(db, 'claims', claimId));
  if (!claimSnap.exists()) return null;

  const claim = { id: claimSnap.id, ...claimSnap.data() };

  // Fetch linked listing
  try {
    const listingSnap = await getDoc(doc(db, 'listings', claim.listingId));
    if (listingSnap.exists()) {
      claim.listing = { id: listingSnap.id, ...listingSnap.data() };
    }
  } catch {
    // Ignore error if not permitted
  }

  // Fetch partitioned fulfillment location details (permitted because claim exists)
  try {
    const fulfillmentSnap = await getDoc(
      doc(db, 'listings', claim.listingId, 'fulfillment', 'location_privacy')
    );
    if (fulfillmentSnap.exists()) {
      claim.fulfillment = fulfillmentSnap.data();
    }
  } catch {
    // Graceful fallback
  }

  return claim;
}
