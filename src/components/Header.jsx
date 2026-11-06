import { UtensilsCrossed, Bell, User, LogIn, Sun, Moon, Globe } from 'lucide-react';
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
}) {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="brand-logo" aria-hidden="true">
            <UtensilsCrossed size={20} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">FoodBridge</span>
            <span className="brand-tag">Surplus Redistribution</span>
          </div>
        </div>

        {/* Global Nav Actions */}
        <div className="header-actions">
          {/* Public Website Mode Toggle */}
          {onOpenPublicSite && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenPublicSite}
              title="Switch to Public Website"
              style={{
                display: 'inline-flex',
                gap: 'var(--space-1)',
                padding: 'var(--space-1) var(--space-2)',
              }}
            >
              <Globe size={14} />
              <span>Public Site</span>
            </button>
          )}

          {/* Role Switcher */}
          <RoleSwitcher
            currentRole={currentRole}
            onRoleChange={onRoleChange}
            onOpenRoleModal={onOpenRoleModal}
          />

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* In-App Notifications */}
          {user && (
            <button
              type="button"
              className="icon-btn"
              onClick={onOpenNotifications}
              aria-label={`In-App Notifications (${unreadNotifications} unread)`}
              title="In-App Notifications Only (Spark Plan)"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && <span className="notification-indicator" />}
            </button>
          )}

          {/* User Profile or Sign In */}
          {user ? (
            <button
              type="button"
              className="user-profile-badge btn-clickable"
              onClick={onOpenProfile}
              title="View User Profile & Status"
            >
              <User size={16} />
              <span className="user-name">
                {profile?.displayName || user.displayName || user.email}
              </span>
            </button>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenAuth}>
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
