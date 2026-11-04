import { UtensilsCrossed, Bell, User } from 'lucide-react';
import RoleSwitcher from './RoleSwitcher.jsx';
import './Header.css';

export default function Header({ currentRole, onRoleChange, unreadNotifications = 0 }) {
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

          <button
            type="button"
            className="icon-btn"
            aria-label={`In-App Notifications (${unreadNotifications} unread)`}
            title="In-App Notifications Only (Spark Plan)"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && <span className="notification-indicator" />}
          </button>

          <div className="user-profile-badge" title="Authenticated User Profile">
            <User size={16} />
            <span className="user-name">Test User</span>
          </div>
        </div>
      </div>
    </header>
  );
}
