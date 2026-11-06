import { UtensilsCrossed, Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function PublicFooter({ onNavigatePublic, onEnterApp }) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-8)',
        marginTop: 'var(--space-16)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)',
          }}
        >
          {/* Col 1: Brand & Philosophy */}
          <div style={{ maxWidth: '340px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UtensilsCrossed size={16} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-brand-900)',
                }}
              >
                FoodBridge
              </span>
            </div>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-label)', lineHeight: 1.6 }}
            >
              A modern community-driven surplus food redistribution and organic waste management
              platform. Operating under the strict principle:
              <strong style={{ display: 'block', color: 'var(--color-text)', marginTop: '4px' }}>
                PREVENT &rarr; REDISTRIBUTE &rarr; RECYCLE &rarr; MEASURE IMPACT
              </strong>
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-4)',
              }}
            >
              <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                <Shield size={12} /> Spark ₹0 Verified
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                FSSAI Good Samaritan Compliant
              </span>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div>
            <h4
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Platforms &amp; Stakeholders
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('for-donors')}
                >
                  For Donors &amp; Canteens
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('for-ngos')}
                >
                  For Verified NGOs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('for-farms')}
                >
                  For Cattle Farms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('for-farms')}
                >
                  For Composting &amp; Biogas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={onEnterApp}
                >
                  Mess Analytics Module
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Resources */}
          <div>
            <h4
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Resources &amp; Trust
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('how-it-works')}
                >
                  How It Works SOP
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('impact')}
                >
                  Audited Impact Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('about')}
                >
                  About FoodBridge
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('privacy')}
                >
                  Data Privacy &amp; 30-Day Purge
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn-quiet"
                  style={{ padding: 0, fontSize: 'var(--font-size-body)' }}
                  onClick={() => onNavigatePublic('terms')}
                >
                  Terms &amp; FSSAI Protection
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Pilots & Contact */}
          <div>
            <h4
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Pilot Administration
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MapPin size={16} color="var(--color-primary)" />
                <span>North Campus Mess 3 &bull; Pilot Cell</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Mail size={16} color="var(--color-primary)" />
                <span>pilot@foodbridge.civic</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Phone size={16} color="var(--color-primary)" />
                <span>Helpdesk: +91 94450 99887</span>
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: 'var(--space-1)' }}
                  onClick={() => onNavigatePublic('contact')}
                >
                  Contact Pilot Coordinator
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-muted)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} FoodBridge Platform. Free &amp; Open Civic Utility.
            Operating strictly on Firebase Spark Tier (₹0 budget).
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button
              type="button"
              className="btn-quiet"
              style={{ padding: 0, fontSize: 'var(--font-size-caption)' }}
              onClick={() => onNavigatePublic('privacy')}
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              className="btn-quiet"
              style={{ padding: 0, fontSize: 'var(--font-size-caption)' }}
              onClick={() => onNavigatePublic('terms')}
            >
              Terms of Service
            </button>
            <span>&bull;</span>
            <button
              type="button"
              className="btn-quiet"
              style={{ padding: 0, fontSize: 'var(--font-size-caption)' }}
              onClick={() => onNavigatePublic('contact')}
            >
              Campus Mess Pilot Cell
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
