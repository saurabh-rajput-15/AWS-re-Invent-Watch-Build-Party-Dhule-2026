import React, { useState } from 'react';
import { Mail, PhoneCall } from 'lucide-react';
import { EVENT_DETAILS } from '../features/event/data/eventData';
import { TermsModal } from '../features/registration/components/TermsModal';

export const Footer: React.FC = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <footer className="relative isolate overflow-hidden border-t border-slate-800/80 bg-[#090D16] py-10 text-slate-400 sm:py-12 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(63,177,255,0.07),transparent_60%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-linear-to-br from-[#0E1526]/85 to-[#0C1222]/55 p-4 shadow-xl shadow-black/20 backdrop-blur-xl sm:rounded-[28px] sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-[#3FB1FF]/70 via-[#FF57E8]/60 to-[#05E08A]/70"
          />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 space-y-5 lg:col-span-7">
              {/* Proportional logo columns keep both assets on one row. */}
              <div className="grid w-full max-w-[640px] grid-cols-[minmax(0,1fr)_1px_minmax(0,1.3fr)] items-center gap-3 sm:gap-6">
                <img
                  src="/AWS_reinvent-dark.png"
                  alt="AWS re:Invent Dhule 2026"
                  className="block h-auto w-full min-w-0 object-contain drop-shadow-xl"
                />
                <div aria-hidden="true" className="h-8 w-px bg-slate-700/70 sm:h-14 lg:h-16" />
                <img
                  src="/AWS_Builder.png"
                  alt="AWS Student Builder Group Dhule"
                  className="block h-auto w-full min-w-0 object-contain opacity-95 drop-shadow-md"
                />
              </div>

              <p className="max-w-lg text-sm leading-relaxed text-slate-400">
                Organized with dedication by the AWS Student Builder Group Dhule for the student and developer community.
              </p>
            </div>

            {/* Organizer contacts */}
            <div className="grid min-w-0 grid-cols-1 gap-5 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#3FB1FF]" />
                  <span className="font-semibold text-white">Official Email</span>
                </div>
                <a
                  href={`mailto:${EVENT_DETAILS.contactEmail}`}
                  className="block break-all pl-5.5 text-sm font-medium text-[#3FB1FF] transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB1FF]"
                >
                  {EVENT_DETAILS.contactEmail}
                </a>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <PhoneCall aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#05E08A]" />
                  <span className="font-semibold text-white">Soham Chaudhari</span>
                  <span className="text-slate-600">:</span>
                </div>
                <a
                  href="tel:9834382337"
                  className="block pl-5.5 font-mono text-sm font-medium text-[#05E08A] transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05E08A]"
                >
                  +91 98343 82337
                </a>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <PhoneCall aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#05E08A]" />
                  <span className="font-semibold text-white">Saurabh Rajput</span>
                  <span className="text-slate-600">:</span>
                </div>
                <a
                  href="tel:9890991510"
                  className="block pl-5.5 font-mono text-sm font-medium text-[#05E08A] transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05E08A]"
                >
                  +91 98909 91510
                </a>
              </div>
            </div>
          </div>

          <nav className="mt-8 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-5 text-xs font-medium text-slate-300 sm:gap-3 sm:text-sm lg:mt-10 [&_a]:rounded-full [&_a]:px-3 [&_a]:py-2 [&_a]:transition-colors [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-[#3FB1FF]">
            <a href="#about" className="hover:bg-[#3FB1FF]/10 hover:text-[#3FB1FF]">About</a>
            <a href="#agenda" className="hover:bg-[#3FB1FF]/10 hover:text-[#3FB1FF]">Schedule</a>
            <a href="#speakers" className="hover:bg-[#3FB1FF]/10 hover:text-[#3FB1FF]">Mentors</a>
            <a href="#venue" className="hover:bg-[#3FB1FF]/10 hover:text-[#3FB1FF]">Venue</a>
            <a href="/register" className="bg-[#AB5CFF]/10 font-semibold text-[#AB5CFF] hover:bg-[#AB5CFF]/20 hover:text-white">Register</a>
            <a href="/codeofconduct" className="hover:bg-[#3FB1FF]/10 hover:text-[#3FB1FF]">Code of Conduct</a>
          </nav>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500 sm:text-left">
          © 2026 AWS Student Builder Group Dhule. All rights reserved.
        </p>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </footer>
  );
};
