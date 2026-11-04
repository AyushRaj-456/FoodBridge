import './RoleSwitcher.css';

const ROLES = [
  { id: 'donor', label: 'Donor' },
  { id: 'recipient', label: 'Recipient NGO' },
  { id: 'mess_operator', label: 'Mess Operator' },
  { id: 'admin', label: 'Admin' },
];

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  return (
    <div className="role-switcher" role="group" aria-label="Role Switcher">
      <span className="role-switcher-label">Role:</span>
      <div className="role-switcher-buttons">
        {ROLES.map((r) => {
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
      </div>
    </div>
  );
}
