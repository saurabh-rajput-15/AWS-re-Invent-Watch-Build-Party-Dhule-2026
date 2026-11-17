import React, { useState } from 'react';
import { MapPin, Navigation, Coffee, Car, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

export const Venue: React.FC = () => {
  const [mainView, setMainView] = useState<'photo' | 'map'>('photo');

  return (
    <section id="venue" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#090D16]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-aws-blue">
            <span>05 · Venue &amp; Logistics</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>How to Reach</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Hotel Anand Regency <span className="text-aws-blue">Riverfront.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Conveniently situated along the riverfront in Dhule, Maharashtra. Featuring 2 dedicated halls: the main event, keynote screening, tech talks, and Kahoot battles in <strong className="text-white">Symphony Hall (2nd Floor)</strong>, and buffet lunch in <strong className="text-white">Harmony Hall (3rd Floor)</strong>.
          </p>
        </div>

        {/* 2-Column Split: Venue Card & Picture-in-Picture (PiP) Showcase */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Venue Card - Height matched with visual showcase */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-aws-green font-semibold">
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
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aws-blue/10 text-aws-blue border border-aws-blue/30 font-mono text-xs font-bold">
                      2F
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>Symphony Hall</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-aws-green/10 text-aws-green rounded-full border border-aws-green/30">
                          Main Keynote &amp; Hack Arena
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Live keynote stream, builder sessions, lightning talks &amp; Kahoot battles.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aws-orange/10 text-aws-orange border border-aws-orange/30 font-mono text-xs font-bold">
                      3F
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>Harmony Hall</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-aws-orange/10 text-aws-orange rounded-full border border-aws-orange/30">
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
                    <Coffee className="h-4 w-4 text-aws-green shrink-0" />
                    <span>Buffet Lunch (3F)</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 border border-slate-800/80 px-3 py-2.5">
                    <Car className="h-4 w-4 text-aws-purple shrink-0" />
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-aws-blue to-aws-green py-3.5 px-5 text-xs font-bold text-slate-950 hover:opacity-95 shadow-lg shadow-aws-blue/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Picture-in-Picture (PiP) Visual Showcase */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Main Display Container with PiP Overlay */}
            <div className="relative w-full flex-1 min-h-[460px] sm:min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0E1526] shadow-2xl flex flex-col">
              {mainView === 'photo' ? (
                /* MAIN: Full Crisp Venue Photo (Zero obscuring overlays on hotel signage) */
                <div className="relative w-full h-full flex-1 flex flex-col">
                  <img
                    src="/Anand-Regency-Riverfront.png"
                    alt="Hotel Anand Regency Riverfront, Dhule"
                    className="w-full h-full flex-1 object-cover object-center"
                  />

                  {/* Minimal Top-Left Venue Tag (Tucked in corner so logo stays completely clear) */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2 rounded-lg bg-[#090D16]/80 px-3 py-1.5 text-xs font-mono text-white backdrop-blur-md border border-slate-700/70 shadow-md pointer-events-none">
                    <span className="inline-block h-2 w-2 rounded-full bg-aws-green animate-pulse" />
                    <span>Hotel Anand Regency Riverfront</span>
                  </div>

                  {/* Picture-in-Picture Mini-Map Card (Docked Bottom-Right) */}
                  <div
                    onClick={() => setMainView('map')}
                    className="absolute bottom-4 right-4 z-20 w-48 sm:w-60 h-32 sm:h-40 rounded-xl border-2 border-slate-700/90 hover:border-aws-blue bg-[#0E1526] shadow-2xl shadow-black/90 overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105"
                    title="Click to view Interactive Google Map"
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2209.404391763241!2d74.7752237501776!3d20.906515648056256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdec5006400aae3%3A0x3b7ea5e71530202!2sHotel%20Anand%20Regency%20Riverfront!5e1!3m2!1sen!2sin!4v1794039464594!5m2!1sen!2sin"
                      title="Mini Map Preview"
                      className="w-full h-full border-0 pointer-events-none filter contrast-125 brightness-90 opacity-85 group-hover:opacity-100 transition-opacity"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    {/* PiP Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-white backdrop-blur border border-white/10 flex items-center gap-1 pointer-events-none">
                      <MapPin className="h-3 w-3 text-aws-blue" />
                      <span>Live Map</span>
                    </div>
                    {/* Hover Prompt */}
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white gap-1.5 pointer-events-none">
                      <Maximize2 className="h-3.5 w-3.5 text-aws-blue" />
                      <span>Click to View Map</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* MAIN: Full Interactive Google Map Embed */
                <div className="relative w-full h-full flex-1 flex flex-col">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2209.404391763241!2d74.7752237501776!3d20.906515648056256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdec5006400aae3%3A0x3b7ea5e71530202!2sHotel%20Anand%20Regency%20Riverfront!5e1!3m2!1sen!2sin!4v1794039464594!5m2!1sen!2sin"
                    title="Map to Hotel Anand Regency Riverfront Dhule"
                    className="w-full h-full flex-1 border-0"
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />

                  {/* Minimal Top-Left Map Tag */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2 rounded-lg bg-[#090D16]/85 px-3 py-1.5 text-xs font-mono text-white backdrop-blur-md border border-slate-700/70 shadow-md pointer-events-none">
                    <span className="inline-block h-2 w-2 rounded-full bg-aws-blue animate-pulse" />
                    <span>Interactive Map · Dhule</span>
                  </div>

                  {/* Picture-in-Picture Mini-Photo Card (Docked Bottom-Right) */}
                  <div
                    onClick={() => setMainView('photo')}
                    className="absolute bottom-4 right-4 z-20 w-48 sm:w-60 h-32 sm:h-40 rounded-xl border-2 border-slate-700/90 hover:border-aws-green bg-[#0E1526] shadow-2xl shadow-black/90 overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105"
                    title="Click to view Venue Façade Photo"
                  >
                    <img
                      src="/Anand-Regency-Riverfront.png"
                      alt="Venue Façade thumbnail"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* PiP Badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono text-white backdrop-blur border border-white/10 flex items-center gap-1 pointer-events-none">
                      <ImageIcon className="h-3 w-3 text-aws-green" />
                      <span>Venue Photo</span>
                    </div>
                    {/* Hover Prompt */}
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white gap-1.5 pointer-events-none">
                      <Maximize2 className="h-3.5 w-3.5 text-aws-green" />
                      <span>Click to View Photo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
