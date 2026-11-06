import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import ListingShell from '../features/listings/ListingShell.jsx';
import FeedShell from '../features/matching/FeedShell.jsx';
import FarmShell from '../features/farm/FarmShell.jsx';
import CompostShell from '../features/compost/CompostShell.jsx';
import ThreeTierRoutingView from '../features/routing/ThreeTierRoutingView.jsx';
import MessShell from '../features/mess-analytics/MessShell.jsx';
import AdminShell from '../features/admin/AdminShell.jsx';
import DeliveryHelperView from '../features/delivery/DeliveryHelperView.jsx';
import PublicShell from '../components/public/PublicShell.jsx';
import InfoView from '../features/common/InfoView.jsx';
import AuthModal from '../features/auth/AuthModal.jsx';
import UserProfileModal from '../features/auth/UserProfileModal.jsx';
import AccountStateBanner from '../features/auth/AccountStateBanner.jsx';
import OrgOnboardingForm from '../features/organisations/OrgOnboardingForm.jsx';
import OrgOnboardingModal from '../features/organisations/OrgOnboardingModal.jsx';
import NotificationInboxModal from '../features/notifications/NotificationInboxModal.jsx';
import ImpactDashboard from '../features/impact/ImpactDashboard.jsx';
import RoleSelectionModal from '../features/auth/RoleSelectionModal.jsx';
import DemandRequestsModal from '../features/ngo/DemandRequestsModal.jsx';
import DistributionProofModal from '../features/ngo/DistributionProofModal.jsx';
import { subscribeToNotifications } from '../features/notifications/notificationService.js';
import { useAuth } from '../features/auth/useAuth.js';
import './AppShell.css';

const DEFAULT_TABS_FOR_ROLE = {
  donor: 'active-listings',
  recipient: 'available-feed',
  farm: 'feed-discovery',
  compost: 'waste-discovery',
  mess_operator: 'meal-entry',
  routing: 'routing-matrix',
  admin: 'verification-queue',
  helper: 'nearby-jobs',
};

export default function AppShell({ initialPublicSite = true }) {
  const { user } = useAuth();
  const [isPublicSite, setIsPublicSite] = useState(() => (user ? false : initialPublicSite));
  const [currentRole, setCurrentRole] = useState('donor');
  const [activeTab, setActiveTab] = useState(DEFAULT_TABS_FOR_ROLE.donor);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [demandModalOpen, setDemandModalOpen] = useState(false);
  const [distProofModalOpen, setDistProofModalOpen] = useState(false);

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
    setIsPublicSite(false);
  };

  const renderMainContent = () => {
    if (activeTab === 'privacy') return <InfoView type="privacy" />;
    if (activeTab === 'help') return <InfoView type="help" />;
    if (activeTab === 'terms') return <InfoView type="terms" />;
    if (activeTab === 'impact' || activeTab === 'impact-dashboard') return <ImpactDashboard />;
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
        return <ListingShell activeTab={activeTab} onSelectTab={setActiveTab} />;
      case 'recipient':
        return (
          <FeedShell
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenDemandRequest={() => setDemandModalOpen(true)}
            onOpenDistributionProof={() => setDistProofModalOpen(true)}
          />
        );
      case 'farm':
        return <FarmShell initialTab={activeTab} />;
      case 'compost':
        return <CompostShell initialTab={activeTab} />;
      case 'routing':
        return <ThreeTierRoutingView />;
      case 'mess_operator':
        return <MessShell activeTab={activeTab} />;
      case 'admin':
        return <AdminShell activeTab={activeTab} />;
      case 'helper':
        return <DeliveryHelperView />;
      default:
        return <ListingShell activeTab={activeTab} onSelectTab={setActiveTab} />;
    }
  };

  // If in public site mode, render the public website environment
  if (isPublicSite) {
    return (
      <>
        <PublicShell
          onEnterApp={(targetRole) => {
            setIsPublicSite(false);
            if (targetRole && typeof targetRole === 'string') {
              handleRoleChange(targetRole);
            }
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

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
        onOpenPublicSite={() => setIsPublicSite(true)}
        onOpenRoleModal={() => setRoleModalOpen(true)}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
      />

      <AccountStateBanner />

      <div className="app-body">
        <Sidebar
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentRole={currentRole}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenPublicSite={() => setIsPublicSite(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        <main id="main-content" className="app-main" tabIndex="-1">
          {renderMainContent()}
        </main>
      </div>

      <BottomNav currentRole={currentRole} activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Global Modals */}
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

      <RoleSelectionModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onSelectRole={handleRoleChange}
      />

      <DemandRequestsModal isOpen={demandModalOpen} onClose={() => setDemandModalOpen(false)} />

      <DistributionProofModal
        isOpen={distProofModalOpen}
        onClose={() => setDistProofModalOpen(false)}
      />
    </div>
  );
}
