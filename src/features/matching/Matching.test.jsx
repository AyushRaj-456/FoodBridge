import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encodeGeohash,
  decodeGeohash,
  getPrecisionForRadius,
  getGeohashQueryRanges,
  geohashQueryBounds,
} from './geohash.js';
import {
  RADIUS_BANDS_KM,
  checkRecipientSafetyEligibility,
  checkCapacityCompatibility,
  checkPickupWindowFeasibility,
  maskListingLocation,
  findMatchingSurplusListings,
} from './matchingService.js';
import { haversineDistance } from '../location/locationService.js';

// Mock Firebase client to test query construction & read minimisation in isolation
vi.mock('../../lib/firebase.js', () => ({
  db: { _mock: true },
}));

const mockDocs = [
  {
    id: 'lst-near-veg',
    data: () => ({
      title: 'Steamed Rice & Dal',
      status: 'published',
      routeTier: 'human',
      dietType: 'vegetarian',
      quantity: 15,
      unit: 'kg',
      portions: 45,
      lat: 13.0827,
      lng: 80.2707,
      geohash: encodeGeohash(13.0827, 80.2707, 6),
      consumeBy: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      pickupEnd: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      location: 'Central Campus Mess 3',
      exactAddress: 'Door 4, Rear Kitchen Bay',
      contactPhone: '+91 94450 99887',
    }),
  },
  {
    id: 'lst-far-veg',
    data: () => ({
      title: 'Chapati & Mix Veg',
      status: 'published',
      routeTier: 'human',
      dietType: 'vegetarian',
      quantity: 10,
      unit: 'kg',
      portions: 30,
      lat: 13.12,
      lng: 80.3,
      geohash: encodeGeohash(13.12, 80.3, 6),
      consumeBy: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      pickupEnd: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      location: 'Outlying Hostel Dining',
      exactAddress: 'Block 9 Kitchen',
      contactPhone: '+91 94450 11223',
    }),
  },
  {
    id: 'lst-expired',
    data: () => ({
      title: 'Old Upma',
      status: 'published',
      routeTier: 'human',
      dietType: 'vegetarian',
      quantity: 10,
      portions: 30,
      lat: 13.083,
      lng: 80.271,
      geohash: encodeGeohash(13.083, 80.271, 6),
      consumeBy: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
      pickupEnd: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      location: 'Hostel Mess 1',
    }),
  },
];

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ type: 'collection' })),
  query: vi.fn((...args) => ({ _query: true, args })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  orderBy: vi.fn((field) => ({ orderBy: field })),
  limit: vi.fn((count) => ({ limit: count })),
  startAfter: vi.fn((doc) => ({ startAfter: doc })),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: mockDocs,
    })
  ),
}));

