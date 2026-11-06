import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  UtensilsCrossed,
  HeartHandshake,
  Calendar,
  ShieldCheck,
  Wheat,
  Recycle,
  Layers,
  Bike,
} from 'lucide-react';
import './RoleSwitcher.css';

const ROLE_DEFINITIONS = [
  { id: 'donor', label: 'Donor', description: 'Hostels, messes & kitchens', icon: UtensilsCrossed },
  { id: 'recipient', label: 'Recipient NGO', description: 'Verified food distribution shelters', icon: HeartHandshake },
  { id: 'mess_operator', label: 'Mess Operator', description: 'Daily meal & waste tracking', icon: Calendar },
  { id: 'admin', label: 'Admin', description: 'Verification & platform moderation', icon: ShieldCheck },
  { id: 'farm', label: 'Cattle Farm', description: 'Feed-suitable surplus collection', icon: Wheat },
  { id: 'compost', label: 'Compost & Biogas', description: 'Organic waste recovery', icon: Recycle },
  { id: 'routing', label: 'Three-Tier Routing', description: 'Hierarchical allocation monitor', icon: Layers },
  { id: 'helper', label: 'Delivery Helper', description: 'Volunteer pickup and OTP verification', icon: Bike },
];

export default function RoleSwitcher({ currentRole, onRoleChange, onOpenRoleModal }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const activeRoleObj = ROLE_DEFINITIONS.find((r) => r.id === currentRole) || ROLE_DEFINITIONS[0];
  const ActiveIcon = activeRoleObj.icon;

  const handleSelectRole = (roleId) => {
    onRoleChange(roleId);
    setDropdownOpen(false);
  };

  return (
    <div className="role-switcher-container" ref={containerRef} role="group" aria-label="Role Switcher">
      <button
        type="button"
        className="role-dropdown-trigger"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="menu"
        title="Switch active role"
      >
        <span className="role-trigger-icon" aria-hidden="true">
          <ActiveIcon size={14} />
        </span>
        <span className="role-trigger-text">
          <span className="role-trigger-prefix">Role:</span>
          <span className="role-trigger-name">{activeRoleObj.label}</span>
        </span>
        <ChevronDown size={14} className={`role-trigger-chevron ${dropdownOpen ? 'open' : ''}`} />
      </button>

      {/* Dropdown Menu (rendered in DOM for accessibility and instant keyboard/test interactions) */}
      <div
        className={`role-dropdown-panel ${dropdownOpen ? 'visible' : ''}`}
        role="menu"
        aria-label="Available Roles"
      >
        <div className="role-dropdown-header">
          <span>Switch Application Role</span>
        </div>

        <div className="role-dropdown-list">
          {ROLE_DEFINITIONS.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                role="button"
                aria-label={r.label}
                className={`role-option-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectRole(r.id)}
                aria-pressed={isActive}
              >
                <div className="role-option-icon">
                  <Icon size={15} />
                </div>
                <div className="role-option-details">
                  <span className="role-option-label">{r.label}</span>
                  <span className="role-option-desc">{r.description}</span>
                </div>
                {isActive && <Check size={14} className="role-option-check" />}
              </button>
            );
          })}
        </div>

        {onOpenRoleModal && (
          <div className="role-dropdown-footer">
            <button
              type="button"
              className="role-guide-btn"
              onClick={() => {
                setDropdownOpen(false);
                onOpenRoleModal();
              }}
            >
              Role Selection Guide &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
