import { useState, useEffect } from 'react';
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
import OrgOnboardingForm from '../features/organisations/OrgOnboardingForm.jsx';
import OrgOnboardingModal from '../features/organisations/OrgOnboardingModal.jsx';
import NotificationInboxModal from '../features/notifications/NotificationInboxModal.jsx';
import { subscribeToNotifications } from '../features/notifications/notificationService.js';
import { useAuth } from '../features/auth/useAuth.js';
import './AppShell.css';

const DEFAULT_TABS_FOR_ROLE = {
  donor: 'active-listings',
  recipient: 'available-feed',
  mess_operator: 'meal-entry',
  admin: 'verification-queue',
};

export default function AppShell() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState('donor');
  const [activeTab, setActiveTab] = useState(DEFAULT_TABS_FOR_ROLE.donor);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);

  // Subscribe to live in-app notifications while app is open
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setFromCache(false);
      return;
    }

    const unsubscribe = subscribeToNotifications(
      user.uid,
      ({ notifications: notifs, unreadCount: count, fromCache: cached }) => {
        setNotifications(notifs || []);
        setUnreadCount(count || 0);
        setFromCache(Boolean(cached));
      },
      (err) => {
        console.warn('In-app notification listener:', err.message);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid]);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setActiveTab(DEFAULT_TABS_FOR_ROLE[newRole] || 'overview');
  };

  const renderMainContent = () => {
    if (activeTab === 'privacy') return <InfoView type="privacy" />;
    if (activeTab === 'help') return <InfoView type="help" />;
    if (activeTab === 'terms') return <InfoView type="terms" />;
    if (activeTab === 'onboard-org') {
      return (
        <div className="feature-container">
          <OrgOnboardingForm
            onSuccess={() => setActiveTab(DEFAULT_TABS_FOR_ROLE[currentRole])}
            onCancel={() => setActiveTab(DEFAULT_TABS_FOR_ROLE[currentRole])}
          />
        </div>
      );
    }

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
        unreadNotifications={unreadCount}
        onOpenNotifications={() => setNotificationsOpen(true)}
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

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenOnboard={() => setOnboardModalOpen(true)}
      />

      <OrgOnboardingModal isOpen={onboardModalOpen} onClose={() => setOnboardModalOpen(false)} />

      <NotificationInboxModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        fromCache={fromCache}
      />
    </div>
  );
}
