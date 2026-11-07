import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { About } from './components/About';
import { Agenda } from './components/Agenda';
import { Speakers } from './components/Speakers';
import { Registration } from './components/Registration';
import { Venue } from './components/Venue';
import { Footer } from './components/Footer';
import { Attendee } from './types';
import { useGsapLenis } from './hooks/useGsapLenis';

export default function App() {
  const [attendee, setAttendee] = useState<Attendee | null>(null);

  // Initialize GSAP ScrollTrigger and Lenis smooth scrolling
  const lenisRef = useGsapLenis();

  // Load registered attendee from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aws_reinvent_dhule_attendee');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.status) parsed.status = 'pending';
        if (!parsed.builderId) parsed.builderId = 'builder-aws';
        if (!parsed.phone) parsed.phone = '9890991510';
        setAttendee(parsed);
      }
    } catch (e) {
      console.warn('Could not read saved attendee from localStorage', e);
    }
  }, []);

  const handleRegisterSuccess = (newAttendee: Attendee) => {
    setAttendee(newAttendee);
    try {
      localStorage.setItem('aws_reinvent_dhule_attendee', JSON.stringify(newAttendee));
    } catch (e) {
      console.warn('Could not save attendee to localStorage', e);
    }
  };

  const scrollToRegister = () => {
    const el = document.getElementById('register');
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -85, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F3F4F6] selection:bg-[#AB5CFF]/30 selection:text-white flex flex-col">
      {/* Scroll Progress Bar at the top of the viewport */}
      <div
        id="scroll-progress"
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left scale-x-0"
        style={{
          background: 'linear-gradient(90deg, #3FB1FF, #FF57E8, #05E08A, #FF9F1C, #AB5CFF)',
        }}
      />

      {/* Top Navigation */}
      <Navbar onScrollToRegister={scrollToRegister} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero onScrollToRegister={scrollToRegister} />

        <Ticker />

        <About />

        <Agenda />

        <Speakers />

        <Registration
          attendee={attendee}
          onRegisterSuccess={handleRegisterSuccess}
        />

        <Venue />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
