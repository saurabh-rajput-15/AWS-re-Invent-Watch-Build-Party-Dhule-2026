import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Ticket,
  Search,
  RotateCw,
  Share2,
} from 'lucide-react';
import { ReactQRCode } from '@lglab/react-qr-code';
import { Attendee } from '../../../types';
import { apiUrl, assetUrl, FRONTEND_URL } from '../../../utils/api';
import { Lanyard } from '../../../components/Lanyard';
import { generateBadgeTextures } from '../utils/badgeTexture';

interface TicketPassPageProps {
  ticketId?: string;
  onNavigateHome: () => void;
}

export const TicketPassPage: React.FC<TicketPassPageProps> = ({ ticketId = '', onNavigateHome }) => {
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [currentId, setCurrentId] = useState<string>(ticketId.trim());
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'lanyard' | 'ticket'>('lanyard');
  const [badgeTextures, setBadgeTextures] = useState<{
    frontUrl: string;
    backUrl: string;
    strapUrl: string;
  } | null>(null);

  // Fetch ticket details
  const fetchTicket = async (idToFetch: string) => {
    const cleanId = idToFetch.trim();
    if (!cleanId) {
      // If no ID provided, check local storage
      try {
        const stored = localStorage.getItem('aws_reinvent_dhule_attendee');
        if (stored) {
          const parsed: Attendee = JSON.parse(stored);
          if (parsed && parsed.id) {
            setAttendee(parsed);
            setCurrentId(parsed.id);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Fallback sample attendee for 3D Lanyard display
      setAttendee(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Check local storage first
    try {
      const stored = localStorage.getItem('aws_reinvent_dhule_attendee');
      if (stored) {
        const parsed: Attendee = JSON.parse(stored);
        if (parsed.id?.toLowerCase() === cleanId.toLowerCase()) {
          setAttendee(parsed);
          setCurrentId(parsed.id);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Fetch from backend API
    try {
      const res = await fetch(apiUrl(`/api/registrations/by-id/${encodeURIComponent(cleanId)}`));
      const data = await res.json();
      if (res.ok && data?.attendee) {
        setAttendee(data.attendee);
        setCurrentId(data.attendee.id);
      } else {
        setError(data?.message || `No admission pass found for ID: ${cleanId}`);
      }
    } catch (err: any) {
      setError(`Could not retrieve ticket: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket(ticketId);
  }, [ticketId]);

  // Generate 3D textures when attendee or currentId changes
  useEffect(() => {
    let isCancelled = false;

    const buildTextures = async () => {
      try {
        const qrEndpoint = currentId
          ? apiUrl(`/api/registrations/qr/${encodeURIComponent(currentId)}.png`)
          : undefined;

        const textures = await generateBadgeTextures(attendee, qrEndpoint);
        if (!isCancelled) {
          setBadgeTextures(textures);
        }
      } catch (e) {
        console.warn('Failed to build badge textures:', e);
      }
    };

    buildTextures();

    return () => {
      isCancelled = true;
    };
  }, [attendee, currentId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const targetId = searchInput.trim();
      setCurrentId(targetId);
      window.history.pushState({}, '', `/ticketid=${targetId}`);
      fetchTicket(targetId);
    }
  };

  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=AWS+re%3AInvent+Watch+%26+Build+Party+Dhule&dates=20261204T033000Z%2F20261204T103000Z&details=Official+entry+ticket+for+AWS+re%3AInvent+Dhule.+Present+your+QR+code+pass+at+Symphony+Hall+2F+reception.&location=Hotel+Anand+Regency+Riverfront%2C+Dhule';
  const mapsUrl = 'https://maps.app.goo.gl/uRJKnYPW6z62mTJA9';

  const shareUrl = `${FRONTEND_URL}/ticketid=${currentId || 'pass'}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AWS re:Invent Watch & Build Party Pass',
        text: `Check out my admission pass for AWS re:Invent Watch & Build Party Dhule!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Pass URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between selection:bg-[#3FB1FF]/30">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Event Portal</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center bg-[#0E1526] border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('lanyard')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'lanyard'
                    ? 'bg-linear-to-r from-[#3FB1FF] to-[#05E08A] text-[#090D16] shadow-md shadow-[#3FB1FF]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Lanyard</span>
              </button>
              <button
                onClick={() => setViewMode('ticket')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'ticket'
                    ? 'bg-linear-to-r from-[#3FB1FF] to-[#05E08A] text-[#090D16] shadow-md shadow-[#3FB1FF]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Digital Pass</span>
              </button>
            </div>

            <img src={assetUrl('/AWS_reinvent-dark.png')} alt="AWS re:Invent" className="h-6 w-auto hidden sm:block" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-12 h-12 border-3 border-[#3FB1FF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm font-mono">Loading official pass #{currentId}...</p>
          </div>
        ) : error && !attendee ? (
          <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-[#0E1526] p-8 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Pass Not Found</h2>
            <p className="text-slate-400 text-xs leading-relaxed">{error}</p>

            {/* Quick search input */}
            <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. riv-26-3495)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#090D16] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3FB1FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3FB1FF] text-[#090D16] rounded-xl text-xs font-bold hover:bg-[#3FB1FF]/90 transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            <button
              onClick={onNavigateHome}
              className="mt-2 text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Return to Registration Portal
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Lookup bar if accessed without ID */}
            {!ticketId && (
              <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter Pass ID (e.g. riv-26-3495)..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0E1526] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3FB1FF]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Load Pass
                </button>
              </form>
            )}

            {/* 1. 3D LANYARD VIEW */}
            {viewMode === 'lanyard' && (
              <div className="space-y-4">
                <div className="relative w-full h-[520px] sm:h-[620px] rounded-3xl border border-slate-800/80 bg-radial from-[#131B2E] via-[#0A0F1D] to-[#050811] overflow-hidden shadow-2xl shadow-black/90">
                  {/* Top Rainbow Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#3FB1FF] via-[#FF57E8] to-[#05E08A] z-10" />

                  {/* Lanyard Physics Canvas */}
                  {badgeTextures ? (
                    <Lanyard
                      frontImage={badgeTextures.frontUrl}
                      backImage={badgeTextures.backUrl}
                      strapImage={badgeTextures.strapUrl}
                      cardColor="#0E1726"
                      strapColor="#FF9900"
                      finish="matte"
                      metal="silver"
                      gravity={0.95}
                      damping={0.45}
                      elasticity={0.4}
                      breeze={0.4}
                      interactive={true}
                      intro={true}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                      Generating interactive 3D physics badge...
                    </div>
                  )}

                  {/* Floating Drag & Flick Hint */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
                    <span>✨</span>
                    <span>Drag, throw, or flick the badge to spin and flip</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#05E08A]/15 text-[#05E08A] border border-[#05E08A]/30 uppercase tracking-widest backdrop-blur-md">
                      ● {attendee?.status === 'approved' ? 'CONFIRMED PASS' : 'SUBMITTED REQUEST'}
                    </span>
                    {attendee?.id && (
                      <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1E293B]/80 text-[#3FB1FF] border border-slate-700 backdrop-blur-md">
                        {attendee.id}
                      </span>
                    )}
                  </div>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer backdrop-blur-md"
                    title="Share Admission Pass"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Info & Switch Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0E1526]/60 border border-slate-800/80 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">
                      {attendee?.fullName || 'AWS Student Builder Pass'}
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono">
                      Pass ID: <span className="text-[#3FB1FF]">{currentId || 'riv-26-XXXX'}</span> · @{attendee?.builderId || 'awsbuilder'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setViewMode('ticket')}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs bg-[#05E08A] text-[#090D16] hover:bg-[#05E08A]/90 transition-all cursor-pointer text-center"
                    >
                      View Scannable QR &amp; Details &rarr;
                    </button>
                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-[#3FB1FF] hover:bg-slate-700 transition-all"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DIGITAL TICKET CARD VIEW */}
            {viewMode === 'ticket' && (
              <div className="max-w-xl mx-auto space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-[#0E1526] overflow-hidden shadow-2xl shadow-black/80">
                  {/* Top Rainbow Accent */}
                  <div className="h-1.5 w-full bg-linear-to-r from-[#3FB1FF] via-[#FF57E8] to-[#05E08A]" />

                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-1.5">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#05E08A]/15 text-[#05E08A] border border-[#05E08A]/30 uppercase tracking-widest mb-1">
                        ● {attendee?.status === 'approved' ? 'CONFIRMED PASS' : 'SUBMITTED REQUEST'}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        AWS re:Invent Watch &amp; Build
                      </h1>
                      <p className="text-xs text-slate-400">
                        Friday, 04 December 2026 &middot; Symphony Hall (2F), Dhule
                      </p>
                    </div>

                    {/* QR Code Card */}
                    <div className="rounded-2xl border-2 border-dashed border-slate-700/80 bg-[#090D16] p-6 text-center space-y-4">
                      <div className="inline-block rounded-lg border border-[#3FB1FF]/40 bg-[#1E293B] px-3.5 py-1 text-xs sm:text-sm font-mono font-bold text-[#3FB1FF]">
                        PASS ID: {currentId || 'riv-26-XXXX'}
                      </div>

                      {/* Configured ReactQRCode using exact specification */}
                      <div className="mx-auto flex justify-center p-4 bg-white rounded-2xl w-fit shadow-xl shadow-black/60">
                        <ReactQRCode
                          value={currentId || 'riv-26-XXXX'}
                          size={260}
                          level="H"
                          background="#FFFFFF"
                          dataModulesSettings={{
                            color: '#000000',
                            style: 'circle',
                          }}
                          finderPatternOuterSettings={{
                            color: '#000000',
                            style: 'rounded',
                          }}
                          finderPatternInnerSettings={{
                            color: '#000000',
                            style: 'rounded',
                          }}
                          imageSettings={{
                            src: assetUrl('/preview.png'),
                            height: 60,
                            width: 100,
                            excavate: true,
                          }}
                        />
                      </div>

                      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        SCAN AT RECEPTION (SYMPHONY HALL 2F)
                      </p>
                    </div>

                    {/* Attendee Info Table */}
                    {attendee && (
                      <div className="divide-y divide-slate-800 text-xs sm:text-sm">
                        <div className="flex justify-between py-2.5">
                          <span className="text-slate-400">Attendee Name:</span>
                          <span className="font-bold text-white text-right">{attendee.fullName}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-slate-400">Registered Email:</span>
                          <span className="text-slate-200 text-right">{attendee.email}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-slate-400">AWS Builder Center:</span>
                          <span className="font-mono font-bold text-[#3FB1FF] text-right">@{attendee.builderId}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-slate-400">Institution / College:</span>
                          <span className="text-slate-200 text-right">{attendee.college}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-slate-400">Check-In Hours:</span>
                          <span className="font-bold text-[#05E08A] text-right">09:00 AM – 09:30 AM IST</span>
                        </div>
                        <div className="flex justify-between py-2.5 items-center">
                          <span className="text-slate-400">Venue Location:</span>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#3FB1FF] font-semibold text-right hover:underline inline-flex items-center gap-1"
                          >
                            Hotel Anand Regency Riverfront, Dhule
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Important Information Box */}
                    <div className="rounded-xl border border-slate-800 bg-[#0A1220] p-4 text-xs text-slate-300 space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <span>📋</span> Important Information
                      </h4>
                      <ul className="space-y-1.5 text-[12px] leading-relaxed">
                        <li className="flex items-start gap-2"><span>✅</span> Carry a valid Government ID or College ID for verification.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Please arrive at least 30 minutes before the event starts.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Your ticket contains a unique QR code required for check-in.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Tickets are non-transferable unless approved by the organizing team.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Keep this pass accessible on the event day.</li>
                      </ul>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        Questions? Reach us at{' '}
                        <a href="mailto:info@reinvent.awssbgdhule.in" className="text-[#3FB1FF] font-semibold underline">
                          info@reinvent.awssbgdhule.in
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <a
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-[#3FB1FF] text-[#090D16] hover:bg-[#3FB1FF]/90 transition-all text-center"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Add to Google Calendar</span>
                      </a>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs border border-slate-700 bg-slate-800/70 text-[#3FB1FF] hover:bg-slate-800 transition-all text-center"
                      >
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>View on Google Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-[#090D16] border-t border-slate-800/80 text-center">
                    <img
                      src={assetUrl('/AWS_Builder.png')}
                      alt="AWS Student Builder Group Dhule"
                      className="h-10 w-auto mx-auto mb-2 opacity-90"
                    />
                    <p className="text-[11px] text-slate-500">
                      Organized by AWS Student Builder Group Dhule &middot; SVKM's IOT Campus
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Page Footer */}
      <footer className="text-center py-4 border-t border-slate-900 text-[11px] text-slate-600">
        AWS re:Invent Watch &amp; Build Party Dhule 2026 &middot; Official Registration System
      </footer>
    </div>
  );
};
