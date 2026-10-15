import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { PortalPage } from './pages/PortalPage';
import { AgentConfigPage } from './pages/AgentConfigPage';
import { AuthPage } from './pages/AuthPage';
import { TelephonyPage } from './pages/TelephonyPage';
import { WhatsAppHubPage } from './pages/WhatsAppHubPage';
import { LegalPage } from './pages/LegalPage';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(path && path !== '' ? path : '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    if (route !== currentRoute) {
      window.history.pushState({}, '', route);
      setCurrentRoute(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage navigate={navigate} />;
      case '/pricing':
        return <PricingPage navigate={navigate} />;
      case '/portal':
      case '/dashboard':
        return <PortalPage navigate={navigate} />;
      case '/agent':
      case '/settings':
        return <AgentConfigPage navigate={navigate} />;
      case '/auth':
      case '/login':
      case '/register':
        return <AuthPage navigate={navigate} />;
      case '/telephony':
      case '/forwarding':
        return <TelephonyPage navigate={navigate} />;
      case '/whatsapp':
      case '/dispatch':
        return <WhatsAppHubPage navigate={navigate} />;
      case '/legal':
      case '/compliance':
      case '/privacy':
        return <LegalPage navigate={navigate} />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar currentRoute={currentRoute} navigate={navigate} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
};

export default App;
