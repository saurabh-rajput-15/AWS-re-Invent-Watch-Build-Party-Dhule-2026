import React from 'react';
import { Linkedin, Github, Users, Mail, ExternalLink } from 'lucide-react';
import { CREW, EVENT_DETAILS } from '../data/eventData';

interface TeamMemberMeta {
  focus: string;
  accent: string;
}

const TEAM_META: Record<string, TeamMemberMeta> = {
  'Soham Chaudhari': {
    focus: 'Community Leadership & Cloud Strategy',
    accent: '#3FB1FF',
  },
  'Vaibhav Chaudhari': {
    focus: 'Event Operations & Venue Logistics',
    accent: '#AB5CFF',
  },
  'Saurabh Girase': {
    focus: 'Portal Development & Reception Tech',
    accent: '#05E08A',
  },
  'Abdullah Bandukwala': {
    focus: 'DevOps Mentorship & Cloud Architecture',
    accent: '#FF9F1C',
  },
  'Aashish Ingale': {
    focus: 'Digital Branding & Community Presence',
    accent: '#FF57E8',
  },
  'Bhavesh Dev': {
    focus: 'Stage Coordination & Attendee Journey',
    accent: '#3FB1FF',
  },
};

export const Team: React.FC = () => {
  return (
    <section id="team" className="relative py-20 lg:py-28 border-b border-slate-800/80 bg-[#090D16] overflow-hidden">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-1/4 -z-10 h-96 w-96 rounded-full bg-aws-blue/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-aws-magenta/10 blur-[130px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-aws-blue">
            <Users className="h-3.5 w-3.5 text-aws-blue" />
            <span>06 · Organizing Team</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>AWS Student Builder Group</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Meet the Builders <span className="text-aws-purple">Behind the Party.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Organized by students, for students. The dedicated student leads and developers from AWS Student Builder Group Dhule working around the clock to deliver North Maharashtra&apos;s most memorable cloud experience.
          </p>
        </div>

        {/* Team Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CREW.map((member) => {
            const meta = TEAM_META[member.name] || {
              focus: member.role,
              accent: '#3FB1FF',
            };

            const initials = member.name
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={member.name}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1526]/85 p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-slate-600 hover:bg-[#0E1526] hover:-translate-y-1.5"
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 z-10 transition-all duration-300"
                  style={{ backgroundColor: meta.accent }}
                />

                {/* Subtle radial glow on card hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: meta.accent }}
                />

                <div className="space-y-5">
                  {/* Portrait Photo Frame with 4:5 Aspect Ratio */}
                  <div className="relative w-full aspect-4/5 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-inner group-hover:border-slate-500/80 transition-colors">
                    <img
                      src={member.image}
                      alt={`${member.name} — ${member.role} — AWS re:Invent Dhule 2026`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div
                      className="hidden h-full w-full items-center justify-center font-bold font-mono text-5xl shadow-inner"
                      style={{
                        backgroundColor: `${meta.accent}20`,
                        color: meta.accent,
                      }}
                    >
                      {initials}
                    </div>

                    {/* Gradient bottom scrim to ease photo into card */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#0E1526] via-[#0E1526]/20 to-transparent pointer-events-none" />

                    {/* Top-Right Social Links with Glassmorphism */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 bg-black/70 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white hover:bg-black/90 transition-all hover:scale-110 shadow-lg"
                          aria-label={`${member.name} LinkedIn Profile`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 bg-black/70 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white hover:bg-black/90 transition-all hover:scale-110 shadow-lg"
                          aria-label={`${member.name} GitHub Profile`}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Member Name and Official Role */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-white group-hover:text-aws-blue transition-colors tracking-tight">
                      {member.name}
                    </h3>
                    <div
                      className="text-sm font-semibold font-mono"
                      style={{ color: meta.accent }}
                    >
                      {member.role}
                    </div>
                  </div>

                  {/* Bio / Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-0.5">
                    {member.description}
                  </p>
                </div>

                {/* Bottom Core Responsibility Tag */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate pr-2">{meta.focus}</span>
                  <span className="shrink-0 text-slate-500 font-bold">AWS SBG</span>
                </div>
              </div>
            );
          })}
        </div>

        
      </div>
    </section>
  );
};
