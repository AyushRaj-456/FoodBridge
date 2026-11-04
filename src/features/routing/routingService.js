/**
 * FoodBridge Zero-Waste Routing Gates
 *
 * Hierarchy: Humans First -> Animals Second -> Soil Third.
 *
 * Absolute Invariants:
 * 1. Human-consumption route permitted ONLY after approved written pilot SOP.
 * 2. Animal-feed and compost routes are strictly DISABLED until qualified eligibility and facility SOPs exist.
 * 3. NEVER infer animal suitability from human rejection (food unsuitable for humans is not automatically safe for animals).
 * 4. Traceable audit trail required for every routing decision (assessor UID, SOP version, sensory/temperature compliance).
 */

export const ROUTE_TIERS = {
  HUMAN: 'human',
  ANIMAL_FEED: 'animal_feed',
  COMPOST: 'compost',
};

export const ROUTE_STATES = {
  UNASSESSED: 'UNASSESSED',
  HUMAN_ROUTE_APPROVED: 'HUMAN_ROUTE_APPROVED',
  ANIMAL_ROUTE_APPROVED: 'ANIMAL_ROUTE_APPROVED',
  ORGANIC_ROUTE_APPROVED: 'ORGANIC_ROUTE_APPROVED',
  BLOCKED: 'BLOCKED',
  EXPIRED: 'EXPIRED',
};

export const APPROVED_PILOT_SOP = {
  REF: 'FB-SOP-PILOT-HUMAN-2026',
  VERSION: '1.0.0',
  TITLE: 'Campus Food Surplus Recovery & Safe Redistribution Pilot Standard Operating Procedure',
};

/**
 * Evaluates whether a listing meets zero-waste routing gates.
 *
 * @param {object} listing Surplus listing document
 * @param {object|null} recipientOrg Optional recipient organisation
 * @returns {{ isEligible: boolean, routeState: string, reason: string | null }}
 */
export function evaluateRoutingEligibility(listing, recipientOrg = null) {
  if (!listing) {
    return {
      isEligible: false,
      routeState: ROUTE_STATES.BLOCKED,
      reason: 'Listing is null or undefined.',
    };
  }

  // Check terminal blocked / expired states
  if (listing.routeStatus === ROUTE_STATES.BLOCKED) {
    return {
      isEligible: false,
      routeState: ROUTE_STATES.BLOCKED,
      reason:
        listing.rejectionReason ||
        'Surplus is blocked from redistribution pathways due to safety concerns.',
    };
  }

  const now = Date.now();
  if (listing.consumeBy) {
    const consumeTime =
      typeof listing.consumeBy === 'number'
        ? listing.consumeBy
        : new Date(listing.consumeBy).getTime();
    if (!isNaN(consumeTime) && now > consumeTime) {
      return {
        isEligible: false,
        routeState: ROUTE_STATES.EXPIRED,
        reason: 'Surplus item has expired past its consume-by deadline.',
      };
    }
  }

  const tier = listing.routeTier || ROUTE_TIERS.HUMAN;

  // ==============================================================
  // TIER 1: HUMAN CONSUMPTION ROUTE
  // ==============================================================
  if (tier === ROUTE_TIERS.HUMAN) {
    const sop = listing.sopVerification;

    // Prerequisite: Approved written pilot SOP
    if (!sop || !sop.sopApproved || !sop.sopRef) {
      return {
        isEligible: false,
        routeState: ROUTE_STATES.UNASSESSED,
        reason:
          'Human consumption route requires an approved written pilot food-safety SOP before publication.',
      };
    }

    // Food safety sensory and holding temperature inspection
    if (!sop.holdingTempCompliant) {
      return {
        isEligible: false,
        routeState: ROUTE_STATES.BLOCKED,
        reason:
          'Holding temperature compliance check failed. Food fell outside safe thermal boundaries.',
      };
    }

    if (!sop.sensoryInspectionPassed) {
      return {
        isEligible: false,
        routeState: ROUTE_STATES.BLOCKED,
        reason: 'Sensory inspection (visual and olfactory hygiene check) failed.',
      };
    }

    // Recipient organisation route compatibility (if provided)
    if (recipientOrg) {
      if (recipientOrg.status !== 'approved') {
        return {
          isEligible: false,
          routeState: ROUTE_STATES.HUMAN_ROUTE_APPROVED,
          reason: 'Recipient organisation is not approved by administrator.',
        };
      }
      const category = (recipientOrg.category || '').toLowerCase();
      if (category === 'farm' || category === 'facility') {
        return {
          isEligible: false,
          routeState: ROUTE_STATES.HUMAN_ROUTE_APPROVED,
          reason: 'Farms and composting facilities cannot claim human consumption food.',
        };
      }
    }

    return {
      isEligible: true,
      routeState: ROUTE_STATES.HUMAN_ROUTE_APPROVED,
      reason: null,
    };
  }

  // ==============================================================
  // TIER 2: ANIMAL FEED ROUTE (DISABLED IN MVP)
  // ==============================================================
  if (tier === ROUTE_TIERS.ANIMAL_FEED) {
    // Negative Invariant: NEVER infer animal suitability from human rejection
    if (listing.inferredFromHumanRejection || listing.sopVerification?.inferredFromHumanRejection) {
      return {
        isEligible: false,
        routeState: ROUTE_STATES.BLOCKED,
        reason:
          'CRITICAL SAFETY VIOLATION: Animal feed suitability cannot be inferred from human food rejection. Food rejected for humans is not automatically safe for animals.',
      };
    }

    return {
      isEligible: false,
      routeState: ROUTE_STATES.BLOCKED,
      reason:
        'Tier 2 Animal Feed route is currently disabled in MVP pending qualified veterinary eligibility assessment and institutional SOP approval.',
    };
  }

  // ==============================================================
  // TIER 3: COMPOST / ORGANIC PROCESS (DISABLED IN MVP)
  // ==============================================================
  if (tier === ROUTE_TIERS.COMPOST) {
    return {
      isEligible: false,
      routeState: ROUTE_STATES.BLOCKED,
      reason:
        'Tier 3 Compost/Organic route is currently disabled in MVP pending approved facility-specific organic processing SOP.',
    };
  }

  return {
    isEligible: false,
    routeState: ROUTE_STATES.UNASSESSED,
    reason: `Unrecognized route tier: "${tier}".`,
  };
}

