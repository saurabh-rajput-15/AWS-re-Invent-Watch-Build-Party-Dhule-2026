import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
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
  Trash2,
  LogOut,
  Mail,
  Camera,
  QrCode,
} from 'lucide-react';
import { Attendee, RegistrationStatus } from '../../../types';
import { verifyAwsBuilderAlias, BuilderVerificationResult } from '../../registration/services/builderVerifier';
import { cleanBuilderAlias } from '../../registration/components/Registration';
import { AdminService } from '../services/adminService';

interface AdminPortalPageProps {
  onNavigateHome: () => void;
  onNavigateScanner?: () => void;
  token?: string;
  onLogout?: () => void;
}

const STORAGE_KEY_ALL = 'aws_reinvent_dhule_all_registrations';

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  onNavigateHome,
  onNavigateScanner,
  token,
  onLogout,
}) => {
  const [allRegistrations, setAllRegistrations] = useState<Attendee[]>([]);
  const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminVerifyMap, setAdminVerifyMap] = useState<Record<string, BuilderVerificationResult>>({});
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isSendingTicketId, setIsSendingTicketId] = useState<string | null>(null);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [rosterInput, setRosterInput] = useState('');
  const [isSyncingRoster, setIsSyncingRoster] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Admin Portal · AWS re:Invent Dhule 2026';
    return () => {
      document.title = 'AWS re:Invent Watch & Build Party Dhule';
    };
  }, []);

  // Fetch registrations from Server using token (with fallback to localStorage)
  const loadRegistrations = async () => {
    setIsLoadingData(true);
    if (token) {
      try {
        const remoteRegistrations = await AdminService.getRegistrations(token);
        setAllRegistrations(remoteRegistrations);
        localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(remoteRegistrations));
        setIsLoadingData(false);
        return;
      } catch (err) {
        console.warn('Could not fetch from server, checking local fallback', err);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL);
      if (stored) {
        setAllRegistrations(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load registrations from localStorage', e);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadRegistrations();
  }, [token]);

  const handleUpdateStatus = async (id: string, newStatus: RegistrationStatus) => {
    // Optimistic local update
    const updated = allRegistrations.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          reviewedAt: Date.now(),
          reviewedBy: 'Event Organizer (Server Authenticated)',
        };
      }
      return r;
    });
    setAllRegistrations(updated);
    localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(updated));

    // Server update
    if (token) {
      try {
        const res = await AdminService.updateStatus(token, id, newStatus, 'Event Organizer');
        if (newStatus === 'approved') {
          if (res.awsApproval?.actionTaken === 'approved') {
            setActionFeedback(`🎉 Registration approved & automatically approved on AWS Builder Center!`);
          } else if (res.awsApproval?.actionTaken === 'already_member') {
            setActionFeedback(`✓ Approved! Already an active attendee on AWS Builder Center.`);
          } else if (res.awsApproval?.message) {
            setActionFeedback(`✓ Approved! AWS status: ${res.awsApproval.message}`);
          } else {
            setActionFeedback(`✓ Registration approved & QR ticket dispatched.`);
          }
          setTimeout(() => setActionFeedback(null), 5000);
        }
      } catch (err) {
        console.error('Failed to sync status update with server', err);
      }
    }

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

  const handleDeleteRegistration = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this registration record?')) {
      const updated = allRegistrations.filter((r) => r.id !== id);
      setAllRegistrations(updated);
      localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(updated));

      if (token) {
        try {
          await AdminService.deleteRegistration(token, id);
        } catch (err) {
          console.error('Failed to delete on server', err);
        }
      }
    }
  };

  const handleResendTicket = async (id: string, email: string) => {
    if (!token) return;
    setIsSendingTicketId(id);
    setActionFeedback(null);
    try {
      await AdminService.resendTicket(token, id);
      setActionFeedback(`Confirmed ticket with QR code dispatched to ${email}`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback(`Failed to send email: ${err.message || 'Check Brevo credentials'}`);
      setTimeout(() => setActionFeedback(null), 5000);
    } finally {
      setIsSendingTicketId(null);
    }
  };

  const handleAdminVerifySingle = async (item: Attendee) => {
    setAdminVerifyMap((prev) => ({
      ...prev,
      [item.id]: { status: 'checking', alias: cleanBuilderAlias(item.builderId) },
    }));
    const res = await verifyAwsBuilderAlias(item.builderId);
    setAdminVerifyMap((prev) => ({
      ...prev,
      [item.id]: res,
    }));
  };

  const handleAdminVerifyAllPending = async () => {
    setIsBatchVerifying(true);
    if (token) {
      try {
        const results = await AdminService.batchVerify(token);
        setAdminVerifyMap((prev) => ({ ...prev, ...results }));
        setIsBatchVerifying(false);
        return;
      } catch {
        // fallback to client-side loop
      }
    }

    for (const item of allRegistrations) {
      if (item.status === 'pending') {
        const res = await verifyAwsBuilderAlias(item.builderId);
        setAdminVerifyMap((prev) => ({ ...prev, [item.id]: res }));
      }
    }
    setIsBatchVerifying(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Builder Alias', 'College', 'Year', 'Why Join', 'Status', 'Registered At'];
    const rows = allRegistrations.map((r) => [
      r.id,
      `"${r.fullName.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      r.builderId,
      `"${r.college.replace(/"/g, '""')}"`,
      r.year,
      `"${(r.whyJoin || '').replace(/"/g, '""')}"`,
      r.status,
      new Date(r.registeredAt).toISOString(),
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

  const handleSyncRoster = async () => {
    if (!token) {
      setActionFeedback('Admin session expired. Please re-login.');
      return;
    }
    const lines = rosterInput
      .split(/[\n,]+/)
      .map((s) => cleanBuilderAlias(s))
      .filter((s) => s.length > 0);

    if (lines.length === 0) {
      alert('Please enter at least one AWS Builder Center alias.');
      return;
    }

    setIsSyncingRoster(true);
    try {
      const items = lines.map((builderId) => ({ builderId }));
      const res = await AdminService.importBuilderCenterAttendees(token, items);
      setActionFeedback(`✓ ${res.message || `Successfully synced ${res.count} attendees to database!`}`);
      setTimeout(() => setActionFeedback(null), 5000);
      setShowRosterModal(false);
      setRosterInput('');
      await loadRegistrations();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingRoster(false);
    }
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

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateScanner ? onNavigateScanner : () => { window.location.href = '/scanner'; }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#3FB1FF]/50 bg-[#3FB1FF]/10 hover:bg-[#3FB1FF]/20 px-3 py-1.5 text-xs font-semibold text-[#3FB1FF] transition cursor-pointer"
              title="Open QR Camera Scanner for Reception Check-In (/scanner)"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">QR Scanner</span>
            </button>

            <button
              onClick={loadRegistrations}
              title="Refresh registrations from server"
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin text-[#3FB1FF]' : ''}`} />
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Lock Session</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
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
                <span className="text-xs font-mono uppercase text-rose-400">Rejected</span>
                <XCircle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
                {rejectedCount}
              </div>
            </div>
          </div>

          {actionFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#05E08A] shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E1526] p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search applicant, alias, email, college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-[#090D16] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none w-56 sm:w-64"
                />
              </div>

              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAdminFilter(filter)}
                    className={`px-3 py-1 rounded-md capitalize font-medium transition cursor-pointer ${
                      adminFilter === filter
                        ? 'bg-[#AB5CFF] text-[#090D16] font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAdminVerifyAllPending}
                disabled={isBatchVerifying || pendingCount === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isBatchVerifying ? 'animate-spin' : ''}`} />
                <span>{isBatchVerifying ? 'Verifying...' : `Verify Pending (${pendingCount})`}</span>
              </button>

              <button
                onClick={() => setShowRosterModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#3FB1FF]/40 bg-[#3FB1FF]/10 hover:bg-[#3FB1FF]/20 px-3 py-1.5 text-xs font-semibold text-[#3FB1FF] transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Sync Builder Center</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Applicant Cards / Table */}
          <div className="rounded-xl border border-slate-800 bg-[#0E1526] overflow-hidden">
            {filteredRegistrations.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No registration records match the current filter or search criteria.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredRegistrations.map((item) => {
                  const check = adminVerifyMap[item.id];
                  const cleanAlias = cleanBuilderAlias(item.builderId);

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 hover:bg-slate-900/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#3FB1FF]">{item.id}</span>
                          <h3 className="text-sm font-semibold text-white">{item.fullName}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                              item.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : item.status === 'rejected'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.checkedIn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#05E08A]/15 text-[#05E08A] border border-[#05E08A]/30 font-mono">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Checked In</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                          <span>{item.email}</span>
                          <span className="text-slate-600">·</span>
                          <span>{item.phone}</span>
                          <span className="text-slate-600">·</span>
                          <span>{item.college} ({item.year || 'Student'})</span>
                        </div>

                        {/* Builder Alias & Live Verification Result */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="text-slate-500">Builder Alias:</span>
                          <a
                            href={`https://builder.aws.com/community/@${cleanAlias}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono font-medium text-[#3FB1FF] hover:underline"
                          >
                            <span>@{cleanAlias}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          <button
                            onClick={() => handleAdminVerifySingle(item)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 cursor-pointer"
                          >
                            <RefreshCw className={`h-2.5 w-2.5 ${check?.status === 'checking' ? 'animate-spin' : ''}`} />
                            <span>Verify live</span>
                          </button>

                          {check && check.status === 'valid' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Profile: {check.displayName}</span>
                              </span>
                              {check.hasEventRegistration ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                                  <span>✓ Confirmed on AWS Event</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Missing Event RSVP</span>
                                </span>
                              )}
                            </>
                          )}

                          {!check && item.builderCenterVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>✓ Confirmed on AWS Event</span>
                            </span>
                          )}

                          {!check && item.builderCenterStatus === 'not_registered' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Missing Event RSVP</span>
                            </span>
                          )}

                          {check && check.status === 'invalid' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Not Found (404)</span>
                            </span>
                          )}
                        </div>

                        {item.whyJoin && (
                          <div className="text-xs text-slate-300 pt-1 flex items-start gap-1.5">
                            <span className="text-slate-500 font-medium shrink-0">Goal / Why Join:</span>
                            <span className="text-amber-200/90 italic">"{item.whyJoin}"</span>
                          </div>
                        )}
                      </div>

                      {/* Status Action Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === 'approved' && (
                          <>
                            <a
                              href={`/ticketid=${encodeURIComponent(item.id)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View digital QR ticket pass in browser (/ticketid=[id])"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                            >
                              <QrCode className="h-3.5 w-3.5 text-[#05E08A]" />
                              <span>Pass</span>
                            </a>

                            <button
                              onClick={() => handleResendTicket(item.id, item.email)}
                              disabled={isSendingTicketId === item.id}
                              title="Resend confirmed QR ticket pass via email"
                              className="inline-flex items-center gap-1 rounded-lg border border-[#3FB1FF]/40 bg-[#3FB1FF]/10 hover:bg-[#3FB1FF]/20 text-[#3FB1FF] px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                            >
                              <Mail className={`h-3.5 w-3.5 ${isSendingTicketId === item.id ? 'animate-spin' : ''}`} />
                              <span>{isSendingTicketId === item.id ? 'Sending...' : 'Ticket'}</span>
                            </button>
                          </>
                        )}

                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'approved')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'rejected')}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {item.status !== 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'pending')}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 text-xs font-medium transition cursor-pointer"
                          >
                            Reset
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRegistration(item.id)}
                          title="Delete registration"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sync Builder Center Roster Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0E1526] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-[#3FB1FF]/15 p-2 text-[#3FB1FF]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sync AWS Builder Center Roster</h3>
                  <p className="text-xs text-slate-400">Import attendees registered for the event</p>
                </div>
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                Paste the AWS Builder Center aliases of attendees who have registered/RSVP'd for the event on AWS Builder Center.
              </p>
              <p className="text-slate-400 text-[11px]">
                Separate by newlines or commas (e.g. <span className="font-mono text-emerald-400">saurabhrajput, agentviru, andrewbrown</span>).
              </p>
              <textarea
                rows={6}
                value={rosterInput}
                onChange={(e) => setRosterInput(e.target.value)}
                placeholder="saurabhrajput&#10;agentviru&#10;andrewbrown"
                className="w-full rounded-xl border border-slate-700 bg-[#090D16] p-3 text-xs text-white placeholder-slate-500 focus:border-[#3FB1FF] focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSyncingRoster || !rosterInput.trim()}
                onClick={handleSyncRoster}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#3FB1FF] to-[#05E08A] px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncingRoster ? 'animate-spin' : ''}`} />
                <span>{isSyncingRoster ? 'Syncing...' : 'Sync to Cloud Database'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

