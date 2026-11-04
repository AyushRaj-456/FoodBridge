import { PlusCircle, TrendingUp } from 'lucide-react';

export default function MessShell({ activeTab }) {
  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Mess Waste & Production Records</h1>
          <p className="text-muted">Hostel Mess Daily Preparation & Leftover Logging</p>
        </div>
        <button type="button" className="btn btn-primary">
          <PlusCircle size={18} aria-hidden="true" />
          <span>Log Meal Record</span>
        </button>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h2>Today&apos;s Service Summary</h2>
        <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
          Active View: <strong>{activeTab}</strong>. Explicit measurement units required (kg /
          count). Missing data is recorded as null, not zero.
        </p>

        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div
            className="card"
            style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Prepared Total
            </span>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--color-brand-900)',
                marginTop: '4px',
              }}
            >
              185.0 kg
            </div>
          </div>
          <div
            className="card"
            style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Served / Consumed
            </span>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--color-success)',
                marginTop: '4px',
              }}
            >
              168.5 kg
            </div>
          </div>
          <div
            className="card"
            style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)' }}
          >
            <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
              Unserved Surplus
            </span>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--color-accent-600)',
                marginTop: '4px',
              }}
            >
              16.5 kg
            </div>
          </div>
        </div>

        <div
          className="notice-box"
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-3)',
            background: 'var(--color-info-bg)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-2)',
            color: 'var(--color-info)',
          }}
        >
          <TrendingUp size={18} />
          <span style={{ fontSize: 'var(--font-size-label)' }}>
            Advisory Prediction Notice: Forecasts require at least 14 days of historical records.
            Advisory estimates do not create confirmed listings.
          </span>
        </div>
      </div>
    </div>
  );
}
