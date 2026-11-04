/**
 * Advisory Prediction Service (Prompt 15 — ₹0 Baseline)
 *
 * Implements moving averages and weekday/meal patterns in pure client-side JavaScript.
 *
 * Invariants:
 * 1. Gated: Requires at least 14 distinct days of historical records before automated forecasts activate.
 * 2. Pure JavaScript: Zero hosted ML, Zero Gemini, Zero OpenAI, Zero Vertex AI, Zero paid APIs.
 * 3. Transparent metadata: Sample size (n), date window (start to end), and uncertainty (+/- std dev).
 * 4. Safety: Forecasts NEVER create confirmed listings. All predictions are strictly labeled ESTIMATE.
 */

export const MIN_HISTORICAL_DAYS = 14;

/**
 * Checks whether historical records meet the 14-day data completeness prerequisite.
 *
 * @param {Array<object>} records
 * @returns {object} { isEligible, distinctDaysCount, minDaysRequired, dateStart, dateEnd, totalRecords }
 */
export function checkAdvisoryEligibility(records = [], minDays = MIN_HISTORICAL_DAYS) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      isEligible: false,
      distinctDaysCount: 0,
      minDaysRequired: minDays,
      dateStart: null,
      dateEnd: null,
      totalRecords: 0,
    };
  }

  const distinctDates = new Set();
  records.forEach((r) => {
    if (r.mealDate && /^\d{4}-\d{2}-\d{2}$/.test(r.mealDate)) {
      distinctDates.add(r.mealDate);
    }
  });

  const sortedDates = Array.from(distinctDates).sort();
  const distinctDaysCount = sortedDates.length;
  const isEligible = distinctDaysCount >= minDays;

  return {
    isEligible,
    distinctDaysCount,
    minDaysRequired: minDays,
    dateStart: sortedDates[0] || null,
    dateEnd: sortedDates[sortedDates.length - 1] || null,
    totalRecords: records.length,
  };
}

/**
 * Computes sample standard deviation for a set of numbers.
 *
 * @param {Array<number>} values
 * @param {number} mean
 * @returns {number} Standard deviation rounded to 2 decimals
 */
export function computeStandardDeviation(values = [], mean = null) {
  if (!Array.isArray(values) || values.length <= 1) return 0;
  const avg = mean !== null ? mean : values.reduce((acc, v) => acc + v, 0) / values.length;
  const sumSquaredDiffs = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
  return Number(Math.sqrt(sumSquaredDiffs / (values.length - 1)).toFixed(2));
}

/**
 * Generates rolling moving averages and weekday/meal pattern forecasts from historical records.
 *
 * @param {Array<object>} records Historical mess records
 * @param {object} options Configuration options
 * @returns {object} Advisory forecasts, weekday patterns, and scaling recommendations
 */
