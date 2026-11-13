import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';

interface AdminLoginFormProps {
  onLogin: (key: string) => Promise<{ success: boolean; message?: string }>;
  onNavigateHome: () => void;
  isLoading: boolean;
  error?: string;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  onLogin,
  onNavigateHome,
  isLoading,
  error,
}) => {
  const [adminKey, setAdminKey] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!adminKey.trim()) {
      setLocalError('Please enter the Admin Key');
      return;
    }

    const res = await onLogin(adminKey.trim());
    if (!res.success) {
      setLocalError(res.message || 'Invalid passcode. Access denied.');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0E1526] p-8 shadow-2xl relative">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Event Site</span>
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#AB5CFF]/10 text-[#AB5CFF] border border-[#AB5CFF]/30 mb-3 shadow-inner">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin & Organizer Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-protected route · Requires valid <code className="text-[#3FB1FF] font-mono">ADMIN_KEY</code>
          </p>
        </div>

        {displayError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Admin Passkey
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter ADMIN_KEY"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full rounded-xl bg-[#090D16] border border-slate-700/80 pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#AB5CFF] focus:ring-1 focus:ring-[#AB5CFF]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Configured in Server <code className="text-slate-300 font-mono">.env</code> as <code className="text-[#3FB1FF] font-mono">ADMIN_KEY</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-[#AB5CFF] to-[#3FB1FF] py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="h-4 w-4" />
            <span>{isLoading ? 'Verifying with Server...' : 'Unlock Admin Portal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

