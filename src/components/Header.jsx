import { UtensilsCrossed, Bell, User, LogIn } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher.jsx';
import { useAuth } from '../features/auth/useAuth.js';
import './Header.css';

export default function Header({
  currentRole,
  onRoleChange,
  unreadNotifications = 0,
  onOpenNotifications,
  onOpenAuth,
  onOpenProfile,
}) {
  const { user, profile } = useAuth();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-logo" aria-hidden="true">
            <UtensilsCrossed size={20} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">FoodBridge</span>
            <span className="brand-tag">Surplus Redistribution</span>
          </div>
        </div>

        <div className="header-actions">
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />

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
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenAuth}
              style={{ minHeight: '36px', padding: 'var(--space-1) var(--space-3)' }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
