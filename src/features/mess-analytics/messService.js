import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase.js';

/**
 * Measurement Methods
 * Explicitly separates physical scale measurements from mathematical deductions and operator visual estimates.
 */
export const MEASUREMENT_METHODS = {
  MEASURED: 'measured',
  DERIVED: 'derived',
  ESTIMATED: 'estimated',
};

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  SNACKS: 'snacks',
  DINNER: 'dinner',
};

export const ALLOWED_UNITS = ['kg', 'portions', 'litres'];

/**
 * Creates a mess service production record in Firestore.
 *
 * Invariants:
 * 1. Missing data is stored as null, NEVER 0.
 * 2. Measurement methods (measured, derived, estimated) are explicitly preserved.
 * 3. Quantities are non-negative numbers with explicit units.
 * 4. Stays strictly within Spark ₹0 quotas.
 *
 * @param {object} params
 * @param {string} params.orgId Organisation ID of the dining hall/mess
 * @param {object} params.user Current authenticated operator { uid, displayName }
 * @param {string} params.mealDate Date string YYYY-MM-DD
 * @param {string} params.mealType 'breakfast' | 'lunch' | 'snacks' | 'dinner'
 * @param {string} params.dishName Menu item or dish description
 * @param {number} params.preparedQty Quantity prepared (>= 0)
 * @param {string} [params.preparedMethod] 'measured' | 'estimated' | 'derived'
 * @param {number|null} [params.servedQty] Quantity consumed/served (null if missing, never 0 for unknown)
 * @param {string|null} [params.servedMethod] 'measured' | 'estimated' | 'derived'
 * @param {number} params.leftoverQty Unserved leftover quantity (>= 0)
 * @param {string} [params.leftoverMethod] 'measured' | 'estimated' | 'derived'
 * @param {string} params.unit 'kg' | 'portions' | 'litres'
 * @param {number|null} [params.peopleServed] Headcount of diners (null if unmeasured)
 * @param {string|null} [params.peopleMethod] 'measured' | 'estimated' | null
 * @param {string} [params.notes] Kitchen operational notes
 * @returns {Promise<{ id: string, record: object }>}
 */
