import { useState } from 'react';
import {
  UtensilsCrossed,
  ArrowRight,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Building,
  HeartHandshake,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  Leaf,
  Scale,
  Activity,
  Users,
} from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth.js';
import {
  HOME_STATS,
  HOME_RECENT_ACTIVITY,
  HOME_MAP_DATA,
  HOME_TRUSTED_PARTNERS,
  HOME_HOW_IT_WORKS,
  HOME_BENEFITS,
  HOME_SAFETY_POINTS,
  HOME_FAQS,
} from './homeData.js';
import './LandingPage.css';

export default function LandingPage({ onOpenAuth, onEnterApp }) {
  const { user } = useAuth();

  // Tab state for "For Donors / For NGOs"
  const [activeRoleTab, setActiveRoleTab] = useState('donors');

  // Accordion state for Safety & Trust (stores open accordion IDs)
  const [openSafetyAccordions, setOpenSafetyAccordions] = useState({
    'safety-1': true, // first accordion open by default
  });

  // Accordion state for FAQ (stores open FAQ IDs)
  const [openFaqAccordions, setOpenFaqAccordions] = useState({
    'faq-1': true,
  });

  // Selected map pin for interactive tooltip
  const [selectedMapNode, setSelectedMapNode] = useState(HOME_MAP_DATA.donors[0]);

  // Auth-gated primary actions
  const handleShareFoodClick = () => {
    if (user) {
      if (typeof onEnterApp === 'function') onEnterApp('donor');
    } else {
      if (typeof onOpenAuth === 'function') onOpenAuth();
    }
  };

  const handleFindFoodClick = () => {
    if (user) {
      if (typeof onEnterApp === 'function') onEnterApp('recipient');
    } else {
      if (typeof onOpenAuth === 'function') onOpenAuth();
    }
  };

  const toggleSafetyAccordion = (id) => {
    setOpenSafetyAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleFaqAccordion = (id) => {
    setOpenFaqAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="landing-page-wrapper">
      {/* ====================================================================
          1. HERO SECTION (Dark Forest Green in Both Light & Dark Themes)
          ==================================================================== */}
      <section className="hero-section" id="hero">
        <div className="landing-container">
          <div className="hero-grid">
            {/* Left: Value Proposition */}
            <div>
              <div className="hero-pill">
                <Leaf size={14} />
                <span>Community Food Rescue • Direct &amp; Safe</span>
              </div>

              <h1 className="hero-title">Good food shouldn&apos;t go to waste.</h1>

              <p className="hero-subtext">
                Share extra food from messes, hostels, and kitchens with nearby verified NGOs in
                minutes — simple, clean, and transparent.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn-hero-accent"
                  onClick={handleShareFoodClick}
                  aria-label="Share surplus food"
                >
                  <span>Share food</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="btn-hero-outline"
                  onClick={handleFindFoodClick}
                  aria-label="Find surplus food nearby"
                >
                  <span>Find food</span>
                </button>
              </div>

              <div className="hero-trust-note">
                <Sparkles size={14} color="var(--hero-accent-lime)" />
                <span>Usually claimed within 15–30 minutes by local shelters</span>
              </div>
            </div>

            {/* Right: Laptop + Phone Product Mockup (Pure HTML/CSS/SVG) */}
            <div className="hero-mockup-wrapper" aria-hidden="true">
              {/* Laptop Frame */}
              <div className="mockup-laptop">
                <div className="laptop-camera-notch" />
                <div className="laptop-screen">
                  {/* Laptop Mockup App Header */}
                  <div className="mockup-app-header">
                    <div className="mockup-brand">
                      <UtensilsCrossed size={14} color="#d8f34e" />
                      <span>FoodBridge Donor App</span>
                    </div>
                    <span className="mockup-badge-live">Live Dispatch</span>
                  </div>

                  {/* Laptop Mockup Body */}
                  <div className="mockup-app-body">
                    <div className="mockup-card">
                      <div className="mockup-card-title">Steamed Rice &amp; Dal Tadka</div>
                      <div className="mockup-card-meta">
                        <span>⚖️ 18 kg (~55 portions)</span>
                        <span>⏱️ Safe until: 10:30 PM</span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: '#607d72',
                          marginBottom: '6px',
                        }}
                      >
                        Pickup Window: <strong>7:30 PM – 9:00 PM</strong>
                      </div>
                      <div className="mockup-card-footer">
                        <span className="mockup-status-tag">Ready for Pickup</span>
                        <span style={{ fontSize: '0.625rem', color: '#166534', fontWeight: 600 }}>
                          Campus Mess 3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop Keyboard Deck Base */}
                <div className="laptop-base">
                  <div className="laptop-notch" />
                </div>
              </div>

              {/* Overlapping Phone Mockup Floating in Foreground */}
              <div className="mockup-phone">
                <div className="phone-speaker" />
                <div className="phone-screen">
                  <div className="phone-alert-badge">
                    <Activity size={10} />
                    <span>Nearby Alert (1.2 km)</span>
                  </div>
                  <div className="phone-food-title">Steamed Rice &amp; Dal</div>
                  <div style={{ fontSize: '0.625rem', color: '#556b60', marginBottom: '4px' }}>
                    18 kg • North Mess Hub
                  </div>
                  <span className="phone-claim-btn">Claim 18 kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Placeholder Strip Under Hero */}
          <div className="hero-partners-strip">
            <div className="hero-partners-label">Trusted by kitchens, hostels and NGOs</div>
            <div className="hero-partners-list">
              {HOME_TRUSTED_PARTNERS.map((partner) => (
                <span key={partner} className="hero-partner-tag">
                  <Building size={12} />
                  <span>{partner}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. LIVE ACTIVITY SECTION (Public - No Login Needed)
          ==================================================================== */}
      <section className="landing-section" id="live-activity">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-kicker">
              <Activity size={14} />
              <span>Real-Time Community Network</span>
            </span>
            <h2 className="section-title">Live Redistribution Activity</h2>
            <p className="section-subtitle">
              See surplus food moving between kitchens and local shelters right now. Approximate
              areas only — exact addresses stay protected.
            </p>
          </div>

          {/* 4 Public Metrics Counters */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{HOME_STATS.mealsShared.label}</span>
                <UtensilsCrossed size={18} className="stat-icon" />
              </div>
              <div className="stat-value">{HOME_STATS.mealsShared.value}</div>
              <div className="stat-note">{HOME_STATS.mealsShared.changeNote}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{HOME_STATS.ngosConnected.label}</span>
                <Users size={18} className="stat-icon" />
              </div>
              <div className="stat-value">{HOME_STATS.ngosConnected.value}</div>
              <div className="stat-note">{HOME_STATS.ngosConnected.changeNote}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{HOME_STATS.activePickups.label}</span>
                <Truck size={18} className="stat-icon" />
              </div>
              <div className="stat-value">{HOME_STATS.activePickups.value}</div>
              <div className="stat-note">{HOME_STATS.activePickups.changeNote}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{HOME_STATS.kgFoodSaved.label}</span>
                <Scale size={18} className="stat-icon" />
              </div>
              <div className="stat-value">{HOME_STATS.kgFoodSaved.value}</div>
              <div className="stat-note">{HOME_STATS.kgFoodSaved.changeNote}</div>
            </div>
          </div>

          {/* Interactive Live Transit Map + Anonymized Live Feed */}
          <div className="live-activity-grid">
            {/* Left: Stylized SVG Live Transit Map */}
            <div className="map-visual-card">
              <div className="map-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#4ade80" />
                  <strong>Active Dispatch &amp; Transit Routes</strong>
                </div>
                <span className="map-privacy-tag">
                  <ShieldCheck size={12} />
                  <span>Approximate Areas Only</span>
                </span>
              </div>

              <div className="map-svg-wrapper">
                <svg
                  className="map-svg"
                  viewBox="0 0 700 360"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Stylized map showing food transit routes from donor kitchens to shelters"
                >
                  {/* Subtle Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeWidth="1"
                      />
                    </pattern>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#d8f34e" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  <rect width="700" height="360" fill="url(#grid)" />

                  {/* Concentric radar backdrop */}
                  <circle
                    cx="350"
                    cy="180"
                    r="140"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="350"
                    cy="180"
                    r="240"
                    stroke="rgba(255,255,255,0.02)"
                    strokeWidth="1"
                  />

                  {/* Transit Routes (Connecting Bezier Curves) */}
                  {HOME_MAP_DATA.routes.map((rt) => (
                    <g key={rt.id}>
                      {/* Glow background curve */}
                      <path
                        d={rt.pathD}
                        stroke="rgba(34, 197, 94, 0.15)"
                        strokeWidth="6"
                        fill="none"
                      />
                      {/* Animated dashed line */}
                      <path
                        d={rt.pathD}
                        stroke="url(#routeGradient)"
                        strokeWidth="2.5"
                        fill="none"
                        className="map-route-line"
                      />
                    </g>
                  ))}

                  {/* Donor Hub Pins (Green) */}
                  {HOME_MAP_DATA.donors.map((d) => (
                    <g
                      key={d.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedMapNode(d)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Donor hub: ${d.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedMapNode(d);
                      }}
                    >
                      {/* Pulsing radar circle */}
                      <circle
                        cx={d.x}
                        cy={d.y}
                        r="8"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="1.5"
                        className="map-node-pulse"
                      />
                      {/* Core pin */}
                      <circle cx={d.x} cy={d.y} r="7" fill="#22c55e" />
                      <circle cx={d.x} cy={d.y} r="3" fill="#ffffff" />
                      <text
                        x={d.x}
                        y={d.y - 12}
                        textAnchor="middle"
                        fill="#e2f5ea"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {d.name}
                      </text>
                    </g>
                  ))}

                  {/* Recipient NGO Pins (Cyan / Amber) */}
                  {HOME_MAP_DATA.recipients.map((r) => (
                    <g
                      key={r.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedMapNode(r)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Recipient partner: ${r.name}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedMapNode(r);
                      }}
                    >
                      <circle cx={r.x} cy={r.y} r="6" fill="#38bdf8" />
                      <circle cx={r.x} cy={r.y} r="2.5" fill="#ffffff" />
                      <text
                        x={r.x}
                        y={r.y + 16}
                        textAnchor="middle"
                        fill="#bae6fd"
                        fontSize="10"
                        fontWeight="500"
                      >
                        {r.name}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Selected Node Tooltip Card & Map Legend */}
              <div className="map-footer">
                <div className="map-legend">
                  <span className="legend-item">
                    <span className="legend-dot legend-dot-donor" />
                    <span>Kitchen Donor Hub</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot legend-dot-ngo" />
                    <span>Recipient Shelter</span>
                  </span>
                </div>
                {selectedMapNode && (
                  <div style={{ color: '#d8f34e', fontSize: '0.75rem', fontWeight: 600 }}>
                    Selected: {selectedMapNode.name} ({selectedMapNode.district})
                  </div>
                )}
              </div>
            </div>

            {/* Right: Anonymized Recent Live Activity Feed */}
            <div className="feed-card">
              <div className="feed-title-row">
                <div className="feed-title">Recent Handover Feed</div>
                <div className="live-indicator">
                  <span className="live-dot" />
                  <span>Live Updates</span>
                </div>
              </div>

              <div className="activity-feed-list">
                {HOME_RECENT_ACTIVITY.map((item) => (
                  <div key={item.id} className="activity-feed-item">
                    <CheckCircle2 size={16} className="feed-item-icon" />
                    <div className="feed-item-content">
                      <div className="feed-food-title">{item.foodSummary}</div>
                      <div className="feed-item-sub">
                        <span>{item.donorArea}</span> &bull; <span>{item.recipientType}</span>
                      </div>
                    </div>
                    <div className="feed-time">{item.timeAgo}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border-subtle, #f0f4f1)',
                  fontSize: '0.75rem',
                  color: 'var(--color-muted)',
                  textAlign: 'center',
                }}
              >
                🔒 Full pickup addresses visible only to claiming volunteers.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. HOW IT WORKS (3 Simple Step Cards)
          ==================================================================== */}
      <section className="landing-section landing-section-alt" id="how-it-works">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-kicker">
              <Clock size={14} />
              <span>Simple 3-Step Process</span>
            </span>
            <h2 className="section-title">How FoodBridge Works</h2>
            <p className="section-subtitle">
              Redistributing surplus food should never slow down kitchen operations or complicate
              volunteer work. Here is how clean handover happens:
            </p>
          </div>

          <div className="how-it-works-grid">
            {HOME_HOW_IT_WORKS.map((step, idx) => {
              const icons = [UtensilsCrossed, CheckCircle2, Truck];
              const StepIcon = icons[idx] || UtensilsCrossed;
              return (
                <div key={step.step} className="step-card">
                  <span className="step-badge">{step.badge}</span>
                  <div className="step-icon-box">
                    <StepIcon size={22} />
                  </div>
                  <span className="step-number">Step 0{step.step}</span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. FOR DONORS / FOR NGOS (Tabbed Benefits Section)
          ==================================================================== */}
      <section className="landing-section" id="roles-section">
        <div className="landing-container">
          <div className="role-tabs-card">
            {/* Tab Switcher */}
            <div style={{ textAlign: 'center' }}>
              <div className="role-tab-switcher" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeRoleTab === 'donors'}
                  className={`role-tab-btn ${activeRoleTab === 'donors' ? 'active' : ''}`}
                  onClick={() => setActiveRoleTab('donors')}
                >
                  For Kitchens &amp; Donors
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeRoleTab === 'ngos'}
                  className={`role-tab-btn ${activeRoleTab === 'ngos' ? 'active' : ''}`}
                  onClick={() => setActiveRoleTab('ngos')}
                >
                  For NGOs &amp; Shelters
                </button>
              </div>
            </div>

            {/* Tab 1: For Donors */}
            {activeRoleTab === 'donors' && (
              <div className="role-content-grid">
                <div>
                  <h3 className="role-headline">{HOME_BENEFITS.donors.heading}</h3>
                  <p className="role-subtext">{HOME_BENEFITS.donors.subheading}</p>

                  <div className="benefits-list">
                    {HOME_BENEFITS.donors.points.map((pt) => (
                      <div key={pt.title} className="benefit-item">
                        <CheckCircle2 size={18} className="benefit-icon" />
                        <div>
                          <div className="benefit-title">{pt.title}</div>
                          <div className="benefit-desc">{pt.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleShareFoodClick}
                      style={{ minHeight: '44px', fontWeight: 600 }}
                    >
                      <span>{HOME_BENEFITS.donors.ctaLabel}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Donor Visual Card */}
                <div
                  style={{
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: 'var(--space-6)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      marginBottom: '12px',
                    }}
                  >
                    <UtensilsCrossed size={18} />
                    <span>Quick Surplus Declaration</span>
                  </div>
                  <div
                    style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}
                  >
                    &bull; <strong>Dish / Description:</strong> Steamed Rice &amp; Mixed Dal
                    <br />
                    &bull; <strong>Portions:</strong> ~50 diners (15 kg)
                    <br />
                    &bull; <strong>Safe Pickup Window:</strong> 8:00 PM – 9:30 PM
                    <br />
                    &bull; <strong>Dietary Tags:</strong> Pure Vegetarian, No Nuts
                    <br />
                  </div>
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: 'var(--color-surface)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    ⚡ Form takes 45 seconds to submit on mobile. Listing closes automatically when
                    pickup time passes.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: For NGOs */}
            {activeRoleTab === 'ngos' && (
              <div className="role-content-grid">
                <div>
                  <h3 className="role-headline">{HOME_BENEFITS.ngos.heading}</h3>
                  <p className="role-subtext">{HOME_BENEFITS.ngos.subheading}</p>

                  <div className="benefits-list">
                    {HOME_BENEFITS.ngos.points.map((pt) => (
                      <div key={pt.title} className="benefit-item">
                        <CheckCircle2 size={18} className="benefit-icon" />
                        <div>
                          <div className="benefit-title">{pt.title}</div>
                          <div className="benefit-desc">{pt.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleFindFoodClick}
                      style={{ minHeight: '44px', fontWeight: 600 }}
                    >
                      <span>{HOME_BENEFITS.ngos.ctaLabel}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* NGO Visual Card */}
                <div
                  style={{
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: 'var(--space-6)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      marginBottom: '12px',
                    }}
                  >
                    <HeartHandshake size={18} />
                    <span>Verified NGO Discovery Feed</span>
                  </div>
                  <div
                    style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}
                  >
                    &bull; <strong>Nearby Alert:</strong> Central Hostel Block A (1.2 km away)
                    <br />
                    &bull; <strong>Portions Offered:</strong> 45 portions
                    <br />
                    &bull; <strong>Freshness Window:</strong> Safe until 10:00 PM
                    <br />
                    &bull; <strong>Dispatch Bay:</strong> Loading Dock Door 2 (Unlocked after claim)
                    <br />
                  </div>
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: 'var(--color-surface)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--color-muted)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    🤝 Claim only what your shelter can distribute. Single-claim locking ensures
                    zero duplicate pickups.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. SAFETY & TRUST (Expandable Accordions)
          ==================================================================== */}
      <section className="landing-section landing-section-alt" id="safety">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-kicker">
              <ShieldCheck size={14} />
              <span>Safety &amp; Transparency</span>
            </span>
            <h2 className="section-title">Built on Safety, Trust, and Privacy</h2>
            <p className="section-subtitle">
              Every step of our process is engineered to protect food freshness, respect kitchen
              privacy, and ensure dignified community nourishment.
            </p>
          </div>

          <div className="accordions-container">
            {HOME_SAFETY_POINTS.map((pt) => {
              const isOpen = !!openSafetyAccordions[pt.id];
              return (
                <div key={pt.id} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => toggleSafetyAccordion(pt.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="accordion-header-text">
                      <span className="accordion-title">{pt.title}</span>
                      <span className="accordion-summary">{pt.summary}</span>
                    </div>
                    <ChevronDown size={18} className="accordion-chevron" />
                  </button>
                  {isOpen && <div className="accordion-content">{pt.detail}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. FREQUENTLY ASKED QUESTIONS (FAQ Accordions)
          ==================================================================== */}
      <section className="landing-section" id="faq">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-kicker">
              <Layers size={14} />
              <span>Questions &amp; Answers</span>
            </span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about sharing or receiving surplus food with FoodBridge.
            </p>
          </div>

          <div className="accordions-container">
            {HOME_FAQS.map((faq) => {
              const isOpen = !!openFaqAccordions[faq.id];
              return (
                <div key={faq.id} className={`faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => toggleFaqAccordion(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question">{faq.question}</span>
                    <ChevronDown size={18} className="accordion-chevron" />
                  </button>
                  {isOpen && <div className="faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. FINAL CTA BAND (Dark Forest Green)
          ==================================================================== */}
      <section className="final-cta-section" id="get-started">
        <div className="landing-container">
          <div className="final-cta-box">
            <h2 className="final-cta-title">Ready to share food in your community?</h2>
            <p className="final-cta-subtitle">
              Join kitchens, hostels, and local shelters preventing food waste every day. No
              subscriptions, no complicated setup.
            </p>

            <div className="final-cta-actions">
              <button
                type="button"
                className="btn-hero-accent"
                onClick={handleShareFoodClick}
                aria-label="Share surplus food now"
              >
                <span>Share food</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="btn-hero-outline"
                onClick={handleFindFoodClick}
                aria-label="Find food nearby"
              >
                <span>Find food nearby</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
