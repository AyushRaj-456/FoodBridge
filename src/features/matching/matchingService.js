import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { haversineDistance, approximateCoordinates } from '../location/locationService.js';
import { getGeohashQueryRanges } from './geohash.js';
import { checkListingExpiry } from '../listings/listingService.js';

/**
 * Standard radius expansion bands for surplus discovery.
 * Invariant: Radius expansion broadens geographic reach but NEVER relaxes safety eligibility.
 */
export const RADIUS_BANDS_KM = [3, 5, 10, 15];

/**
 * Safety-First Recipient Eligibility Check
 * Invariant: Safety eligibility is deterministic and non-negotiable.
 * Proximity never overrides unapproved status or incompatible route tiers.
 *
 * @param {object} recipientOrg Organisation object with status, category, dietaryRestrictions
 * @param {object} listing Surplus listing object
 * @returns {{ isEligible: boolean, reason: string | null }}
 */
export function checkRecipientSafetyEligibility(recipientOrg, listing) {
  if (!recipientOrg) {
    return {
      isEligible: false,
      reason: 'Recipient organisation profile is required.',
    };
  }

  // Gate 1: Organisation Approval Status
  if (recipientOrg.status !== 'approved') {
    return {
      isEligible: false,
      reason: `Recipient organisation is not approved (Current Status: "${recipientOrg.status || 'unknown'}"). Offline admin verification required.`,
    };
  }

  if (!listing) {
    return { isEligible: false, reason: 'Invalid listing.' };
  }

  // Gate 2: Listing Status & Runtime Expiry
  const evaluatedListing = checkListingExpiry(listing);
  if (evaluatedListing.status !== 'published' || evaluatedListing.isExpired) {
    return {
      isEligible: false,
      reason: 'Listing is not available or has expired past its consume-by deadline.',
    };
  }

  // Gate 3: Route Tier Qualification
  const listingTier = listing.routeTier || 'human';
  if (listingTier === 'human') {
    // Only approved human welfare recipients (NGO, charity, community kitchen, shelter)
    const orgCat = (recipientOrg.category || '').toLowerCase();
    if (orgCat === 'farm' || orgCat === 'facility') {
      return {
        isEligible: false,
        reason: 'Agricultural farms and composting facilities cannot claim human consumption food.',
      };
    }
  } else if (listingTier === 'animal_feed') {
    // Animal feed route strictly requires farm capability
    if ((recipientOrg.category || '').toLowerCase() !== 'farm') {
      return {
        isEligible: false,
        reason: 'Animal feed surplus is restricted to verified farm organisations.',
      };
    }
  }

  // Gate 4: Dietary Restrictions Compatibility
  if (recipientOrg.dietaryPreference && recipientOrg.dietaryPreference !== 'all') {
    const pref = recipientOrg.dietaryPreference.toLowerCase();
    const diet = (listing.dietType || '').toLowerCase();
    if (pref === 'vegan' && diet !== 'vegan') {
      return {
        isEligible: false,
        reason: 'Listing does not match recipient vegan dietary requirement.',
      };
    }
    if (pref === 'vegetarian' && !['vegetarian', 'vegan'].includes(diet)) {
      return {
        isEligible: false,
        reason: 'Listing is non-vegetarian, incompatible with recipient dietary restriction.',
      };
    }
  }

  return { isEligible: true, reason: null };
}

/**
 * Capacity and Logistical Handling Compatibility Check
 *
 * @param {object} recipientOrg Organisation object with capacity constraints
 * @param {object} listing Surplus listing object
 * @returns {{ isCompatible: boolean, reason: string | null }}
 */
export function checkCapacityCompatibility(recipientOrg, listing) {
  if (!recipientOrg || !listing) {
    return { isCompatible: false, reason: 'Missing organisation or listing data.' };
  }

  // Max portion handling capacity check
  const maxPortions = recipientOrg.maxPortionsPerClaim || recipientOrg.dailyCapacityMeals;
  if (maxPortions && typeof maxPortions === 'number' && maxPortions > 0) {
    const listingPortions = listing.portions || Math.round((listing.quantity || 0) * 3);
    if (listingPortions > maxPortions * 1.5) {
      return {
        isCompatible: false,
        reason: `Listing portion volume (~${listingPortions} portions) exceeds recipient logistical handling capacity (Max: ${maxPortions} portions).`,
      };
    }
  }

  // Weight capacity check (if specified)
  if (recipientOrg.maxWeightKg && listing.quantity > recipientOrg.maxWeightKg) {
    return {
      isCompatible: false,
      reason: `Listing weight (${listing.quantity} ${listing.unit}) exceeds vehicle payload capacity (${recipientOrg.maxWeightKg} kg).`,
    };
  }

  return { isCompatible: true, reason: null };
}

/**
 * Pickup Window Feasibility Check
 * Validates that the pickup deadline has not elapsed and adequate window remains.
 *
 * @param {object} listing
 * @param {number} minimumBufferMinutes
 * @returns {{ isFeasible: boolean, reason: string | null }}
 */
export function checkPickupWindowFeasibility(listing, minimumBufferMinutes = 0) {
  if (!listing) return { isFeasible: false, reason: 'Invalid listing' };

  const now = Date.now();
  const bufferMs = minimumBufferMinutes * 60 * 1000;

  if (listing.pickupEnd) {
    const pickupEndTime =
      typeof listing.pickupEnd === 'number'
        ? listing.pickupEnd
        : new Date(listing.pickupEnd).getTime();

    if (!isNaN(pickupEndTime) && now + bufferMs > pickupEndTime) {
      return {
        isFeasible: false,
        reason:
          'The designated pickup window has already closed or has insufficient time remaining.',
      };
    }
  }

  if (listing.consumeBy) {
    const consumeTime =
      typeof listing.consumeBy === 'number'
        ? listing.consumeBy
        : new Date(listing.consumeBy).getTime();

    if (!isNaN(consumeTime) && now + bufferMs > consumeTime) {
      return {
        isFeasible: false,
        reason: 'Consume-by safety deadline has already expired.',
      };
    }
  }

  return { isFeasible: true, reason: null };
}

