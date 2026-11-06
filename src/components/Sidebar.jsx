import { useState, useEffect, useRef } from 'react';
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
  X,
  ChevronDown,
  Globe,
  User,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS_BY_ROLE = {
  donor: [
    { id: 'donor-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'create-listing', label: 'Create Listing', icon: PlusCircle },
    { id: 'active-listings', label: 'Active Listings', icon: PackageCheck },
    { id: 'pickup-status', label: 'Pickup Coordination', icon: Truck },
    { id: 'donor-history', label: 'Donation History', icon: History },
  ],
  recipient: [
    { id: 'ngo-dashboard', label: 'Overview', icon: LayoutDashboard },
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
    default:
      return role || 'Member';
  }
}

export default function Sidebar({
  isOpen = false,
  onClose,
  currentRole = 'donor',
  activeTab,
  onSelectTab,
  onOpenPublicSite,
  onOpenProfile,
}) {
  const mainItems = NAV_ITEMS_BY_ROLE[currentRole] || NAV_ITEMS_BY_ROLE.donor;

  // Submenus open state
  const [openSubmenus, setOpenSubmenus] = useState({
    insights: true,
    organization: false,
    guidelines: true,
  });

  const leaveTimeoutRefs = useRef({});

  // Escape key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && typeof onClose === 'function') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll on small screens when drawer is open
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleSubmenu = (groupId) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleMouseEnterGroup = (groupId) => {
    if (leaveTimeoutRefs.current[groupId]) {
      clearTimeout(leaveTimeoutRefs.current[groupId]);
      delete leaveTimeoutRefs.current[groupId];
    }
    setOpenSubmenus((prev) => ({
      ...prev,
      [groupId]: true,
    }));
  };

  const handleMouseLeaveGroup = (groupId) => {
    leaveTimeoutRefs.current[groupId] = setTimeout(() => {
      // Keep guidelines open if active tab is inside it
      const isTabInGroup =
        (groupId === 'guidelines' && ['help', 'privacy', 'terms'].includes(activeTab)) ||
        (groupId === 'insights' && ['impact-dashboard', 'impact'].includes(activeTab)) ||
        (groupId === 'organization' && ['onboard-org'].includes(activeTab));

      if (!isTabInGroup) {
        setOpenSubmenus((prev) => ({
          ...prev,
          [groupId]: false,
        }));
      }
    }, 300);
  };

  const handleItemClick = (tabId) => {
    onSelectTab(tabId);
    if (typeof onClose === 'function' && window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for drawer */}
      <div
        className={`nav-drawer-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <nav
        className={`app-sidebar-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <span className="drawer-title">Navigation</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation panel"
            title="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quiet Safety & Status Info (Redistributed from old secondary bar) */}
        <div className="drawer-status-card" aria-label="System Operational Status">
          <div className="drawer-status-badge">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Verified Safe Handover</span>
          </div>
          <p className="drawer-status-desc">
            Direct community redistribution &bull; Food safety verified &bull; Fresh meal tracking
          </p>
          <div className="drawer-status-role">
            Viewing as: <strong>{formatRoleName(currentRole)}</strong>
          </div>
        </div>

        {/* Drawer Navigation Body */}
        <div className="drawer-nav-scroll">
          {/* Group 1: MAIN (Role Operations) */}
          <div className="drawer-nav-group">
            <span className="drawer-group-title">Main Operations</span>
            <ul className="drawer-nav-list">
              {mainItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`drawer-nav-btn ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <Icon size={17} aria-hidden="true" className="nav-btn-icon" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Group 2: INSIGHTS (Expandable Submenu) */}
          <div
            className="drawer-nav-group"
            onMouseEnter={() => handleMouseEnterGroup('insights')}
            onMouseLeave={() => handleMouseLeaveGroup('insights')}
          >
            <button
              type="button"
              className="drawer-group-trigger"
              onClick={() => toggleSubmenu('insights')}
              aria-expanded={openSubmenus.insights}
            >
              <span className="drawer-group-title">Insights</span>
              <ChevronDown
                size={14}
                className={`drawer-group-chevron ${openSubmenus.insights ? 'open' : ''}`}
              />
            </button>
            {openSubmenus.insights && (
              <ul className="drawer-nav-list submenu">
                <li>
                  <button
                    type="button"
                    className={`drawer-nav-btn ${
                      activeTab === 'impact-dashboard' || activeTab === 'impact' ? 'active' : ''
                    }`}
                    onClick={() => handleItemClick('impact-dashboard')}
                  >
                    <BarChart3 size={16} aria-hidden="true" className="nav-btn-icon" />
                    <span>Community Impact</span>
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Group 3: ORGANIZATION (Expandable Submenu) */}
          <div
            className="drawer-nav-group"
            onMouseEnter={() => handleMouseEnterGroup('organization')}
            onMouseLeave={() => handleMouseLeaveGroup('organization')}
          >
            <button
              type="button"
              className="drawer-group-trigger"
              onClick={() => toggleSubmenu('organization')}
              aria-expanded={openSubmenus.organization}
            >
              <span className="drawer-group-title">Organization</span>
              <ChevronDown
                size={14}
                className={`drawer-group-chevron ${openSubmenus.organization ? 'open' : ''}`}
              />
            </button>
            {openSubmenus.organization && (
              <ul className="drawer-nav-list submenu">
                <li>
                  <button
                    type="button"
                    className={`drawer-nav-btn ${activeTab === 'onboard-org' ? 'active' : ''}`}
                    onClick={() => handleItemClick('onboard-org')}
                  >
                    <Building size={16} aria-hidden="true" className="nav-btn-icon" />
                    <span>Register Organization</span>
                  </button>
                </li>
                {onOpenProfile && (
                  <li>
                    <button
                      type="button"
                      className="drawer-nav-btn"
                      onClick={() => {
                        if (typeof onClose === 'function') onClose();
                        onOpenProfile();
                      }}
                    >
                      <User size={16} aria-hidden="true" className="nav-btn-icon" />
                      <span>Organization Profile</span>
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Group 4: GUIDELINES & SUPPORT (Expandable Submenu) */}
          <div
            className="drawer-nav-group"
            onMouseEnter={() => handleMouseEnterGroup('guidelines')}
            onMouseLeave={() => handleMouseLeaveGroup('guidelines')}
          >
            <button
              type="button"
              className="drawer-group-trigger"
              onClick={() => toggleSubmenu('guidelines')}
              aria-expanded={openSubmenus.guidelines}
            >
              <span className="drawer-group-title">Guidelines &amp; Support</span>
              <ChevronDown
                size={14}
                className={`drawer-group-chevron ${openSubmenus.guidelines ? 'open' : ''}`}
              />
            </button>
            {openSubmenus.guidelines && (
              <ul className="drawer-nav-list submenu">
                <li>
                  <button
                    type="button"
                    className={`drawer-nav-btn ${activeTab === 'help' ? 'active' : ''}`}
                    onClick={() => handleItemClick('help')}
                  >
                    <HelpCircle size={16} aria-hidden="true" className="nav-btn-icon" />
                    <span>Food Safety SOP</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`drawer-nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                    onClick={() => handleItemClick('privacy')}
                  >
                    <FileLock2 size={16} aria-hidden="true" className="nav-btn-icon" />
                    <span>Privacy &amp; Retention</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`drawer-nav-btn ${activeTab === 'terms' ? 'active' : ''}`}
                    onClick={() => handleItemClick('terms')}
                  >
                    <ShieldCheck size={16} aria-hidden="true" className="nav-btn-icon" />
                    <span>Terms of Service</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          {onOpenPublicSite && (
            <button
              type="button"
              className="drawer-public-site-btn"
              onClick={() => {
                if (typeof onClose === 'function') onClose();
                onOpenPublicSite();
              }}
            >
              <Globe size={15} />
              <span>Visit Public Website</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
