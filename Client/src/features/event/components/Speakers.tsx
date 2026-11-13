import React from 'react';
import { Linkedin, Github, Sparkles, Terminal } from 'lucide-react';
import { SPEAKERS } from '../data/eventData';

export const Speakers: React.FC = () => {
  return (
    <section id="speakers" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#090D16]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#FF57E8]">
            <span>03 · Mentors &amp; Speakers</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Cloud Practitioners</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Learn from those who <span className="text-[#FF57E8]">build and ship.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Our sessions and afternoon build sprint are guided by AWS Community Builders, college faculty advisors, and experienced solutions architects ready to help you navigate cloud architectures.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8">
          {SPEAKERS.map((speaker) => {
            const initials = speaker.name
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={speaker.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${
                  speaker.isAnnouncingSoon
                    ? 'border-dashed border-slate-700/80 bg-[#0E1526]/50'
                    : 'border-slate-800 bg-[#0E1526]/85'
                } p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-slate-600 hover:bg-[#0E1526] hover:-translate-y-1`}
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 z-10"
                  style={{ backgroundColor: speaker.accent }}
                />

                <div className="space-y-5">
                  {/* Speaker Profile Photo in 5:4 Portrait Ratio (scaled down with max-width) */}
                  <div className="relative w-full max-w-[280px] sm:max-w-[300px] mx-auto aspect-[4/5] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-inner group-hover:border-slate-500/80 transition-colors">
                    {speaker.image ? (
                      <>
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="h-full w-full object-cover object-[center_18%] transition-transform duration-700 ease-out group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="hidden h-full w-full items-center justify-center font-bold font-mono text-5xl shadow-inner"
                          style={{
                            backgroundColor: `${speaker.accent}20`,
                            color: speaker.accent,
                          }}
                        >
                          {initials}
                        </div>
                      </>
                    ) : (
                      <div
                        className="flex h-full w-full flex-col items-center justify-center p-6 text-center relative overflow-hidden"
                        style={{
                          backgroundColor: `${speaker.accent}0d`,
                        }}
                      >
                        {/* Ambient glow in background */}
                        <div
                          className="absolute w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                          style={{ backgroundColor: speaker.accent }}
                        />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/40 border border-[#FF57E8]/30 shadow-lg">
                            <Sparkles className="h-8 w-8 text-[#FF57E8] animate-pulse" />
                          </div>
                          <span className="text-sm font-mono font-bold tracking-widest uppercase text-slate-300">
                            Second Speaker
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Keynote Speaker · Announcing Soon
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Gradient bottom scrim to ease transition into text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1526] via-[#0E1526]/15 to-transparent pointer-events-none" />

                    {/* Status Badge in Top-Left */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      {speaker.isAnnouncingSoon ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF57E8]/20 backdrop-blur-md border border-[#FF57E8]/40 px-3 py-1 text-[11px] font-mono font-bold text-[#FF57E8] tracking-wide shadow-md animate-pulse">
                          <Sparkles className="h-3 w-3" />
                          <span>Announcing Soon</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#05E08A]/20 backdrop-blur-md border border-[#05E08A]/40 px-3 py-1 text-[11px] font-mono font-bold text-[#05E08A] tracking-wide shadow-md">
                          <span className="h-2 w-2 rounded-full bg-[#05E08A] animate-ping" />
                          <span>Confirmed Speaker</span>
                        </span>
                      )}
                    </div>

                    {/* Social Links in Top-Right */}
                    <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl p-2.5 bg-black/70 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white hover:bg-black/90 transition-all hover:scale-105 shadow-lg"
                          aria-label={`${speaker.name} LinkedIn`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {speaker.github && (
                        <a
                          href={speaker.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl p-2.5 bg-black/70 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white hover:bg-black/90 transition-all hover:scale-105 shadow-lg"
                          aria-label={`${speaker.name} GitHub`}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Name, Role & Organization */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-[#3FB1FF] transition-colors tracking-tight">
                      {speaker.name}
                    </h3>
                    <div className="text-sm sm:text-base font-semibold text-[#05E08A]">
                      {speaker.role}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {speaker.organization}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                    {speaker.bio}
                  </p>

                  {/* Talk / Session Highlight Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                    <div className="text-[11px] font-mono text-[#3FB1FF] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-[#3FB1FF]" />
                      <span>Featured Session</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white leading-snug">
                      {speaker.topic}
                    </div>
                  </div>
                </div>

                {/* Tech & Certification Tags */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {speaker.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className={`text-[11px] font-mono px-3 py-1 rounded-lg ${
                        tag.includes('CKA') || tag.includes('Community Builder')
                          ? 'bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30 font-semibold'
                          : 'text-slate-300 bg-slate-800/70 border border-slate-700/50'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
