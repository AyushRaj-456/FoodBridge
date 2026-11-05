import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

export const REPORT_CATEGORIES = [
  'Hygiene Concern',
  'Late Collection',
  'Safety Violation',
  'Conduct Dispute',
  'Quantity Mismatch',
  'Other',
];

export const REPORT_TARGET_TYPES = [
  'listing',
  'recipient',
  'donor',
  'farm',
  'facility',
  'organisation',
  'general',
];

export const MODERATION_ACTIONS = ['withdrawn', 'flagged'];
export const REPORT_RESOLUTIONS = ['resolved', 'investigated', 'dismissed'];

// ==========================================
// SECURITY & PRIVILEGE ASSERTIONS
// ==========================================

/**
 * Asserts that the actor possesses administrator privilege.
 * Admin role is strictly console-provisioned; client self-promotion is denied.
 */
export function assertAdminAuthorization(user, isAdmin) {
  if (!user || !user.uid) {
    throw new Error('Unauthorized: Authentication required for administrative operations.');
  }
  if (!isAdmin) {
    throw new Error('Unauthorized: Action requires console-provisioned administrator privileges.');
  }
}

/**
 * Asserts that the actor belongs to the requested tenant organisation (IDOR / Cross-Tenant Protection).
 */
export function assertTenantOwnership(user, resourceOrgId, userMemberships = []) {
  if (!user || !user.uid) {
    throw new Error('Unauthorized: Authentication required.');
  }
  if (!resourceOrgId) {
    throw new Error('Tenant resource organisation ID is required.');
  }

  const isMember = userMemberships.some(
    (m) =>
      (m.orgId === resourceOrgId || m.id === `${resourceOrgId}_${user.uid}`) &&
      m.status === 'active'
  );

  if (!isMember) {
    throw new Error(
      `Cross-Tenant Access Denied: User ${user.uid} is not an active member of organisation ${resourceOrgId}.`
    );
  }
}

/**
 * Asserts that client attempts to write directly to /admins collection are prohibited.
 */
export function assertNoClientAdminWrite() {
  throw new Error(
    'Privilege Escalation Blocked: Client writes to the admins collection are permanently forbidden by Firestore rules.'
  );
}

// ==========================================
// APPEND-ONLY AUDIT EVENT SERVICE
// ==========================================

/**
 * Append an immutable audit event to /auditEvents.
 * Security rules enforce:
 * - actorUid == request.auth.uid
 * - createdAt == request.time
 * - allow update, delete: if false;
 */
export async function logAuditEvent({
  actorUid,
  action,
  resourceType,
  resourceId,
  summary,
  metadata = {},
}) {
  if (!actorUid) throw new Error('Audit event requires actorUid.');
  if (!action) throw new Error('Audit event requires action type.');
  if (!resourceType) throw new Error('Audit event requires resourceType.');
  if (!resourceId) throw new Error('Audit event requires resourceId.');

  const auditRef = doc(collection(db, 'auditEvents'));
  const auditData = {
    actorUid,
    action,
    resourceType,
    resourceId,
    summary: summary || `${action} performed on ${resourceType}/${resourceId}`,
    metadata,
    createdAt: serverTimestamp(),
  };

  await setDoc(auditRef, auditData);
  return { id: auditRef.id, ...auditData };
}

/**
 * Fetch append-only audit events for administration review.
 * Rules require isAdmin().
 */
