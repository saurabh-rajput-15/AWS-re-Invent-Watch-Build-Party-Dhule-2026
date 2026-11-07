import React, { useState } from 'react';
import { MapPin, Navigation, Wifi, Zap, Coffee, Car, ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { EVENT_DETAILS, FAQS } from '../data/eventData';

export const Venue: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

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
            Conveniently situated along the riverfront in Dhule, Maharashtra. Featuring executive auditorium screening halls, air-conditioned breakout rooms for the build sprint, and dedicated high-speed developer workstations.
          </p>
        </div>

        {/* 2-Column Split: Venue Card & Google Map Embed */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Venue Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-6 sm:p-7 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-[#05E08A] font-semibold">
                <MapPin className="h-4 w-4" />
                <span>OFFICIAL DESTINATION</span>
              </div>

              <h3 className="mt-2 text-2xl font-bold text-white">
                Hotel Anand Regency Riverfront
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Near Panzara Riverfront, Dhule, Maharashtra 424001
              </p>

              {/* Day Timetable */}
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-in:</span>
                  <span className="text-white font-bold">09:00 AM – 09:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Opening Inauguration:</span>
                  <span className="text-[#3FB1FF] font-bold">09:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kahoot Arena &amp; Awards:</span>
                  <span className="text-[#05E08A] font-bold">01:30 PM – 03:45 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Event Conclusion:</span>
                  <span className="text-[#FF57E8] font-bold">04:00 PM</span>
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2.5">
                  <Wifi className="h-4 w-4 text-[#3FB1FF]" />
                  <span>High-speed Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2.5">
                  <Zap className="h-4 w-4 text-[#FF9F1C]" />
                  <span>Workstation Power</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2.5">
                  <Coffee className="h-4 w-4 text-[#05E08A]" />
                  <span>Lunch &amp; Refreshments</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-800/40 p-2.5">
                  <Car className="h-4 w-4 text-[#AB5CFF]" />
                  <span>Attendee Parking</span>
                </div>
              </div>

              {/* Directions Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={EVENT_DETAILS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#3FB1FF] py-3 px-4 text-xs font-bold text-slate-950 hover:bg-[#60c2ff] transition-all"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Turn-by-Turn Directions</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Hotel+Anand+Regency+Riverfront+Dhule"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 hover:text-white"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* Embedded Google Map Frame */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1526] shadow-xl">
              <div className="absolute top-3 left-3 z-10 rounded-lg bg-[#0E1526]/90 px-3 py-1.5 text-xs font-mono text-white backdrop-blur-sm border border-slate-700">
                📍 Hotel Anand Regency Riverfront
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2209.404391763241!2d74.7752237501776!3d20.906515648056256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdec5006400aae3%3A0x3b7ea5e71530202!2sHotel%20Anand%20Regency%20Riverfront!5e1!3m2!1sen!2sin!4v1794039464594!5m2!1sen!2sin"
                title="Map to Hotel Anand Regency Riverfront Dhule"
                className="w-full h-[400px] sm:h-[460px] border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div id="faq" className="mt-20 pt-16 border-t border-slate-800">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#FF57E8]">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Everything you need to know.
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Have questions about eligibility, team requirements, or what to bring? Check our answers below.
            </p>
          </div>

          <div className="mt-8 space-y-3 max-w-4xl">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-800/90 bg-[#0E1526]/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white hover:text-[#3FB1FF] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#3FB1FF]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Need help contact card */}
          <div className="mt-10 rounded-2xl border border-slate-800 bg-[#0E1526]/80 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 max-w-4xl shadow-xl">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-[#05E08A]/10 p-3 text-[#05E08A] shrink-0">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white">Have questions about the venue or event?</div>
                <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    <strong className="text-white">Soham Chaudhari</strong> <span className="text-slate-400 font-mono text-[11px]">(SBG Lead)</span>:{' '}
                    <a href="tel:9834382337" className="text-[#05E08A] font-mono font-bold hover:underline">
                      +91 98343 82337
                    </a>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">·</span>
                  <span>
                    <strong className="text-white">Saurabh Rajput</strong> <span className="text-slate-400 font-mono text-[11px]">(Organizer)</span>:{' '}
                    <a href="tel:9890991510" className="text-[#05E08A] font-mono font-bold hover:underline">
                      +91 98909 91510
                    </a>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="tel:9834382337"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#05E08A] hover:bg-[#0fd686] px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Soham</span>
              </a>
              <a
                href="tel:9890991510"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-white transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Saurabh</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
