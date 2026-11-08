import React, { useState, useEffect, useRef } from 'react';
import { EVENT_DETAILS } from '../data/eventData';

interface HeroProps {
  onScrollToRegister: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToRegister }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [statusText, setStatusText] = useState('26 days to go');
  const [progressWidth, setProgressWidth] = useState('18%');

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const start = EVENT_DETAILS.startTimestamp;
      const end = EVENT_DETAILS.endTimestamp;

      // Progress bar percentage (9:00 AM to 4:00 PM)
      const progress = Math.max(0, Math.min(1, (now - start) / (end - start)));
      setProgressWidth(`${Math.max(16, progress * 100)}%`);

      if (now < start) {
        const diffMinutes = Math.round((start - now) / 60000);
        const days = Math.floor(diffMinutes / 1440);
        const hours = Math.floor((diffMinutes % 1440) / 60);
        if (days >= 1) {
          setStatusText(`${days} days to go`);
        } else {
          setStatusText(`Starts in ${hours}h ${diffMinutes % 60}m`);
        }
      } else if (now <= end) {
        setStatusText('● Live now');
      } else {
        setStatusText('Event ended');
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[100vh] min-h-[100svh] lg:min-h-0 lg:h-[calc(100vh-62px)] w-full flex flex-col justify-center overflow-hidden bg-[#090D16]"
    >
      {/* Fullscreen Background Video with Vivid Visibility */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover scale-[1.01] brightness-100 contrast-100 opacity-95"
        >
          <source
            src={EVENT_DETAILS.videoBgUrl}
            type="video/mp4"
          />
        </video>

        {/* Vivid Scrim - Preserves Video Clarity with High Contrast Text */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/25 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

        {/* Ambient colored highlights */}
        <div className="ambient-glow bg-[#3FB1FF] w-[500px] h-[400px] -top-20 -left-20 opacity-25" />
        <div className="ambient-glow bg-[#FF57E8] w-[450px] h-[350px] top-1/3 -right-20 opacity-20" />
      </div>

      {/* Main Content Area - Automatically fits in 100vh on Laptop & Responsive on Mobile */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-2 w-full my-auto">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-14 items-center">
          
          {/* Left Column: Heading, Subtext & Action Buttons */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 lg:space-y-4 xl:space-y-5">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-mono font-semibold uppercase tracking-[0.14em] text-[#3FB1FF]">
              AWS STUDENT BUILDER GROUP · DHULE
            </p>

            {/* Headline - Responsive typography scales cleanly across all devices */}
            <h1 className="text-3xl sm:text-5xl md:text-[46px] lg:text-[52px] xl:text-[64px] 2xl:text-[72px] font-black tracking-tight text-white leading-[0.98]">
              AWS re:Invent<br />
              <span className="text-[#3FB1FF]">Watch</span><br />
              <span>&amp; </span>
              <span className="text-[#05E08A]">Build</span>{' '}
              <span className="text-[#FF57E8]">Party</span>{' '}
              <span className="text-white">Dhule</span><br />
              <span className="text-white">2026</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base lg:text-base text-slate-300 max-w-lg leading-relaxed pt-0.5 sm:pt-1">
              Watch the biggest cloud announcements together, then build something with them.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                onClick={onScrollToRegister}
                className="inline-flex items-center justify-center rounded-full bg-[#AB5CFF] hover:bg-[#b873ff] px-7 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#0E131A] shadow-lg shadow-[#AB5CFF]/25 transition-all active:scale-95 cursor-pointer"
              >
                Register
              </button>

              <a
                href={EVENT_DETAILS.calendarGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-black/40 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition-colors"
              >
                Add to calendar
              </a>
            </div>
          </div>

          {/* Right Column: Event Info Card Panel */}
          <div className="lg:col-span-5 w-full">
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-800/80 bg-[#0E1424]/85 p-6 sm:p-8 lg:p-7 xl:p-9 shadow-2xl backdrop-blur-xl">
              {/* Top Status Capsule & Logo Header */}
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 lg:mb-4">
                <span className="inline-block rounded-full bg-[#05E08A] px-3.5 sm:px-4 py-1 text-xs font-mono font-bold text-[#0A0F1D] tracking-wide">
                  {statusText}
                </span>
                <img
                  src="/AWS_reinvent-dark.png"
                  alt="AWS re:Invent 2026"
                  className="h-8 sm:h-9 lg:h-22 w-auto object-contain opacity-95"
                />
              </div>

              {/* Event Details Definition List */}
              <div className="space-y-4 sm:space-y-5 lg:space-y-4 my-3 sm:my-4">
                <div>
                  <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.12em] text-slate-400">
                    DATE
                  </div>
                  <div className="mt-0.5 text-xl sm:text-2xl lg:text-[22px] xl:text-3xl font-extrabold text-white">
                    04 December 2026
                  </div>
                </div>

                <div>
                  <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.12em] text-slate-400">
                    TIME
                  </div>
                  <div className="mt-0.5 text-xl sm:text-2xl lg:text-[22px] xl:text-3xl font-extrabold text-white">
                    9:00 AM – 4:00 PM IST
                  </div>
                </div>

                <div>
                  <div className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.12em] text-slate-400">
                    VENUE
                  </div>
                  <div className="mt-0.5 text-xl sm:text-2xl lg:text-[22px] xl:text-3xl font-extrabold text-white">
                    Anand Regency Riverfront
                  </div>
                </div>
              </div>

              {/* Progress Track Bar */}
              <div className="mt-5 sm:mt-6 lg:mt-5 pt-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/90">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: progressWidth,
                      background: 'linear-gradient(90deg, #3FB1FF, #FF57E8, #05E08A, #FF9F1C, #AB5CFF)'
                    }}
                  />
                </div>
                {/* Ticks */}
                <div className="mt-2 flex justify-between font-mono text-[11px] sm:text-xs text-slate-400">
                  <span>9:00</span>
                  <span className="text-[#05E08A] font-semibold">9:30 start</span>
                  <span>4:00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
