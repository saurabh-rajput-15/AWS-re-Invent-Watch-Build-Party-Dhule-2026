import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Plus, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { AGENDA_SESSIONS, EVENT_DETAILS } from '../data/eventData';
import { TrackCategory, AgendaSession } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

export const Agenda: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TrackCategory>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>('keynote-stream');

  const filteredSessions = selectedCategory === 'all'
    ? AGENDA_SESSIONS
    : AGENDA_SESSIONS.filter((s) => s.category === selectedCategory);

  const categories: { key: TrackCategory; label: string }[] = [
    { key: 'all', label: 'All Sessions' },
    { key: 'keynote', label: 'Keynotes & Screening' },
    { key: 'build', label: 'Watch & Build Sprint' },
    { key: 'workshop', label: 'Workshops & Networking' }
  ];

  return (
    <section id="agenda" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#0A0F1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#05E08A]">
              <span>02 · Event Flow</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Full Day Schedule</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Engineered for <span className="text-[#05E08A]">momentum.</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl">
              09:00 AM to 04:00 PM IST at Hotel Anand Regency Riverfront. From live keynote screenings to the hands-on building sprint and project demos.
            </p>
          </div>

          {/* Interactive Track Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-[#0E1526] p-1.5 rounded-xl border border-slate-800 max-w-full overflow-x-auto shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-[#05E08A] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Sessions List */}
        <div className="mt-10 space-y-4">
          {filteredSessions.map((session, idx) => {
            const isExpanded = expandedSessionId === session.id;

            return (
              <div
                key={session.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0E1526]/80 p-5 sm:p-6 transition-all hover:border-slate-700 hover:bg-[#0E1526]"
              >
                {/* Visual accent indicator */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: session.accentColor }}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Time & Track Category unboxed text */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{session.time}</span>
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span style={{ color: session.accentColor }} className="font-semibold">
                        {session.categoryLabel}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                      </span>
                    </div>

                    {/* Session Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#3FB1FF] transition-colors">
                      {session.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {session.description}
                    </p>

                    {/* Speaker Info */}
                    <div className="pt-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-200">{session.speaker}</span>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span>{session.speakerRole}</span>
                    </div>

                    {/* Prerequisites if any */}
                    {session.prerequisites && session.prerequisites.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="font-mono text-slate-500">Prerequisites:</span>
                        {session.prerequisites.map((req, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-mono text-slate-300"
                          >
                            <CheckCircle2 className="h-3 w-3 text-[#05E08A]" />
                            <span>{req}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Single-Session Add to Calendar */}
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => {
                        const googleUrl = getGoogleCalendarUrl(
                          `${session.title} (AWS re:Invent Dhule)`,
                          session.description,
                          `${EVENT_DETAILS.venueName}, ${session.location}`
                        );
                        window.open(googleUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                      title="Add this session to Google Calendar"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#3FB1FF]" />
                      <span>Sync Calendar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Add Calendar Reminder Banner */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-[#0E1526]/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#3FB1FF]/10 p-2.5 text-[#3FB1FF]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Save the full day to your calendar</div>
              <div className="text-xs text-slate-400">Friday, December 4, 2026 · 09:00 AM – 04:00 PM IST</div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={EVENT_DETAILS.calendarGoogleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none text-center rounded-xl bg-[#3FB1FF] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-[#60c2ff] transition-colors"
            >
              Add to Google Calendar
            </a>
            <button
              onClick={() => downloadIcsFile()}
              className="flex-1 sm:flex-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Download .ics
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