export async function createMessRecord({
  orgId,
  user,
  mealDate,
  mealType,
  dishName,
  preparedQty,
  preparedMethod = MEASUREMENT_METHODS.MEASURED,
  servedQty = null,
  servedMethod = null,
  leftoverQty,
  leftoverMethod = MEASUREMENT_METHODS.MEASURED,
  unit = 'kg',
  peopleServed = null,
  peopleMethod = null,
  notes = '',
}) {
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Valid Organisation ID is required to log mess records.');
  }

  if (!user || !user.uid) {
    throw new Error('Operator must be authenticated to log mess production.');
  }

  if (!mealDate || !/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
    throw new Error('Valid meal date in YYYY-MM-DD format is required.');
  }

  const normalizedMealType = (mealType || '').toLowerCase();
  if (!Object.values(MEAL_TYPES).includes(normalizedMealType)) {
    throw new Error(
      `Invalid meal type "${mealType}". Must be one of: breakfast, lunch, snacks, dinner.`
    );
  }

  if (!dishName || typeof dishName !== 'string' || !dishName.trim()) {
    throw new Error('Dish / menu item name is required.');
  }

  const prepNum = typeof preparedQty === 'number' ? preparedQty : parseFloat(preparedQty);
  if (isNaN(prepNum) || prepNum < 0) {
    throw new Error('Prepared quantity must be a non-negative number.');
  }

  const leftoverNum = typeof leftoverQty === 'number' ? leftoverQty : parseFloat(leftoverQty);
  if (isNaN(leftoverNum) || leftoverNum < 0) {
    throw new Error('Leftover quantity must be a non-negative number.');
  }

  // Unit validation (strict: never mix units)
  const normalizedUnit = (unit || '').toLowerCase();
  if (!ALLOWED_UNITS.includes(normalizedUnit)) {
    throw new Error(`Invalid unit "${unit}". Allowed units: ${ALLOWED_UNITS.join(', ')}.`);
  }

  // Missing data rule: If served quantity is empty or null, store null. NEVER treat missing as zero!
  let servedNum = null;
  if (servedQty !== null && servedQty !== undefined && servedQty !== '') {
    const parsedServed = typeof servedQty === 'number' ? servedQty : parseFloat(servedQty);
    if (isNaN(parsedServed) || parsedServed < 0) {
      throw new Error('Served quantity must be a non-negative number or left blank (null).');
    }
    servedNum = parsedServed;
  }

  // Missing data rule: If headcount is empty or null, store null.
  let peopleNum = null;
  if (peopleServed !== null && peopleServed !== undefined && peopleServed !== '') {
    const parsedPeople =
      typeof peopleServed === 'number' ? peopleServed : parseInt(peopleServed, 10);
    if (isNaN(parsedPeople) || parsedPeople < 0) {
      throw new Error('People served must be a non-negative whole number or left blank (null).');
    }
    peopleNum = parsedPeople;
  }

  // Measurement method validations
  const validMethods = Object.values(MEASUREMENT_METHODS);
  const pMethod = validMethods.includes(preparedMethod)
    ? preparedMethod
    : MEASUREMENT_METHODS.MEASURED;
  const lMethod = validMethods.includes(leftoverMethod)
    ? leftoverMethod
    : MEASUREMENT_METHODS.MEASURED;
  const sMethod =
    servedNum !== null && validMethods.includes(servedMethod)
      ? servedMethod
      : servedNum !== null
        ? MEASUREMENT_METHODS.MEASURED
        : null;

  const payload = {
    orgId,
    mealDate,
    mealType: normalizedMealType,
    dishName: dishName.trim(),
    preparedQty: prepNum,
    preparedMethod: pMethod,
    servedQty: servedNum,
    servedMethod: sMethod,
    leftoverQty: leftoverNum,
    leftoverMethod: lMethod,
    unit: normalizedUnit,
    peopleServed: peopleNum,
    peopleMethod: peopleNum !== null ? peopleMethod || MEASUREMENT_METHODS.MEASURED : null,
    notes: (notes || '').trim(),
    enteredBy: user.displayName || user.email || user.uid,
    enteredByUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'messRecords'), payload);

  return {
    id: docRef.id,
    record: {
      id: docRef.id,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Fetches mess records with cursor-based pagination.
 * Stays strictly within Firestore Spark read quotas by bounding query sizes.
 *
 * @param {object} params
 * @param {string} params.orgId
 * @param {number} [params.pageSize] Records per page (default 10, max 25)
 * @param {object|null} [params.startAfterDoc] Firestore DocumentSnapshot cursor
 * @param {string|null} [params.mealType] Filter by meal type
 * @returns {Promise<{ records: Array<object>, lastDoc: object|null, hasMore: boolean }>}
 */
export async function fetchMessRecordsPaginated({
  orgId,
  pageSize = 10,
  startAfterDoc = null,
  mealType = null,
}) {
  if (!orgId) return { records: [], lastDoc: null, hasMore: false };

  const boundedLimit = Math.min(Math.max(pageSize, 1), 25);
  const constraints = [where('orgId', '==', orgId)];

  if (mealType && mealType !== 'all') {
    constraints.push(where('mealType', '==', mealType.toLowerCase()));
  }

  constraints.push(orderBy('mealDate', 'desc'));

  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }

  // Fetch limit + 1 to determine if there is a next page without a second query
  constraints.push(limit(boundedLimit + 1));

  const q = query(collection(db, 'messRecords'), ...constraints);
  const snapshot = await getDocs(q);

  const docs = snapshot.docs;
  const hasMore = docs.length > boundedLimit;
  const resultDocs = hasMore ? docs.slice(0, boundedLimit) : docs;

  const records = resultDocs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt || new Date().toISOString(),
    };
  });

  const lastDoc = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

  return {
    records,
    lastDoc,
    hasMore,
  };
}

