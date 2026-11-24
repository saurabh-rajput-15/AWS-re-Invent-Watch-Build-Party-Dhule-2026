import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Linkedin,
  Github,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CREW } from '../data/eventData';

const TEAM_COLORS: Record<string, string> = {
  'Soham Chaudhari': '#FF9F1C',
  'Vaibhav Chaudhari': '#3FB1FF',
  'Saurabh Girase': '#AB5CFF',
  'Abdullah Bandukwala': '#05E08A',
  'Aashish Ingale': '#FF57E8',
  'Bhavesh Dev': '#3FB1FF',
};

export const Team: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const hasSwiped = useRef(false);

  const total = CREW.length;
  const activeMember = CREW[activeIndex];
  const activeAccent = TEAM_COLORS[activeMember.name] || '#FF9F1C';

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total]
  );

  const handleNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const handlePrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || isDragging) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [isPaused, isDragging, total, activeIndex]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    hasSwiped.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerStartX.current === null || pointerStartY.current === null) {
      return;
    }
    const dx = e.clientX - pointerStartX.current;
    const dy = e.clientY - pointerStartY.current;

    // Prioritize vertical scrolling if vertical motion dominates early
    if (!hasSwiped.current && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      setIsDragging(false);
      setDragX(0);
      pointerStartX.current = null;
      return;
    }

    if (Math.abs(dx) > 6) {
      hasSwiped.current = true;
    }
    setDragX(Math.max(-140, Math.min(140, dx)));
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    if (dragX < -42) {
      handleNext();
    } else if (dragX > 42) {
      handlePrev();
    }
    setIsDragging(false);
    setDragX(0);
    pointerStartX.current = null;
    pointerStartY.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  return (
    <section
      id="team"
      className="relative py-16 sm:py-20 lg:py-28 border-b border-slate-800/80 bg-[#090D16] overflow-hidden"
    >
      {/* Ambient background glow tracking active member accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 -z-10 h-80 w-80 sm:h-96 sm:w-96 rounded-full blur-[130px] opacity-15 transition-colors duration-700"
        style={{ backgroundColor: activeAccent }}
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
            Meet the Builders{' '}
            <span className="text-aws-purple">Behind the Party.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-lg text-slate-300 leading-relaxed">
            Organized by students, for students. Swipe through our core organizing crew from AWS Student Builder Group Dhule powering the event.
          </p>
        </div>

        {/* Main Interactive Deck + Member Details Layout */}
        <div
          className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          aria-roledescription="carousel"
          aria-label="Core Organizing Team Showcase"
        >
          {/* Left / Top: Interactive 3D Fanned Photo Card Stack */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className="relative w-full max-w-[340px] sm:max-w-[390px] h-[330px] sm:h-[385px] lg:h-[405px] flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
            >
              {CREW.map((member, index) => {
                let diff = index - activeIndex;
                if (diff > total / 2) diff -= total;
                if (diff < -total / 2) diff += total;

                const absDiff = Math.abs(diff);
                const isActive = diff === 0;
                const isVisible = absDiff <= 2;

                const memberAccent = TEAM_COLORS[member.name] || '#FF9F1C';
                const initials = member.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2);

                // Symmetric fanned deck positions behind the active card
                let translateX = 0;
                let rotate = 0;
                let scale = 1;
                let zIndex = 30;
                let opacity = 1;

                if (isActive) {
                  translateX = dragX;
                  rotate = dragX * 0.05;
                  scale = 1;
                  zIndex = 30;
                  opacity = 1;
                } else if (absDiff === 1) {
                  translateX = diff * 22;
                  rotate = diff * 6;
                  scale = 0.92;
                  zIndex = 20;
                  opacity = 0.78;
                } else if (absDiff === 2) {
                  translateX = diff * 21;
                  rotate = diff * 5.5;
                  scale = 0.84;
                  zIndex = 10;
                  opacity = 0.45;
                } else {
                  scale = 0.76;
                  zIndex = 0;
                  opacity = 0;
                }

                return (
                  <div
                    key={member.name}
                    role="button"
                    tabIndex={isVisible && !isActive ? 0 : -1}
                    aria-label={
                      isActive
                        ? `${member.name} — active card`
                        : `View ${member.name}`
                    }
                    onClick={() => {
                      if (hasSwiped.current) return;
                      if (!isActive && isVisible) {
                        goTo(index);
                      } else if (isActive) {
                        handleNext();
                      }
                    }}
                    className={`absolute w-[234px] sm:w-[272px] lg:w-[290px] aspect-3/4 rounded-2xl overflow-hidden border shadow-2xl will-change-transform ${
                      isActive && isDragging
                        ? 'transition-none'
                        : 'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
                    } ${
                      isActive
                        ? 'cursor-pointer'
                        : isVisible
                        ? 'border-white/10 grayscale brightness-55 hover:brightness-75 cursor-pointer'
                        : 'pointer-events-none border-transparent'
                    }`}
                    style={{
                      transform: `translate3d(${translateX}px, ${absDiff * 3}px, 0) rotate(${rotate}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                      borderColor: isActive ? `${memberAccent}66` : undefined,
                      boxShadow: isActive
                        ? `0 22px 45px -12px rgba(0, 0, 0, 0.85), 0 0 28px -8px ${memberAccent}30`
                        : undefined,
                    }}
                  >
                    {!failedImages[member.name] ? (
                      <img
                        src={member.image}
                        alt={`${member.name} — ${member.role} — AWS re:Invent Dhule 2026`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover object-top pointer-events-none"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [member.name]: true,
                          }))
                        }
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center font-bold font-mono text-4xl"
                        style={{
                          backgroundColor: `${memberAccent}20`,
                          color: memberAccent,
                        }}
                      >
                        {initials}
                      </div>
                    )}

                    {/* Bottom Dark Gradient & Uppercase Name Label inside Photo */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                    {isActive && (
                      <div className="absolute bottom-3 left-3.5 right-3.5 pointer-events-none">
                        <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.16em] uppercase text-white drop-shadow">
                          {member.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right / Bottom: Crew Telemetry Dossier Card */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-white/12 bg-[#0B101D]/95 p-5 sm:p-7 lg:p-8 shadow-2xl overflow-hidden">
              {/* Top Glowing Edge Line */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-500"
                style={{
                  background: `linear-gradient(90deg, ${activeAccent}00, ${activeAccent}, ${activeAccent}00)`,
                }}
              />

              {/* Member Identity Block */}
              <div className="space-y-5">
                <div>
                  <div
                    className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.18em] uppercase transition-colors duration-300"
                    style={{ color: activeAccent }}
                  >
                    BUILDER NAME
                  </div>
                  <h3 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tight text-white font-display">
                    {activeMember.name}
                  </h3>
                </div>

                <div>
                  <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-slate-500">
                    ROLE / DESIGNATION
                  </div>
                  <div className="mt-1 text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-slate-100">
                    {activeMember.role}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-slate-500">
                    MISSION DIRECTIVE
                  </div>
                  <p className="mt-1.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                    {activeMember.description}
                  </p>
                </div>

                {/* Clean Inline Social Links */}
                <div className="pt-1 flex items-center gap-5">
                  {activeMember.linkedin && (
                    <a
                      href={activeMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 py-1.5 text-xs sm:text-sm font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-slate-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {activeMember.github && (
                    <a
                      href={activeMember.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 py-1.5 text-xs sm:text-sm font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      <Github className="h-4 w-4 text-slate-400" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Footer Carousel Controls */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold tabular-nums text-slate-400">
                  <span style={{ color: activeAccent }}>0{activeIndex + 1}</span>
                  {' / '}0{total}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous team member"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next team member"
                    className="flex h-10 w-10 items-center justify-center rounded-lg font-bold active:scale-95 text-slate-950 transition-all cursor-pointer shadow-lg"
                    style={{ backgroundColor: activeAccent }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
