import { ShieldCheck, CheckCircle2, Clock, FileCheck2, ArrowRight } from 'lucide-react';

export default function ForDonorsPage({ onEnterApp }) {
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
          For Food Donors
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          Turn Institutional Surplus into Community Nourishment
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          Designed for college hostel messes, canteens, corporate cafeterias, and banquet halls.
          List surplus in under 3 minutes with zero financial cost, full legal protection, and
          audited impact receipts.
        </p>
      </div>

      {/* Value Pillars */}
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
            FSSAI Good Samaritan Protection
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5, margin: 0 }}
          >
            Donors who provide surplus in good faith following standard hygiene procedures are
            protected from liability under Section 26 of the Food Safety and Standards Act.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <Clock
            size={28}
            color="var(--color-primary)"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
            3-Minute Rapid Declaration
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5, margin: 0 }}
          >
            Simple 5-step form with live in-app camera capture and automatic portion estimation. No
            cumbersome bureaucratic paperwork or delayed approvals.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <FileCheck2
            size={28}
            color="var(--color-primary)"
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
            Strict Privacy &amp; Loading Bay Safety
          </h3>
          <p
            className="text-muted"
            style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5, margin: 0 }}
          >
            Your kitchen&apos;s exact address and phone number are shielded from the public and
            revealed only to verified, accredited recipients after a confirmed claim.
          </p>
        </div>
      </div>

      {/* What can be donated */}
      <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontSize: 'var(--font-size-section)', margin: '0 0 var(--space-4)' }}>
          Eligible Food Categories &amp; Requirements
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          <div>
            <h4
              style={{
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <CheckCircle2 size={18} /> Accepted Surplus
            </h4>
            <ul
              style={{
                paddingLeft: 'var(--space-4)',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <li>Untouched batch-cooked meals (rice, dal, curries, sabzi)</li>
              <li>Hot-held bread, chapatis, rotis in covered containers</li>
              <li>Unopened packaged food within manufacturer expiry</li>
              <li>Breakfast items (idli, sambhar, poha) within 3 hours of preparation</li>
            </ul>
          </div>
          <div>
            <h4
              style={{
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              Not Accepted for Human Route
            </h4>
            <ul
              style={{
                paddingLeft: 'var(--space-4)',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <li>Food displayed on open self-service buffet tables</li>
              <li>Partially consumed plates or customer leftovers</li>
              <li>Items held at room temperature exceeding 2 hours</li>
              <li>Food showing sensory deterioration or off-odors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => onEnterApp('donor')}
        >
          <span>Create Food Listing</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
