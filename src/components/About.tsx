import React from 'react';
import { Tv, Cpu, Network, Award, Zap, Code, ShieldCheck } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#090D16]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#3FB1FF]">
            <span>01 · The Concept</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Why Join</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Three core tracks,{' '}
            <span className="text-[#3FB1FF]">one transformative day.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Every December, AWS re:Invent in Las Vegas reveals the future of cloud computing and AI. The AWS Student Builder Group at SVKM’s IOT Dhule brings that epicenter of innovation to Hotel Anand Regency Riverfront—combining big-screen keynote screenings with an interactive live Kahoot Cloud Arena and community networking.
          </p>
        </div>

        {/* 3 Pillars Bento Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Watch */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-7 shadow-lg transition-transform hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#3FB1FF]" />
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-mono text-[#3FB1FF]">01</span>
              <div className="rounded-xl bg-[#3FB1FF]/10 p-3 text-[#3FB1FF]">
                <Tv className="h-6 w-6" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">
              Watch the Keynotes
            </h3>
            <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
              Experience the big announcements on high-definition projection screens. Catch Dr. Werner Vogels and AWS executives as they unveil next-generation cloud architectures, AI foundation models, and serverless compute primitives.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-mono text-[#3FB1FF]">
              <span>Curated Stream</span>
              <span aria-hidden="true">·</span>
              <span>Live Commentary</span>
            </div>
          </div>

          {/* Card 2: Kahoot Cloud Arena */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-7 shadow-lg transition-transform hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#05E08A]" />
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-mono text-[#05E08A]">02</span>
              <div className="rounded-xl bg-[#05E08A]/10 p-3 text-[#05E08A]">
                <Award className="h-6 w-6" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">
              Kahoot Cloud Arena
            </h3>
            <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
              Put your knowledge and quick reflexes to the test! Compete in real-time on your smartphone across multiple Kahoot rounds covering keynote announcements, cloud architectures, and tech trivia to top the giant live leaderboard.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-mono text-[#05E08A]">
              <span>Live Mobile Battles</span>
              <span aria-hidden="true">·</span>
              <span>Instant Leaderboard</span>
            </div>
          </div>

          {/* Card 3: Connect & Win */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-7 shadow-lg transition-transform hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF57E8]" />
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-mono text-[#FF57E8]">03</span>
              <div className="rounded-xl bg-[#FF57E8]/10 p-3 text-[#FF57E8]">
                <Network className="h-6 w-6" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-white">
              Connect &amp; Win Swags
            </h3>
            <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
              Network with 300+ fellow student builders, collegiate cloud captains, and industry practitioners. Cheer for the Kahoot champions on stage, participate in lightning talks, and take home official re:Invent swags and certificates.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-mono text-[#FF57E8]">
              <span>Certificates</span>
              <span aria-hidden="true">·</span>
              <span>Exclusive Swag</span>
            </div>
          </div>
        </div>

        {/* Quantified Impact / Stats Strip */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-[#0E1526]/60 p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#3FB1FF] font-mono tabular-nums">
              300+
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
              Student Builders
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0E1526]/60 p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#05E08A] font-mono tabular-nums">
              7 Hours
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
              Immersive Agenda (9 AM – 4 PM)
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0E1526]/60 p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#FF57E8] font-mono tabular-nums">
              100%
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
              Free with Lunch &amp; Swags
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0E1526]/60 p-5 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#FF9F1C] font-mono tabular-nums">
              SVKM
            </div>
            <div className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
              IOT Dhule Host Institution
            </div>
          </div>
        </div>

        {/* Community Host Banner with Official Logos */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-[#0E1526]/90 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <img
              src="/AWS_Builder.png"
              alt="AWS Student Builder Group at SVKM's IOT Dhule"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
            <div className="hidden sm:block h-12 w-px bg-slate-800" />
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3FB1FF]">
                Official Community Host
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                AWS Student Builder Group · SVKM’s Institute of Technology, Dhule
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Organized to empower students and local cloud developers with direct hands-on immersion into the newest AWS architectures, AI primitives, and industry mentorship.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs">
                <span>
                  <strong className="text-white">Soham Chaudhari</strong> <span className="text-slate-400 font-mono text-[11px]">(SBG Lead)</span>:{' '}
                  <a href="tel:9834382337" className="font-mono font-bold text-[#05E08A] hover:underline">
                    📞 +91 98343 82337
                  </a>
                </span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span>
                  <strong className="text-white">Saurabh Rajput</strong> <span className="text-slate-400 font-mono text-[11px]">(Organizer)</span>:{' '}
                  <a href="tel:9890991510" className="font-mono font-bold text-[#05E08A] hover:underline">
                    📞 +91 98909 91510
                  </a>
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <img
              src="/AWS_reinvent-dark.png"
              alt="AWS re:Invent Dhule 2026"
              className="h-26 sm:h-18 md:h-26 w-auto object-contain opacity-95"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
