import React from 'react';
import { Handshake, HeartHandshake, Building2, Sparkles, Mail, ArrowUpRight } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface Partner {
  id: string;
  name: string;
  category: string;
  categoryBadgeColor: string;
  logo: string;
  logoAlt: string;
  description: string;
  website?: string;
  accent: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'arif',
    name: 'ARIF ( AI Research and Innovation Forum)',
    category: 'Community Partner',
    categoryBadgeColor: 'text-aws-green border-aws-green/30 bg-aws-green/10',
    logo: '/ARIF-white.png',
    logoAlt: 'ARIF — AI Research and Innovation Forum Community Partner',
    description: 'Empowering regional startups, rural entrepreneurship, and supporting student innovators across North Maharashtra.',
    accent: '#05E08A',
  },
  {
    id: 'awssbg',
    name: 'AWS Student Builder Group Dhule',
    category: 'Organizing Host',
    categoryBadgeColor: 'text-aws-blue border-aws-blue/30 bg-aws-blue/10',
    logo: '/AWS_Builder.png',
    logoAlt: 'AWS Student Builder Group Dhule — Official Organizing Group ',
    description: 'Official collegiate developer community driving hands-on cloud skills, certifications, and architectural workshops.',
    accent: '#3FB1FF',
  },

];

export const Partners: React.FC = () => {
  return (
    <section id="partners" className="relative py-20 lg:py-28 border-b border-slate-800/80 bg-[#0A0F1D] overflow-hidden">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/3 -z-10 h-96 w-96 rounded-full bg-aws-green/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/4 -z-10 h-96 w-96 rounded-full bg-aws-blue/10 blur-[130px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-aws-green">
            <Handshake className="h-3.5 w-3.5 text-aws-green" />
            <span>07 · Partners &amp; Supporters</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Ecosystem Collaborators</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Backed by Visionary <span className="text-aws-green">Community Partners.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            We are proud to collaborate with leading incubation centers, collegiate institutions, and hospitality partners who believe in empowering student builders and fostering technological growth across Khandesh.
          </p>
        </div>

        {/* Featured Partners Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {PARTNERS.map((partner) => {
            return (
              <div
                key={partner.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0E1526]/85 p-6 sm:p-7 shadow-xl transition-all duration-300 hover:border-slate-600 hover:bg-[#0E1526] hover:-translate-y-1.5"
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
                  style={{ backgroundColor: partner.accent }}
                />

                <div className="space-y-6">
                  {/* Category Pill */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider border ${partner.categoryBadgeColor}`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{partner.category}</span>
                    </span>
                  </div>

                  {/* Logo Display Box */}
                  <div className="relative flex h-32 sm:h-36 w-full items-center justify-center rounded-xl border border-slate-700/60 bg-slate-950/70 p-5 group-hover:border-slate-500/70 transition-colors">
                    <img
                      src={partner.logo}
                      alt={partner.logoAlt}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Partner Details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-aws-green transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <HeartHandshake className="h-3.5 w-3.5" style={{ color: partner.accent }} />
                    <span className="font-semibold text-slate-300">Official Supporter</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Dhule 2026</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sponsor & Partner Invitation Banner */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-linear-to-br from-[#0E1526] via-[#111A2E] to-[#0E1526] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-aws-green/10 blur-3xl pointer-events-none"
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-aws-green uppercase">
                <Building2 className="h-4 w-4" />
                <span>Partner with AWS re:Invent Dhule</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interested in supporting or sponsoring the event?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Reach over 300+ passionate student developers, cloud builders, and faculty across Khandesh. Connect with our team to explore community partnerships, developer goodies sponsorship, or recruitment access.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`mailto:${EVENT_DETAILS.contactEmail}?subject=Sponsorship%20%26%20Partnership%20Inquiry%20-%20AWS%20re%3AInvent%20Dhule%202026`}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-aws-green to-aws-blue px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-aws-green/20"
              >
                <Mail className="h-4 w-4" />
                <span>Become a Partner / Sponsor</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
