import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { EVENT_DETAILS } from '../features/event/data/eventData';

interface NavbarProps {
  onScrollToRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const navPillRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // 1. GSAP Entrance Animation for Landscape / Desktop Navbar
  useEffect(() => {
    const isLandscape = window.matchMedia('(min-width: 1024px), (orientation: landscape) and (min-width: 640px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isLandscape && !prefersReducedMotion && navPillRef.current) {
      const anim = gsap.fromTo(
        navPillRef.current,
        { y: -45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.1,
          clearProps: 'transform,opacity',
        }
      );

      return () => {
        anim.kill();
      };
    }
  }, []);

  // 2. Track window scroll to subtly adjust glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Countdown timer logic
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const target = EVENT_DETAILS.startTimestamp;
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Smooth GSAP Open / Close Animation for Mobile Menu
  const openMobileMenu = () => {
    if (isClosingRef.current) return;
    setIsRendered(true);
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = (callback?: () => void) => {
    if (isClosingRef.current || !isRendered) return;
    isClosingRef.current = true;
    setMobileMenuOpen(false);

    if (!scrimRef.current || !drawerRef.current) {
      setIsRendered(false);
      isClosingRef.current = false;
      callback?.();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsRendered(false);
        isClosingRef.current = false;
        callback?.();
      },
    });

