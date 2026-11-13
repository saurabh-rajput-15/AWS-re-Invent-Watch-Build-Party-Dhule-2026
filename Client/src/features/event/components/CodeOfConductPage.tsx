import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  UserX,
  FileText,
  Gift,
  CheckCircle2,
  Mail,
  Scale,
  Building,
  HeartHandshake
} from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface CodeOfConductPageProps {
  onNavigateHome: () => void;
  onScrollToRegister: () => void;
}

export const CodeOfConductPage: React.FC<CodeOfConductPageProps> = ({
  onNavigateHome,
  onScrollToRegister
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Code of Conduct & Terms · AWS re:Invent Dhule 2026';
    return () => {
      document.title = 'AWS re:Invent Watch & Build Party Dhule';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F3F4F6] selection:bg-[#AB5CFF]/30 selection:text-white flex flex-col">
      {/* Top Rainbow hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#3FB1FF]/70 via-[#FF57E8]/70 to-[#05E08A]/70" />

      {/* Top Simple Sticky Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-gradient-to-r from-[#090D16]/90 via-[#0C1222]/85 to-[#090D16]/90 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#3FB1FF]" />
            <span>Back to Event</span>
          </button>

          <a href="#home" onClick={onNavigateHome} className="flex items-center shrink-0">
            <img
              src="/AWS_reinvent-dark.png"
              alt="AWS re:Invent Dhule 2026"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
            />
          </a>

          <button
            onClick={() => {
              onNavigateHome();
              setTimeout(() => {
                onScrollToRegister();
              }, 100);
            }}
            className="rounded-full bg-gradient-to-r from-[#AB5CFF] to-[#3FB1FF] px-4 sm:px-5 py-2 text-xs font-bold text-[#0E131A] shadow-md shadow-[#AB5CFF]/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Register →</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="pb-10 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#FF57E8]">
              <Scale className="h-4 w-4 text-[#FF57E8]" />
              <span>Official Community Policy &amp; Terms</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Dhule 2026</span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Terms &amp; Conditions and <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3FB1FF] via-[#FF57E8] to-[#05E08A]">Code of Conduct</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              The AWS re:Invent Watch &amp; Build Party Dhule is dedicated to empowering student builders in a safe, constructive, and respectful atmosphere. By registering for or entering the event, all attendees, mentors, guests, and organizers agree to comply with the rules below.
            </p>

            {/* Quick Warning Notice */}
            <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-xs sm:text-sm text-rose-200 flex items-start gap-3.5">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white uppercase tracking-wider font-mono text-xs">
                  Important Attendee Notice
                </span>
                <p className="leading-relaxed">
                  Admission to the venue is strictly conditional. Organizers enforce a zero-tolerance policy against any misconduct, damage, or harassment. Registration does not automatically guarantee entry; applications undergo manual verification.
                </p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="mt-10 space-y-10">

            {/* Section 1: Venue Liability */}
            <section className="rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-500/15 p-2.5 text-rose-400 shrink-0">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    1. Venue Property, Safety &amp; Non-Liability
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Hotel Anand Regency Riverfront Premises</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                The event is hosted at <strong>Hotel Anand Regency Riverfront</strong> (2nd Floor Symphony Hall for the main gathering &amp; 3rd Floor Harmony Hall for lunch). Attendees must preserve and respect hotel facilities, furniture, projectors, screens, microphones, elevators, and electrical infrastructure.
              </p>

              <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-rose-400 font-bold text-base leading-none">•</span>
                  <span>
                    <strong className="text-white">Zero Liability on SBG Dhule &amp; Organizers:</strong> Neither the AWS Student Builder Group Dhule, its lead organizers, nor student coordinators are legally or financially responsible for any damage, loss, breakage, or harm caused by attendees to hotel premises or rental equipment.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-rose-400 font-bold text-base leading-none">•</span>
                  <span>
                    <strong className="text-white">Individual Liability:</strong> Any attendee who damages, breaks, defaces, or vandalizes any venue property will be held <strong>exclusively and individually liable</strong> for full financial reimbursement, replacement, or repair costs directly payable to the hotel management.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2: Strict Anti-Harassment */}
            <section className="rounded-2xl border border-rose-900/50 bg-[#0E1526]/80 p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-500/20 p-2.5 text-rose-400 shrink-0">
                  <UserX className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    2. Strict Anti-Harassment &amp; Zero Tolerance Policy
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Safety for All Attendees &amp; Female Participants</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                We are fiercely committed to maintaining a secure, dignified, and inclusive environment. <strong>Harassment of any kind will not be tolerated under any circumstances.</strong>
              </p>

              <div className="rounded-xl bg-slate-900/70 border border-rose-900/40 p-4 space-y-3 text-xs sm:text-sm">
                <div className="text-rose-300 font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Zero-Tolerance Guidelines:</span>
                </div>
                <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs sm:text-sm">
                  <li>
                    <strong className="text-white">Strict Protection:</strong> Any offensive comments, derogatory jokes, stalking, unwelcome physical contact, inappropriate staring, non-consensual photography, or intimidation targeted at <strong>female participants, female student volunteers, or any attendee</strong> is strictly forbidden.
                  </li>
                  <li>
                    <strong className="text-rose-400">Immediate Eviction:</strong> Anyone engaging in harassment or inappropriate behavior will be <strong>immediately expelled and removed from the venue premises</strong> without warning.
                  </li>
                  <li>
                    <strong className="text-rose-400">Legal &amp; Disciplinary Consequences:</strong> Organizers will promptly escalate serious infractions to local law enforcement authorities and report the individual to their college/university disciplinary board.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Right of Admission & Neat Demeanor */}
            <section className="rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#3FB1FF]/15 p-2.5 text-[#3FB1FF] shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    3. Right of Admission &amp; Approval Process
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Verification, Orderly Conduct &amp; Decorum</p>
                </div>
              </div>

              <ul className="list-disc pl-5 space-y-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                <li>
                  <strong className="text-white">Registration Is an Application:</strong> Submitting a registration on this portal is a request to attend and does <strong>not</strong> guarantee a seat. Every applicant's AWS Builder Center alias is verified manually. Only participants whose status is updated to <strong>Approved</strong> receive an entry pass.
                </li>
                <li>
                  <strong className="text-white">Organizers' Right to Remove:</strong> Organizers retain the absolute right of admission. Organizers have full discretion to refuse entry, revoke digital credentials, or escort any individual outside the venue for disruptive conduct, insolence, intoxication, or failure to follow coordinator instructions.
                </li>
                <li>
                  <strong className="text-white">Neat &amp; Respectful Demeanor:</strong> Attendees must dress decently, maintain discipline during speaker sessions, keep noise levels courteous, dispose of trash responsibly, and treat all staff and volunteers with respect.
                </li>
              </ul>
            </section>

            {/* Section 4: Swags & International Shipment Disclaimer */}
            <section className="rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#FF57E8]/15 p-2.5 text-[#FF57E8] shrink-0">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    4. Swags &amp; Goodies: USA Dispatch &amp; Transit Disclaimer
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">International Air Cargo &amp; Customs</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Official AWS re:Invent sticker packs, lanyards, and champion winner swags are provided directly by Amazon Web Services and dispatched internationally from the United States.
              </p>

              <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-[#FF57E8] font-bold text-base leading-none">•</span>
                  <span>
                    <strong className="text-white">Courier &amp; Customs Delays:</strong> If promotional swags or merchandise parcels are delayed in international transit, held up by Indian customs clearance, or fail to arrive before event day due to logistics beyond human control, <strong>AWS Student Builder Group Dhule and the organizing committee bear no liability or responsibility</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-[#FF57E8] font-bold text-base leading-none">•</span>
                  <span>
                    Swag quantities, apparel sizes, and giveaways are distributed strictly subject to availability and Kahoot leaderboard performance.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 5: Photography & Media Consent */}
            <section className="rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#05E08A]/15 p-2.5 text-[#05E08A] shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    5. Photography, Media &amp; Retrospectives
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Community Coverage</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                By participating in the event, you consent to being photographed and filmed during keynotes, Kahoot competitions, and the group photo. Images and video clips will be utilized exclusively for community celebration posts, post-event blog summaries, and builder retrospectives on AWS community channels.
              </p>
            </section>

            {/* Section 6: Reporting Violations & Organizer Contacts */}
            <section className="rounded-2xl border border-[#3FB1FF]/40 bg-gradient-to-br from-[#0E1526] via-[#111A30] to-[#0E1526] p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#3FB1FF]/20 p-2.5 text-[#3FB1FF] shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    6. Incident Reporting &amp; Organizer Contacts
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Confidential Incident Reporting</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                If you experience or witness any form of harassment, vandalism, safety hazard, or inappropriate conduct, report it immediately to the organizers on-site or email the organizing team below. All reports will be handled with strict confidentiality and prompt intervention.
              </p>

              <div className="pt-2">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Official Email</div>
                  <div className="font-bold text-white text-sm mt-0.5">AWS Student Builder Group Dhule</div>
                  <a
                    href={`mailto:${EVENT_DETAILS.contactEmail}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#05E08A] hover:underline mt-2"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="break-all">{EVENT_DETAILS.contactEmail}</span>
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* Action Row */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Event Homepage</span>
            </button>

            <button
              onClick={onScrollToRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AB5CFF] to-[#3FB1FF] hover:opacity-95 px-8 py-3 text-xs sm:text-sm font-bold text-[#0E131A] shadow-lg shadow-[#AB5CFF]/20 transition-all cursor-pointer"
            >
              <span>Proceed to Registration →</span>
            </button>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 bg-[#070A12] py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 space-y-2">
          <p>© 2026 AWS Student Builder Group Dhule. All rights reserved.</p>
          <p className="text-[11px] text-slate-600 max-w-2xl mx-auto">
            Amazon Web Services, AWS, and the AWS re:Invent logo are trademarks of Amazon.com, Inc. or its affiliates.
          </p>
        </div>
      </footer>
    </div>
  );
};

