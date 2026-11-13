import React, { useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, FileText, CheckCircle2, UserX, Gift, Scale, ExternalLink } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-slate-800 bg-[#0E1526] shadow-2xl flex flex-col overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-[#090D16]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#AB5CFF]/15 p-2 text-[#AB5CFF]">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Terms &amp; Conditions &amp; Code of Conduct
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">
                  AWS re:Invent Watch &amp; Build Party Dhule 2026
                </span>
                <span className="text-slate-600">·</span>
                <a
                  href="/codeofconduct"
                  onClick={onClose}
                  className="text-xs font-mono text-[#3FB1FF] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full /codeofconduct Page</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm leading-relaxed">
          
          {/* Important Callout */}
          <div className="rounded-xl border border-[#FF9F1C]/30 bg-[#FF9F1C]/10 p-4 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#FF9F1C] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Attendee Acknowledgement</p>
              <p className="mt-0.5 text-xs text-amber-200/90 leading-relaxed">
                By registering for or entering the AWS re:Invent Watch &amp; Build Party Dhule, you explicitly agree to adhere to these rules, the venue safety guidelines, and respectful community conduct.
              </p>
            </div>
          </div>

          {/* Section 1: Venue Liability & Damage */}
          <div className="space-y-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <h3>1. Venue Safety &amp; Property Liability</h3>
            </div>
            <p className="text-slate-300">
              Attendees must treat the premises of <strong>Hotel Anand Regency Riverfront</strong> (including Symphony Hall 2nd Floor, Harmony Hall 3rd Floor, elevators, restrooms, electrical fixtures, projection screens, audio-visual gear, and furniture) with utmost care.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>
                <strong className="text-white">Zero Liability on Organizers:</strong> AWS Student Builder Group Dhule, its student organizers, and affiliated volunteers <strong>will not be held responsible or legally liable</strong> for any property damage, equipment harm, or breakage caused by attendees.
              </li>
              <li>
                <strong className="text-white">Direct Financial &amp; Legal Responsibility:</strong> The individual(s) causing any harm, breakage, vandalism, or damage to hotel property will be held <strong>exclusively and individually liable</strong> for full restitution, monetary reimbursement, and repair expenses as assessed by the hotel management.
              </li>
            </ul>
          </div>

          {/* Section 2: Strict Anti-Harassment & Zero Tolerance */}
          <div className="space-y-2 rounded-xl bg-slate-900/60 border border-rose-900/40 p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <UserX className="h-4 w-4 text-rose-400 shrink-0" />
              <h3>2. Strict Anti-Harassment &amp; Code of Conduct</h3>
            </div>
            <p className="text-slate-300">
              We are dedicated to providing a safe, inclusive, welcoming, and harassment-free experience for everyone, regardless of gender, gender identity, sexual orientation, disability, physical appearance, race, ethnicity, or religion.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>
                <strong className="text-rose-300">Zero Tolerance for Harassment:</strong> Any form of verbal harassment, stalking, unwelcome physical contact, inappropriate comments, derogatory remarks, or non-consensual photography/recording directed at any attendee—<strong>especially female participants, female volunteers, or college students</strong>—is strictly prohibited.
              </li>
              <li>
                <strong className="text-rose-300">Immediate Eviction &amp; Legal Actions:</strong> Any attendee found violating this code will face <strong>immediate ejection from the venue</strong> without recourse. The organizing committee will report the incident immediately to local law enforcement authorities and the individual’s academic institution for disciplinary action.
              </li>
            </ul>
          </div>

          {/* Section 3: Right of Admission & Removal */}
          <div className="space-y-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <FileText className="h-4 w-4 text-[#3FB1FF] shrink-0" />
              <h3>3. Registration Approval &amp; Right of Admission</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>
                <strong className="text-white">Registration Does Not Equal Confirmed Entry:</strong> Submitting an online attendance request does <strong>not</strong> automatically guarantee access or attendance. All registrations undergo manual review and verification by the organizing committee. Only participants with an <strong>Approved</strong> digital pass are permitted entry.
              </li>
              <li>
                <strong className="text-white">Organizers' Right to Evict:</strong> Organizers reserve the absolute right of admission. The organizing leads reserve the unilateral right to refuse entry, revoke digital passes, or remove/escort any person outside the venue for disorderly behavior, intoxication, disruption of sessions, failure to follow instructions, or any reason deemed necessary for the safety and integrity of the event.
              </li>
              <li>
                <strong className="text-white">Professional &amp; Neat Demeanor:</strong> Attendees are expected to conduct themselves courteously, behave neatly, keep the halls clean, and respect fellow builders, speakers, hotel staff, and event volunteers at all times.
              </li>
            </ul>
          </div>

          {/* Section 4: Swags & International Logistics */}
          <div className="space-y-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <Gift className="h-4 w-4 text-[#FF57E8] shrink-0" />
              <h3>4. Swags, Goodies &amp; International Shipping Disclaimer</h3>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>
                <strong className="text-white">Shipped by AWS from the USA:</strong> Official re:Invent swags, commemorative pins, stickers, and winner goodies are dispatched directly by Amazon Web Services (AWS) team from the United States.
              </li>
              <li>
                <strong className="text-white">No Liability for Courier/Customs Delays:</strong> If promotional swags cannot clear international customs or fail to reach the venue in time due to logistical, courier, or air freight delays beyond our control, <strong>AWS Student Builder Group Dhule, its leads, and event organizers bear zero responsibility or liability</strong>.
              </li>
              <li>
                Swag items and sizes are subject to availability and distributed on a first-come, first-served or Kahoot championship basis.
              </li>
            </ul>
          </div>

          {/* Section 5: Media & Photography */}
          <div className="space-y-2 rounded-xl bg-slate-900/60 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
              <CheckCircle2 className="h-4 w-4 text-[#05E08A] shrink-0" />
              <h3>5. Event Media &amp; Community Photography</h3>
            </div>
            <p className="text-slate-400 text-xs">
              By attending, you grant permission to the organizing committee and AWS community media teams to take photographs and record video clips during sessions, Kahoot arena battles, and the closing photo for non-commercial community recap articles, social channels, and builder retrospectives.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#090D16] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            By proceeding, you acknowledge having read and agreed to all terms above.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="flex-1 sm:flex-initial rounded-full bg-[#AB5CFF] hover:bg-[#b873ff] px-6 py-2.5 text-xs font-bold text-[#0E131A] transition-all cursor-pointer shadow-md"
              >
                I Agree &amp; Understand
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-full border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