export function generateAdvisoryForecasts(records = [], options = {}) {
  const eligibility = checkAdvisoryEligibility(records, options.minDays || MIN_HISTORICAL_DAYS);

  if (!eligibility.isEligible && !options.bypassGate) {
    return {
      isGated: true,
      eligibility,
      weekdayPatterns: {},
      mealTypePatterns: {},
      dishRecommendations: [],
      overallSMA: null,
    };
  }

  // 1. Group records by Weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const WEEKDAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const weekdayGroups = {};
  WEEKDAY_NAMES.forEach((name, idx) => {
    weekdayGroups[idx] = {
      dayIndex: idx,
      dayName: name,
      records: [],
      prepValues: [],
      servedValues: [],
      leftoverValues: [],
      units: new Set(),
    };
  });

  // 2. Group records by Meal Type ('breakfast', 'lunch', 'snacks', 'dinner')
  const mealTypeGroups = {
    breakfast: {
      name: 'Breakfast',
      records: [],
      prepValues: [],
      servedValues: [],
      leftoverValues: [],
    },
    lunch: { name: 'Lunch', records: [], prepValues: [], servedValues: [], leftoverValues: [] },
    snacks: { name: 'Snacks', records: [], prepValues: [], servedValues: [], leftoverValues: [] },
    dinner: { name: 'Dinner', records: [], prepValues: [], servedValues: [], leftoverValues: [] },
  };

  // 3. Group by Dish for menu-specific batch scaling recommendations
  const dishGroups = {};

  records.forEach((rec) => {
    if (!rec.mealDate) return;
    const dateObj = new Date(`${rec.mealDate}T00:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();

    const prep = rec.preparedQty || 0;
    const leftover = rec.leftoverQty || 0;
    const served = rec.servedQty !== null && rec.servedQty !== undefined ? rec.servedQty : null;
    const unit = (rec.unit || 'kg').toLowerCase();

    // Weekday accumulation
    if (weekdayGroups[dayOfWeek]) {
      const wg = weekdayGroups[dayOfWeek];
      wg.records.push(rec);
      wg.prepValues.push(prep);
      wg.leftoverValues.push(leftover);
      if (served !== null) wg.servedValues.push(served);
      wg.units.add(unit);
    }

    // Meal type accumulation
    const meal = (rec.mealType || '').toLowerCase();
    if (mealTypeGroups[meal]) {
      const mg = mealTypeGroups[meal];
      mg.records.push(rec);
      mg.prepValues.push(prep);
      mg.leftoverValues.push(leftover);
      if (served !== null) mg.servedValues.push(served);
    }

    // Dish accumulation
    const dish = (rec.dishName || '').trim();
    if (dish) {
      if (!dishGroups[dish]) {
        dishGroups[dish] = {
          dishName: dish,
          unit,
          prepList: [],
          servedList: [],
          leftoverList: [],
        };
      }
      dishGroups[dish].prepList.push(prep);
      dishGroups[dish].leftoverList.push(leftover);
      if (served !== null) dishGroups[dish].servedList.push(served);
    }
  });

  // Calculate Weekday Aggregates with Uncertainty (+/- sigma)
  const weekdayPatterns = {};
  Object.values(weekdayGroups).forEach((wg) => {
    const sampleSize = wg.records.length;
    if (sampleSize === 0) return;

    const avgPrep = wg.prepValues.reduce((a, b) => a + b, 0) / sampleSize;
    const avgLeftover = wg.leftoverValues.reduce((a, b) => a + b, 0) / sampleSize;
    const avgServed =
      wg.servedValues.length > 0
        ? wg.servedValues.reduce((a, b) => a + b, 0) / wg.servedValues.length
        : null;

    const surplusRate = avgPrep > 0 ? (avgLeftover / avgPrep) * 100 : 0;
    const leftoverUncertainty = computeStandardDeviation(wg.leftoverValues, avgLeftover);
    const prepUncertainty = computeStandardDeviation(wg.prepValues, avgPrep);

    weekdayPatterns[wg.dayName] = {
      dayName: wg.dayName,
      dayIndex: wg.dayIndex,
      sampleSize,
      primaryUnit: Array.from(wg.units)[0] || 'kg',
      avgPrepared: Number(avgPrep.toFixed(1)),
      prepUncertainty,
      avgServed: avgServed !== null ? Number(avgServed.toFixed(1)) : null,
      avgLeftover: Number(avgLeftover.toFixed(1)),
      leftoverUncertainty,
      surplusRate: Number(surplusRate.toFixed(1)),
      estimateLabel: 'ESTIMATE',
    };
  });

  // Calculate Meal-Type Aggregates
  const mealTypePatterns = {};
  Object.entries(mealTypeGroups).forEach(([mealKey, mg]) => {
    const sampleSize = mg.records.length;
    if (sampleSize === 0) return;

    const avgPrep = mg.prepValues.reduce((a, b) => a + b, 0) / sampleSize;
    const avgLeftover = mg.leftoverValues.reduce((a, b) => a + b, 0) / sampleSize;
    const surplusRate = avgPrep > 0 ? (avgLeftover / avgPrep) * 100 : 0;
    const leftoverUncertainty = computeStandardDeviation(mg.leftoverValues, avgLeftover);

    mealTypePatterns[mealKey] = {
      mealType: mg.name,
      sampleSize,
      avgPrepared: Number(avgPrep.toFixed(1)),
      avgLeftover: Number(avgLeftover.toFixed(1)),
      leftoverUncertainty,
      surplusRate: Number(surplusRate.toFixed(1)),
      estimateLabel: 'ESTIMATE',
    };
  });

  // Dish-Level Batch Prep Scaling Recommendations
  const dishRecommendations = Object.values(dishGroups)
    .filter((dg) => dg.prepList.length >= 2)
    .map((dg) => {
      const sampleSize = dg.prepList.length;
      const totalPrep = dg.prepList.reduce((a, b) => a + b, 0);
      const totalLeftover = dg.leftoverList.reduce((a, b) => a + b, 0);
      const avgPrep = totalPrep / sampleSize;
      const avgLeftover = totalLeftover / sampleSize;
      const surplusRate = avgPrep > 0 ? (avgLeftover / avgPrep) * 100 : 0;
      const leftoverUncertainty = computeStandardDeviation(dg.leftoverList, avgLeftover);

      // Advisory prep adjustment: recommend reducing batch by 50%-80% of average surplus
      // If surplus rate > 10%, recommend safe trimming
      let recommendedAdjustmentPct = 0;
      if (surplusRate > 15) {
        recommendedAdjustmentPct = -12;
      } else if (surplusRate > 10) {
        recommendedAdjustmentPct = -8;
      } else if (surplusRate < 3) {
        recommendedAdjustmentPct = 0; // Optimal
      }

      const suggestedPrep = Number((avgPrep * (1 + recommendedAdjustmentPct / 100)).toFixed(1));

      return {
        dishName: dg.dishName,
        unit: dg.unit,
        sampleSize,
        avgPrep: Number(avgPrep.toFixed(1)),
        avgLeftover: Number(avgLeftover.toFixed(1)),
        leftoverUncertainty,
        surplusRate: Number(surplusRate.toFixed(1)),
        recommendedAdjustmentPct,
        suggestedPrep,
        estimateLabel: 'ESTIMATE',
        guidanceText:
          recommendedAdjustmentPct < 0
            ? `Consider scaling down initial batch preparation by ${Math.abs(recommendedAdjustmentPct)}% to avoid typical surplus of ${avgLeftover.toFixed(1)} ${dg.unit}. Prepare replenishment in secondary batches if dining hall attendance spikes.`
            : `Surplus rate is optimal (${surplusRate.toFixed(1)}%). Maintain current prep schedule.`,
      };
    })
    .sort((a, b) => b.surplusRate - a.surplusRate);

  // Overall Simple Moving Average (SMA) across all records
  const totalObs = records.length;
  const sumPrep = records.reduce((a, r) => a + (r.preparedQty || 0), 0);
  const sumLeftover = records.reduce((a, r) => a + (r.leftoverQty || 0), 0);
  const overallSMA = {
    sampleSize: totalObs,
    dateStart: eligibility.dateStart,
    dateEnd: eligibility.dateEnd,
    avgPrepared: Number((sumPrep / totalObs).toFixed(1)),
    avgLeftover: Number((sumLeftover / totalObs).toFixed(1)),
    overallSurplusRate: Number(((sumLeftover / sumPrep) * 100).toFixed(1)),
    estimateLabel: 'ESTIMATE',
  };

  return {
    isGated: false,
    eligibility,
    weekdayPatterns,
    mealTypePatterns,
    dishRecommendations,
    overallSMA,
    disclaimer:
      'CRITICAL SAFETY POLICY: Forecasts are advisory estimates computed from moving averages. Forecasts NEVER create confirmed surplus listings or commit food donations without explicit human operator creation.',
  };
}

/**
 * 14-Day Realistic Historical Dataset Generator for Verification & Offline Testing.
 * Generates 14 distinct days of lunch & dinner records with realistic weekday surplus patterns.
 */
export function generate14DayHistoricalSeed(orgId = 'org-campus-mess') {
  const records = [];
  const baseDate = new Date('2026-10-21T00:00:00Z');

  const MENU_ROTATION = [
    { dish: 'Yellow Dal & Jeera Rice', prep: 120, served: 106, left: 14, unit: 'kg' },
    { dish: 'Rajma Chawal', prep: 115, served: 100, left: 15, unit: 'kg' },
    { dish: 'Mix Veg Curry & Rotis', prep: 95, served: 83, left: 12, unit: 'kg' },
    { dish: 'Paneer Butter Masala', prep: 85, served: 78, left: 7, unit: 'kg' },
    { dish: 'Chole Bhature / Rice', prep: 130, served: 112, left: 18, unit: 'kg' },
    { dish: 'Veg Pulao & Raita', prep: 105, served: 95, left: 10, unit: 'kg' },
    { dish: 'Sambhar Rice & Poriyal', prep: 110, served: 102, left: 8, unit: 'kg' },
  ];

  for (let day = 0; day < 14; day++) {
    const d = new Date(baseDate);
    d.setUTCDate(baseDate.getUTCDate() + day);
    const dateStr = d.toISOString().split('T')[0];

    const lunchMenu = MENU_ROTATION[day % MENU_ROTATION.length];
    const dinnerMenu = MENU_ROTATION[(day + 3) % MENU_ROTATION.length];

    // Lunch record
    records.push({
      id: `seed-14d-l-${day + 1}`,
      orgId,
      mealDate: dateStr,
      mealType: 'lunch',
      dishName: lunchMenu.dish,
      preparedQty: lunchMenu.prep,
      preparedMethod: 'measured',
      servedQty: lunchMenu.served,
      servedMethod: 'measured',
      leftoverQty: lunchMenu.left,
      leftoverMethod: 'measured',
      unit: lunchMenu.unit,
      peopleServed: 310 + (day % 4) * 15,
      peopleMethod: 'measured',
      enteredBy: 'Operator Sharma',
      createdAt: `${dateStr}T14:30:00Z`,
    });

    // Dinner record
    records.push({
      id: `seed-14d-d-${day + 1}`,
      orgId,
      mealDate: dateStr,
      mealType: 'dinner',
      dishName: dinnerMenu.dish,
      preparedQty: dinnerMenu.prep,
      preparedMethod: 'measured',
      servedQty: dinnerMenu.served,
      servedMethod: 'derived',
      leftoverQty: dinnerMenu.left,
      leftoverMethod: 'measured',
      unit: dinnerMenu.unit,
      peopleServed: 280 + (day % 3) * 10,
      peopleMethod: 'measured',
      enteredBy: 'Supervisor Verma',
      createdAt: `${dateStr}T21:00:00Z`,
    });
  }

  return records;
}
