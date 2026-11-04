/**
 * FoodBridge Location & Proximity Service
 * ₹0 Spark Invariants:
 * - Straight-line distance using Haversine formula (no paid Google Maps / Mapbox / route APIs)
 * - Browser Geolocation API with user permission prompt and manual fallback
 * - Policy-compliant OpenStreetMap attribution and usage
 */

/**
 * Calculates great-circle straight-line distance in kilometers using the Haversine formula.
 *
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers rounded to two decimal places
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    throw new Error('All coordinates must be valid numbers.');
  }

  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees.');
  }

  if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
    throw new Error('Longitude must be between -180 and 180 degrees.');
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Formats a distance in kilometers into human-readable text.
 * @param {number} km Distance in km
 * @returns {string} e.g. "450 m" or "1.4 km"
 */
export function formatDistance(km) {
  if (typeof km !== 'number' || isNaN(km) || km < 0) {
    return 'Distance unknown';
  }

  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Coarsens coordinates for public recipient feeds before claim confirmation.
 * Precision of 2 decimal places corresponds to ~1.1 km grid resolution.
 */
export function approximateCoordinates(lat, lng, decimalPlaces = 2) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return null;
  }
  const factor = Math.pow(10, decimalPlaces);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor,
    isApproximate: true,
  };
}

/**
 * Default zero-cost campus landmarks for manual pin / address selection
 * when browser geolocation is denied or unavailable.
 */
export const DEFAULT_CAMPUS_LANDMARKS = [
  {
    id: 'lm-central-mess',
    name: 'Central Mess & Kitchen Complex',
    lat: 13.0827,
    lng: 80.2707,
    coarseArea: 'Central Dining Complex, Sector B',
  },
  {
    id: 'lm-north-gate',
    name: 'North Campus Main Entrance',
    lat: 13.0845,
    lng: 80.2725,
    coarseArea: 'North Gate Dispatch Area',
  },
  {
    id: 'lm-eng-cafe',
    name: 'Engineering Complex Cafeteria',
    lat: 13.0862,
    lng: 80.2751,
    coarseArea: 'East Tech Quad',
  },
  {
    id: 'lm-hostel-quad',
    name: 'South Student Hostel Quad',
    lat: 13.0805,
    lng: 80.2689,
    coarseArea: 'South Hostels',
  },
  {
    id: 'lm-community-center',
    name: 'Civic Welfare Community Center',
    lat: 13.088,
    lng: 80.265,
    coarseArea: 'West Civic Enclave',
  },
];

/**
 * Retrieves the user's location via browser Geolocation API with explicit timeout.
 * Reverts gracefully with specific error codes if denied or unavailable.
 */
export async function getUserGeolocation(
  options = { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
) {
  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    return {
      lat: null,
      lng: null,
      accuracy: null,
      error: 'NOT_SUPPORTED',
      message: 'Browser geolocation is not supported on this device or connection.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          message: 'Location acquired successfully.',
        });
      },
      (error) => {
        let errorCode = 'UNKNOWN';
        let message =
          'Unable to determine location. Please select a landmark or drop a manual pin.';

        if (error.code === 1) {
          errorCode = 'PERMISSION_DENIED';
          message =
            'Location access was declined. You can select a campus landmark or set a pin manually.';
        } else if (error.code === 2) {
          errorCode = 'POSITION_UNAVAILABLE';
          message = 'Location signal unavailable. Please use the manual address fallback.';
        } else if (error.code === 3) {
          errorCode = 'TIMEOUT';
          message = 'Location request timed out. Please select your location manually.';
        }

        resolve({
          lat: null,
          lng: null,
          accuracy: null,
          error: errorCode,
          message,
        });
      },
      options
    );
  });
}