export async function fetchAuditEvents({ limitCount = 50 } = {}) {
  const q = query(collection(db, 'auditEvents'), orderBy('createdAt', 'desc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==========================================
// ORGANISATION VERIFICATION & STATUS
// ==========================================

/**
 * Updates organisation status (approved / suspended / pending) with audit record.
 * Admin role strictly enforced by security rules.
 */
export async function updateOrganisationStatus({
  orgId,
  status,
  reason,
  checklist = {},
  adminUser,
}) {
  assertAdminAuthorization(adminUser, true);

  if (!orgId) throw new Error('Organisation ID is required.');
  if (!['approved', 'suspended', 'pending'].includes(status)) {
    throw new Error(
      `Invalid organisation status "${status}". Must be approved, suspended, or pending.`
    );
  }
  if (!reason || reason.trim().length < 10) {
    throw new Error('Mandatory inspection reason must be at least 10 characters.');
  }

  // 1. Record the verification review audit document
  const reviewRef = doc(collection(db, 'verificationReviews'));
  const reviewData = {
    orgId,
    reviewerUid: adminUser.uid,
    checklist: {
      legalRegistrationVerified: Boolean(checklist?.legalRegistrationVerified),
      contactDetailsConfirmed: Boolean(checklist?.contactDetailsConfirmed),
      foodSafetyHandlingConfirmed: Boolean(checklist?.foodSafetyHandlingConfirmed),
      routeTierComplianceConfirmed: Boolean(checklist?.routeTierComplianceConfirmed),
      offlineInspectionVerified: Boolean(checklist?.offlineInspectionVerified),
    },
    decision: status,
    reason: reason.trim(),
    reviewedAt: serverTimestamp(),
  };
  await setDoc(reviewRef, reviewData);

  // 2. Update organisation status in organisations/{orgId}
  const orgRef = doc(db, 'organisations', orgId);
  await updateDoc(orgRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  // 3. Append to system audit log
  await logAuditEvent({
    actorUid: adminUser.uid,
    action: `ORG_STATUS_${status.toUpperCase()}`,
    resourceType: 'organisations',
    resourceId: orgId,
    summary: `Organisation status updated to "${status}". Reason: ${reason.trim()}`,
  });

  return {
    orgId,
    status,
    reviewId: reviewRef.id,
  };
}

// ==========================================
// LISTING MODERATION
// ==========================================

/**
 * Moderates a listing (e.g. withdraw, flag) due to safety or protocol issues.
 * Admin role strictly enforced by security rules.
 */
export async function moderateListing({ listingId, action, reason, adminUser }) {
  assertAdminAuthorization(adminUser, true);

  if (!listingId) throw new Error('Listing ID is required.');
  if (!MODERATION_ACTIONS.includes(action)) {
    throw new Error(
      `Invalid moderation action "${action}". Must be one of: ${MODERATION_ACTIONS.join(', ')}.`
    );
  }
  if (!reason || reason.trim().length < 5) {
    throw new Error('Moderation reason must be at least 5 characters.');
  }

  const listingRef = doc(db, 'listings', listingId);
  const updateData = {
    status: action === 'withdrawn' ? 'withdrawn' : 'flagged',
    withdrawalReason: reason.trim(),
    moderatedBy: adminUser.uid,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(listingRef, updateData);

  // Append audit event
  await logAuditEvent({
    actorUid: adminUser.uid,
    action: `LISTING_MODERATED_${action.toUpperCase()}`,
    resourceType: 'listings',
    resourceId: listingId,
    summary: `Listing ${action} by administrator. Reason: ${reason.trim()}`,
  });

  return { listingId, ...updateData };
}

/**
 * Fetch listings for moderation queue.
 */
export async function fetchListingsForModeration({ statusFilter = null, limitCount = 50 } = {}) {
  let q;
  if (statusFilter) {
    q = query(
      collection(db, 'listings'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==========================================
// INCIDENT & COMMUNITY SAFETY REPORTS
// ==========================================

/**
 * Submit an incident report (hygiene concern, late collection, safety dispute).
 * Any authenticated user can submit a report.
 */
export async function submitIncidentReport({
  targetType,
  targetId,
  category,
  description,
  reporterUid,
}) {
  if (!reporterUid) {
    throw new Error('Authentication required to submit an incident report.');
  }
  if (!targetType || !REPORT_TARGET_TYPES.includes(targetType)) {
    throw new Error(`Invalid target type. Must be one of: ${REPORT_TARGET_TYPES.join(', ')}.`);
  }
  if (!category || !REPORT_CATEGORIES.includes(category)) {
    throw new Error(`Invalid report category. Must be one of: ${REPORT_CATEGORIES.join(', ')}.`);
  }
  if (!description || description.trim().length < 10) {
    throw new Error('Report description must be at least 10 characters.');
  }

  const reportRef = doc(collection(db, 'reports'));
  const reportData = {
    reporterUid,
    targetType,
    targetId: targetId ? String(targetId).trim() : 'general',
    category,
    description: description.trim(),
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(reportRef, reportData);

  // Append audit record
  await logAuditEvent({
    actorUid: reporterUid,
    action: 'REPORT_SUBMITTED',
    resourceType: 'reports',
    resourceId: reportRef.id,
    summary: `Incident report submitted: ${category} regarding ${targetType}/${targetId || 'general'}`,
  });

  return { id: reportRef.id, ...reportData };
}

/**
 * Resolve an incident report.
 * Admin role required.
 */
export async function resolveIncidentReport({
  reportId,
  resolution,
  resolutionNotes = '',
  adminUser,
}) {
  assertAdminAuthorization(adminUser, true);

  if (!reportId) throw new Error('Report ID is required.');
  if (!REPORT_RESOLUTIONS.includes(resolution)) {
    throw new Error(
      `Invalid resolution "${resolution}". Must be one of: ${REPORT_RESOLUTIONS.join(', ')}.`
    );
  }

  const reportRef = doc(db, 'reports', reportId);
  const updateData = {
    status: resolution,
    resolutionNotes: (resolutionNotes || '').trim(),
    resolvedBy: adminUser.uid,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(reportRef, updateData);

  // Append audit event
  await logAuditEvent({
    actorUid: adminUser.uid,
    action: 'REPORT_RESOLVED',
    resourceType: 'reports',
    resourceId: reportId,
    summary: `Report resolved as "${resolution}". Notes: ${resolutionNotes.trim() || 'N/A'}`,
  });

  return { id: reportId, ...updateData };
}

/**
 * Fetch reports for administrator review.
 */
export async function fetchIncidentReports({ statusFilter = null, limitCount = 50 } = {}) {
  let q;
  if (statusFilter) {
    q = query(
      collection(db, 'reports'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Check if a user UID is provisioned as an administrator.
 */
export async function verifyAdminRole(uid) {
  if (!uid) return false;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch (err) {
    console.warn('[adminService] verifyAdminRole check failed:', err.message);
    return false;
  }
}
