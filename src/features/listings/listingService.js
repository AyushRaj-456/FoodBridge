import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { canTransitionListing } from '../../rules/stateMachines.js';

/**
 * Evaluates whether a listing has expired at read or claim time.
 * Invariant: Expiry is checked dynamically at runtime, never by a scheduled worker.
 */
export function checkListingExpiry(listing) {
  if (!listing) return null;

  // Terminal states don't change
  if (['completed', 'withdrawn', 'cancelled', 'expired'].includes(listing.status)) {
    return { ...listing, isExpired: listing.status === 'expired' };
  }

  const now = Date.now();
  let isExpired = false;

  // Check consumeBy deadline
  if (listing.consumeBy) {
    const consumeTime =
      typeof listing.consumeBy === 'number'
        ? listing.consumeBy
        : new Date(listing.consumeBy).getTime();

    if (!isNaN(consumeTime) && now > consumeTime) {
      isExpired = true;
    }
  }

  // Check pickupEnd deadline
  if (!isExpired && listing.pickupEnd) {
    const pickupEndTime =
      typeof listing.pickupEnd === 'number'
        ? listing.pickupEnd
        : new Date(listing.pickupEnd).getTime();

    if (!isNaN(pickupEndTime) && now > pickupEndTime) {
      isExpired = true;
    }
  }

  if (isExpired && listing.status === 'published') {
    return {
      ...listing,
      status: 'expired',
      isExpired: true,
    };
  }

  return { ...listing, isExpired };
}

/**
 * Create a new surplus listing with fulfillment partition.
 * Zero-Cost ₹0 Spark Invariant: No photos are uploaded.
 */
export async function createListing(listingData, user, donorOrgId = 'org-donor-default') {
  if (!user || !user.uid) {
    throw new Error('User must be authenticated to create a listing.');
  }

  const {
    title,
    category = 'cooked_meals',
    quantity,
    unit = 'kg',
    portions,
    preparedAt,
    consumeBy,
    pickupStart,
    pickupEnd,
    storageDeclaration,
    dietType = 'vegetarian',
    allergens = 'None',
    location,
    geohash = null,
    routeTier = 'human',
    status = 'published',
    exactAddress = '',
    contactName = '',
    contactPhone = '',
    instructions = '',
  } = listingData;

  // Field validations
  if (!title || title.trim().length < 3) {
    throw new Error('Listing title must be at least 3 characters.');
  }

  const numQuantity = parseFloat(quantity);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    throw new Error('Quantity must be a positive number greater than 0.');
  }

  if (!consumeBy) {
    throw new Error('Consume-by deadline is required for food safety oversight.');
  }

  if (!['draft', 'published'].includes(status)) {
    throw new Error('Initial listing status must be either "draft" or "published".');
  }

  const listingRef = doc(collection(db, 'listings'));
  const listingId = listingRef.id;

  const docPayload = {
    donorOrgId,
    createdBy: user.uid,
    title: title.trim(),
    category,
    quantity: numQuantity,
    unit: unit.trim().toLowerCase(),
    portions: portions ? parseInt(portions, 10) : Math.round(numQuantity * 3),
    preparedAt: preparedAt || new Date().toISOString(),
    consumeBy,
    pickupStart: pickupStart || new Date().toISOString(),
    pickupEnd: pickupEnd || consumeBy,
    storageDeclaration: (storageDeclaration || 'Standard clean food-grade holding').trim(),
    dietType,
    allergens: (allergens || 'None').trim(),
    location: (location || 'Mess Dispatch Counter').trim(),
    geohash,
    routeTier,
    status,
    activeClaimId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(listingRef, docPayload);

  // Exact location privacy partition in subcollection /fulfillment/{docId}
  const fulfillmentRef = doc(db, 'listings', listingId, 'fulfillment', 'location_privacy');
  const fulfillmentPayload = {
    exactAddress: exactAddress.trim() || location.trim(),
    contactName: contactName.trim() || user.displayName || 'Mess Coordinator',
    contactPhone: contactPhone.trim(),
    instructions: instructions.trim(),
  };

  try {
    await setDoc(fulfillmentRef, fulfillmentPayload);
  } catch (err) {
    console.warn('[listingService] Fulfillment partition subcollection write:', err.message);
  }

  return { id: listingId, ...docPayload, fulfillment: fulfillmentPayload };
}

