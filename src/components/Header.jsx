import { UtensilsCrossed, Bell, User, LogIn, Sun, Moon, Globe, Menu, X } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import './Header.css';

export default function Header({
  currentRole,
  onRoleChange,
  unreadNotifications = 0,
  onOpenNotifications,
  onOpenAuth,
  onOpenProfile,
  onOpenPublicSite,
  onOpenRoleModal,
  isDrawerOpen = false,
  onToggleDrawer,
}) {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Left: Navigation Menu Hamburger Button & Brand */}
        <div className="header-left">
          <button
            type="button"
            className="header-menu-btn"
            onClick={onToggleDrawer}
            aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isDrawerOpen}
            title={isDrawerOpen ? 'Close menu' : 'Open menu'}
          >
            {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="header-brand">
            <div className="brand-logo" aria-hidden="true">
              <UtensilsCrossed size={17} />
            </div>
            <div className="brand-titles">
              <span className="brand-name">FoodBridge</span>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher, Public Site, Theme, Notifications & Account */}
        <div className="header-right">
          {/* Compact Role Switcher Dropdown */}
          <RoleSwitcher
            currentRole={currentRole}
            onRoleChange={onRoleChange}
            onOpenRoleModal={onOpenRoleModal}
          />

          {/* Public Site Link */}
          {onOpenPublicSite && (
            <button
              type="button"
              className="header-public-btn"
              onClick={onOpenPublicSite}
              title="Visit Public Website"
            >
              <Globe size={14} />
              <span className="header-public-text">Public Site</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            className="header-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* In-App Notifications */}
          {user && (
            <button
              type="button"
              className="header-icon-btn"
              onClick={onOpenNotifications}
              aria-label={`In-App Notifications (${unreadNotifications} unread)`}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadNotifications > 0 && <span className="notification-indicator" />}
            </button>
          )}

          {/* Account Profile Control or Sign In */}
          {user ? (
            <button
              type="button"
              className="header-profile-btn"
              onClick={onOpenProfile}
              title="View User Profile & Organization Status"
            >
              <div className="profile-avatar-circle">
                <User size={13} />
              </div>
              <span className="profile-user-name">
                {profile?.displayName || user.displayName || user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAuth}
              style={{ minHeight: '34px', padding: '0 10px' }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
