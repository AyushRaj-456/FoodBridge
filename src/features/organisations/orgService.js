import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

export const VALID_ORG_TYPES = ['donor', 'recipient', 'farm', 'facility'];
export const VALID_ORG_STATUSES = ['pending', 'approved', 'suspended'];

/**
 * Validates whether an organisation is authorized to claim food surplus.
 * Invariant: Unapproved recipients CANNOT claim.
 */
export function canRecipientClaim(orgStatus) {
  return orgStatus === 'approved';
}

/**
 * Create a new organisation application in Firestore.
 * Invariant: status is always forced to 'pending'.
 * No file or image uploads are stored; verification uses offline checklist.
 */
export async function createOrganisationApplication(formData, user) {
  if (!user || !user.uid) {
    throw new Error('User must be authenticated to register an organisation.');
  }

  const {
    type,
    legalName,
    displayName,
    addressText,
    contactPerson,
    contactPhone,
    contactEmail,
    regNumber = '',
    capacity = '',
    operatingHours = '',
    notes = '',
    lat = null,
    lng = null,
    geohash = null,
  } = formData;

  if (!VALID_ORG_TYPES.includes(type)) {
    throw new Error(`Invalid organisation type. Must be one of: ${VALID_ORG_TYPES.join(', ')}`);
  }

  if (!legalName || legalName.trim().length < 2) {
    throw new Error('Legal entity name is required.');
  }

  if (!displayName || displayName.trim().length < 2) {
    throw new Error('Display name is required.');
  }

  if (!addressText || addressText.trim().length < 5) {
    throw new Error('Physical address is required.');
  }

  if (!contactPhone || contactPhone.trim().length < 8) {
    throw new Error('Valid emergency contact phone number is required.');
  }

  if (!contactEmail || !contactEmail.includes('@')) {
    throw new Error('Valid contact email is required.');
  }

  const orgRef = doc(collection(db, 'organisations'));
  const orgId = orgRef.id;

  const orgDocData = {
    type,
    legalName: legalName.trim(),
    displayName: displayName.trim(),
    addressText: addressText.trim(),
    contactPerson: (contactPerson || '').trim(),
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail.trim().toLowerCase(),
    regNumber: regNumber.trim(),
    capacity: String(capacity || '').trim(),
    operatingHours: String(operatingHours || '').trim(),
    notes: String(notes || '').trim(),
    lat,
    lng,
    geohash,
    status: 'pending', // Invariant: always created as pending
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(orgRef, orgDocData);

  // Create applicant's membership record in memberships/{orgId}_{uid}
  const membershipId = `${orgId}_${user.uid}`;
  const membershipRef = doc(db, 'memberships', membershipId);
  const membershipData = {
    orgId,
    uid: user.uid,
    role: 'member',
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(membershipRef, membershipData);
  } catch (err) {
    console.warn('[orgService] Could not write initial membership record:', err.message);
  }

  return { orgId, ...orgDocData };
}

/**
 * Fetch organisation details by document ID.
 */
export async function fetchOrganisationById(orgId) {
  if (!orgId) return null;
  const snap = await getDoc(doc(db, 'organisations', orgId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Fetch organisations created by a specific user.
 */
export async function fetchUserOrganisations(userUid) {
  if (!userUid) return [];
  const q = query(
    collection(db, 'organisations'),
    where('createdBy', '==', userUid),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all organisations for administrative review.
 */
export async function fetchAllOrganisations() {
  const q = query(collection(db, 'organisations'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Submit an offline verification review for an organisation.
 * Admin role strictly enforced by security rules on /verificationReviews and /organisations.
 */
export async function submitVerificationReview({
  orgId,
  reviewerUid,
  checklist,
  decision,
  reason,
}) {
  if (!orgId) throw new Error('Organisation ID is required for verification.');
  if (!reviewerUid) throw new Error('Reviewer UID is required.');
  if (!['approved', 'suspended'].includes(decision)) {
    throw new Error('Verification decision must be either "approved" or "suspended".');
  }
  if (!reason || reason.trim().length < 10) {
    throw new Error('Mandatory inspection reason must be at least 10 characters.');
  }

  // 1. Record the verification review audit document
  const reviewRef = doc(collection(db, 'verificationReviews'));
  const reviewData = {
    orgId,
    reviewerUid,
    checklist: {
      legalRegistrationVerified: Boolean(checklist?.legalRegistrationVerified),
      contactDetailsConfirmed: Boolean(checklist?.contactDetailsConfirmed),
      foodSafetyHandlingConfirmed: Boolean(checklist?.foodSafetyHandlingConfirmed),
      routeTierComplianceConfirmed: Boolean(checklist?.routeTierComplianceConfirmed),
      offlineInspectionVerified: Boolean(checklist?.offlineInspectionVerified),
    },
    decision,
    reason: reason.trim(),
    reviewedAt: serverTimestamp(),
  };

  await setDoc(reviewRef, reviewData);

  // 2. Update organisation status
  const orgRef = doc(db, 'organisations', orgId);
  await setDoc(
    orgRef,
    {
      status: decision,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { reviewId: reviewRef.id, ...reviewData };
}

/**
 * Fetch historical verification reviews for an organisation.
 */
export async function fetchVerificationReviewsForOrg(orgId) {
  if (!orgId) return [];
  const q = query(
    collection(db, 'verificationReviews'),
    where('orgId', '==', orgId),
    orderBy('reviewedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
