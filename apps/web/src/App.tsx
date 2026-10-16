import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardLayout } from './components/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { PortalPage } from './pages/PortalPage';
import { AgentConfigPage } from './pages/AgentConfigPage';
import { AuthPage } from './pages/AuthPage';
import { TelephonyPage } from './pages/TelephonyPage';
import { WhatsAppHubPage } from './pages/WhatsAppHubPage';
import { LegalPage } from './pages/LegalPage';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
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

  const isDashboardRoute = [
    '/portal',
    '/dashboard',
    '/agent',
    '/settings',
    '/telephony',
    '/forwarding',
    '/whatsapp',
    '/dispatch',
  ].includes(currentRoute);

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

  // If loading auth state from localStorage, display brief loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-tertiary">Loading Callivaan...</span>
        </div>
      </div>
    );
  }

  // Protected operational dashboard routes: Require Authentication
  if (isDashboardRoute) {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col min-h-screen bg-surface text-on-surface">
          <Navbar currentRoute={currentRoute} navigate={navigate} />
          <main className="flex-1">
            <AuthPage navigate={navigate} />
          </main>
          <Footer navigate={navigate} />
        </div>
      );
    }

    return (
      <DashboardLayout currentRoute={currentRoute} navigate={navigate}>
        {renderCurrentPage()}
      </DashboardLayout>
    );
  }

  // Public marketing & legal pages render inside the public navigation shell
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
