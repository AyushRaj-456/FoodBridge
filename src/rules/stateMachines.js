/**
 * FoodBridge State Machine Definitions
 * Strict state transitions enforced in client transactions and Firestore rules.
 */

export const LISTING_TRANSITIONS = {
  draft: ['published', 'withdrawn'],
  published: ['claimed', 'withdrawn', 'expired'],
  claimed: ['handover_pending', 'completed', 'cancelled', 'disputed'],
  handover_pending: ['completed', 'cancelled', 'disputed'],
  completed: [], // Terminal state
  withdrawn: [], // Terminal state
  expired: [], // Terminal state
  cancelled: ['published'], // Can be re-listed if still unexpired
  disputed: ['completed', 'cancelled'],
};

export function canTransitionListing(currentStatus, nextStatus) {
  const allowed = LISTING_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export const CLAIM_TRANSITIONS = {
  claimed: ['donor_confirmed', 'recipient_confirmed', 'cancelled', 'disputed'],
  donor_confirmed: ['completed', 'cancelled', 'disputed'],
  recipient_confirmed: ['completed', 'cancelled', 'disputed'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  disputed: ['completed', 'cancelled'],
};

export function canTransitionClaim(currentStatus, nextStatus) {
  const allowed = CLAIM_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export const ORG_TRANSITIONS = {
  pending: ['approved', 'suspended'],
  approved: ['suspended'],
  suspended: ['approved'],
};

export function canTransitionOrg(currentStatus, nextStatus) {
  const allowed = ORG_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}
