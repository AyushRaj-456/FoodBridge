import {
  LayoutDashboard,
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
  Wheat,
  Recycle,
  Layers,
  Bike,
  Globe,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS_BY_ROLE = {
  donor: [
    { id: 'donor-dashboard', label: 'Donor Overview', icon: LayoutDashboard },
    { id: 'create-listing', label: 'Create Listing', icon: PlusCircle },
    { id: 'active-listings', label: 'Active Listings', icon: PackageCheck },
    { id: 'pickup-status', label: 'Pickup Coordination', icon: Truck },
    { id: 'donor-history', label: 'Donation History', icon: History },
  ],
  recipient: [
    { id: 'ngo-dashboard', label: 'NGO Overview', icon: LayoutDashboard },
    { id: 'available-feed', label: 'Surplus Feed', icon: Compass },
    { id: 'my-claims', label: 'Active Claims', icon: CheckCircle },
    { id: 'handover-confirm', label: 'Handover & Collect', icon: Truck },
    { id: 'recipient-history', label: 'Claim History', icon: BarChart3 },
  ],
  farm: [
    { id: 'feed-dashboard', label: 'Farm Overview', icon: LayoutDashboard },
    { id: 'feed-discovery', label: 'Feed Discovery', icon: Wheat },
    { id: 'farm-history', label: 'Collection History', icon: History },
  ],
  compost: [
    { id: 'facility-dashboard', label: 'Facility Overview', icon: LayoutDashboard },
    { id: 'waste-discovery', label: 'Organic Waste', icon: Recycle },
    { id: 'processing-history', label: 'Processing Logs', icon: History },
  ],
  mess_operator: [
    { id: 'meal-entry', label: 'Daily Meal Entry', icon: Calendar },
    { id: 'leftover-records', label: 'Leftover Records', icon: Utensils },
    { id: 'consumption-trends', label: 'Waste Trends', icon: TrendingUp },
    { id: 'advisory-forecast', label: 'Advisory Guidance', icon: Lightbulb },
  ],
  routing: [{ id: 'routing-matrix', label: 'Three-Tier Matrix', icon: Layers }],
  admin: [
    { id: 'verification-queue', label: 'Verification Queue', icon: ShieldAlert },
    { id: 'moderate-listings', label: 'Moderate Listings', icon: FileText },
    { id: 'incident-reports', label: 'Incident Reports', icon: AlertTriangle },
    { id: 'system-audit', label: 'System & Quota Audit', icon: Activity },
  ],
  helper: [
    { id: 'nearby-jobs', label: 'Delivery Jobs', icon: Bike },
    { id: 'otp-verify', label: 'OTP Verification', icon: CheckCircle },
    { id: 'helper-profile', label: 'Helper Ratings', icon: BarChart3 },
  ],
};

export default function Sidebar({ currentRole, activeTab, onSelectTab, onOpenPublicSite }) {
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
        <span className="sidebar-section-title">Compliance &amp; Verification</span>
        <ul className="sidebar-footer-list">
          {onOpenPublicSite && (
            <li>
              <button type="button" className="sidebar-footer-link" onClick={onOpenPublicSite}>
                <Globe size={16} aria-hidden="true" />
                <span>Visit Public Website</span>
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              className={`sidebar-footer-link ${activeTab === 'impact-dashboard' ? 'active' : ''}`}
              onClick={() => onSelectTab('impact-dashboard')}
            >
              <BarChart3 size={16} aria-hidden="true" />
              <span>Impact &amp; Verification</span>
            </button>
          </li>
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
              <span>Privacy &amp; Retention</span>
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
              <span>Terms &amp; Protection</span>
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
