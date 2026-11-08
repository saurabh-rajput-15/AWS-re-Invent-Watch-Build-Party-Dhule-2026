import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

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
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-gradient-to-r from-[#090D16]/85 via-[#0C1222]/80 to-[#090D16]/85 backdrop-blur-xl shadow-lg shadow-black/20">
      {/* Top rainbow accent hairline (translucent) */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#3FB1FF]/70 via-[#FF57E8]/70 to-[#05E08A]/70" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: AWS re:Invent Logo */}
        <a
          href="#home"
          className="flex items-center transition-opacity hover:opacity-90 shrink-0"
        >
          <img
            src="/AWS_reinvent-dark.png"
            alt="AWS re:Invent Dhule 2026"
            className="h-8 sm:h-9 md:h-10 lg:h-10 w-auto object-contain"
          />
        </a>

        {/* Center-Left: Nav Links */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <a href="#about" className="whitespace-nowrap shrink-0 hover:text-white transition-colors">
            About
          </a>
          <a href="#agenda" className="whitespace-nowrap shrink-0 hover:text-white transition-colors">
            Schedule
          </a>
          <a href="#speakers" className="whitespace-nowrap shrink-0 hover:text-white transition-colors">
            Mentors
          </a>
          <a href="#venue" className="whitespace-nowrap shrink-0 hover:text-white transition-colors">
            Venue
          </a>
          <a href="#faq" className="whitespace-nowrap shrink-0 hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Center-Right: Compact Countdown Cards */}
        <div className="hidden md:flex items-center gap-1 xl:gap-1.5 shrink-0">
          <CountdownCard value={countdown.days} label="DAYS" />
          <span className="text-slate-600 font-mono font-bold text-[10px] select-none">:</span>
          <CountdownCard value={countdown.hours} label="HOURS" />
          <span className="text-slate-600 font-mono font-bold text-[10px] select-none">:</span>
          <CountdownCard value={countdown.minutes} label="MINS" />
          <span className="text-slate-600 font-mono font-bold text-[10px] select-none">:</span>
          <CountdownCard value={countdown.seconds} label="SECS" />
        </div>

        {/* Far Right: Primary Action Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onScrollToRegister}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#AB5CFF] hover:bg-[#b873ff] px-4 py-1.5 sm:px-5 sm:py-2 text-xs font-bold text-[#0E131A] shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Register</span>
            <span aria-hidden="true">→</span>
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

      {/* Mobile Drawer (Absolute overlay: does NOT shift or push hero down) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Mobile Drawer */}
          <div className="absolute top-full left-0 right-0 z-50 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-slate-800 bg-[#090D16]/98 backdrop-blur-2xl shadow-2xl px-5 pt-4 pb-7 lg:hidden">
            {/* Mobile Counter */}
            <div className="mb-4 flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <CountdownCard value={countdown.days} label="DAYS" />
              <span className="text-slate-600 font-mono font-bold text-xs">:</span>
              <CountdownCard value={countdown.hours} label="HOURS" />
              <span className="text-slate-600 font-mono font-bold text-xs">:</span>
              <CountdownCard value={countdown.minutes} label="MINS" />
              <span className="text-slate-600 font-mono font-bold text-xs">:</span>
              <CountdownCard value={countdown.seconds} label="SECS" />
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
    </header>
  );
};

// Digits 0 to 9 for vertical rolling animation
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface CountdownCardProps {
  value: number;
  label: string;
}

const CountdownCard: React.FC<CountdownCardProps> = ({ value, label }) => {
  const safeVal = Math.max(0, value);
  const tens = Math.floor(safeVal / 10) % 10;
  const ones = safeVal % 10;

  return (
    <div className="flex h-[36px] w-[38px] sm:h-[40px] sm:w-[42px] flex-col items-center justify-center rounded-lg bg-[#111624] border border-slate-800/80 shadow-inner select-none">
      {/* Rolling Digits Pair */}
      <div className="flex items-center gap-[1px]">
        <RollingNum digit={tens} />
        <RollingNum digit={ones} />
      </div>

      {/* Micro Label */}
      <span className="text-[6.5px] sm:text-[7px] font-mono font-bold text-slate-400 tracking-wider uppercase">
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
    <div className="relative h-[18px] w-[11px] sm:h-[20px] sm:w-[12px] overflow-hidden">
      {/* Subtle top/bottom fade gradient mask */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-[#111624] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-t from-[#111624] to-transparent z-10" />

      {/* Rolling digits column */}
      <div
        className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `translateY(-${digit * 10}%)`,
        }}
      >
        {DIGITS.map((num) => (
          <div
            key={num}
            className="flex h-[18px] w-[11px] sm:h-[20px] sm:w-[12px] items-center justify-center font-mono text-[11px] sm:text-xs font-black text-white tabular-nums select-none"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};
