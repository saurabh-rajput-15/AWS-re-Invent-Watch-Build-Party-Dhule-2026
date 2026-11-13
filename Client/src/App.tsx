import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './features/event/components/Hero';
import { Ticker } from './features/event/components/Ticker';
import { About } from './features/event/components/About';
import { Agenda } from './features/event/components/Agenda';
import { Speakers } from './features/event/components/Speakers';
import { RegistrationPage } from './features/registration/components/RegistrationPage';
import { TicketPassPage } from './features/registration/components/TicketPassPage';
import { Venue } from './features/event/components/Venue';
import { FAQ } from './features/event/components/FAQ';
import { Footer } from './components/Footer';
import { CodeOfConductPage } from './features/event/components/CodeOfConductPage';
import { AdminPortalPage } from './features/admin/components/AdminPortalPage';
import { AdminScannerPage } from './features/admin/components/AdminScannerPage';
import { AdminProtectedRoute } from './features/admin/components/AdminProtectedRoute';
import { Attendee } from './types';
import { useGsapLenis } from './hooks/useGsapLenis';

type AppRoute = 'home' | 'codeofconduct' | 'admin' | 'register' | 'scanner' | 'ticket';

interface RouteState {
  route: AppRoute;
  ticketId?: string;
}

export const extractTicketId = (pathname: string, search: string, hash: string): string | null => {
  const decodedPath = decodeURIComponent(pathname);

  // 1. /ticketid=[id] or /ticketid/[id]
  const matchTicketId = decodedPath.match(/^\/ticketid[=/]([a-zA-Z0-9_-]+)/i);
  if (matchTicketId && matchTicketId[1]) {
    return matchTicketId[1];
  }

  // 2. /ticket/[id]
  const matchTicket = decodedPath.match(/^\/ticket\/([a-zA-Z0-9_-]+)/i);
  if (matchTicket && matchTicket[1]) {
    return matchTicket[1];
  }

  // 3. Search parameters: ?ticketid=... or ?ticket=... or ?id=...
  if (search) {
    const params = new URLSearchParams(search);
    const id = params.get('ticketid') || params.get('ticket') || params.get('id');
    if (id) return id.trim();
  }

  // 4. Hash parameters: #ticketid=... or #/ticketid=... or #ticket=...
  if (hash) {
    const cleanHash = hash.replace(/^#\/?/, '');
    const matchHash = cleanHash.match(/^ticketid[=/]([a-zA-Z0-9_-]+)/i);
    if (matchHash && matchHash[1]) {
      return matchHash[1];
    }
    const hashParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash);
    const id = hashParams.get('ticketid') || hashParams.get('ticket');
    if (id) return id.trim();
  }

  return null;
};

const detectRoute = (pathname: string, search: string, hash: string): RouteState => {
  const p = pathname.toLowerCase().replace(/\/$/, '');
  const h = hash.toLowerCase();

  const ticketId = extractTicketId(pathname, search, hash);
  if (ticketId) {
    return { route: 'ticket', ticketId };
  }

  if (p === '/ticket' || h === '#ticket' || h === '#/ticket') {
    return { route: 'ticket' };
  }

  if (p === '/scanner' || h === '#scanner' || h === '#/scanner') {
    return { route: 'scanner' };
  }

  if (p === '/admin' || h === '#admin' || h === '#/admin') {
    return { route: 'admin' };
  }

  if (
    p === '/codeofconduct' ||
    p === '/code-of-conduct' ||
    h === '#codeofconduct' ||
    h === '#/codeofconduct' ||
    h === '#code-of-conduct' ||
    h === '#/code-of-conduct'
  ) {
    return { route: 'codeofconduct' };
  }

  if (p === '/register' || h === '#register' || h === '#/register') {
    return { route: 'register' };
  }

  return { route: 'home' };
};

