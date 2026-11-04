import { MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FeedShell({ activeTab }) {
  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Verified Recipient Feed</h1>
          <p className="text-muted">Available Surplus Opportunities (NGO / Charitable Cohort)</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h2>Available Surplus (Straight-Line Haversine Match)</h2>
        <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
          Active View: <strong>{activeTab}</strong>. Only approved recipient organisations can
          claim. Exact location unlocked upon atomic claim confirmation.
        </p>

        <div
          style={{
            marginTop: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div
            className="listing-row card"
            style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-neutral">Approx. 1.2 km away</span>
                <strong style={{ marginLeft: 'var(--space-2)' }}>
                  Prepared Meals (College Central Mess)
                </strong>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ minHeight: '36px', padding: 'var(--space-1) var(--space-3)' }}
              >
                <CheckCircle size={16} />
                <span>Claim Surplus</span>
              </button>
            </div>
            <div
              style={{
                marginTop: 'var(--space-2)',
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <MapPin size={14} />
              <span>
                Coarse Location: Campus North Sector (Exact address disclosed after claim)
              </span>
            </div>
          </div>
        </div>

        <div
          className="notice-box"
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-3)',
            background: 'var(--color-warning-bg)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-2)',
            color: 'var(--color-warning)',
          }}
        >
          <AlertTriangle size={18} />
          <span style={{ fontSize: 'var(--font-size-label)' }}>
            Tier 2 (Animal Feed) and Tier 3 (Compost) routes are disabled pending competent
            authority SOP. Only approved human redistribution is enabled.
          </span>
        </div>
      </div>
    </div>
  );
}
