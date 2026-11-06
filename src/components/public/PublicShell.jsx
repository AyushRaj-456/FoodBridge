import { useState } from 'react';
import PublicNavbar from './PublicNavbar.jsx';
import PublicFooter from './PublicFooter.jsx';
import LandingPage from './LandingPage.jsx';
import AboutPage from './AboutPage.jsx';
import HowItWorksPage from './HowItWorksPage.jsx';
import PublicImpactPage from './PublicImpactPage.jsx';
import ForDonorsPage from './ForDonorsPage.jsx';
import ForNgosPage from './ForNgosPage.jsx';
import ForFarmsPage from './ForFarmsPage.jsx';
import ContactPage from './ContactPage.jsx';
import InfoView from '../../features/common/InfoView.jsx';

export default function PublicShell({ onEnterApp, onOpenAuth }) {
  const [activePage, setActivePage] = useState('landing');

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage
            onNavigatePublic={handleNavigate}
            onOpenAuth={onOpenAuth}
            onEnterApp={onEnterApp}
          />
        );
      case 'about':
        return <AboutPage onEnterApp={onEnterApp} onNavigatePublic={handleNavigate} />;
      case 'how-it-works':
        return <HowItWorksPage onEnterApp={onEnterApp} onNavigatePublic={handleNavigate} />;
      case 'impact':
        return <PublicImpactPage onEnterApp={onEnterApp} />;
      case 'for-donors':
        return <ForDonorsPage onEnterApp={onEnterApp} onOpenAuth={onOpenAuth} />;
      case 'for-ngos':
        return <ForNgosPage onEnterApp={onEnterApp} onNavigatePublic={handleNavigate} />;
      case 'for-farms':
        return <ForFarmsPage onEnterApp={onEnterApp} />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return (
          <div
            style={{
              maxWidth: 'var(--content-max-width)',
              margin: '0 auto',
              padding: 'var(--space-8) var(--gutter-desktop)',
            }}
          >
            <InfoView type="privacy" />
          </div>
        );
      case 'terms':
        return (
          <div
            style={{
              maxWidth: 'var(--content-max-width)',
              margin: '0 auto',
              padding: 'var(--space-8) var(--gutter-desktop)',
            }}
          >
            <InfoView type="terms" />
          </div>
        );
      default:
        return (
          <LandingPage
            onNavigatePublic={handleNavigate}
            onOpenAuth={onOpenAuth}
            onEnterApp={onEnterApp}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar
        activePublicPage={activePage}
        onNavigatePublic={handleNavigate}
        onOpenAuth={onOpenAuth}
        onEnterApp={onEnterApp}
      />
      <main style={{ flex: 1 }}>{renderContent()}</main>
      <PublicFooter
        onNavigatePublic={handleNavigate}
        onOpenAuth={onOpenAuth}
        onEnterApp={onEnterApp}
      />
    </div>
  );
}
