import {
  PlusCircle,
  PackageCheck,
  Truck,
  Compass,
  CheckCircle,
  Calendar,
  Utensils,
  ShieldAlert,
  FileText,
  Wheat,
  Recycle,
  Layers,
  Bike,
  LayoutDashboard,
} from 'lucide-react';
import './BottomNav.css';

const PRIMARY_MOBILE_ITEMS = {
  donor: [
    { id: 'donor-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'create-listing', label: 'Create', icon: PlusCircle },
    { id: 'active-listings', label: 'Listings', icon: PackageCheck },
    { id: 'pickup-status', label: 'Pickup', icon: Truck },
  ],
  recipient: [
    { id: 'ngo-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'available-feed', label: 'Feed', icon: Compass },
    { id: 'my-claims', label: 'Claims', icon: CheckCircle },
    { id: 'handover-confirm', label: 'Handover', icon: Truck },
  ],
  farm: [
    { id: 'feed-dashboard', label: 'Farm', icon: LayoutDashboard },
    { id: 'feed-discovery', label: 'Feed', icon: Wheat },
    { id: 'farm-history', label: 'History', icon: Truck },
  ],
  compost: [
    { id: 'facility-dashboard', label: 'Facility', icon: LayoutDashboard },
    { id: 'waste-discovery', label: 'Waste', icon: Recycle },
    { id: 'processing-history', label: 'Logs', icon: Truck },
  ],
  mess_operator: [
    { id: 'meal-entry', label: 'Meals', icon: Calendar },
    { id: 'leftover-records', label: 'Leftover', icon: Utensils },
  ],
  routing: [{ id: 'routing-matrix', label: 'Routing', icon: Layers }],
  admin: [
    { id: 'verification-queue', label: 'Verify', icon: ShieldAlert },
    { id: 'moderate-listings', label: 'Moderate', icon: FileText },
  ],
  helper: [
    { id: 'nearby-jobs', label: 'Jobs', icon: Bike },
    { id: 'otp-verify', label: 'OTP', icon: CheckCircle },
  ],
};

export default function BottomNav({ currentRole, activeTab, onSelectTab }) {
  const items = PRIMARY_MOBILE_ITEMS[currentRole] || PRIMARY_MOBILE_ITEMS.donor;

  return (
    <nav className="bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav-btn ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
