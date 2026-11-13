import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Lock,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Search,
  UserCheck,
  Zap,
  ZapOff,
  ExternalLink,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Attendee } from '../../../types';
import { apiUrl, FRONTEND_URL } from '../../../utils/api';

interface AdminScannerPageProps {
  onNavigateHome: () => void;
  onNavigateAdminPortal?: () => void;
}

// Robust Ticket ID Extractor from any format (raw ID, URL, JSON, QR payload)
export const extractCleanTicketId = (raw: string): string => {
  if (!raw) return '';
  let str = raw.trim().replace(/^["']|["']$/g, '');

  // 1. If scanned content is JSON e.g. {"id": "riv-26-9932"}
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const obj = JSON.parse(str);
      const extracted = obj.id || obj.ticketId || obj.ticket_id || obj.ticket;
      if (extracted) str = String(extracted).trim();
    } catch {}
  }

  // 2. Direct regex for new format riv-26-XXXX (case-insensitive)
  const rivMatch = str.match(/(riv-26-[a-zA-Z0-9]+)/i);
  if (rivMatch && rivMatch[1]) {
    return rivMatch[1].toLowerCase();
  }

  // 3. Direct regex for legacy format DHU-XXXX (case-insensitive)
  const dhuMatch = str.match(/(DHU-[a-zA-Z0-9]+)/i);
  if (dhuMatch && dhuMatch[1]) {
    return dhuMatch[1].toUpperCase();
  }

  // 4. Look for ticketid= in path or query
  if (/ticketid[=/]/i.test(str)) {
    const m = str.match(/ticketid[=/]([a-zA-Z0-9_-]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
  }

  // 5. Look for /ticket/ in URL path
  if (/\/ticket\/([a-zA-Z0-9_-]+)/i.test(str)) {
    const m = str.match(/\/ticket\/([a-zA-Z0-9_-]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
  }

  // 6. Look for verify= parameter in URL
  if (/verify=([a-zA-Z0-9_-]+)/i.test(str)) {
    const m = str.match(/verify=([a-zA-Z0-9_-]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
  }

  // 7. General search param parsing
  if (str.includes('?')) {
    try {
      const url = new URL(str, FRONTEND_URL || 'https://reinvent.awssbgdhule.in');
      const param = url.searchParams.get('ticketid') || url.searchParams.get('ticket') || url.searchParams.get('id');
      if (param) return param.trim().toLowerCase();
    } catch {}
  }

  return str.trim();
};

export const AdminScannerPage: React.FC<AdminScannerPageProps> = ({ onNavigateHome, onNavigateAdminPortal }) => {
  // Authentication State
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('aws_reinvent_admin_token') || null;
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualTicketInput, setManualTicketInput] = useState('');

  // Scan Result State
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    message: string;
    attendee?: Attendee;
    scannedAt?: string;
  } | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ id: string; name: string; time: string; status: string }>>([]);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedTime = useRef<number>(0);
  const lastScannedCode = useRef<string>('');

  // Web Audio Synth & Haptic Feedback for Check-In
  const playBeep = (type: 'success' | 'warning' | 'error') => {
    // 1. Haptic vibration (mobile devices)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        if (type === 'success') {
          navigator.vibrate(100);
        } else if (type === 'warning') {
          navigator.vibrate([60, 40, 60]);
        } else {
          navigator.vibrate([200, 100, 200]);
        }
      } catch {}
    }

    // 2. Audio chime
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(550, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {}
  };

  // Handle Admin Passcode Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: passcode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data?.token) {
        setToken(data.token);
        localStorage.setItem('aws_reinvent_admin_token', data.token);
      } else {
        setAuthError(data?.message || 'Invalid passcode. Access denied.');
      }
    } catch (err: any) {
      setAuthError(`Connection error: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Check In API Call
  const processCheckIn = async (rawCode: string) => {
    if (!token || isProcessing) return;

    const ticketId = extractCleanTicketId(rawCode);
    if (!ticketId) return;

    // Rate-limit identical scan triggers within 2 seconds
    const now = Date.now();
    if (ticketId === lastScannedCode.current && now - lastScannedTime.current < 2000) {
      return;
    }
    lastScannedTime.current = now;
    lastScannedCode.current = ticketId;

    setIsProcessing(true);

    try {
      const res = await fetch(apiUrl('/api/admin/checkin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId }),
      });

      const data = await res.json();
      const currentTimeStr = new Date().toLocaleTimeString();

      if (res.ok && data?.success) {
        if (data.alreadyCheckedIn) {
          playBeep('warning');
          setLastScannedResult({
            success: true,
            alreadyCheckedIn: true,
            message: data.message,
            attendee: data.attendee,
            scannedAt: currentTimeStr,
          });
        } else {
          playBeep('success');
          setLastScannedResult({
            success: true,
            alreadyCheckedIn: false,
            message: data.message,
            attendee: data.attendee,
            scannedAt: currentTimeStr,
          });

          // Add to recent scans list
          if (data.attendee) {
            setScanHistory((prev) => [
              {
                id: data.attendee.id,
                name: data.attendee.fullName,
                time: currentTimeStr,
                status: 'Checked In',
              },
              ...prev.slice(0, 9),
            ]);
          }
        }
      } else {
        playBeep('error');
        setLastScannedResult({
          success: false,
          message: data?.message || `Pass #${ticketId} is not approved or invalid.`,
          attendee: data?.attendee,
          scannedAt: currentTimeStr,
        });
      }
    } catch (err: any) {
      playBeep('error');
      setLastScannedResult({
        success: false,
        message: `Network error verifying pass: ${err.message}`,
        scannedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Start Camera Stream with Robust Cross-Device Fallback
  const startCamera = async () => {
    setCameraError(null);
    setHasTorch(false);
    setTorchOn(false);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          window.isSecureContext === false
            ? 'Camera requires a secure HTTPS connection or localhost. Please access via https:// or localhost.'
            : 'Camera access is not supported on this browser.'
        );
      }

      let stream: MediaStream;
      try {
        // Preferred modern constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Initial camera constraints failed, attempting fallback:', firstErr);
        // Fallback for laptops/desktops or devices without rear camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      // Check for Flashlight / Torch capability on mobile
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = typeof videoTrack.getCapabilities === 'function' ? videoTrack.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play().catch((playErr) => {
          console.warn('Video play was delayed or auto-play prevented:', playErr);
        });
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in browser permissions.'
          : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
          ? 'No camera found on this device. You can still use the manual ticket ID input below.'
          : `Camera error: ${err.message || 'Unable to access camera device'}`
      );
      setIsCameraActive(false);
    }
  };

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track: any = streamRef.current.getVideoTracks()[0];
    if (track && typeof track.applyConstraints === 'function') {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    setIsCameraActive(false);
  };

  // Video Frame Scanning Loop (Optimized with dynamic downscaling)
  useEffect(() => {
    if (!token || !isCameraActive) return;

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          // Limit canvas resolution to max 640px to ensure smooth 60fps across mobile devices without overheating
          const maxDim = 640;
          const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
          const targetWidth = Math.round(video.videoWidth * scale);
          const targetHeight = Math.round(video.videoHeight * scale);

          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }

          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          // attemptBoth ensures detection in glare, low light, and inverted screens
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            processCheckIn(code.data);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [token, isCameraActive, isProcessing]);

  // Lifecycle Camera Activation
  useEffect(() => {
    if (token) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [token, facingMode]);

  // Toggle Camera Front / Back
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Manual Check-In Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketInput.trim()) return;
    processCheckIn(manualTicketInput.trim());
    setManualTicketInput('');
  };

  // 1. Password Protection Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-center items-center px-4 selection:bg-[#3FB1FF]/30">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0E1526] p-8 shadow-2xl relative overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-[#3FB1FF] via-[#FF57E8] to-[#05E08A] absolute top-0 left-0" />

          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#3FB1FF]/10 border border-[#3FB1FF]/30 text-[#3FB1FF] flex items-center justify-center mx-auto">
              <QrCode className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Organizer Reception Scanner</h1>
            <p className="text-xs text-slate-400">
              Enter event admin passcode to unlock the live QR check-in camera.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Passcode (from .env)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter ADMIN_KEY..."
                  autoFocus
                  required
                  className="w-full rounded-xl bg-[#090D16] border border-slate-700/80 pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#3FB1FF] focus:outline-none focus:ring-1 focus:ring-[#3FB1FF]"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 rounded-xl bg-linear-to-r from-[#3FB1FF] to-[#05E08A] text-[#090D16] font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer shadow-lg shadow-[#3FB1FF]/20"
            >
              {isAuthenticating ? 'Verifying Passcode...' : 'Unlock QR Scanner'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Active Scanner Screen
  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col selection:bg-[#3FB1FF]/30">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-[#0A0E1A]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Reception Scanner</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#05E08A]/15 text-[#05E08A] border border-[#05E08A]/30">
                  LIVE
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">AWS re:Invent Dhule 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                soundEnabled
                  ? 'border-[#3FB1FF]/30 bg-[#3FB1FF]/10 text-[#3FB1FF]'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute Beep Chime' : 'Enable Beep Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                  torchOn
                    ? 'border-amber-400/50 bg-amber-400/20 text-amber-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
              >
                {torchOn ? <Zap className="w-4 h-4 text-amber-300" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={toggleFacingMode}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Flip Camera (Front/Rear)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            {onNavigateAdminPortal && (
              <button
                onClick={onNavigateAdminPortal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                <span>Admin Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Scanner Section */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 flex flex-col space-y-5">
        {/* Camera Viewport Container */}
        <div className="relative rounded-3xl border border-slate-800 bg-black overflow-hidden shadow-2xl aspect-4/3 flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {/* Hidden Canvas for QR decoding */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Overlay with Animated Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/20 rounded-2xl relative">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#3FB1FF] rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#3FB1FF] rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#05E08A] rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#05E08A] rounded-br-lg" />

              {/* Pulsing scanning laser */}
              <div className="w-full h-0.5 bg-linear-to-r from-transparent via-[#3FB1FF] to-transparent shadow-[0_0_8px_#3FB1FF] absolute top-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-[#090D16]/95 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <p className="text-xs sm:text-sm text-slate-300 max-w-xs">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-[#3FB1FF] text-[#090D16] font-bold text-xs"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Scanning indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#05E08A] animate-ping" />
            <span>Point camera at attendee QR pass</span>
          </div>
        </div>

        {/* Scan Result Feedback Card */}
        {lastScannedResult && (
          <div
            className={`rounded-2xl border p-5 shadow-xl transition-all ${
              !lastScannedResult.success
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : lastScannedResult.alreadyCheckedIn
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-[#05E08A]/50 text-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                {!lastScannedResult.success ? (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                ) : lastScannedResult.alreadyCheckedIn ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-[#05E08A] shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {!lastScannedResult.success
                      ? 'Invalid / Not Approved'
                      : lastScannedResult.alreadyCheckedIn
                      ? 'Already Checked In!'
                      : 'Verified & Checked In!'}
                  </h3>
                  <p className="text-xs opacity-90">{lastScannedResult.message}</p>
                </div>
              </div>

              <button
                onClick={() => setLastScannedResult(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-black/20"
              >
                Dismiss
              </button>
            </div>

            {lastScannedResult.attendee && (
              <>
                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Attendee Name</span>
                    <span className="font-bold text-white">{lastScannedResult.attendee.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Pass ID</span>
                    <span className="font-mono font-bold text-[#3FB1FF]">{lastScannedResult.attendee.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">AWS Builder ID</span>
                    <span className="font-mono text-[#3FB1FF]">@{lastScannedResult.attendee.builderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">College</span>
                    <span className="truncate text-white block">{lastScannedResult.attendee.college}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <a
                    href={`/ticketid=${encodeURIComponent(lastScannedResult.attendee.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3FB1FF] hover:underline cursor-pointer"
                  >
                    <span>View Pass Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => setLastScannedResult(null)}
                    className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] cursor-pointer transition-colors"
                  >
                    Scan Next Pass →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Manual Barcode / Ticket ID Input */}
        <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Manual Ticket ID / USB Scanner Input
          </label>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={manualTicketInput}
                onChange={(e) => setManualTicketInput(e.target.value)}
                placeholder="Type or scan riv-26-XXXX..."
                className="w-full rounded-xl bg-[#090D16] border border-slate-700 pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:border-[#3FB1FF] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!manualTicketInput.trim() || isProcessing}
              className="px-4 py-2 rounded-xl bg-[#3FB1FF] text-[#090D16] font-bold text-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Recent Check-Ins Stream */}
        {scanHistory.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-[#0E1526] p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Recent Check-Ins ({scanHistory.length})</span>
              <UserCheck className="w-4 h-4 text-[#05E08A]" />
            </h4>
            <div className="divide-y divide-slate-800 text-xs">
              {scanHistory.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#05E08A] font-bold block">{item.status}</span>
                    <span className="text-[10px] text-slate-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
