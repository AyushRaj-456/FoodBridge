import {
  PlusCircle,
  PackageCheck,
  Truck,
  History,
  Compass,
  CheckCircle,
  BarChart3,
  Calendar,
  Utensils,
  TrendingUp,
  Lightbulb,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Activity,
  HelpCircle,
  FileLock2,
  Building,
  ShieldCheck,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS_BY_ROLE = {
  donor: [
    { id: 'create-listing', label: 'Create Listing', icon: PlusCircle },
    { id: 'active-listings', label: 'Active Listings', icon: PackageCheck },
    { id: 'pickup-status', label: 'Pickup Coordination', icon: Truck },
    { id: 'donor-history', label: 'Donation History', icon: History },
  ],
  recipient: [
    { id: 'available-feed', label: 'Surplus Feed', icon: Compass },
    { id: 'my-claims', label: 'Active Claims', icon: CheckCircle },
    { id: 'handover-confirm', label: 'Handover & Collect', icon: Truck },
    { id: 'recipient-history', label: 'Claim History', icon: BarChart3 },
  ],
  mess_operator: [
    { id: 'meal-entry', label: 'Daily Meal Entry', icon: Calendar },
    { id: 'leftover-records', label: 'Leftover Records', icon: Utensils },
    { id: 'consumption-trends', label: 'Waste Trends', icon: TrendingUp },
    { id: 'advisory-forecast', label: 'Advisory Guidance', icon: Lightbulb },
  ],
  admin: [
    { id: 'verification-queue', label: 'Verification Queue', icon: ShieldAlert },
    { id: 'moderate-listings', label: 'Moderate Listings', icon: FileText },
    { id: 'incident-reports', label: 'Incident Reports', icon: AlertTriangle },
    { id: 'system-audit', label: 'System & Quota Audit', icon: Activity },
  ],
};

export default function Sidebar({ currentRole, activeTab, onSelectTab }) {
  const items = NAV_ITEMS_BY_ROLE[currentRole] || NAV_ITEMS_BY_ROLE.donor;

  return (
    <nav className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-section">
        <span className="sidebar-section-title">Operations</span>
        <ul className="sidebar-nav-list">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelectTab(item.id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-section-title">Compliance</span>
        <ul className="sidebar-footer-list">
          <li>
            <button
              type="button"
              className={`sidebar-footer-link ${activeTab === 'onboard-org' ? 'active' : ''}`}
              onClick={() => onSelectTab('onboard-org')}
            >
              <Building size={16} aria-hidden="true" />
              <span>Register Organisation</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`sidebar-footer-link ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => onSelectTab('privacy')}
            >
              <FileLock2 size={16} aria-hidden="true" />
              <span>Privacy & Retention</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`sidebar-footer-link ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => onSelectTab('help')}
            >
              <HelpCircle size={16} aria-hidden="true" />
              <span>Offline SOP Guide</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`sidebar-footer-link ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => onSelectTab('terms')}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Terms & Protection</span>
            </button>
          </li>
        </ul>
        <div className="sidebar-cost-badge">
          <span>Target: Spark ₹0 Plan</span>
        </div>
      </div>
    </nav>
  );
}
