import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import './RoleSwitcher.css';

const PRIMARY_ROLES = [
  { id: 'donor', label: 'Donor' },
  { id: 'recipient', label: 'Recipient NGO' },
  { id: 'mess_operator', label: 'Mess Operator' },
  { id: 'admin', label: 'Admin' },
];

const EXTENDED_ROLES = [
  { id: 'farm', label: 'Cattle Farm' },
  { id: 'compost', label: 'Compost & Biogas' },
  { id: 'routing', label: 'Three-Tier Routing' },
  { id: 'helper', label: 'Delivery Helper' },
];

export default function RoleSwitcher({ currentRole, onRoleChange, onOpenRoleModal }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelectExtended = (roleId) => {
    onRoleChange(roleId);
    setDropdownOpen(false);
  };

  return (
    <div className="role-switcher" role="group" aria-label="Role Switcher">
      <span className="role-switcher-label">Role:</span>
      <div className="role-switcher-buttons">
        {PRIMARY_ROLES.map((r) => {
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`role-btn ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              onClick={() => onRoleChange(r.id)}
            >
              {r.label}
            </button>
          );
        })}

        {/* Extended Roles Dropdown Trigger */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            className={`role-btn ${
              ['farm', 'compost', 'routing', 'helper'].includes(currentRole) ? 'active' : ''
            }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="More Roles (Cattle Farm, Composting, Routing, Delivery)"
            aria-label="Extended Platform Roles"
          >
            <MoreHorizontal size={14} />
            <span>More Roles</span>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-dropdown)',
                padding: 'var(--space-1)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '200px',
                zIndex: 100,
              }}
            >
              {EXTENDED_ROLES.map((ext) => (
                <button
                  key={ext.id}
                  type="button"
                  onClick={() => handleSelectExtended(ext.id)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    background: currentRole === ext.id ? 'var(--color-brand-100)' : 'none',
                    color: currentRole === ext.id ? 'var(--color-primary)' : 'var(--color-text)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-label)',
                    fontWeight: currentRole === ext.id ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {ext.label}
                </button>
              ))}

              {onOpenRoleModal && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenRoleModal();
                  }}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    borderTop: '1px solid var(--color-border)',
                    background: 'none',
                    color: 'var(--color-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '2px',
                  }}
                >
                  Role Selection Guide &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
