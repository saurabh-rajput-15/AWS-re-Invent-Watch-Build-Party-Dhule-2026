import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Attendee } from '../../../types';
import { Registration } from './Registration';
import { Footer } from '../../../components/Footer';

interface RegistrationPageProps {
  attendee: Attendee | null;
  onRegisterSuccess: (attendee: Attendee) => void;
  onNavigateHome: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  attendee,
  onRegisterSuccess,
  onNavigateHome,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Register · AWS re:Invent Watch & Build Party Dhule 2026';
    return () => {
      document.title = 'AWS re:Invent Watch & Build Party Dhule';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F3F4F6] selection:bg-[#AB5CFF]/30 selection:text-white flex flex-col">
      {/* Top Hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#3FB1FF]/70 via-[#FF57E8]/70 to-[#05E08A]/70" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-gradient-to-r from-[#090D16]/90 via-[#0C1222]/85 to-[#090D16]/90 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#3FB1FF]" />
              <span>Back to Event</span>
            </button>
           
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className="flex items-center shrink-0 cursor-pointer"
          >
            <img
              src="/AWS_reinvent-dark.png"
              alt="AWS re:Invent Dhule 2026"
              className="h-8 sm:h-9 md:h-12 w-auto object-contain"
            />
          </a>

          <div>
            <button
              onClick={onNavigateHome}
              className="rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Event Agenda
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Registration attendee={attendee} onRegisterSuccess={onRegisterSuccess} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

