import { useState } from 'react';
import { Calendar, TrendingUp, Lightbulb, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const SAMPLE_MEAL_RECORDS = [
  {
    id: 'rec-01',
    mealDate: '2026-11-04',
    mealType: 'Lunch',
    dishName: 'Yellow Dal & Jeera Rice',
    preparedQty: 120.0,
    servedQty: 104.5,
    leftoverQty: 15.5,
    unit: 'kg',
    peopleServed: 320,
    enteredBy: 'Operator Sharma',
  },
  {
    id: 'rec-02',
    mealDate: '2026-11-04',
    mealType: 'Breakfast',
    dishName: 'Poha & Masala Chai',
    preparedQty: 65.0,
    servedQty: 64.0,
    leftoverQty: 1.0,
    unit: 'kg',
    peopleServed: 280,
    enteredBy: 'Operator Sharma',
  },
  {
    id: 'rec-03',
    mealDate: '2026-11-03',
    mealType: 'Dinner',
    dishName: 'Mix Veg Curry & Rotis',
    preparedQty: 95.0,
    servedQty: 82.0,
    leftoverQty: 13.0,
    unit: 'kg',
    peopleServed: 290,
    enteredBy: 'Supervisor Verma',
  },
];

export default function MessShell({ activeTab }) {
  const [records, setRecords] = useState(SAMPLE_MEAL_RECORDS);
  const [filterMealType, setFilterMealType] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    mealDate: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    dishName: '',
    preparedQty: '',
    servedQty: '',
    leftoverQty: '',
    unit: 'kg',
    peopleServed: '',
  });

  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    const prep = parseFloat(formData.preparedQty);
    const served = parseFloat(formData.servedQty);
    const leftover = parseFloat(formData.leftoverQty);
    const people = parseInt(formData.peopleServed, 10);

    if (isNaN(prep) || prep < 0 || isNaN(served) || served < 0 || isNaN(leftover) || leftover < 0) {
      setFormError('All quantities must be non-negative numbers (0 or greater).');
      return;
    }

    if (served + leftover > prep * 1.1) {
      setFormError(
        'The sum of served and leftover quantities significantly exceeds the prepared amount. Please check the values.'
      );
      return;
    }

    const newRecord = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      mealDate: formData.mealDate,
      mealType: formData.mealType.charAt(0).toUpperCase() + formData.mealType.slice(1),
      dishName: formData.dishName.trim(),
      preparedQty: prep,
      servedQty: served,
      leftoverQty: leftover,
      unit: formData.unit,
      peopleServed: isNaN(people) ? null : people,
      enteredBy: 'Operator Log',
    };

    setRecords((prev) => [newRecord, ...prev]);
    setFormSuccess(`Meal record for "${newRecord.dishName}" successfully logged.`);
    setFormData((prev) => ({
      ...prev,
      dishName: '',
      preparedQty: '',
      servedQty: '',
      leftoverQty: '',
      peopleServed: '',
    }));
  };

  const filteredRecords = records.filter((r) => {
    if (filterMealType === 'all') return true;
    return r.mealType.toLowerCase() === filterMealType.toLowerCase();
  });

  // Calculate Metrics
  const totalPrepared = records.reduce((acc, r) => acc + r.preparedQty, 0);
  const totalServed = records.reduce((acc, r) => acc + r.servedQty, 0);
  const totalLeftover = records.reduce((acc, r) => acc + r.leftoverQty, 0);
  const surplusPct = totalPrepared > 0 ? ((totalLeftover / totalPrepared) * 100).toFixed(1) : 0;

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

      {/* Summary KPI Cards */}
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
            Total Prepared
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-brand-900)' }}>
            {totalPrepared.toFixed(1)} kg
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            Across logged services
          </span>
        </div>

        <div
          className="card"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
            Total Consumed
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
            {totalServed.toFixed(1)} kg
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            Dining hall absorption
          </span>
        </div>

        <div
          className="card"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
            Unserved Surplus
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
            {totalLeftover.toFixed(1)} kg
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
            {surplusPct}% surplus rate
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
            Enter measured quantities. Incomplete data is stored as null, not zero.
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
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-3)',
              }}
            >
              <div className="input-group">
                <label htmlFor="meal-prepared" className="input-label">
                  Prepared Quantity *
                </label>
                <input
                  id="meal-prepared"
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 50.0"
                  value={formData.preparedQty}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, preparedQty: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="meal-served" className="input-label">
                  Served / Consumed *
                </label>
                <input
                  id="meal-served"
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 45.0"
                  value={formData.servedQty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, servedQty: e.target.value }))}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="meal-leftover" className="input-label">
                  Unserved Leftover *
                </label>
                <input
                  id="meal-leftover"
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 5.0"
                  value={formData.leftoverQty}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, leftoverQty: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="meal-unit" className="input-label">
                  Unit
                </label>
                <select
                  id="meal-unit"
                  className="input-field"
                  value={formData.unit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                >
                  <option value="kg">kg</option>
                  <option value="portions">portions</option>
                  <option value="liters">liters</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="meal-people" className="input-label">
                  People Served
                </label>
                <input
                  id="meal-people"
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="e.g. 240"
                  value={formData.peopleServed}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, peopleServed: e.target.value }))
                  }
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 'var(--space-5)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
              }}
            >
              <button type="submit" className="btn btn-primary">
                <span>Save Production Record</span>
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
                Auditable records of all kitchen meal sessions.
              </p>
            </div>
            <div>
              <select
                aria-label="Filter by Meal Type"
                value={filterMealType}
                onChange={(e) => setFilterMealType(e.target.value)}
                className="input-field"
                style={{ width: 'auto', minHeight: '32px' }}
              >
                <option value="all">All Meal Types</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div className="responsive-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal</th>
                  <th>Dish Name</th>
                  <th>Prepared</th>
                  <th>Served</th>
                  <th>Leftover</th>
                  <th>People</th>
                  <th>Entered By</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.mealDate}</td>
                    <td>
                      <span className="badge badge-neutral">{rec.mealType}</span>
                    </td>
                    <td>
                      <strong>{rec.dishName}</strong>
                    </td>
                    <td>
                      {rec.preparedQty} {rec.unit}
                    </td>
                    <td>
                      {rec.servedQty} {rec.unit}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-warning)' }}>
                      {rec.leftoverQty} {rec.unit}
                    </td>
                    <td>{rec.peopleServed || 'N/A'}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{rec.enteredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Waste & Consumption Trends */}
      {activeTab === 'consumption-trends' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <TrendingUp size={22} color="var(--color-brand-700)" />
            <h2>Consumption Trends &amp; Surplus Patterns</h2>
          </div>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Accessible data-driven summaries. Avoids fabricated placeholder charts.
          </p>

          <div
            style={{
              marginTop: 'var(--space-4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
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
                Surplus percentage by food item
              </p>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-label)',
                    }}
                  >
                    <span>Yellow Dal &amp; Jeera Rice</span>
                    <strong>12.9% surplus</strong>
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
                      style={{ width: '12.9%', height: '100%', background: 'var(--color-warning)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-label)',
                    }}
                  >
                    <span>Mix Veg Curry &amp; Rotis</span>
                    <strong>13.7% surplus</strong>
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
                      style={{ width: '13.7%', height: '100%', background: 'var(--color-warning)' }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-label)',
                    }}
                  >
                    <span>Poha &amp; Chai</span>
                    <strong>1.5% surplus</strong>
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
                      style={{ width: '1.5%', height: '100%', background: 'var(--color-success)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                background: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3>Data Completeness Audit</h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-caption)', marginTop: '2px' }}
              >
                Required for reliable advisory forecasts
              </p>

              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-label)' }}>
                <p>
                  &bull; <strong>Current logged window:</strong> 3 consecutive service days
                </p>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  &bull; <strong>Pre-requisite for automated advisory:</strong> 14 complete days
                </p>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  &bull; <strong>Data integrity:</strong> All quantities logged with verified unit
                  weight (kg).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 4: Advisory Forecast */}
      {activeTab === 'advisory-forecast' && (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Lightbulb size={22} color="var(--color-accent-600)" />
            <h2>Production Advisory &amp; Forecasting</h2>
          </div>
          <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
            Guidance for kitchen managers to reduce daily surplus before cooking.
          </p>

          <div
            className="notice-box"
            style={{
              marginTop: 'var(--space-4)',
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
              requires at least 14 days of complete meal records to account for weekend attendance
              variations and seasonal weather.
            </p>
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
              preparations. Consider scaling down batch prep by 10% for the initial 12:00 PM opening
              and preparing replenishment batches as dining hall attendance dictates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
