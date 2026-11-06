import { ShieldCheck, Info } from 'lucide-react';
import './StatusBanner.css';

export default function StatusBanner({ role }) {
  return (
    <aside className="status-banner" aria-label="System Operational Status">
      <div className="status-banner-inner">
        <div className="status-banner-badge">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Firebase Spark (₹0 Plan)</span>
        </div>
        <div className="status-banner-content">
          <Info size={14} aria-hidden="true" />
          <span>
            Strict zero-cost contract active. No billing account linked. In-app sync only. Quotas:
            50,000 reads/day.
          </span>
        </div>
        <div className="status-banner-role">
          Viewing as: <strong>{formatRoleName(role)}</strong>
        </div>
      </div>
    </aside>
  );
}

function formatRoleName(role) {
  switch (role) {
    case 'donor':
      return 'Donor Member';
    case 'recipient':
      return 'Verified Recipient (NGO)';
    case 'mess_operator':
      return 'Mess Operator';
    case 'admin':
      return 'Administrator';
    case 'farm':
      return 'Cattle & Dairy Farm';
    case 'compost':
      return 'Composting & Biogas Facility';
    case 'routing':
      return 'Three-Tier Routing Monitor';
    case 'helper':
      return 'Delivery Helper (Future Scope)';
    case 'public':
      return 'Public Community Member';
    default:
      return role;
  }
}
