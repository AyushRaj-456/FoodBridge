import { useState, useRef, useEffect } from 'react';
import { UtensilsCrossed, Sun, Moon, ChevronDown, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import './PublicNavbar.css';

export default function PublicNavbar({
  activePublicPage,
  onNavigatePublic,
  onOpenAuth,
  onEnterApp,
}) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop Dropdown Open States
  const [donorsDropdownOpen, setDonorsDropdownOpen] = useState(false);
  const [ngosDropdownOpen, setNgosDropdownOpen] = useState(false);

  // Mobile Accordion Open States inside Drawer
  const [mobileDonorsOpen, setMobileDonorsOpen] = useState(false);
  const [mobileNgosOpen, setMobileNgosOpen] = useState(false);

  const donorsTimeoutRef = useRef(null);
  const ngosTimeoutRef = useRef(null);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShareFoodClick = () => {
    setMobileMenuOpen(false);
    if (user) {
      if (typeof onEnterApp === 'function') onEnterApp('donor');
    } else {
      if (typeof onOpenAuth === 'function') onOpenAuth();
    }
  };

  const handleSectionScroll = (sectionId) => {
    setMobileMenuOpen(false);
    if (activePublicPage !== 'landing') {
      if (typeof onNavigatePublic === 'function') onNavigatePublic('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePageClick = (pageId) => {
    setMobileMenuOpen(false);
    if (typeof onNavigatePublic === 'function') onNavigatePublic(pageId);
  };

  return (
    <header className="public-navbar-header">
      <div className="public-navbar-container">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => handlePageClick('landing')}
          className="nav-brand-btn"
          aria-label="FoodBridge Home"
        >
          <div className="nav-brand-icon">
            <UtensilsCrossed size={19} />
          </div>
          <div>
            <div className="nav-brand-title">FoodBridge</div>
            <div className="nav-brand-tagline">Rescue Food &bull; Restore Balance</div>
          </div>
        </button>

        {/* Center Desktop Links with Slide-down Dropdowns */}
        <nav className="desktop-nav-center" aria-label="Main Navigation">
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => handleSectionScroll('how-it-works')}
          >
            How it works
          </button>

          <button
            type="button"
            className="nav-link-btn"
            onClick={() => handleSectionScroll('live-activity')}
          >
            Live activity
          </button>

          {/* For Donors Dropdown */}
          <div
            className="nav-dropdown-wrapper"
            onMouseEnter={() => {
              if (donorsTimeoutRef.current) clearTimeout(donorsTimeoutRef.current);
              setDonorsDropdownOpen(true);
            }}
            onMouseLeave={() => {
              donorsTimeoutRef.current = setTimeout(() => setDonorsDropdownOpen(false), 150);
            }}
          >
            <button
              type="button"
              className="nav-link-btn"
              aria-expanded={donorsDropdownOpen}
              onClick={() => setDonorsDropdownOpen((prev) => !prev)}
            >
              <span>For donors</span>
              <ChevronDown size={14} />
            </button>
            <div className={`dropdown-menu ${donorsDropdownOpen ? 'show' : ''}`}>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handlePageClick('for-donors')}
              >
                <span className="dropdown-item-title">Messes &amp; Hostels</span>
                <span className="dropdown-item-desc">
                  Bulk cooked meals &amp; student kitchen surplus
                </span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handlePageClick('for-donors')}
              >
                <span className="dropdown-item-title">Restaurants &amp; Caterers</span>
                <span className="dropdown-item-desc">
                  Event catering &amp; daily end-of-service items
                </span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handlePageClick('for-donors')}
              >
                <span className="dropdown-item-title">Food Stores &amp; Bakeries</span>
                <span className="dropdown-item-desc">
                  Safe packaged staples, dairy &amp; baked goods
                </span>
              </button>
            </div>
          </div>

          {/* For NGOs Dropdown */}
          <div
            className="nav-dropdown-wrapper"
            onMouseEnter={() => {
              if (ngosTimeoutRef.current) clearTimeout(ngosTimeoutRef.current);
              setNgosDropdownOpen(true);
            }}
            onMouseLeave={() => {
              ngosTimeoutRef.current = setTimeout(() => setNgosDropdownOpen(false), 150);
            }}
          >
            <button
              type="button"
              className="nav-link-btn"
              aria-expanded={ngosDropdownOpen}
              onClick={() => setNgosDropdownOpen((prev) => !prev)}
            >
              <span>For NGOs</span>
              <ChevronDown size={14} />
            </button>
            <div className={`dropdown-menu ${ngosDropdownOpen ? 'show' : ''}`}>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handlePageClick('for-ngos')}
              >
                <span className="dropdown-item-title">Food Shelters &amp; Homes</span>
                <span className="dropdown-item-desc">
                  Daily nutritious feeding for children &amp; elders
                </span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handlePageClick('for-ngos')}
              >
                <span className="dropdown-item-title">Community Kitchens</span>
                <span className="dropdown-item-desc">
                  Neighborhood food distribution &amp; relief
                </span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handlePageClick('for-farms')}
              >
                <span className="dropdown-item-title">Animal Welfare &amp; Farms</span>
                <span className="dropdown-item-desc">
                  Safe clean greens &amp; grain for gaushalas
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`nav-link-btn ${activePublicPage === 'about' ? 'active' : ''}`}
            onClick={() => handlePageClick('about')}
          >
            About
          </button>
        </nav>

        {/* Right Nav Controls */}
        <div className="nav-right-controls">
          {/* Light / Dark Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Sign In Outline Button */}
          <button
            type="button"
            className="btn-nav-signin"
            onClick={onOpenAuth}
            aria-label="Sign in to your account"
          >
            <LogIn size={15} />
            <span>Sign in</span>
          </button>

          {/* Share Food Main Accent Button */}
          <button
            type="button"
            className="btn-nav-accent"
            onClick={handleShareFoodClick}
            aria-label="Share surplus food"
          >
            <span>Share food</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ====================================================================
          Mobile Slide-in Drawer
          ==================================================================== */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <div
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="nav-brand-icon" style={{ width: '28px', height: '28px' }}>
              <UtensilsCrossed size={15} />
            </div>
            <strong style={{ fontSize: '1.1rem' }}>FoodBridge</strong>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: '4px',
            }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <button
            type="button"
            className="drawer-link"
            onClick={() => handleSectionScroll('how-it-works')}
          >
            How it works
          </button>

          <button
            type="button"
            className="drawer-link"
            onClick={() => handleSectionScroll('live-activity')}
          >
            Live activity
          </button>

          {/* For Donors Accordion */}
          <div>
            <button
              type="button"
              className="drawer-link"
              onClick={() => setMobileDonorsOpen((prev) => !prev)}
              aria-expanded={mobileDonorsOpen}
            >
              <span>For Donors</span>
              <ChevronDown
                size={16}
                style={{
                  transform: mobileDonorsOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
            {mobileDonorsOpen && (
              <div className="drawer-sub-menu">
                <button
                  type="button"
                  className="drawer-sub-link"
                  onClick={() => handlePageClick('for-donors')}
                >
                  Messes &amp; Hostels
                </button>
                <button
                  type="button"
                  className="drawer-sub-link"
                  onClick={() => handlePageClick('for-donors')}
                >
                  Restaurants &amp; Caterers
                </button>
                <button
                  type="button"
                  className="drawer-sub-link"
                  onClick={() => handlePageClick('for-donors')}
                >
                  Food Stores &amp; Bakeries
                </button>
              </div>
            )}
          </div>

          {/* For NGOs Accordion */}
          <div>
            <button
              type="button"
              className="drawer-link"
              onClick={() => setMobileNgosOpen((prev) => !prev)}
              aria-expanded={mobileNgosOpen}
            >
              <span>For NGOs</span>
              <ChevronDown
                size={16}
                style={{
                  transform: mobileNgosOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
            {mobileNgosOpen && (
              <div className="drawer-sub-menu">
                <button
                  type="button"
                  className="drawer-sub-link"
                  onClick={() => handlePageClick('for-ngos')}
                >
                  Food Shelters &amp; Homes
                </button>
                <button
                  type="button"
                  className="drawer-sub-link"
                  onClick={() => handlePageClick('for-ngos')}
                >
                  Community Kitchens
                </button>
                <button
                  type="button"
                  className="drawer-sub-link"
                  onClick={() => handlePageClick('for-farms')}
                >
                  Animal Welfare &amp; Farms
                </button>
              </div>
            )}
          </div>

          <button type="button" className="drawer-link" onClick={() => handlePageClick('about')}>
            About
          </button>
        </div>

        <div className="drawer-footer">
          <button
            type="button"
            className="btn-hero-accent"
            style={{ width: '100%', minHeight: '44px', fontSize: '0.9375rem' }}
            onClick={handleShareFoodClick}
          >
            <span>Share food</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', minHeight: '42px', fontSize: '0.9375rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              if (typeof onOpenAuth === 'function') onOpenAuth();
            }}
          >
            <LogIn size={15} />
            <span>Sign in</span>
          </button>
        </div>
      </div>
    </header>
  );
}