    tl.to(drawerRef.current, {
      y: -18,
      opacity: 0,
      scale: 0.97,
      duration: 0.22,
      ease: 'power2.in',
    }).to(
      scrimRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      },
      '-=0.15'
    );
  };

  // Trigger GSAP entrance when mobile menu mounts into the DOM
  useEffect(() => {
    if (isRendered && drawerRef.current && scrimRef.current) {
      const items = drawerRef.current.querySelectorAll('.mobile-nav-item');

      gsap.killTweensOf([scrimRef.current, drawerRef.current, items]);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        scrimRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      )
      .fromTo(
        drawerRef.current,
        { y: -22, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.32, ease: 'power3.out' },
        '-=0.12'
      );

      if (items.length > 0) {
        tl.fromTo(
          items,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.22, stagger: 0.03, ease: 'power2.out', clearProps: 'transform,opacity' },
          '-=0.18'
        );
      }
    }
  }, [isRendered]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pointer-events-none">
      {/* Backdrop Scrim for mobile menu */}
      {isRendered && (
        <div
          ref={scrimRef}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden pointer-events-auto"
          onClick={() => closeMobileMenu()}
          aria-hidden="true"
        />
      )}

      {/* Main Floating Navbar Pill (GSAP Animated on Landscape / Desktop) */}
      <div
        ref={navPillRef}
        className={`mx-auto max-w-7xl rounded-full border transition-all duration-300 ${
          isScrolled
            ? 'border-white/15 bg-[#090D16]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 scale-[0.99]'
            : 'border-white/10 bg-linear-to-r from-[#090D16]/90 via-[#0C1222]/85 to-[#090D16]/90 backdrop-blur-xl shadow-2xl shadow-black/40 scale-100'
        } pointer-events-auto relative z-50`}
      >
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: AWS re:Invent Logo */}
          <a
            href="#home"
            className="flex items-center transition-opacity hover:opacity-90 shrink-0"
          >
            <img
              src="/AWS_reinvent-dark.png"
              alt="AWS re:Invent Dhule 2026"
              width={783}
              height={281}
              fetchPriority="high"
              decoding="async"
              className="h-8 sm:h-9 md:h-10 lg:h-13 w-auto object-contain"
            />
          </a>

          {/* Center-Left: Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs sm:text-sm font-medium text-slate-300">
            <a href="#about" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
              About
            </a>
            <a href="#benefits" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
              Benefits
            </a>
            <a href="#agenda" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
              Schedule
            </a>
            <a href="#speakers" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
              Mentors
            </a>
            <a href="#venue" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
              Venue
            </a>
            <a href="#faq" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
              FAQ
            </a>
          </nav>

          {/* Center-Right: Open Countdown */}
          <div className="hidden md:flex items-start gap-1.5 xl:gap-2 shrink-0">
            <CountdownUnit value={countdown.days} label="DAYS" />
            <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
            <CountdownUnit value={countdown.hours} label="HOURS" />
            <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
            <CountdownUnit value={countdown.minutes} label="MINS" />
            <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
            <CountdownUnit value={countdown.seconds} label="SECS" />
          </div>

          {/* Far Right: Primary Action Pill & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onScrollToRegister}
              className="relative p-[1.5px] rounded-full bg-linear-to-r from-aws-blue via-aws-magenta to-aws-orange transition-all hover:scale-105 active:scale-95 shadow-lg shadow-aws-magenta/20 cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C1222]/90 hover:bg-[#0C1222]/70 px-4 py-1.5 sm:px-5 sm:py-2 text-xs font-bold text-white transition-all whitespace-nowrap">
                <span>Register</span>
                <span aria-hidden="true">→</span>
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => (mobileMenuOpen ? closeMobileMenu() : openMobileMenu())}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white transition-all focus:outline-none lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Smooth GSAP Open / Close with solid dark card) */}
      {isRendered && (
        <div
          ref={drawerRef}
          className="mx-auto max-w-7xl pt-2 lg:hidden pointer-events-auto relative z-50"
        >
          <div className="rounded-3xl border border-white/10 bg-[#0B1120] p-4 sm:p-5 shadow-2xl shadow-black/90 max-h-[calc(100dvh-5.5rem)] overflow-y-auto">
            {/* Mobile Counter Card */}
            <div className="mobile-nav-item mb-3 rounded-2xl bg-white/[0.03] border border-white/5 p-3 flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-aws-blue">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-aws-blue animate-pulse" />
                Event Starts In
              </div>
              <div className="flex items-start justify-center gap-3 pt-1">
                <CountdownUnit value={countdown.days} label="DAYS" />
                <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
                <CountdownUnit value={countdown.hours} label="HOURS" />
                <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
                <CountdownUnit value={countdown.minutes} label="MINS" />
                <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
                <CountdownUnit value={countdown.seconds} label="SECS" />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1 text-sm font-medium">
              <a
                href="#about"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>About</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
              </a>
              <a
                href="#benefits"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>What You'll Get</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
              </a>
              <a
                href="#agenda"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>Schedule &amp; Tracks</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
              </a>
              <a
                href="#speakers"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>Mentors &amp; Speakers</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
              </a>
              <a
                href="#venue"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>Venue &amp; Location</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
              </a>
              <a
                href="#faq"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>FAQ</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
              </a>
              <a
                href="/codeofconduct"
                onClick={() => closeMobileMenu()}
                className="mobile-nav-item group flex items-center justify-between rounded-xl px-4 py-2.5 text-slate-200 transition-all hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
              >
                <span>Terms &amp; Code of Conduct</span>
                <span className="flex items-center gap-1.5">
                  <span className="rounded-md bg-aws-blue/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-aws-blue">
                    /codeofconduct
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-aws-blue" />
                </span>
              </a>

              {/* Action Button */}
              <div className="mobile-nav-item pt-2.5">
                <button
                  onClick={() => {
                    closeMobileMenu(() => onScrollToRegister());
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-aws-purple via-aws-magenta to-aws-blue py-3.5 text-center text-sm font-bold text-black shadow-lg shadow-aws-purple/20 transition-all hover:opacity-95 active:scale-[0.98] cursor-pointer"
                >
                  <span>Register for Free Pass</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

// Digits 0 to 9 for vertical rolling animation
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface CountdownUnitProps {
  value: number;
  label: string;
}

const CountdownUnit: React.FC<CountdownUnitProps> = ({ value, label }) => {
  const safeVal = Math.max(0, value);
  const tens = Math.floor(safeVal / 10) % 10;
  const ones = safeVal % 10;

  return (
    <div
      aria-label={`${safeVal} ${label.toLowerCase()}`}
      className="flex min-w-8 sm:min-w-9 flex-col items-center gap-0.5 select-none"
    >
      {/* Rolling Digits Pair */}
      <div aria-hidden="true" className="flex items-center">
        <RollingNum digit={tens} />
        <RollingNum digit={ones} />
      </div>

      {/* Micro Label */}
      <span aria-hidden="true" className="text-[8px] font-mono font-medium text-slate-400 tracking-[0.12em] uppercase">
        {label}
      </span>
    </div>
  );
};

interface RollingNumProps {
  digit: number;
}

const RollingNum: React.FC<RollingNumProps> = ({ digit }) => {
  return (
    <div className="relative h-6 w-3 sm:h-[26px] sm:w-[13px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
      {/* Rolling digits column */}
      <div
        className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{
          transform: `translateY(-${digit * 10}%)`,
        }}
      >
        {DIGITS.map((num) => (
          <div
            key={num}
            className="flex h-6 w-3 sm:h-[26px] sm:w-[13px] shrink-0 items-center justify-center font-mono text-lg sm:text-xl font-semibold text-white tabular-nums select-none"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};
