import React, { useState } from "react";
import { Mail, PhoneCall } from "lucide-react";
import { EVENT_DETAILS } from "../features/event/data/eventData";
import { TermsModal } from "../features/registration/components/TermsModal";

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
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-aws-blue/70 via-aws-magenta/60 to-aws-green/70"
          />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 space-y-5 lg:col-span-7">
              {/* Proportional logo columns keep both assets on one row. */}
              <div className="grid w-full max-w-160 grid-cols-[minmax(0,1fr)_1px_minmax(0,1.3fr)] items-center gap-3 sm:gap-6">
                <img
                  src="/AWS_reinvent-dark.png"
                  alt="AWS re:Invent Dhule 2026"
                  width={783}
                  height={281}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full min-w-0 object-contain drop-shadow-xl"
                />
                <div
                  aria-hidden="true"
                  className="h-8 w-px bg-slate-700/70 sm:h-14 lg:h-16"
                />
                <img
                  src="/AWS_Builder.png"
                  alt="AWS Student Builder Group Dhule"
                  width={1121}
                  height={205}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full min-w-0 object-contain opacity-95 drop-shadow-md"
                />
              </div>

              <p className="max-w-lg text-sm leading-relaxed text-slate-400">
                Organized with dedication by the AWS Student Builder Group Dhule
                for the student and developer community.
              </p>

              {/* Powered By Sponsor Lockup */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-slate-500">
                  Powered By
                </span>
                <a
                  href="https://hackmamba.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-slate-950/60 hover:border-aws-orange/40 px-3 py-1.5 transition-colors"
                  aria-label="Powered by Hackmamba"
                >
                  <img
                    src="/Hackmamba-white.png"
                    alt="Hackmamba — Official Event Sponsor"
                    width={678}
                    height={157}
                    loading="lazy"
                    decoding="async"
                    className="h-8 sm:h-10 w-auto object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Organizer contacts */}
            <div className="grid min-w-0 grid-cols-1 gap-5 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-aws-blue"
                  />
                  <span className="font-semibold text-white">
                    Official Email
                  </span>
                </div>
                <a
                  href={`mailto:${EVENT_DETAILS.contactEmail}`}
                  className="block break-all pl-5.5 text-sm font-medium text-aws-blue transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-blue"
                >
                  {EVENT_DETAILS.contactEmail}
                </a>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <PhoneCall
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-aws-green"
                  />
                  <span className="font-semibold text-white">
                    Soham Chaudhari
                  </span>
                  <span className="text-slate-600">:</span>
                </div>
                <a
                  href="tel:9834382337"
                  className="block pl-5.5 font-mono text-sm font-medium text-aws-green transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-green"
                >
                  +91 98343 82337
                </a>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <PhoneCall
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-aws-green"
                  />
                  <span className="font-semibold text-white">
                    Saurabh Rajput
                  </span>
                  <span className="text-slate-600">:</span>
                </div>
                <a
                  href="tel:9890991510"
                  className="block pl-5.5 font-mono text-sm font-medium text-aws-green transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-green"
                >
                  +91 98909 91510
                </a>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 rounded-xl border border-aws-orange/25 bg-aws-orange/10 px-3.5 py-2.5 text-[11px] leading-relaxed text-amber-200/95">
                <strong className="text-white">High Volume &amp; Limited Seats:</strong> Receiving 100+ emails &amp; calls — our team is reviewing every request &amp; confirming by call. Please be patient &amp; thank you for your support!
              </div>
            </div>
          </div>

          <nav className="mt-8 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-5 text-xs font-medium text-slate-300 sm:gap-3 sm:text-sm lg:mt-10 [&_a]:rounded-full [&_a]:px-3 [&_a]:py-2 [&_a]:transition-colors [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-aws-blue">
            <a
              href="/#about"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              About
            </a>
            <a
              href="/#benefits"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Benefits
            </a>
            <a
              href="/#agenda"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Schedule
            </a>
            <a
              href="/#speakers"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Mentors
            </a>
            <a
              href="/#venue"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Venue
            </a>
            <a
              href="/#team"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Team
            </a>
            <a
              href="/#partners"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Sponsors
            </a>
            <a
              href="/register"
              className="bg-aws-purple/10 font-semibold text-aws-purple hover:bg-aws-purple/20 hover:text-white"
            >
              Register
            </a>
            <a
              href="/codeofconduct"
              className="hover:bg-aws-blue/10 hover:text-aws-blue"
            >
              Code of Conduct
            </a>
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
