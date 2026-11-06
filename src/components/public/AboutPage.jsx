import { ShieldCheck, Heart, Leaf, Target, Users } from 'lucide-react';

export default function AboutPage({ onEnterApp, onNavigatePublic }) {
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
          About FoodBridge
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          Rescuing Food. Restoring Ecological Balance.
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          FoodBridge was engineered to solve one of society&apos;s most glaring paradoxes: vast
          amounts of nutritious food prepared in institutional messes go uneaten every day, while
          vulnerable communities nearby face food insecurity.
        </p>
      </div>

      {/* Origin Story */}
      <div
        className="card"
        style={{
          padding: 'var(--space-8)',
          backgroundColor: 'var(--color-surface)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-8)',
          }}
        >
          <div>
            <span className="badge badge-verified" style={{ marginBottom: 'var(--space-2)' }}>
              Origin &bull; Campus Pilot
            </span>
            <h2
              style={{ fontSize: 'var(--font-size-title-desktop)', margin: '0 0 var(--space-3)' }}
            >
              From North Campus Mess 3 to a Reusable Civic Standard
            </h2>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}
            >
              In October 2026, we launched a 14-day zero-cost pilot with Campus Mess 3 and City Care
              Welfare NGO. Operating under strict written standard operating procedures
              (`FB-SOP-PILOT-HUMAN-2026`), the pilot successfully recovered 315 kg of untouched
              cooked meals (787 meal equivalents) with zero safety or hygiene incidents.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
              The Four Pillars
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Target
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>1. Prevention First:</strong> Using descriptive statistics to adjust
                  cooking volumes before surplus even occurs.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Users
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>2. Human Priority:</strong> Rapid handover of wholesome surplus meals to
                  verified orphanages and shelters.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Heart
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>3. Cattle &amp; Livestock Feed:</strong> Routing suitable grain and
                  vegetable surplus to registered farms.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Leaf
                  size={20}
                  color="var(--color-primary)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <strong>4. Soil Re-enrichment:</strong> Composting inedible kitchen trimmings into
                  organic fertilizer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zero Cost Invariant Callout */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--color-primary)',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-canvas)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <ShieldCheck size={28} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-1)' }}>
              Our Uncompromising Zero-Cost Architecture Guarantee
            </h3>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6, margin: 0 }}
            >
              FoodBridge runs 100% on the Google Firebase Spark Tier with no credit card or billing
              account linked. We do not use paid Cloud Functions, paid maps, paid SMS gateways, or
              paid commercial AI APIs. This guarantees FoodBridge will remain genuinely free for
              public institutions, community groups, and universities forever.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button type="button" className="btn btn-primary" onClick={() => onEnterApp('donor')}>
          <span>Enter Application</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigatePublic('how-it-works')}
        >
          <span>Read How It Works</span>
        </button>
      </div>
    </div>
  );
}
