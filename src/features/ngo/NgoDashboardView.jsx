import { Truck, ShieldCheck, Clock, PlusCircle, Award } from 'lucide-react';

export default function NgoDashboardView({
  orgStatus = 'approved',
  onNavigateTab,
  onOpenDemandRequest,
  onOpenDistributionProof,
}) {
  return (
    <div className="ngo-dashboard">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-1)',
            }}
          >
            <span className="badge badge-verified">
              <ShieldCheck size={13} />{' '}
              {orgStatus === 'approved' ? 'Verified Welfare Organization' : `Status: ${orgStatus}`}
            </span>
            <span className="text-muted" style={{ fontSize: '11px' }}>
              Registration: MH/2021/0284912
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-size-title-desktop)', margin: 0 }}>
            City Care Welfare NGO &bull; Operations Portal
          </h1>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', marginTop: '4px' }}>
            Discover inspected hot-held batches, coordinate insulated pickups, and record
            distributions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-primary" onClick={onOpenDemandRequest}>
            <PlusCircle size={16} />
            <span>Post Meal Request</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={onOpenDistributionProof}>
            <Award size={16} />
            <span>Submit Distribution Proof</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Available Surplus Nearby
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: '4px 0',
            }}
          >
            2 batches
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Within 5 km radius</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Pending Collections
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-accent)',
              margin: '4px 0',
            }}
          >
            1 pickup
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            Central Mess 3 Loading Bay
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Completed Collections
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-brand-900)',
              margin: '4px 0',
            }}
          >
            14
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Lifetime handovers</div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Meals Received
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              margin: '4px 0',
            }}
          >
            787
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            Served to verified beneficiaries
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-label)' }}>
            Monthly Impact
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
            315 kg
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
            Rescued in November 2026
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Nearby Feed Preview */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
              Available Fresh Surplus
            </h3>
            <button
              type="button"
              className="btn-quiet"
              style={{ fontSize: 'var(--font-size-label)' }}
              onClick={() => onNavigateTab('available-feed')}
            >
              Open Feed Explorer &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-hover)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span className="badge badge-success" style={{ marginBottom: '2px' }}>
                    18 kg &bull; ~55 Portions
                  </span>
                  <h4 style={{ margin: '2px 0', fontSize: '1rem' }}>
                    Steamed Rice &amp; Yellow Dal Tadka
                  </h4>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    North Campus Mess 3 &bull; 1.2 km away
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigateTab('available-feed')}
                >
                  Inspect &amp; Claim
                </button>
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-hover)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <span className="badge badge-success" style={{ marginBottom: '2px' }}>
                    12 kg &bull; ~35 Portions
                  </span>
                  <h4 style={{ margin: '2px 0', fontSize: '1rem' }}>Vegetable Pulao &amp; Raita</h4>
                  <div className="text-muted" style={{ fontSize: '12px' }}>
                    Engineering Cafeteria &bull; 2.4 km away
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigateTab('available-feed')}
                >
                  Inspect &amp; Claim
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Claims & Handover Status */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
              Active Pickup in Progress
            </h3>
            <span className="badge badge-warning">Awaiting Collection</span>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-2)',
              }}
            >
              <Clock size={16} color="var(--color-accent)" />
              <strong style={{ fontSize: '14px' }}>Pickup Window: 20:30 &ndash; 22:00</strong>
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-2)',
              }}
            >
              <strong>Unlocked Address:</strong> Kitchen Loading Bay, Gate 4, Central Mess 3
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-muted)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <strong>Mess Supervisor:</strong> Mr. Raman (+91 94450 99887)
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => onNavigateTab('handover-confirm')}
            >
              <span>Complete Bilateral Handover</span>
              <Truck size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