/**
 * Update an existing listing. Enforces allowed state transitions and field editability.
 */
export async function updateListing(listingId, updates, user) {
  if (!listingId) throw new Error('Listing ID is required for update.');
  if (!user || !user.uid) throw new Error('User must be authenticated to update listing.');

  const listingRef = doc(db, 'listings', listingId);
  const snap = await getDoc(listingRef);

  if (!snap.exists()) {
    throw new Error(`Listing "${listingId}" not found.`);
  }

  const currentData = snap.data();

  // Validate State Transition if status changed
  if (updates.status && updates.status !== currentData.status) {
    if (!canTransitionListing(currentData.status, updates.status)) {
      throw new Error(
        `Invalid state transition: Cannot transition listing from "${currentData.status}" to "${updates.status}".`
      );
    }
  }

  // Prevent editing food specifications if already claimed
  if (['claimed', 'handover_pending', 'completed'].includes(currentData.status)) {
    if (
      updates.quantity ||
      updates.title ||
      updates.consumeBy ||
      updates.pickupStart ||
      updates.pickupEnd
    ) {
      throw new Error('Cannot modify food specifications on an active or claimed listing.');
    }
  }

  if (updates.quantity !== undefined) {
    const q = parseFloat(updates.quantity);
    if (isNaN(q) || q <= 0) {
      throw new Error('Quantity must be a positive number greater than 0.');
    }
    updates.quantity = q;
  }

  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  await setDoc(listingRef, payload, { merge: true });

  return { id: listingId, ...currentData, ...payload };
}

/**
 * Publish a draft listing.
 */
export async function publishListing(listingId, user) {
  return updateListing(listingId, { status: 'published' }, user);
}

/**
 * Withdraw a listing.
 */
export async function withdrawListing(listingId, user, reason = 'Withdrawn by donor') {
  return updateListing(listingId, { status: 'withdrawn', withdrawalReason: reason }, user);
}

/**
 * Fetch active listings for a donor organisation with runtime expiry evaluation.
 */
export async function fetchActiveListings(donorOrgId) {
  if (!donorOrgId) return [];

  const q = query(
    collection(db, 'listings'),
    where('donorOrgId', '==', donorOrgId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Evaluate expiry at read time
  return items
    .map(checkListingExpiry)
    .filter((l) => ['draft', 'published', 'claimed'].includes(l.status));
}

/**
 * Fetch listing history for a donor organisation.
 */
export async function fetchListingHistory(donorOrgId) {
  if (!donorOrgId) return [];

  const q = query(
    collection(db, 'listings'),
    where('donorOrgId', '==', donorOrgId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  return items
    .map(checkListingExpiry)
    .filter((l) => ['completed', 'withdrawn', 'expired', 'cancelled'].includes(l.status));
}

/**
 * Fetch single listing detail by ID with read-time expiry and optional fulfillment.
 */
export async function fetchListingById(listingId) {
  if (!listingId) return null;

  const snap = await getDoc(doc(db, 'listings', listingId));
  if (!snap.exists()) return null;

  const data = checkListingExpiry({ id: snap.id, ...snap.data() });

  // Attempt to fetch fulfillment details
  try {
    const fulfillmentSnap = await getDoc(
      doc(db, 'listings', listingId, 'fulfillment', 'location_privacy')
    );
    if (fulfillmentSnap.exists()) {
      data.fulfillment = fulfillmentSnap.data();
    }
  } catch {
    // Expected to fail if unauthenticated or not permitted by security rules
  }

  return data;
}
