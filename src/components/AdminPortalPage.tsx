import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';
import { Attendee, RegistrationStatus } from '../types';
import { verifyAwsBuilderAlias, BuilderVerificationResult } from '../services/builderVerifier';
import { cleanBuilderAlias } from './Registration';

interface AdminPortalPageProps {
  onNavigateHome: () => void;
}

const STORAGE_KEY_ALL = 'aws_reinvent_dhule_all_registrations';

const DEFAULT_SAMPLE_REGISTRATIONS: Attendee[] = [
  {
    id: 'DHU-1082',
    fullName: 'Rushikesh More',
    email: 'rushikesh.more@gmail.com',
    phone: '9822145678',
    builderId: 'andrewbrown',
    college: 'Government College of Engineering, Jalgaon',
    year: '3rd Year',
    status: 'pending',
    registeredAt: Date.now() - 3600000 * 5
  },
  {
    id: 'DHU-1094',
    fullName: 'Snehal Jadhav',
    email: 'snehal.jadhav@gmail.com',
    phone: '9765432190',
    builderId: 'davebuildscloud',
    college: 'RCPIT Shirpur',
    year: '4th Year',
    status: 'approved',
    registeredAt: Date.now() - 3600000 * 12,
    reviewedAt: Date.now() - 3600000 * 2,
    reviewedBy: 'Soham Chaudhari (SBG Lead)'
  },
  {
    id: 'DHU-1120',
    fullName: 'Prathamesh Patil',
    email: 'prathamesh.patil@gmail.com',
    phone: '9423187654',
    builderId: 'fakealias999xyz',
    college: 'SSVPS B.S. Deore College of Engineering, Dhule',
    year: '2nd Year',
    status: 'pending',
    registeredAt: Date.now() - 3600000 * 2
  }
];

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ onNavigateHome }) => {
  const [adminPin, setAdminPin] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [allRegistrations, setAllRegistrations] = useState<Attendee[]>([]);
  const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminVerifyMap, setAdminVerifyMap] = useState<Record<string, BuilderVerificationResult>>({});
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Admin Portal · AWS re:Invent Dhule 2026';
    return () => {
      document.title = 'AWS re:Invent Watch & Build Party Dhule';
    };
  }, []);

  // Check persistent session storage for unlock
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('aws_reinvent_admin_session') === 'true';
    if (isUnlocked) {
      setIsAdminUnlocked(true);
    }
  }, []);

  // Load all registrations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL);
      if (stored) {
        const parsed: Attendee[] = JSON.parse(stored);
        setAllRegistrations(parsed);
      } else {
        localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(DEFAULT_SAMPLE_REGISTRATIONS));
        setAllRegistrations(DEFAULT_SAMPLE_REGISTRATIONS);
      }
    } catch (e) {
      console.warn('Could not load registrations', e);
      setAllRegistrations(DEFAULT_SAMPLE_REGISTRATIONS);
    }
  }, []);

  const saveAllRegistrations = (list: Attendee[]) => {
    setAllRegistrations(list);
    try {
      localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save all registrations', e);
    }
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPin.trim().toLowerCase();
    if (pin === 'aws2026' || pin === 'admin' || pin === '9890991510' || pin === '9834382337') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('aws_reinvent_admin_session', 'true');
      setAdminError('');
    } else {
      setAdminError('Invalid passcode. Use organizer PIN or phone number.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('aws_reinvent_admin_session');
    setAdminPin('');
  };

  const handleUpdateStatus = (id: string, newStatus: RegistrationStatus) => {
    const updated = allRegistrations.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          reviewedAt: Date.now(),
          reviewedBy: 'Soham Chaudhari & Saurabh Rajput'
        };
      }
      return r;
    });
    saveAllRegistrations(updated);

    // Also update single stored attendee if matching
    try {
      const single = localStorage.getItem('aws_reinvent_dhule_attendee');
      if (single) {
        const parsed: Attendee = JSON.parse(single);
        if (parsed.id === id) {
          const updatedAttendee = updated.find((r) => r.id === id);
          if (updatedAttendee) {
            localStorage.setItem('aws_reinvent_dhule_attendee', JSON.stringify(updatedAttendee));
          }
        }
      }
    } catch (e) {
      console.warn('Could not sync single attendee', e);
    }
  };

  const handleDeleteRegistration = (id: string) => {
    if (window.confirm('Are you sure you want to delete this registration record?')) {
      const updated = allRegistrations.filter((r) => r.id !== id);
      saveAllRegistrations(updated);
    }
  };

  const handleAdminVerifySingle = async (item: Attendee) => {
    setAdminVerifyMap((prev) => ({
      ...prev,
      [item.id]: { status: 'checking', alias: cleanBuilderAlias(item.builderId) }
    }));
    const res = await verifyAwsBuilderAlias(item.builderId);
    setAdminVerifyMap((prev) => ({
      ...prev,
      [item.id]: res
    }));
  };

  const handleAdminVerifyAllPending = async () => {
    setIsBatchVerifying(true);
    for (const item of allRegistrations) {
      if (item.status === 'pending') {
        const res = await verifyAwsBuilderAlias(item.builderId);
        setAdminVerifyMap((prev) => ({ ...prev, [item.id]: res }));
      }
    }
    setIsBatchVerifying(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Builder Alias', 'College', 'Year', 'Status', 'Registered At'];
    const rows = allRegistrations.map((r) => [
      r.id,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      r.builderId,
      `"${r.college.replace(/"/g, '""')}"`,
      r.year,
      r.status,
      new Date(r.registeredAt).toISOString()
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aws_reinvent_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = allRegistrations.filter((r) => {
    const matchesFilter = adminFilter === 'all' ? true : r.status === adminFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.builderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    return matchesFilter && matchesQuery;
  });

  const pendingCount = allRegistrations.filter((r) => r.status === 'pending').length;
  const approvedCount = allRegistrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = allRegistrations.filter((r) => r.status === 'rejected').length;

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
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#AB5CFF]/15 border border-[#AB5CFF]/30 text-[11px] font-mono font-bold text-[#AB5CFF]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Organizer Portal (/admin)</span>
            </span>
          </div>

          <a href="#home" onClick={onNavigateHome} className="flex items-center shrink-0">
            <img
              src="/AWS_reinvent-dark.png"
              alt="AWS re:Invent Dhule 2026"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
            />
          </a>

          <div>
            {isAdminUnlocked ? (
              <button
                onClick={handleLockAdmin}
                className="rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Lock Session
              </button>
            ) : (
              <span className="text-xs font-mono text-slate-400">Restricted Access</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {!isAdminUnlocked ? (
            /* Passcode Screen */
            <div className="max-w-md mx-auto my-12 p-8 sm:p-10 rounded-2xl border border-slate-800 bg-[#0E1526] shadow-2xl text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090D16] border border-slate-800 text-[#05E08A] shadow-inner">
                <Lock className="h-8 w-8" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Organizer Portal Login</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Enter the event coordinator passcode to access attendee verifications and approvals.
                </p>
              </div>

              <form onSubmit={handleUnlockAdmin} className="space-y-4 pt-2">
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter passcode (e.g. aws2026)"
                  className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-4 py-3 text-center text-sm text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none focus:ring-1 focus:ring-[#AB5CFF]"
                  autoFocus
                />
                {adminError && <p className="text-xs text-rose-400">{adminError}</p>}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#AB5CFF] to-[#3FB1FF] py-3 text-xs font-bold text-[#0E131A] shadow-lg shadow-[#AB5CFF]/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  Unlock Admin Dashboard
                </button>

                <p className="text-[11px] text-slate-500">
                  Hint: Passcode is <code className="text-slate-300 font-mono">aws2026</code>
                </p>
              </form>
            </div>
          ) : (
            /* Unlocked Dashboard */
            <div className="space-y-6">
              {/* Top Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#0E1526] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Total Applications</span>
                    <Users className="h-4 w-4 text-[#3FB1FF]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                    {allRegistrations.length}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0E1526] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#FF9F1C]">Pending Review</span>
                    <Clock className="h-4 w-4 text-[#FF9F1C]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#FF9F1C] mt-1 font-mono">
                    {pendingCount}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0E1526] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#05E08A]">Approved Passes</span>
                    <CheckCircle2 className="h-4 w-4 text-[#05E08A]" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#05E08A] mt-1 font-mono">
                    {approvedCount}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0E1526] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-rose-400">Declined (404)</span>
                    <XCircle className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
                    {rejectedCount}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Status Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setAdminFilter('all')}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'all'
                          ? 'bg-[#3FB1FF] text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      All ({allRegistrations.length})
                    </button>
                    <button
                      onClick={() => setAdminFilter('pending')}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'pending'
                          ? 'bg-[#FF9F1C] text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setAdminFilter('approved')}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'approved'
                          ? 'bg-[#05E08A] text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Approved ({approvedCount})
                    </button>
                    <button
                      onClick={() => setAdminFilter('rejected')}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'rejected'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Declined ({rejectedCount})
                    </button>
                  </div>

                  {/* Search, Batch Verify & Export CSV */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleAdminVerifyAllPending}
                      disabled={isBatchVerifying || pendingCount === 0}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isBatchVerifying ? 'animate-spin' : ''}`} />
                      <span>Verify Pending 404s</span>
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, alias, college..."
                        className="rounded-xl border border-slate-700 bg-[#090D16] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-3 pt-2">
                  {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      No registration requests match your current search or filter.
                    </div>
                  ) : (
                    filteredRegistrations.map((item) => {
                      const cleanAlias = cleanBuilderAlias(item.builderId);
                      const verifyState = adminVerifyMap[item.id];

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-800 bg-[#090D16] p-4 sm:p-5 transition-all hover:border-slate-700 space-y-3"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Attendee Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-sm sm:text-base font-bold text-white">{item.fullName}</h2>
                                <span className="font-mono text-xs text-slate-500">{item.id}</span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                                    item.status === 'approved'
                                      ? 'bg-[#05E08A]/15 text-[#05E08A] border border-[#05E08A]/30'
                                      : item.status === 'rejected'
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : 'bg-[#FF9F1C]/15 text-[#FF9F1C] border border-[#FF9F1C]/30'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                <span>{item.email}</span>
                                <span className="text-slate-600">·</span>
                                <span className="font-mono">{item.phone}</span>
                                <span className="text-slate-600">·</span>
                                <span>{item.college} ({item.year})</span>
                              </div>

                              {/* Live Builder Verification Status */}
                              <div className="flex items-center gap-2 pt-1 text-xs">
                                <span className="text-slate-400">Builder Profile:</span>
                                <span className="font-mono font-bold text-white">@{cleanAlias}</span>

                                {verifyState?.status === 'checking' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3FB1FF] animate-pulse">
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    <span>Pinging AWS...</span>
                                  </span>
                                )}
                                {verifyState?.status === 'valid' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#05E08A] bg-[#05E08A]/10 px-2 py-0.5 rounded border border-[#05E08A]/30">
                                    <Check className="h-3 w-3" />
                                    <span>200 OK (Profile Live)</span>
                                  </span>
                                )}
                                {verifyState?.status === 'invalid' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                                    <X className="h-3 w-3" />
                                    <span>404 Not Found</span>
                                  </span>
                                )}

                                <button
                                  onClick={() => handleAdminVerifySingle(item)}
                                  className="text-[11px] font-mono text-slate-400 hover:text-white underline cursor-pointer ml-1"
                                >
                                  Test Live
                                </button>

                                <a
                                  href={`https://builder.aws.com/community/@${cleanAlias}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded bg-[#3FB1FF]/15 hover:bg-[#3FB1FF]/25 border border-[#3FB1FF]/30 px-2 py-0.5 text-[11px] font-mono font-bold text-[#3FB1FF] transition-colors ml-1"
                                >
                                  <span>Open Profile ↗</span>
                                </a>
                              </div>
                            </div>

                            {/* Actions: Approve / Decline / Reset */}
                            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                              {item.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'approved')}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#05E08A] hover:bg-[#0fd686] px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Approve Pass</span>
                                </button>
                              )}

                              {item.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Decline (404)</span>
                                </button>
                              )}

                              {item.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'pending')}
                                  className="inline-flex items-center gap-1 rounded-xl border border-slate-800 p-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                                  title="Reset to Pending"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteRegistration(item.id)}
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer notes */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span>Signed in as Organizers (Soham Chaudhari &amp; Saurabh Rajput)</span>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset registration database to sample applications?')) {
                        localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(DEFAULT_SAMPLE_REGISTRATIONS));
                        setAllRegistrations(DEFAULT_SAMPLE_REGISTRATIONS);
                        setAdminVerifyMap({});
                      }
                    }}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Sample Applications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 bg-[#070A12] py-6 text-center text-xs text-slate-500">
        <p>© 2026 AWS Student Builder Group Dhule · Organizer Review Portal</p>
      </footer>
    </div>
  );
};

