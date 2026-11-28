import React from 'react';
import {
  UtensilsCrossed,
  Gift,
  Cloud,
  Users,
  Laptop,
  Sparkles,
  PartyPopper,
  ArrowRight,
  CheckCircle2,
  Sparkle
} from 'lucide-react';
import { EVENT_BENEFITS } from '../data/eventData';

interface BenefitsProps {
  onScrollToRegister?: () => void;
}

export const Benefits: React.FC<BenefitsProps> = ({ onScrollToRegister }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'lunch':
        return UtensilsCrossed;
      case 'swags':
        return Gift;
      case 'credits':
        return Cloud;
      case 'networking':
        return Users;
      case 'learning':
        return Laptop;
      case 'announcements':
        return Sparkles;
      case 'activities':
        return PartyPopper;
      default:
        return Sparkles;
    }
  };

  return (
    <section id="benefits" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#0A0F1D] overflow-hidden">
      {/* Background glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-aws-orange/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-aws-blue/10 blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-aws-orange">
            <span>02 · What You'll Get</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Exclusive Benefits</span>
          </div>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            More than just a watch party,{' '}
            <span className="text-aws-orange">an exclusive experience.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            We're making this more than just a watch party! Get ready for a full day packed with exciting experiences and exclusive benefits:
          </p>
        </div>

        {/* Benefits Bento Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENT_BENEFITS.map((benefit, index) => {
            const IconComponent = getIcon(benefit.id);
            const isWideOnDesktop = benefit.id === 'lunch' || benefit.id === 'activities';
            const isWideOnTablet = benefit.id === 'activities';

            return (
              <div
                key={benefit.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0E1526]/80 p-6 sm:p-7 shadow-xl transition-all duration-300 hover:border-slate-700 hover:bg-[#0E1526] hover:-translate-y-1 ${
                  isWideOnDesktop ? 'lg:col-span-2' : 'lg:col-span-1'
                } ${isWideOnTablet ? 'md:col-span-2' : 'md:col-span-1'}`}
              >
                {/* Top accent color bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                  style={{ backgroundColor: benefit.accent }}
                />

                <div>
                  {/* Card Header: Icon & Tags */}
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors group-hover:scale-105 duration-300"
                      style={{
                        backgroundColor: `${benefit.accent}15`,
                        borderColor: `${benefit.accent}30`,
                        color: benefit.accent,
                      }}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wider uppercase border"
                        style={{
                          backgroundColor: `${benefit.accent}10`,
                          borderColor: `${benefit.accent}25`,
                          color: benefit.accent,
                        }}
                      >
                        {benefit.tag}
                      </span>
                      <span className="hidden sm:inline-block font-mono text-xs font-bold text-slate-500">
                        0{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="mt-5 text-xl font-bold text-white group-hover:text-white transition-colors flex items-center gap-2">
                    <span>{benefit.title}</span>
                  </h3>

                  {/* Card Description */}
                  <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Card Footer: Category pill & subtle indicator */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {benefit.category}
                  </span>
                  <div
                    className="flex items-center gap-1 font-mono font-semibold transition-transform group-hover:translate-x-0.5"
                    style={{ color: benefit.accent }}
                  >
                    <span>Included</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Banner with Fast Registration CTA */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-linear-to-br from-[#0E1526] via-[#121b33] to-[#0E1526] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-aws-green/10 blur-3xl pointer-events-none"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-aws-green uppercase">
                <Sparkle className="h-3.5 w-3.5" />
                <span>100% Free for Confirmed Attendees</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white">
                All 7 benefits are completely complimentary.
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Lunch at Hotel Anand Regency, official AWS merchandise, vouchers, and keynote sessions are fully covered. Reserve your verified pass before seats fill up.
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="/register"
                onClick={(e) => {
                  if (onScrollToRegister && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onScrollToRegister();
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-aws-orange hover:bg-[#ffaa33] px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-aws-orange/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>Claim Your Pass</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