/**
 * Computes descriptive analytics from loaded mess records.
 *
 * Critical Rules:
 * 1. Missing data is NOT zero: records with null servedQty or null peopleServed
 *    are excluded from denominators to prevent skewing averages.
 * 2. Never mix units: quantities are grouped strictly by unit ('kg', 'portions', etc.).
 * 3. Separate measured, derived, and estimated values.
 * 4. Transparent sample sizes (n) for every calculation.
 *
 * @param {Array<object>} records List of mess records
 * @returns {object} Descriptive analytics breakdown
 */
export function computeMessAnalytics(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      sampleSize: 0,
      unitMetrics: {},
      qualityMetrics: {
        totalRecords: 0,
        measuredCount: 0,
        derivedCount: 0,
        estimatedCount: 0,
        missingServedCount: 0,
        missingPeopleCount: 0,
        dataCompletenessRate: 0,
      },
      dishPatterns: [],
      mealDistribution: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 },
      perCapitaByUnit: {},
    };
  }

  const sampleSize = records.length;
  let measuredCount = 0;
  let derivedCount = 0;
  let estimatedCount = 0;
  let missingServedCount = 0;
  let missingPeopleCount = 0;

  const mealDistribution = { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
  const unitGroups = {};
  const dishGroups = {};

  records.forEach((rec) => {
    // 1. Meal type distribution
    const meal = (rec.mealType || 'other').toLowerCase();
    if (mealDistribution[meal] !== undefined) {
      mealDistribution[meal] += 1;
    }

    // 2. Data Completeness & Measurement Methods
    const pMethod = rec.preparedMethod || MEASUREMENT_METHODS.MEASURED;
    const lMethod = rec.leftoverMethod || MEASUREMENT_METHODS.MEASURED;
    const sMethod = rec.servedMethod;

    if (
      pMethod === MEASUREMENT_METHODS.ESTIMATED ||
      lMethod === MEASUREMENT_METHODS.ESTIMATED ||
      sMethod === MEASUREMENT_METHODS.ESTIMATED
    ) {
      estimatedCount += 1;
    } else if (lMethod === MEASUREMENT_METHODS.DERIVED || sMethod === MEASUREMENT_METHODS.DERIVED) {
      derivedCount += 1;
    } else {
      measuredCount += 1;
    }

    if (rec.servedQty === null || rec.servedQty === undefined) {
      missingServedCount += 1;
    }

    if (rec.peopleServed === null || rec.peopleServed === undefined) {
      missingPeopleCount += 1;
    }

    // 3. Group by unit (Invariable: Never mix kg, portions, litres)
    const unit = (rec.unit || 'kg').toLowerCase();
    if (!unitGroups[unit]) {
      unitGroups[unit] = {
        unit,
        totalPrepared: 0,
        totalLeftover: 0,
        totalServed: 0,
        servedSampleCount: 0,
        totalRecords: 0,
        perCapitaPairs: [],
      };
    }

    const uGrp = unitGroups[unit];
    uGrp.totalRecords += 1;
    uGrp.totalPrepared += rec.preparedQty || 0;
    uGrp.totalLeftover += rec.leftoverQty || 0;

    // Missing served is NOT zero: only aggregate when measured
    if (rec.servedQty !== null && rec.servedQty !== undefined) {
      uGrp.totalServed += rec.servedQty;
      uGrp.servedSampleCount += 1;
    }

    // Per-capita pair: requires BOTH servedQty AND peopleServed to be valid numbers > 0
    if (
      rec.servedQty !== null &&
      rec.servedQty !== undefined &&
      rec.peopleServed !== null &&
      rec.peopleServed !== undefined &&
      rec.peopleServed > 0
    ) {
      uGrp.perCapitaPairs.push({
        servedQty: rec.servedQty,
        people: rec.peopleServed,
        ratio: rec.servedQty / rec.peopleServed,
      });
    }

    // 4. Dish-level leftover patterns
    const dishKey = rec.dishName.trim();
    if (!dishGroups[dishKey]) {
      dishGroups[dishKey] = {
        dishName: dishKey,
        unit,
        sampleCount: 0,
        totalPrepared: 0,
        totalLeftover: 0,
      };
    }
    const dGrp = dishGroups[dishKey];
    dGrp.sampleCount += 1;
    dGrp.totalPrepared += rec.preparedQty || 0;
    dGrp.totalLeftover += rec.leftoverQty || 0;
  });

  // Calculate unit-level metrics
  const unitMetrics = {};
  const perCapitaByUnit = {};

  Object.entries(unitGroups).forEach(([unit, data]) => {
    const surplusRate =
      data.totalPrepared > 0 ? ((data.totalLeftover / data.totalPrepared) * 100).toFixed(1) : '0.0';

    const avgLeftoverPerService =
      data.totalRecords > 0 ? (data.totalLeftover / data.totalRecords).toFixed(1) : '0.0';

    const avgServedPerService =
      data.servedSampleCount > 0 ? (data.totalServed / data.servedSampleCount).toFixed(1) : null; // Null if no valid served data exists

    unitMetrics[unit] = {
      unit,
      totalPrepared: Number(data.totalPrepared.toFixed(1)),
      totalLeftover: Number(data.totalLeftover.toFixed(1)),
      totalServed: Number(data.totalServed.toFixed(1)),
      servedSampleCount: data.servedSampleCount,
      surplusRate: Number(surplusRate),
      avgLeftoverPerService: Number(avgLeftoverPerService),
      avgServedPerService: avgServedPerService !== null ? Number(avgServedPerService) : null,
      totalRecords: data.totalRecords,
    };

    // Per-capita consumption (g/person or portions/person)
    if (data.perCapitaPairs.length > 0) {
      const totalRatio = data.perCapitaPairs.reduce((acc, p) => acc + p.ratio, 0);
      const avgConsumption = (totalRatio / data.perCapitaPairs.length).toFixed(3);
      perCapitaByUnit[unit] = {
        unit,
        averagePerPerson: Number(avgConsumption),
        validSampleCount: data.perCapitaPairs.length,
      };
    } else {
      perCapitaByUnit[unit] = {
        unit,
        averagePerPerson: null,
        validSampleCount: 0,
      };
    }
  });

  // Calculate dish patterns
  const dishPatterns = Object.values(dishGroups)
    .map((d) => {
      const surplusRate =
        d.totalPrepared > 0 ? ((d.totalLeftover / d.totalPrepared) * 100).toFixed(1) : '0.0';
      return {
        dishName: d.dishName,
        unit: d.unit,
        sampleCount: d.sampleCount,
        totalPrepared: Number(d.totalPrepared.toFixed(1)),
        totalLeftover: Number(d.totalLeftover.toFixed(1)),
        surplusRate: Number(surplusRate),
      };
    })
    .sort((a, b) => b.surplusRate - a.surplusRate);

  const completeRecords = records.filter(
    (r) =>
      r.servedQty !== null &&
      r.servedQty !== undefined &&
      r.peopleServed !== null &&
      r.peopleServed !== undefined
  ).length;

  const dataCompletenessRate = Number(((completeRecords / sampleSize) * 100).toFixed(1));

  return {
    sampleSize,
    unitMetrics,
    qualityMetrics: {
      totalRecords: sampleSize,
      measuredCount,
      derivedCount,
      estimatedCount,
      missingServedCount,
      missingPeopleCount,
      dataCompletenessRate,
    },
    dishPatterns,
    mealDistribution,
    perCapitaByUnit,
  };
}
