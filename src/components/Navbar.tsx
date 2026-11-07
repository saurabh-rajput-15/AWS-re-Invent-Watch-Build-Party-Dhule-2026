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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/95 backdrop-blur-md">
      {/* Top rainbow accent hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#3FB1FF] via-[#FF57E8] to-[#05E08A]" />

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Lockup: AWS re:Invent Logo (h-20) + Divider + AWS Student Builder Group */}
        <a
          href="#home"
          className="flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90 shrink-0"
        >
          <img
            src="/AWS_reinvent-dark.png"
            alt="AWS re:Invent Dhule 2026"
            className="h-16 sm:h-20 w-auto object-contain py-1"
          />
          <div className="h-8 sm:h-10 w-[1px] bg-slate-800" />
          <img
            src="/AWS_Builder.png"
            alt="AWS Student Builder Group"
            className="h-9 sm:h-12 w-auto object-contain opacity-95"
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#0E1526] px-4 pt-3 pb-6 lg:hidden">
          {/* Mobile Brand Lockup */}
          <div className="mb-4 flex items-center justify-center gap-3 p-3 rounded-xl bg-[#090D16]/95 border border-slate-800">
            <img
              src="/AWS_reinvent-dark.png"
              alt="AWS re:Invent Dhule 2026"
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <div className="h-7 w-[1px] bg-slate-800" />
            <img
              src="/AWS_Builder.png"
              alt="AWS Student Builder Group"
              className="h-8 sm:h-9 w-auto object-contain opacity-95"
            />
          </div>

          {/* Mobile Counter */}
          <div className="mb-4 flex items-center justify-center gap-1.5 p-3 rounded-xl bg-[#090D16]/90">
            <CountdownCard value={countdown.days} label="DAYS" />
            <span className="text-slate-500 font-mono font-bold text-xs">:</span>
            <CountdownCard value={countdown.hours} label="HOURS" />
            <span className="text-slate-500 font-mono font-bold text-xs">:</span>
            <CountdownCard value={countdown.minutes} label="MINS" />
            <span className="text-slate-500 font-mono font-bold text-xs">:</span>
            <CountdownCard value={countdown.seconds} label="SECS" />
          </div>

          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors"
            >
              About
            </a>
            <a
              href="#agenda"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors"
            >
              Schedule &amp; Tracks
            </a>
            <a
              href="#speakers"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors"
            >
              Mentors &amp; Speakers
            </a>
            <a
              href="#venue"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors"
            >
              Venue &amp; Location
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors"
            >
              FAQ
            </a>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onScrollToRegister();
                }}
                className="w-full rounded-full bg-[#AB5CFF] py-2.5 text-center text-xs font-bold text-[#0E131A]"
              >
                Register Now →
              </button>
            </div>
          </nav>
        </div>
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
