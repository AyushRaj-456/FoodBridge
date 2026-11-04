import { UserCheck, Activity } from 'lucide-react';

export default function AdminShell({ activeTab }) {
  return (
    <div className="feature-container">
      <div className="feature-header">
        <div>
          <h1>Administrative & Moderation Console</h1>
          <p className="text-muted">
            Console-Provisioned Privileged Controls (₹0 Spark Operations)
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <h2>Pending Organisation Applications (Offline Review)</h2>
        <p className="text-muted" style={{ marginTop: 'var(--space-1)' }}>
          Active View: <strong>{activeTab}</strong>. Review physical/offline documentation using
          checklist. No document scans are uploaded to Firestore.
        </p>

        <div style={{ marginTop: 'var(--space-4)', overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: 'var(--space-2)' }}>Organisation Name</th>
                <th style={{ padding: 'var(--space-2)' }}>Type</th>
                <th style={{ padding: 'var(--space-2)' }}>Submitted Date</th>
                <th style={{ padding: 'var(--space-2)' }}>Status</th>
                <th style={{ padding: 'var(--space-2)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-2)' }}>City Care Welfare NGO</td>
                <td style={{ padding: 'var(--space-2)' }}>Verified NGO</td>
                <td style={{ padding: 'var(--space-2)' }}>Nov 04, 2026</td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span className="badge badge-warning">Pending Review</span>
                </td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      minHeight: '32px',
                      padding: '2px var(--space-2)',
                      fontSize: 'var(--font-size-caption)',
                    }}
                  >
                    <UserCheck size={14} />
                    <span>Checklist</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className="card"
          style={{
            marginTop: 'var(--space-6)',
            background: 'var(--color-canvas)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Activity size={18} color="var(--color-brand-700)" />
            <h3>Daily Spark Quota Headroom</h3>
          </div>
          <div
            style={{
              marginTop: 'var(--space-3)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
                Firestore Reads (50k limit)
              </span>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>1,240 / 50,000</div>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
                Firestore Writes (20k limit)
              </span>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>410 / 20,000</div>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-caption)' }}>
                Hosting Bandwidth (10 GB)
              </span>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>142 MB / 10 GB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
