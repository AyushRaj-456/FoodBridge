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
} from 'lucide-react';
import './BottomNav.css';

const PRIMARY_MOBILE_ITEMS = {
  donor: [
    { id: 'create-listing', label: 'Create', icon: PlusCircle },
    { id: 'active-listings', label: 'Listings', icon: PackageCheck },
    { id: 'pickup-status', label: 'Pickup', icon: Truck },
  ],
  recipient: [
    { id: 'available-feed', label: 'Feed', icon: Compass },
    { id: 'my-claims', label: 'Claims', icon: CheckCircle },
    { id: 'handover-confirm', label: 'Handover', icon: Truck },
  ],
  mess_operator: [
    { id: 'meal-entry', label: 'Meals', icon: Calendar },
    { id: 'leftover-records', label: 'Leftover', icon: Utensils },
  ],
  admin: [
    { id: 'verification-queue', label: 'Verify', icon: ShieldAlert },
    { id: 'moderate-listings', label: 'Moderate', icon: FileText },
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
