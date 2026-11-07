import React from 'react';
import { ArrowUp, PhoneCall } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800 bg-[#070A12] text-slate-400 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">
          <div className="space-y-4">
            {/* Enlarged Logos Lockup */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              <img
                src="/AWS re_Invent_dark.png"
                alt="AWS re:Invent Dhule 2026"
                className="h-16 sm:h-22 md:h-28 lg:h-32 w-auto object-contain filter drop-shadow-xl"
              />
              <div className="hidden sm:block h-16 sm:h-20 w-px bg-slate-800" />
              <img
                src="/AWS_Builder.png"
                alt="AWS Student Builder Group at SVKM's IOT Dhule"
                className="h-10 sm:h-13 md:h-16 w-auto object-contain opacity-95 filter drop-shadow-md"
              />
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
              Organized with dedication by the AWS Student Builder Group at SVKM’s Institute of Technology, Dhule for the student and developer community.
            </p>

            {/* Organisers Contact Card */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2.5 sm:gap-4 p-3 rounded-xl bg-[#0E1526]/90 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#05E08A]/15 text-[#05E08A] shrink-0">
                  <PhoneCall className="h-3 w-3" />
                </span>
                <span className="text-xs text-slate-300">
                  <strong className="text-white font-semibold">Soham Chaudhari</strong> <span className="text-slate-400 text-[11px] font-mono">(SBG Lead)</span>:
                </span>
                <a
                  href="tel:9834382337"
                  className="inline-flex items-center text-xs font-mono font-bold text-[#05E08A] hover:underline"
                >
                  <span>+91 98343 82337</span>
                </a>
              </div>

              <span className="hidden sm:inline text-slate-700">|</span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">
                  <strong className="text-white font-semibold">Saurabh Rajput</strong> <span className="text-slate-400 text-[11px] font-mono">(Organizer)</span>:
                </span>
                <a
                  href="tel:9890991510"
                  className="inline-flex items-center text-xs font-mono font-bold text-[#05E08A] hover:underline"
                >
                  <span>+91 98909 91510</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-300">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#agenda" className="hover:text-white transition-colors">Schedule</a>
            <a href="#speakers" className="hover:text-white transition-colors">Mentors</a>
            <a href="#venue" className="hover:text-white transition-colors">Venue</a>
            <a href="#register" className="hover:text-white transition-colors">Register</a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#3FB1FF] hover:underline cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 AWS Student Builder Group · SVKM’s IOT Dhule. All rights reserved.
          </p>
          <p className="max-w-xl text-[11px] leading-relaxed">
            Amazon Web Services, AWS, and the AWS re:Invent logo are trademarks of Amazon.com, Inc. or its affiliates. This is an independent collegiate community gathering and is not officially affiliated with or hosted by Amazon Web Services.
          </p>
        </div>
      </div>
    </footer>
  );
};
