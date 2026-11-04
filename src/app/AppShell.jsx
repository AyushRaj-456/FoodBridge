import { useState } from 'react';
import Header from '../components/Header.jsx';
import StatusBanner from '../components/StatusBanner.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import ListingShell from '../features/listings/ListingShell.jsx';
import FeedShell from '../features/matching/FeedShell.jsx';
import MessShell from '../features/mess-analytics/MessShell.jsx';
import AdminShell from '../features/admin/AdminShell.jsx';
import InfoView from '../features/common/InfoView.jsx';
import AuthModal from '../features/auth/AuthModal.jsx';
import UserProfileModal from '../features/auth/UserProfileModal.jsx';
import AccountStateBanner from '../features/auth/AccountStateBanner.jsx';
import './AppShell.css';

const DEFAULT_TABS_FOR_ROLE = {
  donor: 'active-listings',
  recipient: 'available-feed',
  mess_operator: 'meal-entry',
  admin: 'verification-queue',
};

export default function AppShell() {
  const [currentRole, setCurrentRole] = useState('donor');
  const [activeTab, setActiveTab] = useState(DEFAULT_TABS_FOR_ROLE.donor);
  const [unreadNotifications] = useState(2);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setActiveTab(DEFAULT_TABS_FOR_ROLE[newRole] || 'overview');
  };

  const renderMainContent = () => {
    if (activeTab === 'privacy') return <InfoView type="privacy" />;
    if (activeTab === 'help') return <InfoView type="help" />;

    switch (currentRole) {
      case 'donor':
        return <ListingShell activeTab={activeTab} />;
      case 'recipient':
        return <FeedShell activeTab={activeTab} />;
      case 'mess_operator':
        return <MessShell activeTab={activeTab} />;
      case 'admin':
        return <AdminShell activeTab={activeTab} />;
      default:
        return <ListingShell activeTab={activeTab} />;
    }
  };

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        unreadNotifications={unreadNotifications}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <StatusBanner role={currentRole} />
      <AccountStateBanner />

      <div className="app-body">
        <Sidebar currentRole={currentRole} activeTab={activeTab} onSelectTab={setActiveTab} />

        <main id="main-content" className="app-main" tabIndex="-1">
          {renderMainContent()}
        </main>
      </div>

      <BottomNav currentRole={currentRole} activeTab={activeTab} onSelectTab={setActiveTab} />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}
