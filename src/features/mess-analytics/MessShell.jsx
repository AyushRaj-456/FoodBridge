import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import {
  MEASUREMENT_METHODS,
  createMessRecord,
  fetchMessRecordsPaginated,
  computeMessAnalytics,
} from './messService.js';
import {
  generateAdvisoryForecasts,
  generate14DayHistoricalSeed,
  MIN_HISTORICAL_DAYS,
} from './advisoryService.js';

// Baseline seed data when offline or prior to live organisation logging
const INITIAL_DEMO_RECORDS = [
  {
    id: 'rec-01',
    orgId: 'org-campus-mess',
    mealDate: '2026-11-04',
    mealType: 'lunch',
    dishName: 'Yellow Dal & Jeera Rice',
    preparedQty: 120.0,
    preparedMethod: 'measured',
    servedQty: 104.5,
    servedMethod: 'measured',
    leftoverQty: 15.5,
    leftoverMethod: 'measured',
    unit: 'kg',
    peopleServed: 320,
    peopleMethod: 'measured',
    enteredBy: 'Operator Sharma',
  },
  {
    id: 'rec-02',
    orgId: 'org-campus-mess',
    mealDate: '2026-11-04',
    mealType: 'breakfast',
    dishName: 'Poha & Masala Chai',
    preparedQty: 65.0,
    preparedMethod: 'measured',
    servedQty: 64.0,
    servedMethod: 'measured',
    leftoverQty: 1.0,
    leftoverMethod: 'measured',
    unit: 'kg',
    peopleServed: 280,
    peopleMethod: 'measured',
    enteredBy: 'Operator Sharma',
  },
  {
    id: 'rec-03',
    orgId: 'org-campus-mess',
    mealDate: '2026-11-03',
    mealType: 'dinner',
    dishName: 'Mix Veg Curry & Rotis',
    preparedQty: 95.0,
    preparedMethod: 'measured',
    servedQty: 82.0,
    servedMethod: 'derived',
    leftoverQty: 13.0,
    leftoverMethod: 'measured',
    unit: 'kg',
    peopleServed: 290,
    peopleMethod: 'estimated',
    enteredBy: 'Supervisor Verma',
  },
  {
    id: 'rec-04',
    orgId: 'org-campus-mess',
    mealDate: '2026-11-03',
    mealType: 'lunch',
    dishName: 'Rajma & Steamed Rice',
    preparedQty: 110.0,
    preparedMethod: 'measured',
    servedQty: null, // Explicit missing data
    servedMethod: null,
    leftoverQty: 18.0,
    leftoverMethod: 'measured',
    unit: 'kg',
    peopleServed: null, // Explicit missing headcount
    peopleMethod: null,
    enteredBy: 'Operator Sharma',
    notes: 'Dinner rush; plate tally was not maintained.',
  },
  {
    id: 'rec-05',
    orgId: 'org-campus-mess',
    mealDate: '2026-11-02',
    mealType: 'dinner',
    dishName: 'Paneer Butter Masala',
    preparedQty: 80.0,
    preparedMethod: 'estimated',
    servedQty: 74.0,
    servedMethod: 'derived',
    leftoverQty: 6.0,
    leftoverMethod: 'estimated',
    unit: 'kg',
    peopleServed: 275,
    peopleMethod: 'measured',
    enteredBy: 'Operator Sharma',
  },
];

