import React from 'react';

export const Ticker: React.FC = () => {
  const sequence = [
    { text: 'WATCH', color: '#3FB1FF' },
    { text: 'BUILD', color: '#05E08A' },
    { text: 'CONNECT', color: '#FF57E8' },
    { text: 'SHIP', color: '#FF9F1C' },
    { text: 're:INVENT', color: '#AB5CFF' }
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-[#2A3342] bg-[#0E131A] py-3.5 sm:py-4 select-none">
      <div className="flex w-max animate-[marquee_26s_linear_infinite] whitespace-nowrap font-mono font-bold text-xl sm:text-2xl md:text-[26px] tracking-[0.04em]">
        {/* Repeat sequence 4 times for seamless continuous horizontal scroll */}
        {[...Array(4)].map((_, repIdx) => (
          <div key={repIdx} className="flex items-center">
            {sequence.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="mx-4 sm:mx-6 text-slate-400" aria-hidden="true">✦</span>
                <span style={{ color: item.color }}>{item.text}</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
