import { HeartHandshake, Sprout, ArrowRight } from 'lucide-react';

export default function ForFarmsPage({ onEnterApp }) {
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
          Tiers 2 &amp; 3 Routing
        </span>
        <h1
          style={{
            fontSize: 'var(--font-size-display)',
            margin: 'var(--space-2) 0 var(--space-4)',
          }}
        >
          For Cattle Farms &amp; Composting Facilities
        </h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
          FoodBridge completes the circular biological lifecycle. When food is not suitable for
          human consumption, we coordinate safe animal feed routing and organic soil recovery under
          strict segregation rules.
        </p>
      </div>

      {/* Two columns: Cattle Farms vs Composting Facilities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-10)',
        }}
      >
        {/* Cattle Farms */}
        <div
          className="card"
          style={{ padding: 'var(--space-6)', borderTop: '4px solid var(--color-accent)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-3)',
            }}
          >
            <span className="badge badge-warning">Tier 2 Recovery</span>
            <HeartHandshake size={24} color="var(--color-accent)" />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
            For Dairy &amp; Cattle Farms
          </h2>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}>
            Access clean vegetable preparation trimmings, fresh cabbage leaves, grain husks, and
            bakery byproducts. Reduce feed costs while preventing methane emissions from landfill
            disposal.
          </p>

          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              border: '1px solid var(--color-border)',
            }}
          >
            <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: '4px' }}>
              Safety Rule:
            </strong>
            Food declared spoiled or contaminated for humans is NEVER automatically routed to
            animals. Cattle feed requires separate, independent animal suitability verification.
          </div>

          <div style={{ marginTop: 'var(--space-5)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => onEnterApp('farm')}
            >
              <span>Explore Cattle Farm Workspace</span>
            </button>
          </div>
        </div>

        {/* Composting & Biogas */}
        <div className="card" style={{ padding: 'var(--space-6)', borderTop: '4px solid #0d9488' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-3)',
            }}
          >
            <span className="badge badge-info">Tier 3 Enrichment</span>
            <Sprout size={24} color="#0d9488" />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-3)' }}>
            For Composting &amp; Biogas Facilities
          </h2>
          <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}>
            Collect high-calorie post-consumer organic waste, coffee grounds, and kitchen scraps for
            anaerobic digestion and aerobic vermicomposting. Track carbon diversion and compost
            yield.
          </p>

          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-canvas)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              border: '1px solid var(--color-border)',
            }}
          >
            <strong
              style={{ color: 'var(--color-brand-900)', display: 'block', marginBottom: '4px' }}
            >
              Ecological Conversion:
            </strong>
            Every 1,000 kg of organic waste diverted into composting prevents approximately 2,500 kg
            CO2e while generating ~500 kg of rich agricultural fertilizer.
          </div>

          <div style={{ marginTop: 'var(--space-5)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => onEnterApp('compost')}
            >
              <span>Explore Composting Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Routing Monitor CTA */}
      <div
        className="card"
        style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: '0 0 var(--space-2)' }}>
          Monitor the Real-Time Three-Tier Routing System
        </h3>
        <p
          className="text-muted"
          style={{
            fontSize: 'var(--font-size-body)',
            maxWidth: '580px',
            margin: '0 auto var(--space-4)',
          }}
        >
          Review the classification logic, facility eligibility gates, and negative tests preventing
          hazardous cross-contamination.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => onEnterApp('routing')}>
          <span>Open Three-Tier Routing Interface</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