/**
 * Formally assesses and approves a surplus listing for Tier 1 Human Route
 * based on an approved written pilot SOP.
 *
 * @param {string} listingId
 * @param {object} user Assessor user object { uid, displayName }
 * @param {object} assessmentData Inspection metrics { holdingTempCompliant, sensoryInspectionPassed, safetyNotes, sopRef, sopVersion }
 * @returns {object} Audit payload for Firestore
 */
export function approveHumanRoute(listingId, user, assessmentData = {}) {
  if (!listingId) throw new Error('Listing ID is required for human route approval.');
  if (!user || !user.uid) throw new Error('Assessor must be an authenticated user.');

  const {
    holdingTempCompliant,
    sensoryInspectionPassed,
    safetyNotes = '',
    sopRef = APPROVED_PILOT_SOP.REF,
    sopVersion = APPROVED_PILOT_SOP.VERSION,
  } = assessmentData;

  if (holdingTempCompliant !== true) {
    throw new Error(
      'Human route approval requires explicit confirmation of holding temperature compliance.'
    );
  }

  if (sensoryInspectionPassed !== true) {
    throw new Error(
      'Human route approval requires explicit visual and olfactory sensory inspection pass.'
    );
  }

  if (!safetyNotes || safetyNotes.trim().length < 10) {
    throw new Error(
      'Detailed safety notes (minimum 10 characters) are required for route audit traceability.'
    );
  }

  return {
    listingId,
    routeTier: ROUTE_TIERS.HUMAN,
    routeStatus: ROUTE_STATES.HUMAN_ROUTE_APPROVED,
    sopVerification: {
      sopApproved: true,
      sopRef,
      sopVersion,
      assessedBy: user.uid,
      assessedByName: user.displayName || 'Mess Safety Officer',
      assessedAt: new Date().toISOString(),
      holdingTempCompliant: true,
      sensoryInspectionPassed: true,
      safetyNotes: safetyNotes.trim(),
      inferredFromHumanRejection: false,
    },
    inferredFromHumanRejection: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Rejects or blocks a listing from human consumption pathways.
 * Explicitly records rejection reason and marks inferredFromHumanRejection.
 *
 * @param {string} listingId
 * @param {object} user Assessor user object { uid }
 * @param {object} blockDetails { reason, failureType }
 */
export function blockSurplusRoute(listingId, user, blockDetails = {}) {
  if (!listingId) throw new Error('Listing ID is required.');
  if (!user || !user.uid) throw new Error('Assessor must be authenticated.');

  const reason = blockDetails.reason || 'Safety inspection failed.';
  const isHumanInspectionFailure = blockDetails.isHumanInspectionFailure ?? true;

  return {
    listingId,
    routeStatus: ROUTE_STATES.BLOCKED,
    rejectionReason: reason,
    blockedBy: user.uid,
    blockedAt: new Date().toISOString(),
    inferredFromHumanRejection: isHumanInspectionFailure,
    sopVerification: {
      sopApproved: false,
      assessedBy: user.uid,
      assessedAt: new Date().toISOString(),
      holdingTempCompliant: false,
      sensoryInspectionPassed: false,
      rejectionReason: reason,
      inferredFromHumanRejection: isHumanInspectionFailure,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Explicit attempt to activate Tier 2 Animal Feed route.
 * Rejects immediately with appropriate safety invariants.
 */
export function attemptAnimalFeedRoute(listingId, user, feedData = {}) {
  if (!listingId) throw new Error('Listing ID is required.');
  if (!user || !user.uid) throw new Error('User must be authenticated.');

  // Negative Invariant: Reject any attempt to infer animal feed from human rejection
  if (feedData.inferredFromHumanRejection) {
    throw new Error(
      'CRITICAL SAFETY VIOLATION: Animal feed suitability must never be inferred from human rejection. Food rejected for human consumption cannot be automatically cascaded to animals.'
    );
  }

  // Tier 2 route disabled in MVP
  throw new Error(
    'Tier 2 Animal Feed route is currently disabled in MVP. Activation requires qualified veterinary assessment, approved farm SOP, and legal clearance.'
  );
}

/**
 * Explicit attempt to activate Tier 3 Compost / Organic route.
 * Rejects immediately in MVP.
 */
export function attemptCompostRoute(listingId, user) {
  if (!listingId) throw new Error('Listing ID is required.');
  if (!user || !user.uid) throw new Error('User must be authenticated.');

  throw new Error(
    'Tier 3 Compost/Organic route is currently disabled in MVP pending facility-specific organic processing SOP.'
  );
}
