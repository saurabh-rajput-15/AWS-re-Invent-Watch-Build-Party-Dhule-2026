import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { EVENT_DETAILS, FAQS } from '../data/eventData';

export const FAQ: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="relative py-20 lg:py-28 border-b border-slate-800/80 bg-[#090D16]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Sticky Heading Column - Stays pinned on scroll until last question */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 xl:top-32 self-start space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#FF57E8]">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>06 · FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08]">
              Frequently Asked<br />
              <span className="text-[#3FB1FF]">Questions</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md pt-1">
              Have questions about eligibility, team requirements, registration passes, or what to bring? Check our answers.
            </p>

            {/* Quick Support Card */}
            <div className="pt-2">
              <div className="rounded-xl border border-slate-800/90 bg-[#0E1526]/80 p-4 max-w-md">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#05E08A] animate-pulse" />
                  <span>Still have questions?</span>
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Email the organizing team for assistance.
                </p>
                <a
                  href={`mailto:${EVENT_DETAILS.contactEmail}`}
                  className="mt-2 inline-block max-w-full break-all text-xs font-semibold text-[#3FB1FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3FB1FF]"
                >
                  {EVENT_DETAILS.contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Right FAQ List Column - Minimal line-separated accordion matching reference */}
          <div className="lg:col-span-7 divide-y divide-slate-800 border-t border-b border-slate-800">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div key={faq.id} className="py-5 sm:py-6 group transition-colors">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${
                        isOpen ? 'text-[#3FB1FF]' : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#FF9F1C]' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm sm:text-base text-slate-400 leading-relaxed pr-4 sm:pr-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
