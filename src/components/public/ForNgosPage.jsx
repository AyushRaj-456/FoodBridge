import { ShieldCheck, HeartHandshake, MapPin, ArrowRight } from 'lucide-react';

export default function ForNgosPage({ onEnterApp }) {
  return (
    <div
      style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: 'var(--space-10) var(--gutter-desktop)',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '740px', marginBottom: 'var(--space-10)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-label)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          For Registered NGOs &amp; Charities
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          Reliable Access to Wholesome, Inspected Surplus Meals
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          FoodBridge connects verified NGOs directly with high-volume kitchens and dining halls.
          Receive real-time notifications for nearby available batches, claim with concurrency
          safety, and serve your community with confidence.
        </p>
      </div>

      {/* Key Benefits */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-10)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <ShieldCheck
            size={28}
            color="var(--color-primary)"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
            100% Quality Guaranteed
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5, margin: 0 }}
          >
            Every batch requires a donor temperature declaration, in-app live photograph, allergen
            list, and precise preparation timestamp before it appears in your feed.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <MapPin
            size={28}
            color="var(--color-primary)"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
            Proximity-Based Discovery
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5, margin: 0 }}
          >
            Discover listings within 5 km on an interactive map or filterable list. Avoid wasting
            transport time on distant or unfeasible pickups.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <HeartHandshake
            size={28}
            color="var(--color-primary)"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
            Demand-Side Meal Requests
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5, margin: 0 }}
          >
            Organizing a community meal or disaster relief drive? Broadcast your projected
            requirements in advance to institutional dining halls.
          </p>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontSize: 'var(--font-size-section)', margin: '0 0 var(--space-4)' }}>
          How to Become a Verified Recipient Organization
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-3)' }}
          >
            <strong>1. Organization Registration</strong>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-label)', marginTop: '4px' }}
            >
              Submit society registration, 80G/12A certificate, or official trust deed.
            </p>
          </div>
          <div
            style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-3)' }}
          >
            <strong>2. Food Safety Contact</strong>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-label)', marginTop: '4px' }}
            >
              Designate a primary contact responsible for collection hygiene and insulated
              containers.
            </p>
          </div>
          <div
            style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-3)' }}
          >
            <strong>3. Admin Verification</strong>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-label)', marginTop: '4px' }}
            >
              Platform admins verify credentials within 24 hours. Upon approval, live claims unlock
              immediately.
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => onEnterApp('recipient')}
        >
          <span>Browse Available Surplus Feed</span>
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          onClick={() => onEnterApp('onboard-org')}
        >
          <span>Apply for NGO Verification</span>
        </button>
      </div>
    </div>
  );
}
