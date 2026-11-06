import {
  UtensilsCrossed,
  ArrowRight,
  HeartHandshake,
  Sprout,
  TrendingDown,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Users,
  Leaf,
} from 'lucide-react';

export default function LandingPage({ onNavigatePublic, onEnterApp }) {
  return (
    <div className="landing-page-wrapper">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section
        style={{
          position: 'relative',
          padding: 'var(--space-12) var(--gutter-desktop) var(--space-16)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--content-max-width)',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-10)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Value Prop */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-brand-100)',
                color: 'var(--color-brand-900)',
                fontSize: 'var(--font-size-label)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <Leaf size={15} />
              <span>Community Food Rescue Network &bull; Verified Safe</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
                lineHeight: 1.15,
                fontWeight: 'var(--font-weight-extrabold)',
                color: 'var(--color-brand-900)',
                letterSpacing: '-0.03em',
                marginBottom: 'var(--space-4)',
              }}
            >
              Turn Surplus Food into Real Impact.
            </h1>

            <p
              className="text-muted"
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                marginBottom: 'var(--space-6)',
                maxWidth: '560px',
              }}
            >
              Connect surplus food with verified NGOs, support cattle farms, and recycle organic
              waste — building a resilient community with less food wastage.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => onEnterApp('donor')}
              >
                <span>Donate Food</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => onEnterApp('recipient')}
              >
                <span>Find Food</span>
              </button>

              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => onNavigatePublic('how-it-works')}
                style={{ padding: 'var(--space-2) var(--space-3)' }}
              >
                Explore How It Works &rarr;
              </button>
            </div>

            {/* Safety & Compliance Trust Points */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                fontSize: 'var(--font-size-label)',
                color: 'var(--color-muted)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                FSSAI Safe Food Declaration
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                Strict Donor Privacy Shield
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" />
                Direct Community Handover
              </span>
            </div>
          </div>

          {/* Right Column: Authentic Editorial Visual Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-canvas)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Editorial Header */}
            <div
              style={{
                padding: 'var(--space-5)',
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secondary)',
                  }}
                />
                <span
                  style={{
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-label)',
                  }}
                >
                  Live Campus Redistribution Cell
                </span>
              </div>
              <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                Verified Mess 3
              </span>
            </div>

            {/* Simulated Live Surplus Dispatch Card */}
            <div style={{ padding: 'var(--space-6)' }}>
              <div
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: 'var(--space-5)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <div>
                    <span
                      className="badge badge-success"
                      style={{ marginBottom: 'var(--space-1)' }}
                    >
                      Cooked Meals &bull; Ready for Handover
                    </span>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-text)' }}>
                      Fresh Steamed Rice &amp; Yellow Dal Tadka
                    </h3>
                    <p
                      className="text-muted"
                      style={{ fontSize: 'var(--font-size-label)', margin: '4px 0 0' }}
                    >
                      Declared at 19:30 &bull; Insulated stainless vessels (&gt;60&deg;C)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      18 kg
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                      ~55 portions
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-canvas)',
                    fontSize: '12px',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <div>
                    <span className="text-muted">Safe Window:</span>
                    <div style={{ fontWeight: 600 }}>Until 23:00</div>
                  </div>
                  <div>
                    <span className="text-muted">Recipient:</span>
                    <div style={{ fontWeight: 600 }}>City Care NGO</div>
                  </div>
                  <div>
                    <span className="text-muted">Routing Tier:</span>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      Tier 1 (Human)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                  }}
                >
                  <span className="text-muted">Pickup Pin: Campus Kitchen Loading Bay</span>
                  <span className="badge badge-neutral">SOP Compliant</span>
                </div>
              </div>

              {/* Three-Tier Routing Quick Indicator */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-2)',
                }}
              >
                <div
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '14px' }}>
                    1. Humans
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Verified NGOs</div>
                </div>
                <div
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '14px' }}>
                    2. Animals
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Cattle Farms</div>
                </div>
                <div
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#0d9488', fontWeight: 700, fontSize: '14px' }}>3. Soil</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                    Compost / Biogas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. IMPACT STATISTICS (Section 4.1: Empirical / Verified Data)
          ==================================================================== */}
      <section
        style={{
          padding: 'var(--space-10) var(--gutter-desktop)',
          backgroundColor: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 'var(--font-size-label)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                Audited Pilot Results
              </span>
              <h2 style={{ fontSize: 'var(--font-size-section)', margin: '4px 0 0' }}>
                Measured Outcomes &bull; Single-Mess Campus Pilot
              </h2>
            </div>
            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-muted)' }}>
              Data source: 14-day controlled pilot logs &bull; Zero fabricated numbers
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-label)',
                  marginBottom: '4px',
                }}
              >
                Meals Redistributed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                787
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Calculated at 400g/meal (FSSAI)
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-label)',
                  marginBottom: '4px',
                }}
              >
                Surplus Rescued
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>
                315 kg
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Diverted from waste stream
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-label)',
                  marginBottom: '4px',
                }}
              >
                Food Production Monitored
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                4,850 kg
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Across 42 distinct meal shifts
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-label)',
                  marginBottom: '4px',
                }}
              >
                Safety &amp; Spoilage Incidents
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                0
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                100% human-SOP adherence
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-label)',
                  marginBottom: '4px',
                }}
              >
                Community Accessibility
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                100% Free
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Open for verified welfare partners
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. HOW IT WORKS (Section 4.1: Four-Step Process)
          ==================================================================== */}
      <section
        style={{
          padding: 'var(--space-16) var(--gutter-desktop)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-12)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Operational Workflow
            </span>
            <h2 style={{ fontSize: 'var(--font-size-title-desktop)', marginTop: 'var(--space-1)' }}>
              How FoodBridge Works
            </h2>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--space-2)' }}
            >
              A disciplined, transparent 4-step pipeline designed for rapid redistribution within
              safe consumption windows.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
              position: 'relative',
            }}
          >
            {/* Step 1 */}
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-100)',
                  color: 'var(--color-brand-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
                List Surplus Food
              </h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', margin: 0 }}>
                Kitchen staff logs excess quantity, storage temperature, preparation time, and
                dietary details with live in-app camera confirmation in under 3 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-100)',
                  color: 'var(--color-brand-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
                Find Verified Recipients
              </h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', margin: 0 }}>
                Nearby verified welfare NGOs within 5 km receive instant in-app alerts. Only
                verified charities can claim food; exact pickup address is shielded until claim.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-100)',
                  color: 'var(--color-brand-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
                Complete the Handover
              </h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', margin: 0 }}>
                Recipient arrives at designated loading bay with insulated transport boxes. Both
                parties confirm temperature and physical condition before departure.
              </p>
            </div>

            {/* Step 4 */}
            <div
              className="card"
              style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-100)',
                  color: 'var(--color-brand-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: 'var(--font-size-card-heading)', margin: 0 }}>
                Track Audited Impact
              </h3>
              <p className="text-muted" style={{ fontSize: 'var(--font-size-body)', margin: 0 }}>
                Real-time accounting of meals served, kg rescued, and environmental diversion using
                UNEP/FSSAI accredited conversion metrics without guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. THREE-TIER ZERO-WASTE HIERARCHY (Section 4.1 & 11)
          ==================================================================== */}
      <section
        style={{
          padding: 'var(--space-16) var(--gutter-desktop)',
          backgroundColor: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto var(--space-12)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Ecological Recovery Cascade
            </span>
            <h2 style={{ fontSize: 'var(--font-size-title-desktop)', marginTop: 'var(--space-1)' }}>
              Three-Tier Zero-Waste Routing
            </h2>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-body)', marginTop: 'var(--space-2)' }}
            >
              Food has distinct value at every stage. We route surplus along strict biological and
              food-safety pathways, ensuring zero edible nutrition is wasted.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {/* Tier 1 Card */}
            <div
              className="card"
              style={{
                borderTop: '4px solid var(--color-primary)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <span className="badge badge-verified">Tier 1 &bull; Highest Priority</span>
                <Users size={20} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 var(--space-2)' }}>
                Humans First &bull; Verified NGOs
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5 }}
              >
                Freshly prepared, properly held cooked meals, untouched bread, and packaged
                foodstuffs. Dispatched strictly to government-verified orphanages, shelters, and
                community kitchens.
              </p>
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '12px',
                  color: 'var(--color-muted)',
                }}
              >
                <strong>SOP Standard:</strong> FSSAI Safe Food Handover &bull; 4-hour consumption
                window
              </div>
            </div>

            {/* Tier 2 Card */}
            <div
              className="card"
              style={{
                borderTop: '4px solid var(--color-accent)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <span className="badge badge-warning">Tier 2 &bull; Secondary Recovery</span>
                <HeartHandshake size={20} color="var(--color-accent)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 var(--space-2)' }}>
                Animals Second &bull; Cattle &amp; Dairy Farms
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5 }}
              >
                Vegetable peelings, clean grain trimmings, and safe bakery surplus assessed as
                wholesome feed.{' '}
                <em>
                  Strict invariant: Food rejected for human consumption is never inferred safe for
                  animals.
                </em>
              </p>
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '12px',
                  color: 'var(--color-muted)',
                }}
              >
                <strong>SOP Standard:</strong> Separate cattle-feed suitability certification
                required
              </div>
            </div>

            {/* Tier 3 Card */}
            <div
              className="card"
              style={{
                borderTop: '4px solid #0d9488',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <span className="badge badge-info">Tier 3 &bull; Soil Enrichment</span>
                <Sprout size={20} color="#0d9488" />
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: '0 0 var(--space-2)' }}>
                Soil Third &bull; Composting &amp; Biogas
              </h3>
              <p
                className="text-muted"
                style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.5 }}
              >
                Plate scraps, citrus rinds, and non-feedable kitchen organics converted into
                nutrient-dense vermicompost or clean biogas energy, completing the circular
                lifecycle.
              </p>
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '12px',
                  color: 'var(--color-muted)',
                }}
              >
                <strong>SOP Standard:</strong> Organic diversion tracking &bull; 0.5 kg compost
                yield / kg
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. FOOD WASTE PREVENTION (Mess Analytics Section 4.1 & 10)
          ==================================================================== */}
      <section
        style={{
          padding: 'var(--space-16) var(--gutter-desktop)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--content-max-width)',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-10)',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 'var(--font-size-label)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              Root-Cause Prevention
            </span>
            <h2
              style={{
                fontSize: 'var(--font-size-title-desktop)',
                margin: 'var(--space-1) 0 var(--space-4)',
              }}
            >
              The Best Surplus Food is the Food Never Wasted.
            </h2>
            <p
              className="text-muted"
              style={{ fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}
            >
              Redistribution solves the immediate surplus, but prevention solves the systematic
              loss. Our proprietary Mess Analytics engine helps large-scale dining operators monitor
              consumption, identify patterns, and adjust batch preparation without paid third-party
              AI or hidden costs.
            </p>

            <div
              style={{
                marginTop: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-primary)', marginTop: '2px' }}>
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <strong>Track Daily Preparation &amp; Consumption:</strong>
                  <span
                    className="text-muted"
                    style={{ display: 'block', fontSize: 'var(--font-size-label)' }}
                  >
                    Log exact kilograms prepared, consumed, and left over with headcount
                    verification.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-primary)', marginTop: '2px' }}>
                  <BarChart3 size={18} />
                </div>
                <div>
                  <strong>Weekday &amp; Meal-Wise Wastage Patterns:</strong>
                  <span
                    className="text-muted"
                    style={{ display: 'block', fontSize: 'var(--font-size-label)' }}
                  >
                    Discover why Friday dinners or Sunday breakfasts generate higher variance.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--color-primary)', marginTop: '2px' }}>
                  <TrendingDown size={18} />
                </div>
                <div>
                  <strong>14-Day Moving Average Advisory Forecasts:</strong>
                  <span
                    className="text-muted"
                    style={{ display: 'block', fontSize: 'var(--font-size-label)' }}
                  >
                    Deterministic JavaScript algorithms offer cooking advisories with uncertainty
                    bounds.
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onEnterApp('mess_operator')}
              >
                <span>Explore Mess Analytics Workspace</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Visual Preview of Mess Analytics */}
          <div
            className="card"
            style={{
              padding: 'var(--space-6)',
              backgroundColor: 'var(--color-canvas)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>
                  Campus Mess 3 &bull; Wastage Dashboard
                </h4>
                <span className="text-muted" style={{ fontSize: '11px' }}>
                  14-Day Baseline Window
                </span>
              </div>
              <span className="badge badge-success">8.4% Avg Surplus</span>
            </div>

            {/* Mini Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <span>Mon (Dinner Rice &amp; Dal)</span>
                  <strong>12 kg leftover (6.2%)</strong>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{ width: '6.2%', height: '100%', background: 'var(--color-primary)' }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <span>Wed (Lunch Veg Pulao)</span>
                  <strong>24 kg leftover (12.1%)</strong>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{ width: '12.1%', height: '100%', background: 'var(--color-accent)' }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <span>Fri (Dinner Chapatis)</span>
                  <strong>18 kg leftover (9.0%)</strong>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{ width: '9%', height: '100%', background: 'var(--color-primary)' }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 'var(--space-5)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '12px',
              }}
            >
              <div
                style={{ color: 'var(--color-brand-900)', fontWeight: 600, marginBottom: '2px' }}
              >
                Deterministic Advisory:
              </div>
              <div className="text-muted">
                &ldquo;Based on 14-day Friday patterns, consider preparing ~2,080 portions instead
                of 2,250 to prevent ~18 kg excess.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. COMMUNITY IMPACT & CALL TO ACTION
          ==================================================================== */}
      <section
        style={{
          padding: 'var(--space-16) var(--gutter-desktop)',
          backgroundColor: 'var(--color-surface)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-brand-100)',
              color: 'var(--color-brand-900)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            <UtensilsCrossed size={24} />
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: 'var(--space-3)' }}>
            Join the FoodBridge Network Today
          </h2>

          <p
            className="text-muted"
            style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}
          >
            Whether you operate a college dining hall, manage a welfare NGO, or run a cattle farm —
            FoodBridge provides the free, reliable digital infrastructure to eliminate food waste.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => onEnterApp('donor')}
            >
              <span>Get Started as Donor</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => onNavigatePublic('for-ngos')}
            >
              <span>Register as Recipient NGO</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
