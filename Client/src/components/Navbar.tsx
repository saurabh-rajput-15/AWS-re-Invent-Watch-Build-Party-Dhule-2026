import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { EVENT_DETAILS } from '../features/event/data/eventData';

interface NavbarProps {
  onScrollToRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

  // Prevent background scrolling while mobile drawer is open
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
    <header className="fixed top-0 left-0 right-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pointer-events-none">
      <div className="mx-auto max-w-7xl rounded-full border border-white/10 bg-gradient-to-r from-[#090D16]/90 via-[#0C1222]/85 to-[#090D16]/90 backdrop-blur-xl shadow-2xl shadow-black/40 pointer-events-auto relative">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: AWS re:Invent Logo */}
        <a
          href="#home"
          className="flex items-center transition-opacity hover:opacity-90 shrink-0"
        >
          <img
            src="/AWS_reinvent-dark.png"
            alt="AWS re:Invent Dhule 2026"
            className="h-8 sm:h-9 md:h-10 lg:h-13 w-auto object-contain"
          />
        </a>

        {/* Center-Left: Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs sm:text-sm font-medium text-slate-300">
          <a href="#about" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
            About
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
          <a href="/register" className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full text-[#3FB1FF] hover:bg-[#3FB1FF]/10 hover:text-white transition-all font-semibold">
            Register
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

        {/* Far Right: Primary Action Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onScrollToRegister}
            className="relative p-[1.5px] rounded-full bg-gradient-to-r from-[#3FB1FF] via-[#FF57E8] to-[#FF9F1C] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#FF57E8]/20 cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C1222]/90 hover:bg-[#0C1222]/70 px-4 py-1.5 sm:px-5 sm:py-2 text-xs font-bold text-white transition-all whitespace-nowrap">
              <span>Register</span>
              <span aria-hidden="true">→</span>
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-slate-300 hover:text-white focus:outline-none lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Absolute overlay attached to floating navbar) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 top-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Mobile Drawer */}
          <div className="absolute top-[calc(100%+8px)] left-3 right-3 sm:left-6 sm:right-6 lg:left-8 lg:right-8 mx-auto max-w-7xl z-50 max-h-[calc(100vh-100px)] overflow-y-auto rounded-3xl border border-slate-800 bg-[#090D16]/98 backdrop-blur-2xl shadow-2xl px-5 pt-4 pb-7 lg:hidden pointer-events-auto">
            {/* Mobile Counter */}
              <div className="mb-4 flex items-start justify-center gap-3 border-b border-white/10 py-4">
                <CountdownUnit value={countdown.days} label="DAYS" />
                <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
                <CountdownUnit value={countdown.hours} label="HOURS" />
                <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
                <CountdownUnit value={countdown.minutes} label="MINS" />
                <span aria-hidden="true" className="pt-0.5 text-slate-500 font-mono text-sm select-none">:</span>
                <CountdownUnit value={countdown.seconds} label="SECS" />
              </div>

              <nav className="flex flex-col space-y-1.5 text-sm font-medium text-slate-200">
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 hover:bg-slate-800/70 hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#agenda"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 hover:bg-slate-800/70 hover:text-white transition-colors"
                >
                  Schedule &amp; Tracks
                </a>
                <a
                  href="#speakers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 hover:bg-slate-800/70 hover:text-white transition-colors"
                >
                  Mentors &amp; Speakers
                </a>
                <a
                  href="#venue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 hover:bg-slate-800/70 hover:text-white transition-colors"
                >
                  Venue &amp; Location
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 hover:bg-slate-800/70 hover:text-white transition-colors"
                >
                  FAQ
                </a>
                <a
                  href="/codeofconduct"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Terms &amp; Code of Conduct</span>
                  <span className="font-mono text-[11px] text-[#3FB1FF]">/codeofconduct</span>
                </a>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onScrollToRegister();
                    }}
                    className="w-full rounded-full bg-[#AB5CFF] hover:bg-[#b873ff] py-3 text-center text-xs font-bold text-[#0E131A] shadow-lg shadow-[#AB5CFF]/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Register Now →
                  </button>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
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