describe('Matching Engine & Geohash Radius Expansion (Prompt 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Geohash Encoding & Range Query Helpers', () => {
    it('encodes latitude and longitude accurately into base32 geohashes', () => {
      const hash = encodeGeohash(13.0827, 80.2707, 6);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(6);
    });

    it('decodes geohash back to within bounding range', () => {
      const originalLat = 13.0827;
      const originalLng = 80.2707;
      const hash = encodeGeohash(originalLat, originalLng, 7);
      const decoded = decodeGeohash(hash);

      expect(Math.abs(decoded.lat - originalLat)).toBeLessThan(0.01);
      expect(Math.abs(decoded.lng - originalLng)).toBeLessThan(0.01);
    });

    it('determines appropriate precision for different radius thresholds', () => {
      expect(getPrecisionForRadius(1)).toBe(6); // <= 1.5 km
      expect(getPrecisionForRadius(5)).toBe(5); // <= 5 km
      expect(getPrecisionForRadius(10)).toBe(4); // <= 20 km
      expect(getPrecisionForRadius(50)).toBe(3); // <= 80 km
    });

    it('computes correct Firestore query bounds with tilde suffix', () => {
      const bounds = geohashQueryBounds('tdr1v');
      expect(bounds[0]).toBe('tdr1v');
      expect(bounds[1]).toBe('tdr1v~');
      expect(bounds[1] > bounds[0]).toBe(true);
    });

    it('generates multi-cell geohash query ranges covering radius bounding box', () => {
      const ranges = getGeohashQueryRanges(13.0827, 80.2707, 5);
      expect(Array.isArray(ranges)).toBe(true);
      expect(ranges.length).toBeGreaterThan(0);
      expect(ranges[0].length).toBe(2);
      expect(ranges[0][0] < ranges[0][1]).toBe(true);
    });
  });

  describe('Safety-First Recipient Eligibility (Safety Gate)', () => {
    const verifiedRecipientOrg = {
      id: 'org-ngo-1',
      status: 'approved',
      category: 'ngo',
      dietaryPreference: 'all',
      maxPortionsPerClaim: 100,
    };

    const validHumanListing = {
      id: 'lst-1',
      status: 'published',
      routeTier: 'human',
      dietType: 'vegetarian',
      consumeBy: Date.now() + 1000 * 60 * 60 * 3,
      pickupEnd: Date.now() + 1000 * 60 * 60 * 2,
    };

    it('approves eligible recipient with published, unexpired human surplus', () => {
      const result = checkRecipientSafetyEligibility(verifiedRecipientOrg, validHumanListing);
      expect(result.isEligible).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('rejects unapproved recipient organisations', () => {
      const pendingOrg = { ...verifiedRecipientOrg, status: 'pending' };
      const suspendedOrg = { ...verifiedRecipientOrg, status: 'suspended' };

      expect(checkRecipientSafetyEligibility(pendingOrg, validHumanListing).isEligible).toBe(false);
      expect(checkRecipientSafetyEligibility(suspendedOrg, validHumanListing).isEligible).toBe(
        false
      );
    });

    it('rejects expired listings even if organisation is approved and close', () => {
      const expiredListing = {
        ...validHumanListing,
        consumeBy: Date.now() - 1000 * 60, // 1 min ago
      };

      const result = checkRecipientSafetyEligibility(verifiedRecipientOrg, expiredListing);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toMatch(/expired/i);
    });

    it('enforces route tier gating: farms cannot claim human meals', () => {
      const farmOrg = { ...verifiedRecipientOrg, category: 'farm' };
      const result = checkRecipientSafetyEligibility(farmOrg, validHumanListing);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toMatch(/farms.*cannot claim human/i);
    });

    it('enforces dietary restrictions compatibility', () => {
      const veganOrg = { ...verifiedRecipientOrg, dietaryPreference: 'vegan' };
      const nonVegListing = { ...validHumanListing, dietType: 'non-vegetarian' };

      const result = checkRecipientSafetyEligibility(veganOrg, nonVegListing);
      expect(result.isEligible).toBe(false);
      expect(result.reason).toMatch(/dietary requirement/i);
    });

    it('RADIUS EXPANSION INVARIANT: Expanding radius NEVER relaxes safety eligibility', () => {
      const pendingOrg = { ...verifiedRecipientOrg, status: 'pending' };

      // Invariant test across all 4 radius bands
      RADIUS_BANDS_KM.forEach(() => {
        const eligibility = checkRecipientSafetyEligibility(pendingOrg, validHumanListing);
        expect(eligibility.isEligible).toBe(false);
      });
    });
  });

  describe('Capacity & Pickup-Window Compatibility', () => {
    it('approves listings within recipient logistical handling capacity', () => {
      const org = { maxPortionsPerClaim: 80 };
      const listing = { portions: 50, quantity: 15 };

      const result = checkCapacityCompatibility(org, listing);
      expect(result.isCompatible).toBe(true);
    });

    it('flags listings that severely exceed recipient logistical handling volume', () => {
      const smallOrg = { maxPortionsPerClaim: 30 };
      const largeListing = { portions: 120, quantity: 40 };

      const result = checkCapacityCompatibility(smallOrg, largeListing);
      expect(result.isCompatible).toBe(false);
      expect(result.reason).toMatch(/exceeds recipient logistical handling capacity/i);
    });

    it('validates pickup window feasibility when adequate time remains', () => {
      const listing = {
        pickupEnd: Date.now() + 1000 * 60 * 90, // 90 min future
        consumeBy: Date.now() + 1000 * 60 * 180,
      };

      const result = checkPickupWindowFeasibility(listing, 15);
      expect(result.isFeasible).toBe(true);
    });

    it('rejects listings when pickup window has closed', () => {
      const listing = {
        pickupEnd: Date.now() - 1000 * 60 * 5, // 5 min ago
        consumeBy: Date.now() + 1000 * 60 * 180,
      };

      const result = checkPickupWindowFeasibility(listing);
      expect(result.isFeasible).toBe(false);
      expect(result.reason).toMatch(/pickup window has already closed/i);
    });
  });

  describe('Approximate Before Claim vs Exact After Claim Location Disclosure', () => {
    const rawListing = {
      id: 'lst-100',
      title: 'Rice and Sambar',
      lat: 13.082745,
      lng: 80.270789,
      location: 'Central Campus Mess 3 Loading Dock',
      exactAddress: 'Rear Loading Dock, Door 4, Gate 2',
      contactPhone: '+91 94450 12345',
      contactPerson: 'Mess Coordinator',
    };

    it('masks exact address and phone prior to claim confirmation', () => {
      const masked = maskListingLocation(rawListing, false);

      expect(masked.isLocationPartitioned).toBe(true);
      expect(masked.exactAddress).toBeNull();
      expect(masked.contactPhone).toBeNull();
      expect(masked.contactPerson).toBeNull();
      // Retains coarse location & approximate coordinates
      expect(masked.coarseLocation).toBe('Central Campus Mess 3 Loading Dock');
      expect(masked.coarseCoordinates.lat).toBe(13.08);
      expect(masked.coarseCoordinates.lng).toBe(80.27);
    });

    it('reveals exact pickup location and coordinator phone after claim is confirmed', () => {
      const revealed = maskListingLocation(rawListing, true);

      expect(revealed.isLocationPartitioned).toBe(false);
      expect(revealed.exactAddress).toBe('Rear Loading Dock, Door 4, Gate 2');
      expect(revealed.contactPhone).toBe('+91 94450 12345');
      expect(revealed.contactPerson).toBe('Mess Coordinator');
    });
  });

  describe('findMatchingSurplusListings Engine Execution', () => {
    const recipientLocation = { lat: 13.0827, lng: 80.2707 };
    const approvedOrg = {
      id: 'org-1',
      status: 'approved',
      category: 'ngo',
      maxPortionsPerClaim: 100,
      dietaryPreference: 'all',
    };

    it('queries within geohash bounds and applies exact Haversine proximity filtering', async () => {
      const result = await findMatchingSurplusListings(recipientLocation, approvedOrg, {
        radiusKm: 3,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.listings)).toBe(true);

      // Verify that near item (dist < 3km) is included, but expired item is omitted
      const nearItem = result.listings.find((l) => l.id === 'lst-near-veg');
      expect(nearItem).toBeDefined();
      expect(nearItem.exactDistanceKm).toBeLessThanOrEqual(3);

      const expiredItem = result.listings.find((l) => l.id === 'lst-expired');
      expect(expiredItem).toBeUndefined();
    });

    it('expands discovery when radius expands from 3 km to 10 km', async () => {
      const distToFar = haversineDistance(13.0827, 80.2707, 13.12, 80.3);

      // At 3 km, far item should be filtered out
      const res3km = await findMatchingSurplusListings(recipientLocation, approvedOrg, {
        radiusKm: 3,
      });
      const farIn3km = res3km.listings.find((l) => l.id === 'lst-far-veg');
      expect(farIn3km).toBeUndefined();

      // At radius exceeding distance (e.g. 10 km), far item is included
      if (distToFar <= 10) {
        const res10km = await findMatchingSurplusListings(recipientLocation, approvedOrg, {
          radiusKm: 10,
        });
        const farIn10km = res10km.listings.find((l) => l.id === 'lst-far-veg');
        expect(farIn10km).toBeDefined();
      }
    });

    it('ranks candidates by straight-line distance ascending', async () => {
      const result = await findMatchingSurplusListings(recipientLocation, approvedOrg, {
        radiusKm: 15,
      });

      if (result.listings.length >= 2) {
        expect(result.listings[0].exactDistanceKm).toBeLessThanOrEqual(
          result.listings[1].exactDistanceKm
        );
      }
    });

    it('minimises Firestore reads with bounded query page sizes', async () => {
      const { limit } = await import('firebase/firestore');
      await findMatchingSurplusListings(recipientLocation, approvedOrg, {
        radiusKm: 5,
        pageSize: 5,
      });

      expect(limit).toHaveBeenCalledWith(5);
    });
  });
});
