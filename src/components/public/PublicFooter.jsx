import { UtensilsCrossed, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function PublicFooter({ onNavigatePublic, onEnterApp }) {
  return (
    <footer
      style={{
        backgroundColor: '#0f2f26',
        color: '#ffffff',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        paddingTop: 'var(--space-12, 3rem)',
        paddingBottom: 'var(--space-8, 2rem)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--content-max-width, 1280px)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop, 2rem)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-8, 2rem)',
            marginBottom: 'var(--space-12, 3rem)',
          }}
        >
          {/* Col 1: Brand & Community Philosophy */}
          <div style={{ maxWidth: '340px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2, 0.5rem)',
                marginBottom: 'var(--space-3, 0.75rem)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#d8f34e',
                  color: '#0d2b22',
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
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                FoodBridge
              </span>
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              A community food redistribution network connecting surplus kitchen meals with nearby
              reviewed shelters and community welfare organizations.
            </p>
            <div
              style={{
                marginTop: 'var(--space-4, 1rem)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                fontSize: '0.75rem',
                color: '#d8f34e',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={14} />
              <span>Reviewed by Our Team &bull; Privacy Protected</span>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: 'var(--space-4, 1rem)',
                fontWeight: 700,
              }}
            >
              For Communities
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2, 0.5rem)',
              }}
            >
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('for-donors')}
                >
                  For Messes &amp; Kitchens
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('for-ngos')}
                >
                  For Reviewed NGOs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('for-farms')}
                >
                  For Cattle Farms &amp; Composting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    if (typeof onEnterApp === 'function') onEnterApp('donor');
                  }}
                >
                  Donor Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines & Trust */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: 'var(--space-4, 1rem)',
                fontWeight: 700,
              }}
            >
              Trust &amp; Guidelines
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2, 0.5rem)',
              }}
            >
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('how-it-works')}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('about')}
                >
                  About FoodBridge
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('privacy')}
                >
                  Privacy &amp; Data Minimization
                </button>
              </li>
              <li>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => onNavigatePublic('terms')}
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Help & Contact */}
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: 'var(--space-4, 1rem)',
                fontWeight: 700,
              }}
            >
              Contact &amp; Support
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2, 0.5rem)',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} color="#d8f34e" />
                <span>North Campus Sector &bull; Community Cell</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#d8f34e" />
                <span>support@foodbridge.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#d8f34e" />
                <span>Helpdesk: +91 94450 99887</span>
              </div>
              <div style={{ marginTop: 'var(--space-2, 0.5rem)' }}>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => onNavigatePublic('contact')}
                >
                  Get in Touch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 'var(--space-6, 1.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4, 1rem)',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} FoodBridge Community Redistribution Platform. Built
            for positive community impact.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() => onNavigatePublic('privacy')}
            >
              Privacy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() => onNavigatePublic('terms')}
            >
              Terms
            </button>
            <span>&bull;</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Built with <Heart size={12} color="#d8f34e" fill="#d8f34e" /> for community welfare
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
