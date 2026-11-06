import { useState } from 'react';
import {
  UtensilsCrossed,
  Sun,
  Moon,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function PublicNavbar({
  activePublicPage,
  onNavigatePublic,
  onOpenAuth,
  onEnterApp,
}) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'impact', label: 'Impact' },
    { id: 'for-donors', label: 'Donors' },
    { id: 'for-ngos', label: 'NGOs' },
    { id: 'for-farms', label: 'Farms' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (id) => {
    onNavigatePublic(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
          padding: '0 var(--gutter-desktop)',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        {/* Brand */}
        <button
          type="button"
          onClick={() => handleLinkClick('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
          }}
          aria-label="FoodBridge Home"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: '1.25rem',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-brand-900)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              FoodBridge
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-muted)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                fontWeight: 'var(--font-weight-medium)',
                whiteSpace: 'nowrap',
              }}
            >
              Rescue Food &bull; Restore Balance
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = activePublicPage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-label)',
                  fontWeight: isActive
                    ? 'var(--font-weight-semibold)'
                    : 'var(--font-weight-medium)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Theme Switcher */}
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sign In */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenAuth}
            style={{ display: 'inline-flex' }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>

          {/* Enter Authenticated App */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onEnterApp}
            style={{ display: 'inline-flex' }}
          >
            <LayoutDashboard size={15} />
            <span>Open App</span>
            <ArrowRight size={14} />
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            style={{ display: 'inline-flex' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-4) var(--gutter-mobile)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              style={{
                background: activePublicPage === link.id ? 'var(--color-surface-hover)' : 'none',
                border: 'none',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                fontSize: 'var(--font-size-body)',
                fontWeight:
                  activePublicPage === link.id
                    ? 'var(--font-weight-semibold)'
                    : 'var(--font-weight-regular)',
                color: activePublicPage === link.id ? 'var(--color-primary)' : 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={onEnterApp}
            >
              <LayoutDashboard size={16} />
              <span>Launch Operations App</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
