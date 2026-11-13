import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Calendar,
  ArrowRight,
  Clock,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Phone,
  User,
  Mail,
  Building,
  Lock,
  X,
  Check,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Scale,
  ShieldAlert
} from 'lucide-react';
import { Attendee, RegistrationStatus } from '../../../types';
import { EVENT_DETAILS } from '../../event/data/eventData';
import { verifyAwsBuilderAlias, BuilderVerificationResult } from '../services/builderVerifier';
import { TermsModal } from './TermsModal';
import { ReactQRCode } from '@lglab/react-qr-code';
import { apiUrl, assetUrl } from '../../../utils/api';

interface RegistrationProps {
  attendee: Attendee | null;
  onRegisterSuccess: (attendee: Attendee) => void;
}

const STORAGE_KEY_ALL = 'aws_reinvent_dhule_all_registrations';

export const cleanBuilderAlias = (input: string): string => {
  if (!input) return '';
  let val = input.trim().toLowerCase();
  val = val.replace(/^https?:\/\/(www\.)?builder\.aws\.com\/community\/@?/i, '');
  val = val.replace(/^builder\.aws\.com\/community\/@?/i, '');
  val = val.replace(/^@/, '');
  return val.trim().toLowerCase();
};

export const countWords = (text: string): number => {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

// Pre-seeded registrations so organizers/users can immediately test manual review
const DEFAULT_SAMPLE_REGISTRATIONS: Attendee[] = [
  {
    id: 'riv-26-1082',
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
    id: 'riv-26-1094',
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
    id: 'riv-26-1120',
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

export const Registration: React.FC<RegistrationProps> = ({
  attendee,
  onRegisterSuccess
}) => {
  const [formData, setFormData] = useState({
    fullName: attendee?.fullName || '',
    email: attendee?.email || '',
    phone: attendee?.phone || '',
    builderId: attendee?.builderId || '',
    college: attendee?.college || '',
    year: attendee?.year || '3rd Year',
    whyJoin: attendee?.whyJoin || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2-Step Guided Wizard States
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [hasOpenedBuilderCenter, setHasOpenedBuilderCenter] = useState(false);
  const [hasConfirmedBuilderRsvp, setHasConfirmedBuilderRsvp] = useState(false);

  // Form Builder Verification State
  const [verificationResult, setVerificationResult] = useState<BuilderVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Admin Modal States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [allRegistrations, setAllRegistrations] = useState<Attendee[]>([]);
  const [adminFilter, setAdminFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminVerifyMap, setAdminVerifyMap] = useState<Record<string, BuilderVerificationResult>>({});
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);

  // Load all registrations from localStorage on mount
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

  // Sync attendee status if updated in allRegistrations
  useEffect(() => {
    if (attendee) {
      const current = allRegistrations.find(
        (r) => r.id === attendee.id || r.email.toLowerCase() === attendee.email.toLowerCase()
      );
      if (current && current.status !== attendee.status) {
        onRegisterSuccess(current);
      }
    }
  }, [allRegistrations, attendee, onRegisterSuccess]);

  const saveAllRegistrations = (list: Attendee[]) => {
    setAllRegistrations(list);
    try {
      localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save registrations', e);
    }
  };

  // Form Validation
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your full name';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number';
    }
    if (!formData.builderId.trim()) {
      errs.builderId = 'AWS Builder Center alias is required';
    } else if (verificationResult?.status === 'valid' && verificationResult.hasEventRegistration === false) {
      errs.builderId = 'Please register on AWS Builder Center first, then return here to submit';
    } else if (verificationResult?.status === 'invalid') {
      errs.builderId = 'Please provide a valid AWS Builder Center alias';
    }
    if (!formData.college.trim()) {
      errs.college = 'Please enter your college name';
    }
    const whyWords = countWords(formData.whyJoin);
    if (!formData.whyJoin.trim()) {
      errs.whyJoin = 'Please answer why you want to join this event';
    } else if (whyWords > 10) {
      errs.whyJoin = `Please keep your response to 10 words or fewer (currently ${whyWords} words)`;
    }
    if (!agreedToTerms) {
      errs.terms = 'You must accept the Terms & Conditions and Code of Conduct';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Auto-verification timer and cache refs (checks after 3s typing stop or immediately on field blur)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedAliasRef = useRef<string>('');

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Test alias live against AWS Builder Center endpoint automatically
  const triggerAutoVerify = async (rawInput: string, force = false) => {
    const alias = cleanBuilderAlias(rawInput);
    if (!alias) {
      setVerificationResult(null);
      lastCheckedAliasRef.current = '';
      return;
    }
    // Skip duplicate network check if already verified for this exact alias unless forced
    if (!force && alias === lastCheckedAliasRef.current && verificationResult) {
      return;
    }
    setIsVerifying(true);
    lastCheckedAliasRef.current = alias;
    const result = await verifyAwsBuilderAlias(alias, force);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const handleAliasChange = (val: string) => {
    // Automatically convert to lowercase even if CapsLock is active or user enters uppercase
    const lowerVal = val.toLowerCase();
    setFormData((prev) => ({ ...prev, builderId: lowerVal }));
    if (errors.builderId) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.builderId;
        return copy;
      });
    }
    // Cancel prior pending check on typing
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    const clean = cleanBuilderAlias(lowerVal);
    if (!clean) {
      setVerificationResult(null);
      lastCheckedAliasRef.current = '';
      return;
    }
    // If user stops typing for 1.8 seconds, verify automatically
    typingTimerRef.current = setTimeout(() => {
      triggerAutoVerify(lowerVal);
    }, 1800);
  };

  const handleAliasBlur = () => {
    // If user moves to another field, verify immediately
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    if (formData.builderId.trim()) {
      triggerAutoVerify(formData.builderId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const cleanAlias = cleanBuilderAlias(formData.builderId);
      const newAttendee: Attendee = {
        id: attendee?.id || `riv-26-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        builderId: cleanAlias,
        college: formData.college.trim(),
        year: formData.year,
        whyJoin: formData.whyJoin.trim(),
        status: attendee?.status || 'pending', // Starts as pending manual review
        registeredAt: attendee?.registeredAt || Date.now(),
        builderCenterVerified: verificationResult?.hasEventRegistration || false,
        builderCenterStatus: verificationResult?.hasEventRegistration ? 'registered_on_builder_center' : 'not_registered',
        builderCenterVerifiedAt: verificationResult?.hasEventRegistration ? Date.now() : undefined,
      };

      // Add or update in allRegistrations
      const updatedList = [
        newAttendee,
        ...allRegistrations.filter((r) => r.id !== newAttendee.id && r.email.toLowerCase() !== newAttendee.email.toLowerCase())
      ];
      saveAllRegistrations(updatedList);

      // Asynchronously sync registration to Server
      fetch(apiUrl('/api/registrations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAttendee),
      }).catch((err) => console.warn('Could not sync registration to server:', err));

      onRegisterSuccess(newAttendee);
      setIsSubmitting(false);
    }, 350);
  };

  // Admin Actions
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPin.trim().toLowerCase();
    if (pin === 'aws2026' || pin === 'admin' || pin === '9890991510' || pin === '9834382337') {
      setIsAdminUnlocked(true);
      setAdminError('');
    } else {
      setAdminError('Invalid passcode. Use "aws2026" or organizer phone number.');
    }
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

    if (attendee && attendee.id === id) {
      const updatedAttendee = updated.find((r) => r.id === id);
      if (updatedAttendee) {
        onRegisterSuccess(updatedAttendee);
      }
    }
  };

  const handleDeleteRegistration = (id: string) => {
    if (window.confirm('Delete this registration request?')) {
      const updated = allRegistrations.filter((r) => r.id !== id);
      saveAllRegistrations(updated);
    }
  };

  // Admin verify individual applicant alias
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

  // Batch verify all pending applicants
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

  const filteredRegistrations = allRegistrations.filter((r) => {
    const matchesFilter = adminFilter === 'all' ? true : r.status === adminFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.builderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    return matchesFilter && matchesQuery;
  });

  const pendingCount = allRegistrations.filter((r) => r.status === 'pending').length;
  const approvedCount = allRegistrations.filter((r) => r.status === 'approved').length;

  return (
    <section id="register" className="relative py-16 md:py-24 border-b border-slate-800/80 bg-[#0A0F1D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Context & Verification Process */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#AB5CFF]">
              <span>04 · Registration</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              Request Your <span className="text-[#AB5CFF]">Seat.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              300+ builders, one auditorium at Hotel Anand Regency Riverfront. To ensure verified student builders and prevent bot spam, all attendance requests are manually reviewed by our organizers before entry passes are issued.
            </p>

            {/* How verification works step-by-step */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#FF9F1C]/15 p-2 text-[#FF9F1C] shrink-0 mt-0.5">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">1. RSVP on AWS Builder Center</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official registration on Amazon Web Services' portal is required before local pass issuance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#3FB1FF]/10 p-2 text-[#3FB1FF] shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">2. Fill Pass Details &amp; Reason (Max 10 Words)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your name, mobile, Builder alias, and why you want to attend in 10 words or fewer.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#AB5CFF]/10 p-2 text-[#AB5CFF] shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">3. Check Email for Next Verification Steps</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    After submitting, you will receive an email with next steps. Complete them to significantly boost your chances of getting confirmed!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#05E08A]/10 p-2 text-[#05E08A] shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">4. Guaranteed Entry Pass</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Once accepted, your confirmed entry pass will display here with badge credentials, buffet lunch, and Kahoot arena access.
                  </p>
                </div>
              </div>
            </div>

            {/* Organizers Contact Note */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
              <div className="text-slate-400 font-medium">For registration assistance, email the organizing team:</div>
              <a
                href={`mailto:${EVENT_DETAILS.contactEmail}`}
                className="inline-block max-w-full break-all font-bold text-[#05E08A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#05E08A]"
              >
                {EVENT_DETAILS.contactEmail}
              </a>
            </div>

            {/* Terms Quick Launch Button */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              
              <a
                href="/codeofconduct"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Scale className="h-4 w-4 text-[#3FB1FF]" />
                <span>Code of Conduct &amp; Policy</span>
              </a>
            </div>
          </div>

          {/* Right Column: Form or Submitted Status View */}
          <div className="lg:col-span-7">
            {attendee ? (
              /* Already Registered / Submitted View */
              <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Status indicator hairline */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    attendee.status === 'approved'
                      ? 'bg-gradient-to-r from-[#05E08A] to-[#3FB1FF]'
                      : attendee.status === 'rejected'
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-[#FF9F1C] via-[#FF57E8] to-[#AB5CFF]'
                  }`}
                />

                {/* Header with Status Pill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-xl p-2.5 shrink-0 ${
                        attendee.status === 'approved'
                          ? 'bg-[#05E08A]/15 text-[#05E08A]'
                          : attendee.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-[#05E08A]/15 text-[#05E08A]'
                      }`}
                    >
                      {attendee.status === 'approved' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : attendee.status === 'rejected' ? (
                        <XCircle className="h-6 w-6" />
                      ) : (
                        <CheckCircle2 className="h-6 w-6 text-[#05E08A]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase ${
                            attendee.status === 'approved'
                              ? 'bg-[#05E08A]/20 text-[#05E08A] border border-[#05E08A]/40'
                              : attendee.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-[#FF9F1C]/20 text-[#FF9F1C] border border-[#FF9F1C]/40'
                          }`}
                        >
                          {attendee.status === 'approved'
                            ? '● Approved Attendee'
                            : attendee.status === 'rejected'
                            ? 'Declined'
                            : '⏳ Request Submitted · Pending Approval'}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID: {attendee.id}</span>
                      </div>
                      <h3 className="mt-1 text-xl font-bold text-white">
                        {attendee.status === 'approved'
                          ? `You're Confirmed, ${attendee.fullName}!`
                          : attendee.status === 'rejected'
                          ? `Application Review Status`
                          : `Request Submitted, ${attendee.fullName}!`}
                      </h3>
                    </div>
                  </div>

                  <img
                    src="/AWS_reinvent-dark.png"
                    alt="AWS re:Invent Dhule 2026"
                    className="h-10 sm:h-12 w-auto object-contain hidden sm:block opacity-95 filter drop-shadow"
                  />
                </div>

                {/* Status Notice Callout */}
                {attendee.status === 'approved' ? (
                  <div className="mt-5 space-y-4">
                    <div className="p-4 sm:p-5 rounded-xl border border-[#05E08A]/40 bg-[#05E08A]/10 text-xs sm:text-sm text-emerald-200">
                      <p>
                        <strong>Congratulations!</strong> Your registration has been verified and approved by the organizing team. Your seat at Hotel Anand Regency Riverfront is reserved for 04 December 2026.
                      </p>
                    </div>

                    {/* Official Digital QR Code Pass */}
                    <div className="rounded-2xl border-2 border-dashed border-[#3FB1FF]/40 bg-[#0A1220] p-6 text-center shadow-xl">
                      <div className="inline-block rounded-lg border border-[#3FB1FF]/30 bg-[#1E293B] px-3.5 py-1 text-xs font-mono font-bold text-[#3FB1FF] mb-4">
                        PASS ID: {attendee.id}
                      </div>

                      <div className="mx-auto flex justify-center p-3.5 bg-white rounded-2xl w-fit shadow-lg shadow-black/40">
                        <ReactQRCode
                          value={attendee.id}
                          size={190}
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
                            height: 42,
                            width: 42,
                            excavate: true,
                          }}
                        />
                      </div>

                      <p className="mt-3 text-[11px] font-mono text-slate-400 tracking-wider uppercase">
                        Present this QR Code at Symphony Hall (2F) Check-In
                      </p>
                    </div>

                    {/* Important Information Callout */}
                    <div className="rounded-xl border border-slate-800 bg-[#0E1526]/80 p-4 text-xs text-slate-300 text-left">
                      <h5 className="font-bold text-white mb-2.5 flex items-center gap-1.5">
                        <span>📋</span> Important Information
                      </h5>
                      <ul className="space-y-1.5 text-slate-300">
                        <li className="flex items-start gap-2"><span>✅</span> Carry a valid Government ID or College ID for verification.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Please arrive at least 30 minutes before the event starts.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Your ticket contains a unique QR code required for check-in.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Tickets are non-transferable unless approved by the organizing team.</li>
                        <li className="flex items-start gap-2"><span>✅</span> Keep this email accessible on the event day.</li>
                      </ul>
                      <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
                        Questions? Reach us at <a href="mailto:info@reinvent.awssbgdhule.in" className="text-[#3FB1FF] font-semibold underline">info@reinvent.awssbgdhule.in</a>
                      </div>
                    </div>
                  </div>
                ) : attendee.status === 'rejected' ? (
                  <div className="mt-5 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs sm:text-sm text-rose-200">
                    <p>
                      Your application could not be verified with the provided AWS Builder ID.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 p-4 sm:p-5 rounded-xl border border-[#05E08A]/40 bg-[#05E08A]/10 text-xs sm:text-sm flex items-start gap-3.5">
                    <div className="rounded-lg bg-[#05E08A]/20 p-2 text-[#05E08A] shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">
                        Your request is submitted successfully!
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                        Once the admin approves your entry, you will receive a confirmation email shortly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submitted Details Review List */}
                <div className="py-5 space-y-2.5 text-sm text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Full Name:</span>
                    <span className="font-medium text-white">{attendee.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Email Address:</span>
                    <span className="font-medium text-white">{attendee.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Mobile Number:</span>
                    <span className="font-mono text-white">{attendee.phone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-slate-800/60 min-w-0">
                    <span className="text-slate-400 shrink-0">AWS Builder Center:</span>
                    <a
                      href={`https://builder.aws.com/community/@${cleanBuilderAlias(attendee.builderId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-[#3FB1FF] hover:underline inline-flex items-center gap-1 text-xs min-w-0 truncate"
                    >
                      <span className="truncate max-w-[260px] sm:max-w-xs md:max-w-none">
                        @{cleanBuilderAlias(attendee.builderId)}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Institution:</span>
                    <span className="font-medium text-white">{attendee.college}</span>
                  </div>
                  {attendee.whyJoin && (
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400 shrink-0">Why Join:</span>
                      <span className="font-medium text-[#AB5CFF] italic text-left sm:text-right sm:max-w-md">"{attendee.whyJoin}"</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Venue &amp; Time:</span>
                    <span className="font-medium text-white">Anand Regency Riverfront · 9:00 AM IST</span>
                  </div>
                </div>

                {/* Action Buttons: Edit info removed, clean calendar button */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <a
                    href={EVENT_DETAILS.calendarGoogleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3FB1FF] to-[#05E08A] hover:opacity-95 py-3.5 px-5 text-xs font-bold text-slate-950 shadow-md cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Add to Google Calendar</span>
                  </a>
                </div>
              </div>
            ) : registrationStep === 1 ? (
              /* ========================================================================= */
              /* STEP 1: AWS Builder Center Official Registration                          */
              /* ========================================================================= */
              <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9F1C] via-[#FF57E8] to-[#3FB1FF]" />

                {/* Stepper Progress Bar */}
                <div className="mb-6 pb-5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    {/* Step 1 Pill */}
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF9F1C] text-xs font-bold text-slate-950 font-mono shadow-md shadow-[#FF9F1C]/20">
                        1
                      </span>
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF9F1C]">
                          Step 1 of 2
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          AWS Builder Center RSVP
                        </h3>
                      </div>
                    </div>

                    {/* Step 2 Pill (Upcoming) */}
                    <div className="hidden sm:flex items-center gap-2 opacity-50">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 font-mono">
                        2
                      </span>
                      <div className="text-left">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          Step 2
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Pass Details</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1 Main Body */}
                <div className="space-y-6">
                  {/* Prerequisite Notice */}
                  <div className="rounded-xl border border-[#FF9F1C]/30 bg-[#FF9F1C]/5 p-4 sm:p-5">
                    <div className="flex items-start gap-3.5">
                      <div className="rounded-lg bg-[#FF9F1C]/15 p-2 text-[#FF9F1C] shrink-0 mt-0.5">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">
                          Official AWS Registration Required First
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          To attend the AWS re:Invent Watch &amp; Build Party in Dhule, all participants must first register for the event on the official **Amazon Web Services Builder Center** platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="space-y-3 rounded-xl border border-slate-800 bg-[#090D16]/90 p-4 sm:p-5 text-xs text-slate-300">
                    <div className="font-mono font-semibold uppercase tracking-wider text-[11px] text-[#3FB1FF] flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#3FB1FF]" />
                      <span>How to Complete Step 1:</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pt-1">
                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3FB1FF]/15 text-[#3FB1FF] font-mono font-bold text-[11px]">
                          1
                        </span>
                        <div className="leading-relaxed">
                          Click the button below to open the official event page on <strong className="text-white">builder.aws.com</strong>.
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF9F1C]/15 text-[#FF9F1C] font-mono font-bold text-[11px]">
                          2
                        </span>
                        <div className="leading-relaxed">
                          Sign in with your <strong className="text-white">AWS Builder ID</strong> (or create one for free in 1 minute if you don't have one).
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#05E08A]/15 text-[#05E08A] font-mono font-bold text-[11px]">
                          3
                        </span>
                        <div className="leading-relaxed">
                          Click the <strong className="text-white">"Register"</strong> or <strong className="text-white">"RSVP"</strong> button on the AWS event page.
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF57E8]/15 text-[#FF57E8] font-mono font-bold text-[11px]">
                          4
                        </span>
                        <div className="leading-relaxed">
                          Come back to this tab, confirm your RSVP, and proceed to Step 2 to enter your pass details.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Link Button: Opens Builder Center Event Page */}
                  <a
                    href={EVENT_DETAILS.builderCenterEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasOpenedBuilderCenter(true)}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] via-[#FF57E8] to-[#3FB1FF] py-3.5 px-6 text-sm font-bold text-slate-950 hover:opacity-95 shadow-lg shadow-[#FF9F1C]/20 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <span>1. Open AWS Builder Center Event Page</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {hasOpenedBuilderCenter && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#05E08A]" />
                      <span>AWS event page opened in a new tab! Once you finish registering on AWS, check the box below to proceed.</span>
                    </div>
                  )}

                  {/* Checkbox Confirmation Gate */}
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={hasConfirmedBuilderRsvp}
                      onChange={(e) => setHasConfirmedBuilderRsvp(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#05E08A] focus:ring-[#05E08A] focus:ring-offset-0 cursor-pointer"
                    />
                    <div className="text-xs text-slate-300 select-none">
                      <span className="font-semibold text-white">
                        I have registered / RSVP'd for this event on AWS Builder Center
                      </span>
                      <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                        I will provide my valid AWS Builder alias in Step 2 for organizer verification.
                      </p>
                    </div>
                  </label>

                  {/* Continue Button to Step 2 */}
                  <button
                    type="button"
                    disabled={!hasConfirmedBuilderRsvp}
                    onClick={() => {
                      if (hasConfirmedBuilderRsvp) {
                        setRegistrationStep(2);
                      }
                    }}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold transition-all ${
                      hasConfirmedBuilderRsvp
                        ? 'bg-gradient-to-r from-[#3FB1FF] to-[#05E08A] text-slate-950 hover:opacity-95 shadow-lg shadow-[#3FB1FF]/25 cursor-pointer active:scale-[0.99]'
                        : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <span>Continue to Step 2: Fill Details &amp; Create Pass</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* STEP 2: Attendee Details & Local Pass Registration Form                   */
              /* ========================================================================= */
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-800 bg-[#0E1526] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3FB1FF] via-[#05E08A] to-[#AB5CFF]" />

                {/* Stepper Progress Bar */}
                <div className="mb-6 pb-4 border-b border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#05E08A] text-xs font-bold text-slate-950 font-mono shadow-md shadow-[#05E08A]/20">
                      2
                    </span>
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#05E08A]">
                        Step 2 of 2
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {attendee ? 'Update Your Attendance Request' : 'Attendee Details & Pass Request'}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRegistrationStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>← Back to Step 1</span>
                  </button>
                </div>

                {/* Step 1 Completion Banner */}
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#05E08A] shrink-0" />
                    <span>Step 1 Confirmed: Registered on AWS Builder Center</span>
                  </div>
                  <a
                    href={EVENT_DETAILS.builderCenterEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] underline font-semibold text-emerald-200 hover:text-white flex items-center gap-1 shrink-0"
                  >
                    <span>View AWS Event Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Soham Chaudhari"
                      className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none focus:ring-1 focus:ring-[#AB5CFF]"
                      required
                      maxLength={80}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email & Mobile Number Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none focus:ring-1 focus:ring-[#AB5CFF]"
                        required
                        maxLength={120}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9834382337"
                        className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none focus:ring-1 focus:ring-[#AB5CFF]"
                        required
                        maxLength={15}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* AWS Builder Center Alias ID with Direct 404 Check */}
                  <div className="rounded-xl border border-slate-800 bg-[#090D16]/90 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#3FB1FF]">
                        AWS Builder Center Alias / ID *
                      </label>
                      <a
                        href="https://profile.aws.amazon.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#05E08A] hover:underline"
                      >
                        <span>Create Builder ID on Builder Center</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* Input with automatic inline verification (no button needed) */}
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.builderId}
                        onChange={(e) => handleAliasChange(e.target.value)}
                        onBlur={handleAliasBlur}
                        placeholder="e.g. saurabhrajput1 or @saurabhrajput1"
                        className="w-full rounded-xl border border-slate-700 bg-[#0E1526] pl-4 pr-36 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#3FB1FF] focus:outline-none focus:ring-1 focus:ring-[#3FB1FF] font-mono lowercase"
                        required
                        maxLength={120}
                      />
                      {/* Inline live status indicator */}
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        {isVerifying ? (
                          <span className="flex items-center gap-1.5 text-xs text-[#3FB1FF] font-mono">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span className="text-[11px]">Checking...</span>
                          </span>
                        ) : verificationResult?.status === 'valid' ? (
                          verificationResult.hasEventRegistration ? (
                            <span className="flex items-center gap-1 text-[11px] text-[#05E08A] font-mono font-bold bg-[#05E08A]/10 px-2 py-0.5 rounded border border-[#05E08A]/30">
                              <span>✓ Registered on AWS</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              <span>⚠️ Missing Event RSVP</span>
                            </span>
                          )
                        ) : verificationResult?.status === 'invalid' ? (
                          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            <span>✕ 404 Not Found</span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {errors.builderId && (
                      <p className="text-xs text-rose-400">{errors.builderId}</p>
                    )}

                    {/* Real-time Verification Feedback Card */}
                    {verificationResult && (
                      <div>
                        {verificationResult.status === 'valid' ? (
                          verificationResult.hasEventRegistration ? (
                            /* STATE 1: Found in Event Attendee / Request list */
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-200 space-y-2">
                              <div className="flex items-center gap-3">
                                {verificationResult.avatar ? (
                                  <img
                                    src={verificationResult.avatar}
                                    alt="Avatar"
                                    className="h-8 w-8 rounded-full border border-emerald-500/40 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                                    ✓
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span className="text-[#05E08A]">✓ We found that you have registered on Builder Center!</span>
                                  </div>
                                  <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                                    @{verificationResult.alias} {verificationResult.displayName ? `(${verificationResult.displayName})` : ''}
                                  </div>
                                </div>
                              </div>
                              <p className="text-[11px] text-emerald-300/90 leading-relaxed pl-1 border-t border-emerald-500/20 pt-1.5">
                                Your event registration request was found for <strong>AWS re:Invent Watch &amp; Build Party Dhule</strong>. You can now fill out the form below to complete your pass application!
                              </p>
                            </div>
                          ) : (
                            /* STATE 2: Profile Valid, but NOT in Event Attendee / Request list */
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 space-y-3">
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-bold text-amber-300 text-sm">
                                    We couldn't find your registration on AWS Builder Center for this event
                                  </div>
                                  <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                                    We found your AWS profile (<span className="font-mono text-white">@{verificationResult.alias}</span>), but you haven't clicked <strong>"Register"</strong> on the official event page yet. Please register on the Builder Center first, then come back here to submit.
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                                <a
                                  href={EVENT_DETAILS.builderCenterEventUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md transition-all cursor-pointer"
                                >
                                  <span>1. Open Builder Center &amp; Register</span>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => triggerAutoVerify(formData.builderId, true)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:text-white transition-colors cursor-pointer"
                                >
                                  <RefreshCw className={`h-3 w-3 ${isVerifying ? 'animate-spin' : ''}`} />
                                  <span>2. Re-check Status</span>
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          /* STATE 3: 404 No profile found */
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-bold text-rose-300">
                                404 Not Found: Profile does not exist on AWS Builder Center
                              </div>
                              <div className="text-[11px] text-rose-300/80 mt-0.5 leading-relaxed">
                                AWS returned no profile for "@{verificationResult.alias}". If you recently created your Builder ID, please set up your public profile at{' '}
                                <a
                                  href="https://profile.aws.amazon.com/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline font-bold text-white"
                                >
                                  profile.aws.amazon.com
                                </a>{' '}
                                before submitting.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Enter your AWS Builder Center username (e.g. <span className="font-mono text-slate-300">saurabhrajput1</span>). Organizers will verify this profile before approving.
                    </p>
                  </div>

                  {/* College / Institution */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      College / Institution *
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Government College of Engineering"
                      className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none focus:ring-1 focus:ring-[#AB5CFF]"
                      required
                      maxLength={120}
                    />
                    {errors.college && (
                      <p className="mt-1 text-xs text-rose-400">{errors.college}</p>
                    )}
                  </div>

                  {/* Year of Study */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Year of Study
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-3.5 py-2.5 text-sm text-white focus:border-[#AB5CFF] focus:outline-none"
                    >
                      <option value="1st Year">1st Year (FE)</option>
                      <option value="2nd Year">2nd Year (SE)</option>
                      <option value="3rd Year">3rd Year (TE)</option>
                      <option value="4th Year">4th Year (BE)</option>
                      <option value="Postgraduate / Alumni">Postgraduate / Alumni</option>
                    </select>
                  </div>
                </div>

                {/* Why do you want to join this event? (max 10 words) */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                      Why do you want to join this event? <span className="text-[#AB5CFF]">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        countWords(formData.whyJoin) > 10
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                          : 'text-slate-400 bg-slate-900 border border-slate-800'
                      }`}
                    >
                      {countWords(formData.whyJoin)} / 10 words max
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.whyJoin}
                    onChange={(e) => {
                      setFormData({ ...formData, whyJoin: e.target.value });
                      if (errors.whyJoin) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.whyJoin;
                          return copy;
                        });
                      }
                    }}
                    placeholder="e.g. Master AWS cloud architecture and network with practitioners"
                    className={`w-full rounded-xl border bg-[#090D16] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                      errors.whyJoin || countWords(formData.whyJoin) > 10
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-700 focus:border-[#AB5CFF] focus:ring-[#AB5CFF]'
                    }`}
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Max 10 words describing your interest or learning goals for this watch &amp; build party.
                  </p>
                  {errors.whyJoin && (
                    <p className="text-xs text-rose-400">{errors.whyJoin}</p>
                  )}
                </div>

                {/* Terms & Conditions / Code of Conduct Checkbox */}
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-[#090D16] text-[#AB5CFF] focus:ring-[#AB5CFF] cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I agree to the{' '}
                      <a
                        href="/codeofconduct"
                        className="text-[#3FB1FF] font-semibold underline hover:text-[#72c7ff] inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Terms &amp; Conditions and Code of Conduct</span>
                      </a>
                      . I understand that registration does not guarantee entry, damage to the venue will be billed to the person responsible, swags are shipped from the USA and organizers are not liable for transit delays, and zero-tolerance policies apply to any harassment.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-rose-400 pl-7">{errors.terms}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="mt-7 flex items-center gap-3">
                  {(() => {
                    const isRsvpMissing = verificationResult?.status === 'valid' && verificationResult.hasEventRegistration === false;
                    return (
                      <button
                        type="submit"
                        disabled={isSubmitting || isRsvpMissing}
                        className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm font-bold transition-all shadow-lg ${
                          isRsvpMissing
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-not-allowed opacity-90'
                            : 'bg-[#AB5CFF] hover:bg-[#b873ff] text-[#0E131A] cursor-pointer shadow-[#AB5CFF]/20 disabled:opacity-50'
                        }`}
                      >
                        {isRsvpMissing ? (
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <span>Register on Builder Center First to Submit</span>
                          </span>
                        ) : (
                          <>
                            <span>{isSubmitting ? 'Submitting Request...' : 'Submit Attendance Request'}</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>

                {/* Post-Submit Email Instruction Note */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                  <Mail className="h-4 w-4 text-[#3FB1FF] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white">What happens next:</strong> After submitting your request, you will receive an email with quick next steps to complete to <strong className="text-[#3FB1FF]">significantly increase your chances of ticket confirmation</strong>.
                  </p>
                </div>

                <p className="mt-3 text-center text-[11px] text-slate-500">
                  ⚡ Applications are reviewed and verified manually by the AWS Student Builder Group leads.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Organizer Admin Review Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-800 bg-[#0E1526] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#090D16]">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#AB5CFF]/15 p-2 text-[#AB5CFF]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Organizer Verification Portal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manual attendee approval &amp; AWS Builder ID 404 verification
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAdminModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {!isAdminUnlocked ? (
              /* Passcode Unlock Screen */
              <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#090D16] border border-slate-800 text-[#05E08A]">
                  <Lock className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-bold text-white">Organizer Access</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter organizer verification passcode to review, accept, or decline attendee applications.
                </p>

                <form onSubmit={handleUnlockAdmin} className="space-y-3 pt-2">
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter passcode (e.g. aws2026)"
                    className="w-full rounded-xl border border-slate-700 bg-[#090D16] px-4 py-2.5 text-center text-sm text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none"
                    autoFocus
                  />
                  {adminError && <p className="text-xs text-rose-400">{adminError}</p>}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#AB5CFF] hover:bg-[#b873ff] py-2.5 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
                  >
                    Unlock Organizer Portal
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Hint: Passcode is <code className="text-slate-300">aws2026</code>
                  </p>
                </form>
              </div>
            ) : (
              /* Unlocked Review Dashboard */
              <div className="flex-1 flex flex-col p-5 overflow-hidden">
                {/* Stats & Search Strip */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  {/* Status Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setAdminFilter('all')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'all'
                          ? 'bg-[#3FB1FF] text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      All ({allRegistrations.length})
                    </button>
                    <button
                      onClick={() => setAdminFilter('pending')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'pending'
                          ? 'bg-[#FF9F1C] text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setAdminFilter('approved')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'approved'
                          ? 'bg-[#05E08A] text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Approved ({approvedCount})
                    </button>
                    <button
                      onClick={() => setAdminFilter('rejected')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        adminFilter === 'rejected'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Declined ({allRegistrations.filter((r) => r.status === 'rejected').length})
                    </button>
                  </div>

                  {/* Actions: Batch Verify & Search */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAdminVerifyAllPending}
                      disabled={isBatchVerifying || pendingCount === 0}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-40 cursor-pointer whitespace-nowrap"
                    >
                      <RefreshCw className={`h-3 w-3 ${isBatchVerifying ? 'animate-spin' : ''}`} />
                      <span>Verify Pending (Check 404s)</span>
                    </button>

                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, builder ID..."
                        className="rounded-xl border border-slate-700 bg-[#090D16] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#AB5CFF] focus:outline-none w-full sm:w-56"
                      />
                    </div>
                  </div>
                </div>

                {/* Submissions List */}
                <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1">
                  {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No registrations match your search or filter.
                    </div>
                  ) : (
                    filteredRegistrations.map((item) => {
                      const cleanAlias = cleanBuilderAlias(item.builderId);
                      const verifyState = adminVerifyMap[item.id];

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-800 bg-[#090D16]/90 p-4 transition-all hover:border-slate-700"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Attendee Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-white">{item.fullName}</h5>
                                <span className="font-mono text-[10px] text-slate-500">{item.id}</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
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

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                <a
                                  href={`mailto:${item.email}`}
                                  className="inline-flex items-center gap-1 hover:text-white"
                                >
                                  <Mail className="h-3 w-3 text-slate-500" />
                                  <span>{item.email}</span>
                                </a>
                                <a
                                  href={`tel:${item.phone}`}
                                  className="inline-flex items-center gap-1 text-[#05E08A] hover:underline font-mono"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{item.phone}</span>
                                </a>
                                <div className="inline-flex items-center gap-1 text-slate-300">
                                  <Building className="h-3 w-3 text-slate-500" />
                                  <span>{item.college} ({item.year})</span>
                                </div>
                              </div>

                              {/* Builder Center Profile & Verification Status */}
                              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-slate-400">Builder Profile:</span>
                                <span className="font-mono font-bold text-[#3FB1FF] bg-[#0E1526] px-2 py-0.5 rounded border border-slate-800">
                                  @{cleanAlias}
                                </span>

                                {/* Verification API Check Result */}
                                {verifyState && (
                                  <div>
                                    {verifyState.status === 'checking' ? (
                                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400 font-mono inline-flex items-center gap-1">
                                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                        Checking...
                                      </span>
                                    ) : verifyState.status === 'valid' ? (
                                      <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono font-bold inline-flex items-center gap-1">
                                        ✓ 200 Valid ({verifyState.displayName})
                                      </span>
                                    ) : (
                                      <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[11px] font-mono font-bold inline-flex items-center gap-1">
                                        ✕ 404 Profile Not Found
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Auto Check Button */}
                                <button
                                  type="button"
                                  onClick={() => handleAdminVerifySingle(item)}
                                  className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[11px] text-slate-300 transition-colors cursor-pointer"
                                  title="Check 404 status via API"
                                >
                                  <RefreshCw className="h-2.5 w-2.5" />
                                  <span>Test 404</span>
                                </button>

                                {/* Direct Profile Tab Link */}
                                <a
                                  href={`https://builder.aws.com/community/@${cleanAlias}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded bg-[#3FB1FF]/15 hover:bg-[#3FB1FF]/25 border border-[#3FB1FF]/30 px-2 py-0.5 text-[11px] font-mono font-bold text-[#3FB1FF] transition-colors"
                                >
                                  <span>Open Page ↗</span>
                                </a>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                              {item.status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'approved')}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#05E08A] hover:bg-[#0fd686] px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {item.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Decline (404)</span>
                                </button>
                              )}

                              {item.status !== 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'pending')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-800 p-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                                  title="Reset to Pending"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer notes */}
                <div className="pt-4 border-t border-slate-800 mt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span>Logged in as Organizers (Soham Chaudhari &amp; Saurabh Rajput)</span>
                  <button
                    onClick={() => {
                      localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(DEFAULT_SAMPLE_REGISTRATIONS));
                      setAllRegistrations(DEFAULT_SAMPLE_REGISTRATIONS);
                      setAdminVerifyMap({});
                    }}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Sample Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms & Conditions / Code of Conduct Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAgreedToTerms(true)}
      />
    </section>
  );
};
