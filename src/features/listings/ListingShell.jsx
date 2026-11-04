import { PlusCircle, AlertCircle } from 'lucide-react';

export default function ListingShell({ activeTab }) {
  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Donor Operations</h1>
          <p className="text-muted">Hostel Mess / Commercial Kitchen Surplus Dispatch</p>
        </div>
        <button type="button" className="btn btn-primary">
          <PlusCircle size={18} aria-hidden="true" />
          <span>New Surplus Declaration</span>
        </button>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h2>Active Listings (Direct Collection)</h2>
        <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
          Surplus entries are subject to strict expiry deadlines and offline SOP compliance. No
          cloud photos uploaded in ₹0 MVP.
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
                <span className="badge badge-success">Published</span>
                <strong style={{ marginLeft: 'var(--space-2)' }}>
                  Cooked Rice & Dal (Hostel Block A)
                </strong>
              </div>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
                Pickup Window: 20:30 – 22:00
              </span>
            </div>
            <div
              style={{
                marginTop: 'var(--space-2)',
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-muted)',
              }}
            >
              Quantity: <strong>15 kg (~45 portions)</strong> | Prepared: 19:30 | Consume By: 23:00
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
          <AlertCircle size={18} />
          <span style={{ fontSize: 'var(--font-size-label)' }}>
            Active Tab: <strong>{activeTab}</strong>. Direct collection coordination only. Expiry
            checks run at user interaction time.
          </span>
        </div>
      </div>
    </div>
  );
}
