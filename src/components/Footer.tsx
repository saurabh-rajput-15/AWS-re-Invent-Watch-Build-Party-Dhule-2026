import React, { useState } from 'react';
import { PhoneCall, Scale } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';
import { TermsModal } from './TermsModal';

export const Footer: React.FC = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <footer className="border-t border-slate-800 bg-[#070A12] text-slate-400 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">
          <div className="space-y-4">
            {/* Enlarged Logos Lockup */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              <img
                src="/AWS_reinvent-dark.png"
                alt="AWS re:Invent Dhule 2026"
                className="h-16 sm:h-22 md:h-28 lg:h-32 w-auto object-contain filter drop-shadow-xl"
              />
              <div className="hidden sm:block h-16 sm:h-20 w-px bg-slate-800" />
              <img
                src="/AWS_Builder.png"
                alt="AWS Student Builder Group Dhule"
                className="h-10 sm:h-13 md:h-16 w-auto object-contain opacity-95 filter drop-shadow-md"
              />
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
              Organized with dedication by the AWS Student Builder Group Dhule for the student and developer community.
            </p>

            {/* Organisers Contact Card */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2.5 sm:gap-4 p-3 rounded-xl bg-[#0E1526]/90 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#05E08A]/15 text-[#05E08A] shrink-0">
                  <PhoneCall className="h-3 w-3" />
                </span>
                <span className="text-xs text-slate-300">
                  <strong className="text-white font-semibold">Soham Chaudhari</strong>:
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
                  <strong className="text-white font-semibold">Saurabh Rajput</strong>:
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
            <a href="/codeofconduct" className="text-[#3FB1FF] hover:underline font-medium transition-colors">Code of Conduct</a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 AWS Student Builder Group Dhule. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              /admin
            </a>
            <span className="text-slate-700">·</span>
            <a
              href="/codeofconduct"
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              /codeofconduct
            </a>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Terms Modal
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </footer>
  );
};
