export default function PublicImpactPage({ onEnterApp }) {
  return (
    <div
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-10) var(--gutter-desktop)',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '760px', marginBottom: 'var(--space-10)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-label)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Public Transparency Report
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          Audited Impact &amp; Environmental Ledger
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          FoodBridge measures real, verifiable numbers. We never invent arbitrary multiplier factors
          or present speculative environmental claims as verified facts.
        </p>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Human Meals Rescued
          </div>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: 'var(--space-1) 0',
            }}
          >
            787
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            400g / meal (FSSAI 2019 standard)
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Total Food Rescued
          </div>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--color-brand-900)',
              margin: 'var(--space-1) 0',
            }}
          >
            315.0 kg
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            Weighed on calibrated dispatch scale
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            CO2e Prevented (Est.)
          </div>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#0d9488',
              margin: 'var(--space-1) 0',
            }}
          >
            787.5 kg
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            2.5 kg CO2e / kg food (UNEP 2024)
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Water Footprint Conserved
          </div>
          <div
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#0284c7',
              margin: 'var(--space-1) 0',
            }}
          >
            315,000 L
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            1,000 L / kg cooked meal baseline
          </div>
        </div>
      </div>

      {/* Segregated Quantities Table */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
        <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-4)' }}>
          Segregated Material Accounting
        </h3>
        <p
          className="text-muted"
          style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-4)' }}
        >
          In accordance with strict platform guidelines, quantities across recovery stages are
          tracked separately and never conflated.
        </p>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lifecycle Stage</th>
                <th>Measured Quantity</th>
                <th>Units</th>
                <th>Verification Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Offered Quantity</strong>
                </td>
                <td>320.0</td>
                <td>kg</td>
                <td>Donor Kitchen Scale Entry</td>
                <td>
                  <span className="badge badge-neutral">Logged</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Claimed Quantity</strong>
                </td>
                <td>315.0</td>
                <td>kg</td>
                <td>Atomic Firestore Reservation</td>
                <td>
                  <span className="badge badge-info">Claimed</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Collected Quantity</strong>
                </td>
                <td>315.0</td>
                <td>kg</td>
                <td>Bilateral Handover Confirmation</td>
                <td>
                  <span className="badge badge-warning">Collected</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Distributed Quantity</strong>
                </td>
                <td>315.0</td>
                <td>kg</td>
                <td>NGO Beneficiary Log</td>
                <td>
                  <span className="badge badge-verified">Distributed</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Organic Waste Diverted</strong>
                </td>
                <td>0.0</td>
                <td>kg</td>
                <td>Tier 3 Compost Gate (Disabled in Pilot)</td>
                <td>
                  <span className="badge badge-neutral">Phase 2 Scope</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Factor Audit */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
          Accredited Factor Citations
        </h3>
        <ul
          style={{
            paddingLeft: 'var(--space-4)',
            margin: 0,
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <li>
            <strong>Meals per kg:</strong> 2.5 meals / kg (400g adult cooked serving standard, FSSAI
            Guidance on Food Donation, 2019).
          </li>
          <li>
            <strong>CO2 equivalent:</strong> 2.5 kg CO2e / kg food waste avoided (United Nations
            Environment Programme Food Waste Index Report, 2024).
          </li>
          <li>
            <strong>Water footprint:</strong> ~1,000 liters / kg cooked cereal and legume diet
            (Water Footprint Network, Mekonnen &amp; Hoekstra).
          </li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onEnterApp('impact-dashboard')}
        >
          <span>Open Interactive Impact Console</span>
        </button>
      </div>
    </div>
  );
}
