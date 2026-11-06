import { ShieldCheck, Info } from 'lucide-react';
import './StatusBanner.css';

export default function StatusBanner({ role }) {
  return (
    <aside className="status-banner" aria-label="System Operational Status">
      <div className="status-banner-inner">
        <div className="status-banner-badge">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>Verified Safe Handover</span>
        </div>
        <div className="status-banner-content">
          <Info size={14} aria-hidden="true" />
          <span>
            Direct community redistribution &bull; Food safety verified &bull; Fresh meal tracking
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
      return 'Delivery Helper';
    case 'public':
      return 'Public Community Member';
    default:
      return role;
  }
}
