import React from 'react';
import { MapPin, Navigation, Coffee, Car } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

export const Venue: React.FC = () => {
  return (
    <section id="venue" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#090D16]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#3FB1FF]">
            <span>05 · Venue &amp; Logistics</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>How to Reach</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Hotel Anand Regency <span className="text-[#3FB1FF]">Riverfront.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Conveniently situated along the riverfront in Dhule, Maharashtra. Featuring 2 dedicated halls: the main event, keynote screening, tech talks, and Kahoot battles in <strong className="text-white">Symphony Hall (2nd Floor)</strong>, and buffet lunch in <strong className="text-white">Harmony Hall (3rd Floor)</strong>.
          </p>
        </div>

        {/* 2-Column Split: Venue Card & Google Map Embed */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Venue Card - Height matched with map */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#05E08A] font-semibold">
                  <MapPin className="h-4 w-4" />
                  <span>OFFICIAL DESTINATION</span>
                </div>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  Hotel Anand Regency Riverfront
                </h3>
                <p className="mt-1.5 text-sm text-slate-300">
                  Near Panzara Riverfront, Dhule, Maharashtra 424001
                </p>

                {/* Dedicated Event Halls */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3FB1FF]/10 text-[#3FB1FF] border border-[#3FB1FF]/30 font-mono text-xs font-bold">
                      2F
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>Symphony Hall</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#05E08A]/10 text-[#05E08A] rounded-full border border-[#05E08A]/30">
                          Main Keynote &amp; Hack Arena
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Live keynote stream, builder sessions, lightning talks &amp; Kahoot battles.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF9F1C]/10 text-[#FF9F1C] border border-[#FF9F1C]/30 font-mono text-xs font-bold">
                      3F
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>Harmony Hall</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FF9F1C]/10 text-[#FF9F1C] rounded-full border border-[#FF9F1C]/30">
                          Buffet Networking
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Complimentary lunch buffet, refreshments &amp; mentor meetups.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Amenities Badges */}
                <div className="mt-6 grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800/80 px-3 py-2.5">
                    <Coffee className="h-4 w-4 text-[#05E08A] shrink-0" />
                    <span>Buffet Lunch (3F)</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800/80 px-3 py-2.5">
                    <Car className="h-4 w-4 text-[#AB5CFF] shrink-0" />
                    <span>Free Attendee Parking</span>
                  </div>
                </div>
              </div>

              {/* Single Clear Primary Navigation Button */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <a
                  href={EVENT_DETAILS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3FB1FF] to-[#05E08A] py-3.5 px-5 text-xs font-bold text-slate-950 hover:opacity-95 shadow-lg shadow-[#3FB1FF]/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Embedded Google Map Frame - Shows vibrant color on hover */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1526] shadow-xl flex-1 flex flex-col min-h-[420px] transition-all duration-300 hover:border-slate-700">
              {/* Floating Map Pin Badge */}
              <div className="absolute top-3 left-10 z-10 rounded-lg bg-[#0E1526]/90 px-3 py-1.5 text-xs font-mono text-white backdrop-blur-md border border-slate-700/80 shadow-md flex items-center gap-1.5 pointer-events-none">
                <span className="inline-block h-2 w-2 rounded-full bg-[#05E08A] animate-pulse" />
                <span>Hotel Anand Regency Riverfront</span>
              </div>

              {/* Hover indicator tooltip */}
              <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-[#0E1526]/85 px-2.5 py-1 text-[11px] font-mono text-slate-400 backdrop-blur-md border border-slate-700/60 opacity-80 group-hover:opacity-0 transition-opacity pointer-events-none">
                Hover to explore map
              </div>

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2209.404391763241!2d74.7752237501776!3d20.906515648056256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdec5006400aae3%3A0x3b7ea5e71530202!2sHotel%20Anand%20Regency%20Riverfront!5e1!3m2!1sen!2sin!4v1794039464594!5m2!1sen!2sin"
                title="Map to Hotel Anand Regency Riverfront Dhule"
                className="w-full h-full flex-1 min-h-[380px] border-0 grayscale contrast-125 brightness-90 opacity-85 transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:opacity-100"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
