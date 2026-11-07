import React from 'react';
import { Linkedin, Github, ExternalLink, Sparkles, Terminal } from 'lucide-react';
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
              .map((w) => w[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={speaker.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border ${
                  speaker.isAnnouncingSoon
                    ? 'border-dashed border-slate-700/80 bg-[#0E1526]/50'
                    : 'border-slate-800 bg-[#0E1526]/80'
                } p-6 sm:p-7 shadow-lg transition-all hover:border-slate-700 hover:bg-[#0E1526]`}
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: speaker.accent }}
                />

                <div>
                  {/* Top Bar: Avatar & Badges */}
                  <div className="flex items-start justify-between gap-4">
                    {speaker.image ? (
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800 shadow-md">
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            // If photo isn't yet present in public/speaker, hide img and show styled initials fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="hidden h-full w-full items-center justify-center font-bold font-mono text-xl sm:text-2xl shadow-inner"
                          style={{
                            backgroundColor: `${speaker.accent}20`,
                            color: speaker.accent,
                          }}
                        >
                          {initials}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl font-bold font-mono text-xl sm:text-2xl shadow-inner"
                        style={{
                          backgroundColor: `${speaker.accent}20`,
                          color: speaker.accent,
                          border: `1.5px solid ${speaker.accent}50`
                        }}
                      >
                        {initials}
                      </div>
                    )}

                    <div className="flex flex-col items-end gap-2">
                      {speaker.isAnnouncingSoon ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF57E8]/10 border border-[#FF57E8]/30 px-3 py-1 text-[11px] font-mono font-bold text-[#FF57E8] tracking-wide animate-pulse">
                          <Sparkles className="h-3 w-3" />
                          <span>Announcing Soon</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#05E08A]/10 border border-[#05E08A]/30 px-3 py-1 text-[11px] font-mono font-bold text-[#05E08A] tracking-wide">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#05E08A]" />
                          <span>Confirmed Speaker</span>
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {speaker.linkedin && (
                          <a
                            href={speaker.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            aria-label={`${speaker.name} GitHub`}
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="mt-5">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#3FB1FF] transition-colors">
                      {speaker.name}
                    </h3>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {speaker.role}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {speaker.organization}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {speaker.bio}
                  </p>

                  {/* Talk / Session Highlight */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Featured Topic
                    </div>
                    <div className="mt-1 text-xs sm:text-sm font-semibold text-white">
                      {speaker.topic}
                    </div>
                  </div>
                </div>

                {/* Tech & Certification Tags */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {speaker.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded ${
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

        {/* Community Mentorship Callout */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-[#0E1526]/70 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              Want to mentor or showcase your AWS project?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              If you have built an exciting project on AWS or lead a student cloud initiative, connect with the SVKM’s IOT Dhule organizing crew to take the stage.
            </p>
          </div>
          <a
            href="mailto:developersaurabhrajput@gmail.com?subject=AWS%20re%3AInvent%20Dhule%20Mentor%20Inquiry"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700 transition-colors shrink-0"
          >
            <span>Connect with Organizers</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