export default function App() {
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [routeState, setRouteState] = useState<RouteState>(() => {
    if (typeof window !== 'undefined') {
      return detectRoute(window.location.pathname, window.location.search, window.location.hash);
    }
    return { route: 'home' };
  });

  const currentRoute = routeState.route;
  const activeTicketId = routeState.ticketId;

  // Initialize GSAP ScrollTrigger and Lenis smooth scrolling
  const lenisRef = useGsapLenis();

  // Listen to browser navigation back/forward and hash changes
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(detectRoute(window.location.pathname, window.location.search, window.location.hash));
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToHome = () => {
    if (window.location.pathname !== '/' || window.location.hash || window.location.search) {
      window.history.pushState({}, '', '/');
    }
    setRouteState({ route: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCodeOfConduct = () => {
    if (window.location.pathname !== '/codeofconduct') {
      window.history.pushState({}, '', '/codeofconduct');
    }
    setRouteState({ route: 'codeofconduct' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setRouteState({ route: 'admin' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRegister = () => {
    if (window.location.pathname !== '/register') {
      window.history.pushState({}, '', '/register');
    }
    setRouteState({ route: 'register' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToScanner = () => {
    if (window.location.pathname !== '/scanner') {
      window.history.pushState({}, '', '/scanner');
    }
    setRouteState({ route: 'scanner' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTicket = (ticketId?: string) => {
    const targetUrl = ticketId ? `/ticketid=${ticketId}` : '/ticket';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRouteState({ route: 'ticket', ticketId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Intercept any clicks on /admin, /scanner, /ticket, /ticketid=..., /codeofconduct, /register or back to home
  useEffect(() => {
    const handleGlobalLinkClicks = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href === '/admin' || href === '#/admin' || href === '#admin') {
        e.preventDefault();
        navigateToAdmin();
      } else if (href === '/scanner' || href === '#/scanner' || href === '#scanner') {
        e.preventDefault();
        navigateToScanner();
      } else if (
        href === '/ticket' ||
        href === '#/ticket' ||
        href === '#ticket' ||
        href.startsWith('/ticketid=') ||
        href.startsWith('/ticket/')
      ) {
        e.preventDefault();
        const extracted = extractTicketId(href, '', '');
        navigateToTicket(extracted || undefined);
      } else if (href === '/codeofconduct' || href === '/code-of-conduct') {
        e.preventDefault();
        navigateToCodeOfConduct();
      } else if (href === '/register' || href === '#register' || href === '#/register') {
        e.preventDefault();
        navigateToRegister();
      } else if (href === '/' && currentRoute !== 'home') {
        e.preventDefault();
        navigateToHome();
      }
    };
    document.addEventListener('click', handleGlobalLinkClicks);
    return () => document.removeEventListener('click', handleGlobalLinkClicks);
  }, [currentRoute]);

  // Monitor scroll for Back to Top Button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load registered attendee from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aws_reinvent_dhule_attendee');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.status) parsed.status = 'pending';
        if (!parsed.builderId) parsed.builderId = 'builder-aws';
        if (!parsed.phone) parsed.phone = '9890991510';
        setAttendee(parsed);
      }
    } catch (e) {
      console.warn('Could not read saved attendee from localStorage', e);
    }
  }, []);

  const handleRegisterSuccess = (newAttendee: Attendee) => {
    setAttendee(newAttendee);
    try {
      localStorage.setItem('aws_reinvent_dhule_attendee', JSON.stringify(newAttendee));
    } catch (e) {
      console.warn('Could not save attendee to localStorage', e);
    }
  };

  // Dedicated /scanner Route (Admin QR Camera Scanner)
  if (currentRoute === 'scanner') {
    return (
      <AdminScannerPage
        onNavigateHome={navigateToHome}
        onNavigateAdminPortal={navigateToAdmin}
      />
    );
  }

  // Dedicated /ticket or /ticketid=[id] Route (Digital Pass & 3D Lanyard View)
  if (currentRoute === 'ticket') {
    return (
      <TicketPassPage
        ticketId={activeTicketId || ''}
        onNavigateHome={navigateToHome}
      />
    );
  }

  // Dedicated /register Route
  if (currentRoute === 'register') {
    return (
      <RegistrationPage
        attendee={attendee}
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateHome={navigateToHome}
      />
    );
  }

  // Protected Admin Portal Route
  if (currentRoute === 'admin') {
    return (
      <AdminProtectedRoute onNavigateHome={navigateToHome}>
        {({ token, onLogout }) => (
          <AdminPortalPage
            onNavigateHome={navigateToHome}
            onNavigateScanner={navigateToScanner}
            token={token}
            onLogout={onLogout}
          />
        )}
      </AdminProtectedRoute>
    );
  }

  if (currentRoute === 'codeofconduct') {
    return (
      <CodeOfConductPage
        onNavigateHome={navigateToHome}
        onScrollToRegister={navigateToRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F3F4F6] selection:bg-[#AB5CFF]/30 selection:text-white flex flex-col">
      {/* Scroll Progress Bar at the top of the viewport */}
      <div
        id="scroll-progress"
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left scale-x-0"
        style={{
          background: 'linear-gradient(90deg, #3FB1FF, #FF57E8, #05E08A, #FF9F1C, #AB5CFF)',
        }}
      />

      {/* Top Navigation */}
      <Navbar onScrollToRegister={navigateToRegister} />

      {/* Main Content Sections (Clean Landing Stream without embedded registration form) */}
      <main className="flex-1">
        <Hero onScrollToRegister={navigateToRegister} />

        <Ticker />

        <About />

        <Agenda />

        <Speakers />

        <Venue />

        <FAQ />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sticky Bottom-Right Back to Top Button */}
      {showBackToTop && (
        <div className="fixed bottom-6 right-6 z-40 transition-all duration-300">
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#0E1526]/90 hover:bg-[#1a233a] border border-slate-700/80 hover:border-[#3FB1FF]/60 text-slate-200 hover:text-white shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer group"
          >
            <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 text-[#3FB1FF]" />
          </button>
        </div>
      )}
    </div>
  );
}
