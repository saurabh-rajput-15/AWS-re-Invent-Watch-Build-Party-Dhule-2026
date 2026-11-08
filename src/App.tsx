import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { About } from './components/About';
import { Agenda } from './components/Agenda';
import { Speakers } from './components/Speakers';
import { Registration } from './components/Registration';
import { Venue } from './components/Venue';
import { Footer } from './components/Footer';
import { CodeOfConductPage } from './components/CodeOfConductPage';
import { AdminPortalPage } from './components/AdminPortalPage';
import { Attendee } from './types';
import { useGsapLenis } from './hooks/useGsapLenis';

type AppRoute = 'home' | 'codeofconduct' | 'admin';

const detectRoute = (pathname: string, hash: string): AppRoute => {
  const p = pathname.toLowerCase().replace(/\/$/, '');
  const h = hash.toLowerCase();

  if (p === '/admin' || h === '#admin' || h === '#/admin') {
    return 'admin';
  }

  if (
    p === '/codeofconduct' ||
    p === '/code-of-conduct' ||
    h === '#codeofconduct' ||
    h === '#/codeofconduct' ||
    h === '#code-of-conduct' ||
    h === '#/code-of-conduct'
  ) {
    return 'codeofconduct';
  }

  return 'home';
};

export default function App() {
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return detectRoute(window.location.pathname, window.location.hash);
    }
    return 'home';
  });

  // Initialize GSAP ScrollTrigger and Lenis smooth scrolling
  const lenisRef = useGsapLenis();

  // Listen to browser navigation back/forward and hash changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(detectRoute(window.location.pathname, window.location.hash));
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Intercept any clicks on /admin, /codeofconduct or back to home
  useEffect(() => {
    const handleGlobalLinkClicks = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '/admin' || href === '#/admin' || href === '#admin') {
        e.preventDefault();
        navigateToAdmin();
      } else if (href === '/codeofconduct' || href === '/code-of-conduct') {
        e.preventDefault();
        navigateToCodeOfConduct();
      } else if (href === '/' && (currentRoute === 'codeofconduct' || currentRoute === 'admin')) {
        e.preventDefault();
        navigateToHome();
      }
    };
    document.addEventListener('click', handleGlobalLinkClicks);
    return () => document.removeEventListener('click', handleGlobalLinkClicks);
  }, [currentRoute]);

  const navigateToHome = () => {
    if (window.location.pathname !== '/' || window.location.hash) {
      window.history.pushState({}, '', '/');
    }
    setCurrentRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCodeOfConduct = () => {
    if (window.location.pathname !== '/codeofconduct') {
      window.history.pushState({}, '', '/codeofconduct');
    }
    setCurrentRoute('codeofconduct');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setCurrentRoute('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const scrollToRegister = () => {
    const el = document.getElementById('register');
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -85, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (currentRoute === 'admin') {
    return <AdminPortalPage onNavigateHome={navigateToHome} />;
  }

  if (currentRoute === 'codeofconduct') {
    return (
      <CodeOfConductPage
        onNavigateHome={navigateToHome}
        onScrollToRegister={scrollToRegister}
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
      <Navbar onScrollToRegister={scrollToRegister} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero onScrollToRegister={scrollToRegister} />

        <Ticker />

        <About />

        <Agenda />

        <Speakers />

        <Registration
          attendee={attendee}
          onRegisterSuccess={handleRegisterSuccess}
        />

        <Venue />
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