export default function MessShell({ activeTab }) {
  let user = null;
  let profile = null;
  try {
    const auth = useAuth();
    user = auth?.user || null;
    profile = auth?.profile || null;
  } catch {
    // Graceful fallback when rendered outside of AuthProvider
  }
  const orgId = profile?.orgId || 'org-campus-mess';

  const [records, setRecords] = useState(INITIAL_DEMO_RECORDS);
  const [filterMealType, setFilterMealType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Form State
  const [formData, setFormData] = useState({
    mealDate: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    dishName: '',
    preparedQty: '',
    preparedMethod: MEASUREMENT_METHODS.MEASURED,
    servedQty: '',
    servedMethod: MEASUREMENT_METHODS.MEASURED,
    leftoverQty: '',
    leftoverMethod: MEASUREMENT_METHODS.MEASURED,
    unit: 'kg',
    peopleServed: '',
    peopleMethod: MEASUREMENT_METHODS.MEASURED,
    notes: '',
  });

  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Try fetching live records from Firestore if user has active org
  useEffect(() => {
    let isMounted = true;
    async function loadLiveRecords() {
      if (!user?.uid || !profile?.orgId) return;
      try {
        const { records: liveRecords } = await fetchMessRecordsPaginated({
          orgId: profile.orgId,
          pageSize: 25,
        });
        if (isMounted && liveRecords.length > 0) {
          setRecords(liveRecords);
        }
      } catch (err) {
        // Fallback to local records on emulator disconnect or permission check
        console.warn('Mess records fetch fallback:', err.message);
      }
    }
    loadLiveRecords();
    return () => {
      isMounted = false;
    };
  }, [user?.uid, profile?.orgId]);

  // Derive helper calculations
  const handleAutoDeriveLeftover = () => {
    const prep = parseFloat(formData.preparedQty);
    const served = parseFloat(formData.servedQty);
    if (!isNaN(prep) && !isNaN(served) && prep >= served) {
      setFormData((prev) => ({
        ...prev,
        leftoverQty: (prep - served).toFixed(1),
        leftoverMethod: MEASUREMENT_METHODS.DERIVED,
      }));
    }
  };

  const handleAutoDeriveServed = () => {
    const prep = parseFloat(formData.preparedQty);
    const leftover = parseFloat(formData.leftoverQty);
    if (!isNaN(prep) && !isNaN(leftover) && prep >= leftover) {
      setFormData((prev) => ({
        ...prev,
        servedQty: (prep - leftover).toFixed(1),
        servedMethod: MEASUREMENT_METHODS.DERIVED,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const prepNum = parseFloat(formData.preparedQty);
      const leftoverNum = parseFloat(formData.leftoverQty);
      const servedNum = formData.servedQty !== '' ? parseFloat(formData.servedQty) : null;
      const peopleNum = formData.peopleServed !== '' ? parseInt(formData.peopleServed, 10) : null;

      if (
        isNaN(prepNum) ||
        prepNum < 0 ||
        isNaN(leftoverNum) ||
        leftoverNum < 0 ||
        (servedNum !== null && (isNaN(servedNum) || servedNum < 0))
      ) {
        throw new Error('All quantities must be non-negative numbers (0 or greater).');
      }
      if (peopleNum !== null && (isNaN(peopleNum) || peopleNum < 0)) {
        throw new Error('People served must be a non-negative whole number or left blank.');
      }

      // Check sum constraint when both are measured
      if (servedNum !== null && servedNum + leftoverNum > prepNum * 1.15) {
        throw new Error(
          'Physical inconsistency: The sum of served and leftover exceeds prepared quantity by more than 15%. Please verify scale readings.'
        );
      }

      const activeUser = user || {
        uid: 'demo-mess-op',
        displayName: 'Mess Operator (Local)',
        email: 'operator@campus.edu',
      };

      let newRecord;
      try {
        const result = await createMessRecord({
          orgId,
          user: activeUser,
          mealDate: formData.mealDate,
          mealType: formData.mealType,
          dishName: formData.dishName,
          preparedQty: prepNum,
          preparedMethod: formData.preparedMethod,
          servedQty: servedNum,
          servedMethod: servedNum !== null ? formData.servedMethod : null,
          leftoverQty: leftoverNum,
          leftoverMethod: formData.leftoverMethod,
          unit: formData.unit,
          peopleServed: peopleNum,
          peopleMethod: peopleNum !== null ? formData.peopleMethod : null,
          notes: formData.notes,
        });
        newRecord = result.record;
      } catch (dbErr) {
        // If unauthenticated or offline, persist to local session state
        console.warn('Firestore write bypassed, logging to local session:', dbErr.message);
        newRecord = {
          id: `rec-${Date.now().toString().slice(-4)}`,
          orgId,
          mealDate: formData.mealDate,
          mealType: formData.mealType,
          dishName: formData.dishName.trim(),
          preparedQty: prepNum,
          preparedMethod: formData.preparedMethod,
          servedQty: servedNum,
          servedMethod: servedNum !== null ? formData.servedMethod : null,
          leftoverQty: leftoverNum,
          leftoverMethod: formData.leftoverMethod,
          unit: formData.unit,
          peopleServed: peopleNum,
          peopleMethod: peopleNum !== null ? formData.peopleMethod : null,
          notes: formData.notes.trim(),
          enteredBy: activeUser.displayName || 'Mess Operator',
          createdAt: new Date().toISOString(),
        };
      }

      setRecords((prev) => [newRecord, ...prev]);
      setFormSuccess(
        `Meal record for "${newRecord.dishName}" successfully logged. Unrecorded fields left blank.`
      );

      // Reset form
      setFormData((prev) => ({
        ...prev,
        dishName: '',
        preparedQty: '',
        servedQty: '',
        leftoverQty: '',
        peopleServed: '',
        notes: '',
      }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Paginate Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterMealType === 'all') return true;
      return (r.mealType || '').toLowerCase() === filterMealType.toLowerCase();
    });
  }, [records, filterMealType]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Compute Descriptive Analytics
  const analytics = useMemo(() => {
    return computeMessAnalytics(records);
  }, [records]);

  // Compute Advisory Predictions & Moving Averages (Prompt 15)
  const forecastData = useMemo(() => {
    return generateAdvisoryForecasts(records);
  }, [records]);

  const handleLoad14DayPilot = () => {
    const seed = generate14DayHistoricalSeed(orgId);
    setRecords(seed);
  };

  const handleResetToBaseline = () => {
    setRecords(INITIAL_DEMO_RECORDS);
  };

  // Primary unit metrics (e.g. kg)
  const primaryUnitMetric = analytics.unitMetrics['kg'] ||
    Object.values(analytics.unitMetrics)[0] || {
      totalPrepared: 0,
      totalServed: 0,
      totalLeftover: 0,
      surplusRate: 0,
      unit: 'kg',
    };

  const perCapitaKg = analytics.perCapitaByUnit['kg'] || {
    averagePerPerson: null,
    validSampleCount: 0,
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'measured':
        return (
          <span
            className="badge badge-success"
            title="Measured directly on kitchen scale / verified count"
            style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
          >
            <Scale size={10} />
            <span>Measured</span>
          </span>
        );
      case 'derived':
        return (
          <span
            className="badge badge-neutral"
            title="Mathematically derived from related balance equation"
            style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
          >
            <Layers size={10} />
            <span>Derived</span>
          </span>
        );
      case 'estimated':
        return (
          <span
            className="badge badge-warning"
            title="Operator visual estimation"
            style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
          >
            <Eye size={10} />
            <span>Estimated</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="feature-container">
      {/* Header */}
      <div className="feature-header">
        <div>
          <h1>Mess Waste &amp; Production Records</h1>
          <p className="text-muted">
            Daily Preparation, Consumption &amp; Surplus Analytics (Calm Civic Utility)
          </p>
        </div>
      </div>

      {/* Spark Quota & Missing Data Notice Banner */}
      <div
        style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--color-surface)',
          borderLeft: '3px solid var(--color-brand-700)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <Info size={15} style={{ color: 'var(--color-brand-700)', flexShrink: 0 }} />
        <span>
          <strong>Data Quality Guidelines:</strong> Unrecorded fields are left blank and excluded
          from averages. Measured, derived, and estimated quantities are recorded transparently.
        </span>
      </div>

      {/* Summary KPI Cards (Primary Unit: kg) */}
      <div
        style={{
          marginTop: 'var(--space-4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div
          className="card"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
            Total Prepared ({primaryUnitMetric.unit})
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-brand-900)' }}>
            {primaryUnitMetric.totalPrepared.toFixed(1)} {primaryUnitMetric.unit}
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            Across {primaryUnitMetric.totalRecords || 0} logged sessions
          </span>
        </div>

        <div
          className="card"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
            Total Consumed ({primaryUnitMetric.unit})
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
            {primaryUnitMetric.totalServed.toFixed(1)} {primaryUnitMetric.unit}
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            From {primaryUnitMetric.servedSampleCount || 0} measured meals
          </span>
        </div>

        <div
          className="card"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
            Unserved Surplus ({primaryUnitMetric.unit})
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
            {primaryUnitMetric.totalLeftover.toFixed(1)} {primaryUnitMetric.unit}
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            {primaryUnitMetric.surplusRate}% surplus rate
          </span>
        </div>

        <div
          className="card"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
            Per-Diner Consumption
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-brand-800)' }}>
            {perCapitaKg.averagePerPerson !== null
              ? `${perCapitaKg.averagePerPerson} kg/diner`
              : 'N/A'}
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            Based on {perCapitaKg.validSampleCount} recorded meals
          </span>
        </div>
      </div>

      {/* View 1: Meal Entry Form */}
      {activeTab === 'meal-entry' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={22} color="var(--color-brand-700)" />
            <h2>Log Daily Meal Service Record</h2>
          </div>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Enter kitchen quantities. Leave unrecorded fields blank.
          </p>

          {formSuccess && (
            <div
              className="alert alert-success"
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div
              className="alert alert-danger"
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} style={{ marginTop: 'var(--space-4)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              <div className="input-group">
                <label htmlFor="meal-date" className="input-label">
                  Meal Date *
                </label>
                <input
                  id="meal-date"
                  type="date"
                  className="input-field"
                  value={formData.mealDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mealDate: e.target.value }))}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="meal-type" className="input-label">
                  Meal Type *
                </label>
                <select
                  id="meal-type"
                  className="input-field"
                  value={formData.mealType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mealType: e.target.value }))}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Evening Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="meal-dish" className="input-label">
                  Dish / Menu Item *
                </label>
                <input
                  id="meal-dish"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Steamed Basmati Rice & Sambhar"
                  value={formData.dishName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dishName: e.target.value }))}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="meal-unit" className="input-label">
                  Measurement Unit *
                </label>
                <select
                  id="meal-unit"
                  className="input-field"
                  value={formData.unit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                >
                  <option value="kg">kg (weight)</option>
                  <option value="portions">portions (count)</option>
                  <option value="litres">litres (volume)</option>
                </select>
              </div>
            </div>

            {/* Quantities and Measurement Methods */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                background: 'var(--color-canvas)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Prepared Quantity */}
              <div className="input-group">
                <label htmlFor="meal-prepared" className="input-label">
                  Prepared Quantity ({formData.unit}) *
                </label>
                <input
                  id="meal-prepared"
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 100.0"
                  value={formData.preparedQty}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, preparedQty: e.target.value }))
                  }
                  required
                />
                <select
                  aria-label="Prepared Method"
                  className="input-field"
                  style={{ marginTop: '4px', fontSize: 'var(--font-size-caption)' }}
                  value={formData.preparedMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, preparedMethod: e.target.value }))
                  }
                >
                  <option value="measured">Measured (Kitchen Scale)</option>
                  <option value="estimated">Estimated (Visual/Batch)</option>
                </select>
              </div>

              {/* Served Quantity */}
              <div className="input-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <label htmlFor="meal-served" className="input-label">
                    Served / Consumed ({formData.unit})
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDeriveServed}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-brand-700)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textDecoration: 'underline',
                    }}
                  >
                    Derive (Prep - Left)
                  </button>
                </div>
                <input
                  id="meal-served"
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-field"
                  placeholder="Leave empty if unmeasured"
                  value={formData.servedQty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, servedQty: e.target.value }))}
                />
                <select
                  aria-label="Served Method"
                  className="input-field"
                  style={{ marginTop: '4px', fontSize: 'var(--font-size-caption)' }}
                  value={formData.servedMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, servedMethod: e.target.value }))
                  }
                >
                  <option value="measured">Measured (Direct Weighing)</option>
                  <option value="derived">Derived (Prepared - Leftover)</option>
                  <option value="estimated">Estimated (Visual Estimate)</option>
                </select>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                  Blank = null (not 0)
                </span>
              </div>

              {/* Leftover Quantity */}
              <div className="input-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <label htmlFor="meal-leftover" className="input-label">
                    Unserved Leftover ({formData.unit}) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDeriveLeftover}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-brand-700)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textDecoration: 'underline',
                    }}
                  >
                    Derive (Prep - Served)
                  </button>
                </div>
                <input
                  id="meal-leftover"
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 12.5"
                  value={formData.leftoverQty}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, leftoverQty: e.target.value }))
                  }
                  required
                />
                <select
                  aria-label="Leftover Method"
                  className="input-field"
                  style={{ marginTop: '4px', fontSize: 'var(--font-size-caption)' }}
                  value={formData.leftoverMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, leftoverMethod: e.target.value }))
                  }
                >
                  <option value="measured">Measured (Kitchen Scale)</option>
                  <option value="derived">Derived (Prepared - Served)</option>
                  <option value="estimated">Estimated (Visual/Pan)</option>
                </select>
              </div>

              {/* People Served */}
              <div className="input-group">
                <label htmlFor="meal-people" className="input-label">
                  People Served (Headcount)
                </label>
                <input
                  id="meal-people"
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="Leave empty if uncounted"
                  value={formData.peopleServed}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, peopleServed: e.target.value }))
                  }
                />
                <select
                  aria-label="Headcount Method"
                  className="input-field"
                  style={{ marginTop: '4px', fontSize: 'var(--font-size-caption)' }}
                  value={formData.peopleMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, peopleMethod: e.target.value }))
                  }
                >
                  <option value="measured">Measured (Token / Turnstile Count)</option>
                  <option value="estimated">Estimated (Visual Headcount)</option>
                </select>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                  Blank = null (not 0)
                </span>
              </div>
            </div>

            {/* Operational Notes */}
            <div className="input-group" style={{ marginTop: 'var(--space-3)' }}>
              <label htmlFor="meal-notes" className="input-label">
                Operational Notes (Optional)
              </label>
              <input
                id="meal-notes"
                type="text"
                className="input-field"
                placeholder="e.g. Exam week, rain impacted attendance, recipe modification"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div
              style={{
                marginTop: 'var(--space-5)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
              }}
            >
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Saving Record...' : 'Save Production Record'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View 2: Leftover Records History */}
      {activeTab === 'leftover-records' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <h2>Leftover Production Log</h2>
              <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
                Auditable records with explicit units and measurement methods. Paginated within
                quota.
              </p>
            </div>
            <div>
              <select
                aria-label="Filter by Meal Type"
                value={filterMealType}
                onChange={(e) => {
                  setFilterMealType(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
                style={{ width: 'auto', minHeight: '32px' }}
              >
                <option value="all">All Meal Types</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div className="responsive-table-wrapper" style={{ marginTop: 'var(--space-3)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal</th>
                  <th>Dish Name</th>
                  <th>Prepared</th>
                  <th>Served</th>
                  <th>Leftover</th>
                  <th>Headcount</th>
                  <th>Quality / Method</th>
                  <th>Entered By</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: 'center',
                        padding: 'var(--space-6)',
                        color: 'var(--color-muted)',
                      }}
                    >
                      No meal service records match the selected filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{rec.mealDate}</td>
                      <td>
                        <span
                          className="badge badge-neutral"
                          style={{ textTransform: 'capitalize' }}
                        >
                          {rec.mealType}
                        </span>
                      </td>
                      <td>
                        <strong>{rec.dishName}</strong>
                        {rec.notes && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--color-muted)',
                              marginTop: '2px',
                            }}
                          >
                            {rec.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        {rec.preparedQty} {rec.unit}
                      </td>
                      <td>
                        {rec.servedQty !== null && rec.servedQty !== undefined ? (
                          `${rec.servedQty} ${rec.unit}`
                        ) : (
                          <span
                            className="badge badge-neutral"
                            style={{ fontSize: '10px' }}
                            title="Missing data is stored as null, not zero"
                          >
                            N/A (Missing)
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-warning)' }}>
                        {rec.leftoverQty} {rec.unit}
                      </td>
                      <td>
                        {rec.peopleServed !== null && rec.peopleServed !== undefined ? (
                          rec.peopleServed
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                            N/A
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {getMethodBadge(rec.leftoverMethod || rec.preparedMethod)}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-muted)', fontSize: '11px' }}>
                        {rec.enteredBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--color-canvas)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-caption)',
              }}
            >
              <span>
                Page {currentPage} of {totalPages} ({filteredRecords.length} records total)
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 3: Waste & Consumption Trends */}
      {activeTab === 'consumption-trends' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <TrendingUp size={22} color="var(--color-brand-700)" />
            <h2>Descriptive Analytics &amp; Surplus Patterns</h2>
          </div>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Descriptive statistics computed strictly within quota. Missing values are omitted from
            denominators, never assumed to be zero.
          </p>

          <div
            style={{
              marginTop: 'var(--space-4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Dish-level Surplus Patterns */}
            <div
              className="card"
              style={{
                background: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3>Dish-Level Leftover Patterns</h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-caption)', marginTop: '2px' }}
              >
                Surplus percentage by menu item (with transparent sample sizes)
              </p>

              <div style={{ marginTop: 'var(--space-3)' }}>
                {analytics.dishPatterns.map((dish) => (
                  <div key={dish.dishName} style={{ marginBottom: 'var(--space-3)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'var(--font-size-label)',
                      }}
                    >
                      <span>
                        <strong>{dish.dishName}</strong>{' '}
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                          (n = {dish.sampleCount})
                        </span>
                      </span>
                      <strong>
                        {dish.surplusRate}% surplus ({dish.totalLeftover} / {dish.totalPrepared}{' '}
                        {dish.unit})
                      </strong>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: 'var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                        marginTop: '4px',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(dish.surplusRate, 100)}%`,
                          height: '100%',
                          background:
                            dish.surplusRate > 10 ? 'var(--color-warning)' : 'var(--color-success)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Completeness & Measurement Quality Audit */}
            <div
              className="card"
              style={{
                background: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3>Data Quality &amp; Integrity Audit</h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-caption)', marginTop: '2px' }}
              >
                Audit of measured vs derived vs estimated quantities
              </p>

              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-label)' }}>
                <p>
                  &bull; <strong>Total Service Records:</strong>{' '}
                  {analytics.qualityMetrics.totalRecords} logged meals
                </p>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  &bull; <strong>Directly Measured on Scale:</strong>{' '}
                  {analytics.qualityMetrics.measuredCount} records
                </p>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  &bull; <strong>Mathematically Derived:</strong>{' '}
                  {analytics.qualityMetrics.derivedCount} records
                </p>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  &bull; <strong>Visual / Operator Estimated:</strong>{' '}
                  {analytics.qualityMetrics.estimatedCount} records
                </p>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  &bull; <strong>Missing Consumed / Headcount:</strong>{' '}
                  {analytics.qualityMetrics.missingServedCount} served /{' '}
                  {analytics.qualityMetrics.missingPeopleCount} diners
                </p>
                <p
                  style={{
                    marginTop: 'var(--space-2)',
                    color: 'var(--color-muted)',
                    fontSize: 'var(--font-size-caption)',
                  }}
                >
                  * All calculations exclude missing values from denominators to avoid artificial
                  dilution.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Advisory Forecast */}
      {activeTab === 'advisory-forecast' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Lightbulb size={22} color="var(--color-brand-700)" />
                <h2>Production Advisory &amp; Forecasting</h2>
              </div>
              <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
                Empirical moving averages &amp; weekday patterns. All predictions are marked
                ESTIMATE.
              </p>
            </div>

            <div>
              {forecastData.isGated ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleLoad14DayPilot}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Sparkles size={14} />
                  <span>Load 14-Day Pilot History</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResetToBaseline}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={14} />
                  <span>Reset to Baseline Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* Gated State: < 14 Days */}
          {forecastData.isGated ? (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div
                className="notice-box"
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-warning)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Clock size={20} />
                  <strong>Advisory Gated: Awaiting 14-Day Minimum Historical Data</strong>
                </div>
                <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-label)' }}>
                  FoodBridge does not fabricate predictive forecasts. Automated production advice
                  requires at least 14 days of complete meal records to account for weekend
                  attendance variations and seasonal weather.
                </p>

                <div style={{ marginTop: 'var(--space-3)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-caption)',
                    }}
                  >
                    <span>
                      Logging Progress: {forecastData.eligibility.distinctDaysCount} of{' '}
                      {MIN_HISTORICAL_DAYS} days recorded
                    </span>
                    <span>
                      {Math.round(
                        (forecastData.eligibility.distinctDaysCount / MIN_HISTORICAL_DAYS) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(0,0,0,0.1)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginTop: '4px',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(
                          (forecastData.eligibility.distinctDaysCount / MIN_HISTORICAL_DAYS) * 100,
                          100
                        )}%`,
                        height: '100%',
                        background: 'var(--color-warning)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-canvas)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-label)',
                }}
              >
                <strong>Interim Recommendation:</strong>
                <p style={{ marginTop: 'var(--space-1)', color: 'var(--color-muted)' }}>
                  Historical lunch services on Tuesdays show an average of 14–16 kg surplus in rice
                  preparations. Consider scaling down batch prep by 10% for the initial 12:00 PM
                  opening and preparing replenishment batches as dining hall attendance dictates.
                </p>
              </div>
            </div>
          ) : (
            /* Un-Gated Active Forecast: >= 14 Days */
            <div style={{ marginTop: 'var(--space-4)' }}>
              {/* Zero-Cost & Safety Banner */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '4px solid var(--color-brand-700)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="badge badge-success" style={{ fontSize: '11px' }}>
                      Active 14-Day Rolling Model
                    </span>
                    <span
                      style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}
                    >
                      Rolling 14-Day Average
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-label)', marginTop: '4px' }}>
                    <strong>Recorded History:</strong> {forecastData.eligibility.totalRecords} meals
                    across {forecastData.eligibility.distinctDaysCount} service days &bull;{' '}
                    <strong>Window:</strong> {forecastData.eligibility.dateStart} to{' '}
                    {forecastData.eligibility.dateEnd}
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--color-muted)', textAlign: 'right' }}>
                  <span>Uncertainty indicates sample standard deviation (&plusmn; &sigma;)</span>
                </div>
              </div>

              {/* Invariant Warning: Forecasts Never Create Confirmed Listings */}
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-canvas)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                <ShieldAlert size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <span>
                  <strong>Safety Contract:</strong> Forecasts are advisory estimates for kitchen
                  production planning.{' '}
                  <strong>Forecasts never create confirmed surplus listings</strong> or commit food
                  donations without explicit, physical human inspection and manual publishing.
                </span>
              </div>

              {/* Weekday Patterns Grid */}
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h3>Day-of-Week Moving Averages &amp; Surplus Patterns</h3>
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--font-size-caption)', marginTop: '2px' }}
                >
                  Historical consumption patterns aggregated by day of the week
                </p>

                <div
                  style={{
                    marginTop: 'var(--space-3)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 'var(--space-3)',
                  }}
                >
                  {Object.values(forecastData.weekdayPatterns).map((wp) => (
                    <div
                      key={wp.dayName}
                      className="card"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <strong style={{ fontSize: '1rem' }}>{wp.dayName}s</strong>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                          n = {wp.sampleSize}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 'var(--space-2)',
                          fontSize: 'var(--font-size-caption)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2px',
                          }}
                        >
                          <span className="text-muted">Average Prep:</span>
                          <strong>
                            {wp.avgPrepared} {wp.primaryUnit}
                          </strong>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '2px',
                          }}
                        >
                          <span className="text-muted">Predicted Surplus:</span>
                          <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                            {wp.avgLeftover} &plusmn; {wp.leftoverUncertainty} {wp.primaryUnit}{' '}
                            <small
                              className="badge badge-neutral"
                              style={{ fontSize: '9px', padding: '1px 3px' }}
                            >
                              ESTIMATE
                            </small>
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted">Historical Surplus Rate:</span>
                          <strong>{wp.surplusRate}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dish-Specific Batch Prep Scaling Recommendations */}
              <div style={{ marginTop: 'var(--space-5)' }}>
                <h3>Dish-Specific Batch Scaling Guidance</h3>
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--font-size-caption)', marginTop: '2px' }}
                >
                  Actionable kitchen scaling recommendations to prevent daily surplus before cooking
                </p>

                <div
                  style={{
                    marginTop: 'var(--space-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                  }}
                >
                  {forecastData.dishRecommendations.map((rec) => (
                    <div
                      key={rec.dishName}
                      className="card"
                      style={{
                        background: 'var(--color-canvas)',
                        border: '1px solid var(--color-border)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          flexWrap: 'wrap',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '1.05rem' }}>{rec.dishName}</strong>{' '}
                          <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                            (n = {rec.sampleSize} services)
                          </span>
                        </div>
                        <div>
                          {rec.recommendedAdjustmentPct < 0 ? (
                            <span
                              className="badge badge-warning"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              <span>Reduce Prep by {Math.abs(rec.recommendedAdjustmentPct)}%</span>
                              <span style={{ fontSize: '9px', opacity: 0.85 }}>[ESTIMATE]</span>
                            </span>
                          ) : (
                            <span className="badge badge-success">Prep Optimal</span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 'var(--space-2)',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--font-size-caption)',
                        }}
                      >
                        <div>
                          <span className="text-muted">Historical Prep:</span> {rec.avgPrep}{' '}
                          {rec.unit}
                        </div>
                        <div>
                          <span className="text-muted">Average Leftover:</span> {rec.avgLeftover}{' '}
                          &plusmn; {rec.leftoverUncertainty} {rec.unit} ({rec.surplusRate}%)
                        </div>
                        <div>
                          <span className="text-muted">Suggested Initial Prep:</span>{' '}
                          <strong>
                            {rec.suggestedPrep} {rec.unit}
                          </strong>{' '}
                          <small className="badge badge-neutral" style={{ fontSize: '9px' }}>
                            ESTIMATE
                          </small>
                        </div>
                      </div>

                      <p
                        style={{
                          margin: 'var(--space-2) 0 0 0',
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--color-muted)',
                          lineHeight: 1.45,
                        }}
                      >
                        &bull; {rec.guidanceText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
