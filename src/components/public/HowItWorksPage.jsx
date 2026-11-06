import { CheckCircle2, Clock, Thermometer, MapPin, Truck, Award } from 'lucide-react';

export default function HowItWorksPage({ onEnterApp, onNavigatePublic }) {
  return (
    <div
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-10) var(--gutter-desktop)',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '720px', marginBottom: 'var(--space-10)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-label)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          Operational SOP
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          How FoodBridge Operates Safely
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          Food safety is non-negotiable. Every step in the FoodBridge pipeline is governed by
          rigorous physical standard operating procedures (SOPs) aligned with FSSAI regulations.
        </p>
      </div>

      {/* Step by step operational breakdown */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-10)',
        }}
      >
        {/* Step 1 */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-100)',
                color: 'var(--color-brand-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <h3
                style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-1)' }}
              >
                Step 1: Declaration &amp; Food Safety Audit
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}
              >
                Immediately at the conclusion of meal service, kitchen supervisors assess untouched
                surplus. Only food held in stainless steel insulated vessels at &gt;60&deg;C (hot
                holding) or &lt;5&deg;C (cold holding) is eligible for declaration. Food that has
                been displayed on self-service buffet counters is discarded.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <span className="badge badge-neutral">
                  <Thermometer size={12} /> Hot Holding &gt;60&deg;C
                </span>
                <span className="badge badge-neutral">
                  <Clock size={12} /> Max 4-Hour Consumption Window
                </span>
                <span className="badge badge-neutral">In-App Live Photo Proof</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-100)',
                color: 'var(--color-brand-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div>
              <h3
                style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-1)' }}
              >
                Step 2: Proximity Broadcast &amp; Concurrency-Safe Claim
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}
              >
                The listing is broadcast to verified welfare organizations within a 5 km geohash
                radius. Our concurrency engine uses atomic Firestore transactions to ensure that
                multiple NGOs cannot double-claim the same batch. Donor street addresses remain
                hidden until an authorized claim is confirmed.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <span className="badge badge-verified">
                  <CheckCircle2 size={12} /> Atomic Single-Claim Lock
                </span>
                <span className="badge badge-neutral">
                  <MapPin size={12} /> Privacy Geohash Obfuscation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-100)',
                color: 'var(--color-brand-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div>
              <h3
                style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-1)' }}
              >
                Step 3: Verification at Dispatch Counter
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}
              >
                The claiming NGO dispatches an authorized volunteer equipped with insulated
                food-grade transport boxes. At the mess kitchen dispatch counter, both parties
                inspect container seals and record the handover.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <span className="badge badge-neutral">
                  <Truck size={12} /> Insulated Transport
                </span>
                <span className="badge badge-neutral">Bilateral Counter-Sign</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-100)',
                color: 'var(--color-brand-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              4
            </div>
            <div>
              <h3
                style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-1)' }}
              >
                Step 4: Distribution &amp; Environmental Ledgering
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}
              >
                The food is served to verified beneficiaries before the consume-by deadline. The
                recipient logs beneficiary count, and the platform updates public impact metrics
                segregating human meals, animal feed, and compost diversion without conflation.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-3)',
                }}
              >
                <span className="badge badge-success">
                  <Award size={12} /> UNEP / FSSAI Audited Metrics
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button type="button" className="btn btn-primary" onClick={() => onEnterApp('donor')}>
          <span>Create a Food Listing</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigatePublic('for-donors')}
        >
          <span>View Donor Guide</span>
        </button>
      </div>
    </div>
  );
}
