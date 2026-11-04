/**
 * FoodBridge Zero-Cost Geohash Utility
 * Pure JavaScript Base32 Geohash encoding, decoding, and bounding-box query range helpers.
 *
 * Invariant: ₹0 Spark tier, runs entirely in client runtime without paid geo APIs.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encodes latitude and longitude into a geohash string.
 *
 * @param {number} latitude Between -90 and 90
 * @param {number} longitude Between -180 and 180
 * @param {number} precision Number of characters (default 6 ~1.2km resolution)
 * @returns {string} Geohash string
 */
export function encodeGeohash(latitude, longitude, precision = 6) {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    throw new Error('Valid numeric latitude and longitude required for geohash encoding.');
  }

  let latMin = -90.0;
  let latMax = 90.0;
  let lonMin = -180.0;
  let lonMax = 180.0;

  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (lonMin + lonMax) / 2;
      if (longitude >= mid) {
        ch |= 1 << (4 - bit);
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        ch |= 1 << (4 - bit);
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Decodes a geohash string into latitude and longitude bounds and center point.
 *
 * @param {string} geohash
 * @returns {{ lat: number, lng: number, latRange: number[], lonRange: number[] }}
 */
export function decodeGeohash(geohash) {
  if (!geohash || typeof geohash !== 'string') {
    throw new Error('Valid geohash string required for decoding.');
  }

  let latMin = -90.0;
  let latMax = 90.0;
  let lonMin = -180.0;
  let lonMax = 180.0;
  let isEven = true;

  const lower = geohash.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const c = lower[i];
    const cd = BASE32.indexOf(c);
    if (cd === -1) {
      throw new Error(`Invalid character "${c}" in geohash.`);
    }

    for (let j = 0; j < 5; j++) {
      const mask = 1 << (4 - j);
      if (isEven) {
        const mid = (lonMin + lonMax) / 2;
        if ((cd & mask) !== 0) {
          lonMin = mid;
        } else {
          lonMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if ((cd & mask) !== 0) {
          latMin = mid;
        } else {
          latMax = mid;
        }
      }
      isEven = !isEven;
    }
  }

  return {
    lat: (latMin + latMax) / 2,
    lng: (lonMin + lonMax) / 2,
    latRange: [latMin, latMax],
    lonRange: [lonMin, lonMax],
  };
}

/**
 * Returns the query range [start, end] in Firestore for a given geohash prefix.
 * In Firestore: where('geohash', '>=', range[0]), where('geohash', '<=', range[1])
 */
export function geohashQueryBounds(prefix) {
  return [prefix, prefix + '~'];
}

/**
 * Computes optimal geohash precision for a radius in kilometers.
 *
 * @param {number} radiusKm
 * @returns {number} Geohash character precision (3 to 6)
 */
export function getPrecisionForRadius(radiusKm) {
  if (radiusKm <= 1.5) return 6; // ~1.2 km
  if (radiusKm <= 5) return 5; // ~4.9 km
  if (radiusKm <= 20) return 4; // ~39 km
  if (radiusKm <= 80) return 3; // ~156 km
  return 2;
}

/**
 * Generates geohash bounding ranges covering a circular radius around coordinates.
 * Computes center cell and 8 adjacent neighbor bounding boxes to guarantee complete coverage.
 *
 * @param {number} centerLat
 * @param {number} centerLng
 * @param {number} radiusKm
 * @returns {Array<[string, string]>} Array of [startGeohash, endGeohash] query intervals
 */
export function getGeohashQueryRanges(centerLat, centerLng, radiusKm) {
  const precision = getPrecisionForRadius(radiusKm);

  // Degrees per kilometer approximation:
  // 1 deg latitude ~ 111 km
  // 1 deg longitude ~ 111 km * cos(lat)
  const latDelta = radiusKm / 111.0;
  const lonDelta = radiusKm / (111.0 * Math.cos((centerLat * Math.PI) / 180));

  const minLat = Math.max(-90, centerLat - latDelta);
  const maxLat = Math.min(90, centerLat + latDelta);
  const minLon = Math.max(-180, centerLng - lonDelta);
  const maxLon = Math.min(180, centerLng + lonDelta);

  const hashes = new Set();

  // Sample grid points across the bounding box
  const steps = 3;
  for (let i = 0; i <= steps; i++) {
    const lat = minLat + (i * (maxLat - minLat)) / steps;
    for (let j = 0; j <= steps; j++) {
      const lon = minLon + (j * (maxLon - minLon)) / steps;
      hashes.add(encodeGeohash(lat, lon, precision));
    }
  }

  // Deduplicate and consolidate ranges
  const sortedHashes = Array.from(hashes).sort();
  const ranges = [];

  for (const h of sortedHashes) {
    const [start, end] = geohashQueryBounds(h);
    // Consolidate overlapping or contiguous ranges
    if (ranges.length > 0 && ranges[ranges.length - 1][1] >= start) {
      ranges[ranges.length - 1][1] = end;
    } else {
      ranges.push([start, end]);
    }
  }

  return ranges;
}