/**
 * Masks exact fulfillment details for public recipient feeds prior to claim confirmation.
 * Invariant: Approximate coordinates and coarse area before claim; exact address unlocked only after claim.
 *
 * @param {object} listing
 * @param {boolean} isClaimedByRecipient
 * @returns {object} Listing with location privacy applied
 */
export function maskListingLocation(listing, isClaimedByRecipient = false) {
  if (!listing) return null;

  if (isClaimedByRecipient) {
    // Return full details including exact address and coordinator contact
    return {
      ...listing,
      isLocationPartitioned: false,
    };
  }

  // Pre-claim masked view
  const approx = approximateCoordinates(listing.lat, listing.lng, 2);

  return {
    ...listing,
    fulfillment: null,
    exactAddress: null,
    contactPerson: null,
    contactPhone: null,
    isLocationPartitioned: true,
    coarseLocation: listing.location || listing.coarseLocation || 'Designated Campus Dispatch Area',
    coarseCoordinates: approx,
  };
}

/**
 * Finds and ranks matching surplus listings using geohash range queries,
 * exact Haversine proximity filtering, eligibility gates, and pagination.
 *
 * @param {object} recipientLocation { lat, lng }
 * @param {object} recipientOrg Recipient organisation document
 * @param {object} options { radiusKm, pageSize, dietFilter, lastDoc, routeTier }
 * @returns {Promise<{ listings: Array, hasMore: boolean, lastDoc: any, count: number }>}
 */
export async function findMatchingSurplusListings(recipientLocation, recipientOrg, options = {}) {
  const {
    radiusKm = 5,
    pageSize = 10,
    dietFilter = 'all',
    lastDoc = null,
    routeTier = 'human',
  } = options;

  if (
    !recipientLocation ||
    typeof recipientLocation.lat !== 'number' ||
    typeof recipientLocation.lng !== 'number'
  ) {
    throw new Error('Valid recipient coordinates (latitude and longitude) are required.');
  }

  // 1. Generate geohash bounding query ranges
  const queryRanges = getGeohashQueryRanges(recipientLocation.lat, recipientLocation.lng, radiusKm);

  const candidateMap = new Map();

  // 2. Query Firestore with pagination to minimise document reads on Spark ₹0
  try {
    for (const [startHash, endHash] of queryRanges) {
      let q = query(
        collection(db, 'listings'),
        where('status', '==', 'published'),
        where('geohash', '>=', startHash),
        where('geohash', '<=', endHash),
        orderBy('geohash'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        if (!candidateMap.has(d.id)) {
          candidateMap.set(d.id, { id: d.id, _snap: d, ...d.data() });
        }
      });

      // Stop querying additional sub-ranges if we already reached double page size
      if (candidateMap.size >= pageSize * 2) {
        break;
      }
    }
  } catch (err) {
    console.warn('[matchingService] Firestore geohash query failed or offline:', err.message);
  }

  const rawCandidates = Array.from(candidateMap.values());

  // 3. Process, filter, and score candidates
  const matched = [];

  for (const item of rawCandidates) {
    // 3a. Recipient Safety Eligibility Check
    const eligibility = checkRecipientSafetyEligibility(recipientOrg, item);
    if (!eligibility.isEligible) {
      continue;
    }

    // 3b. Route Tier Check
    if (item.routeTier && item.routeTier !== routeTier) {
      continue;
    }

    // 3c. Capacity Check
    const capacity = checkCapacityCompatibility(recipientOrg, item);
    if (!capacity.isCompatible) {
      continue;
    }

    // 3d. Pickup Window Feasibility
    const pickupWindow = checkPickupWindowFeasibility(item);
    if (!pickupWindow.isFeasible) {
      continue;
    }

    // 3e. Dietary Filter
    if (
      dietFilter !== 'all' &&
      item.dietType &&
      item.dietType.toLowerCase() !== dietFilter.toLowerCase()
    ) {
      continue;
    }

    // 3f. Exact Great-Circle Haversine Straight-Line Distance Calculation
    if (typeof item.lat === 'number' && typeof item.lng === 'number') {
      const distance = haversineDistance(
        recipientLocation.lat,
        recipientLocation.lng,
        item.lat,
        item.lng
      );

      // Strict radius boundary check
      if (distance <= radiusKm) {
        // Pre-claim location privacy masking
        const masked = maskListingLocation(item, false);
        matched.push({
          ...masked,
          exactDistanceKm: distance,
        });
      }
    }
  }

  // 4. Deterministic Ranking:
  // Primary: Straight-line distance ascending
  // Secondary: Consume-by deadline ascending (prioritize earlier expiring food to prevent waste)
  matched.sort((a, b) => {
    if (a.exactDistanceKm !== b.exactDistanceKm) {
      return a.exactDistanceKm - b.exactDistanceKm;
    }
    const consumeA = new Date(a.consumeBy || 0).getTime();
    const consumeB = new Date(b.consumeBy || 0).getTime();
    return consumeA - consumeB;
  });

  const pagedListings = matched.slice(0, pageSize);
  const nextDoc = pagedListings.length > 0 ? pagedListings[pagedListings.length - 1]._snap : null;

  return {
    listings: pagedListings,
    totalMatches: matched.length,
    hasMore: matched.length > pageSize,
    lastDoc: nextDoc,
    activeRadiusKm: radiusKm,
  };
}
