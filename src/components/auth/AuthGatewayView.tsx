import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Music2,
  Users,
  Heart,
  ArrowLeft,
  AtSign,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
  X
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { AuthService } from '../../services/auth';
import { StorageService } from '../../services/storage';
import { TeamMember } from '../../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const AuthGatewayView: React.FC = () => {
  const { loginUser, registerUser } = useWorship();

  // Mode: 'landing' (mockup visual) | 'login' | 'register'
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'register'>('landing');

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regVocalRange, setRegVocalRange] = useState<TeamMember['vocal_range']>('Alto');
  const [regRoleTitle, setRegRoleTitle] = useState('Worship Team Vocalist');
  const [regInstrument, setRegInstrument] = useState('Vocals');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; message?: string }>({ checking: false });

  // Known local members for quick-select
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    try {
      const mems = StorageService.getMembers();
      setAvailableMembers(mems);
    } catch (e) {
      console.warn('Failed to load local members:', e);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Debounced username check for register
  useEffect(() => {
    const raw = regUsername.trim();
    if (!raw || raw.length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      const res = await AuthService.checkUsernameAvailable(raw);
      setUsernameStatus({
        checking: false,
        available: res.available,
        message: res.available ? 'Username is available' : res.error
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [regUsername]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('PWA install error:', err);
        setShowInstallHelp(true);
      }
    } else {
      setShowInstallHelp(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await loginUser(loginUsername, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Login failed. Please check your username and password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await registerUser({
        username: regUsername,
        fullName: regFullName,
        password: regPassword,
        roleTitle: regRoleTitle,
        vocalRange: regVocalRange,
        instrument: regInstrument
      });

      if (res.success) {
        setRegSuccess(`Welcome @${regUsername}! Logging you in...`);
      } else {
        setRegError(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECE5D7] via-[#F4EFE6] to-[#E5DCC8] flex items-center justify-center p-0 sm:p-4 selection:bg-[#E8DFD1]">
      {/* Mobile viewport container matching reference layout */}
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-[860px] sm:max-h-[96vh] bg-[#F7F4EE] sm:rounded-[38px] shadow-2xl border-0 sm:border sm:border-stone-200/80 flex flex-col justify-between relative overflow-y-auto overflow-x-hidden animate-fade-in">
        
        {/* Organic curved waves overlay at top */}
        <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none opacity-40 overflow-hidden">
          <svg
            viewBox="0 0 430 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <path
              d="M-20,40 C80,90 140,-10 260,60 C360,120 400,30 460,80 L460,-20 L-20,-20 Z"
              fill="#E8DDCD"
            />
            <path
              d="M-30,120 C60,170 170,80 290,140 C380,190 420,110 470,160 L470,-20 L-30,-20 Z"
              fill="#F2EAE0"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* ============================================================ */}
        {/* VIEW MODE: LANDING (Exact Match to Mockup) */}
        {/* ============================================================ */}
        {viewMode === 'landing' && (
          <div className="flex-1 flex flex-col justify-between relative z-10">
            {/* Top Content Block */}
            <div className="px-6 pt-7 sm:pt-9 pb-2 flex flex-col items-center text-center">
              {/* Circular Worship Team Emblem */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105">
                <img
                  src="/images/worship_team_profile.png"
                  alt="Beholding Jesus Worship Team"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/apple-touch-icon.png';
                  }}
                />
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif text-[29px] sm:text-[33px] text-[#141413] font-normal tracking-tight leading-[1.14] mt-3 sm:mt-4">
                Worship Together.<br />
                Anywhere, Anytime.
              </h1>

              <p className="text-[#646057] text-[13px] sm:text-[14px] max-w-[280px] sm:max-w-[300px] mx-auto leading-relaxed mt-2 font-normal">
                Join our worship community, access songs, and be part of something greater.
              </p>

              {/* Action Buttons & Triad */}
              <div className="flex flex-col items-center w-full max-w-[315px] mx-auto mt-4 sm:mt-5">
                {/* Login Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-full py-3.5 px-6 rounded-full bg-[#121212] hover:bg-[#222220] active:scale-[0.98] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                >
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Register Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-[#FAF7F2] active:scale-[0.98] text-[#121212] border border-[#1A1918] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xs transition-all mt-2.5 cursor-pointer group"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Divider: Get the App */}
                <div className="w-full flex items-center gap-3 my-3.5 sm:my-4">
                  <div className="flex-1 h-[1px] bg-[#DDD6C8]" />
                  <span className="text-[11px] sm:text-xs text-[#7A756D] font-medium tracking-wide">
                    Get the App
                  </span>
                  <div className="flex-1 h-[1px] bg-[#DDD6C8]" />
                </div>

                {/* Install App Button */}
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-6 rounded-full bg-[#121212] hover:bg-[#222220] active:scale-[0.98] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Install App</span>
                </button>

                {/* Triad Features (Music, Community, Inspired) */}
                <div className="w-full grid grid-cols-3 divide-x divide-[#DDD6C8] mt-4 text-center">
                  <div className="flex flex-col items-center justify-center px-1">
                    <Music2 className="w-5 h-5 text-[#1C1B19] stroke-[1.6]" />
                    <span className="text-[10px] sm:text-[11px] text-[#2C2925] font-medium leading-tight mt-1.5">
                      Worship<br />Music
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-1">
                    <Users className="w-5 h-5 text-[#1C1B19] stroke-[1.6]" />
                    <span className="text-[10px] sm:text-[11px] text-[#2C2925] font-medium leading-tight mt-1.5">
                      Community
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-1">
                    <Heart className="w-5 h-5 text-[#1C1B19] stroke-[1.6]" />
                    <span className="text-[10px] sm:text-[11px] text-[#2C2925] font-medium leading-tight mt-1.5">
                      Be Inspired
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Worship Silhouette with Golden Cross (Edge-to-Edge flush bottom) */}
            <div className="w-full relative mt-auto block leading-none">
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#F7F4EE] via-[#F7F4EE]/60 to-transparent pointer-events-none" />
              <img
                src="/images/gateway_cross_silhouette.png"
                alt="Worship Congregation Facing Cross"
                className="w-full h-[180px] sm:h-[210px] object-cover object-top block"
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW MODE: LOGIN */}
        {/* ============================================================ */}
        {viewMode === 'login' && (
          <div className="flex-1 flex flex-col justify-between relative z-10 px-6 pt-6 pb-6 animate-slide-up">
            <div>
              {/* Back button */}
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mt-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2DAD0] p-1 shadow-2xs shrink-0 overflow-hidden">
                  <img
                    src="/images/worship_team_profile.png"
                    alt="Emblem"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                    Sign In
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    Beholding Jesus Worship Team Portal
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 mt-2">
                {loginError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. mikoworship or anjelo"
                      autoComplete="username"
                      className="w-full text-xs pl-10 pr-3 py-3 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full text-xs pl-10 pr-10 py-3 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading || !loginUsername.trim() || !loginPassword.trim()}
                  className="w-full py-3.5 rounded-full bg-[#121212] hover:bg-stone-900 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer mt-2"
                >
                  {loginLoading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In & Enter App</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Sign-In Pills (if members exist) */}
              {availableMembers.length > 0 && (
                <div className="mt-5 pt-4 border-t border-stone-200/80">
                  <p className="text-[11px] font-bold text-stone-500 mb-2">
                    Quick Sign-In as Registered Member:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableMembers.slice(0, 4).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setLoginUsername(m.username || m.name.toLowerCase().replace(/\s+/g, ''));
                          setLoginPassword('Member2026!');
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50/70 border border-stone-200 text-xs font-semibold text-stone-700 transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center text-[9px] font-bold">
                          {m.avatar && m.avatar.includes('/') ? (
                            <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{m.avatar || m.name.slice(0, 1)}</span>
                          )}
                        </div>
                        <span>{m.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Switch Link */}
            <div className="text-center pt-4">
              <p className="text-xs text-stone-600">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('register')}
                  className="font-bold text-stone-900 underline underline-offset-2 hover:text-amber-900 cursor-pointer"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW MODE: REGISTER */}
        {/* ============================================================ */}
        {viewMode === 'register' && (
          <div className="flex-1 flex flex-col justify-between relative z-10 px-6 pt-6 pb-6 animate-slide-up">
            <div>
              {/* Back button */}
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mt-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#E2DAD0] p-1 shadow-2xs shrink-0 overflow-hidden">
                  <img
                    src="/images/worship_team_profile.png"
                    alt="Emblem"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                    Create Account
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Join Beholding Jesus Worship Ministry
                  </p>
                </div>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                {regError && (
                  <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                    Real Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. John Miko Sarsalijo"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Unique Username */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-stone-700">
                      Unique Username *
                    </label>
                    {usernameStatus.checking ? (
                      <span className="text-[10px] text-stone-400">Checking...</span>
                    ) : usernameStatus.available !== undefined ? (
                      <span className={`text-[10px] font-bold ${usernameStatus.available ? 'text-emerald-600' : 'text-red-500'}`}>
                        {usernameStatus.message}
                      </span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      placeholder="e.g. mikoworship"
                      className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-medium"
                    />
                  </div>
                </div>

                {/* Vocal Range & Role */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                      Vocal Range
                    </label>
                    <select
                      value={regVocalRange}
                      onChange={(e) => setRegVocalRange(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs cursor-pointer font-medium"
                    >
                      <option value="Soprano">Soprano</option>
                      <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                      <option value="Alto">Alto</option>
                      <option value="Tenor">Tenor</option>
                      <option value="Baritone">Baritone</option>
                      <option value="Bass">Bass</option>
                      <option value="Instrumentalist">Instrumentalist Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                      Ministry Role
                    </label>
                    <select
                      value={regRoleTitle}
                      onChange={(e) => setRegRoleTitle(e.target.value)}
                      className="w-full text-xs px-2.5 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs cursor-pointer font-medium"
                    >
                      <option value="Worship Leader">Worship Leader</option>
                      <option value="Worship Team Vocalist">Vocalist</option>
                      <option value="Acoustic Guitarist">Acoustic Guitar</option>
                      <option value="Keyboardist / Pianist">Keys / Piano</option>
                      <option value="Electric Guitarist">Electric Guitar</option>
                      <option value="Bass Guitarist">Bass</option>
                      <option value="Drummer">Drums</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="min 6 chars"
                        className="w-full text-xs pl-8 pr-2 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                      Confirm *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="re-type"
                        className="w-full text-xs pl-8 pr-2 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    regLoading ||
                    !regFullName.trim() ||
                    !regUsername.trim() ||
                    !regPassword ||
                    regPassword !== regConfirmPassword ||
                    usernameStatus.available === false
                  }
                  className="w-full py-3.5 rounded-full bg-[#121212] hover:bg-stone-900 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer mt-3"
                >
                  {regLoading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Create Account & Enter</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Switch Link */}
            <div className="text-center pt-3">
              <p className="text-xs text-stone-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="font-bold text-stone-900 underline underline-offset-2 hover:text-amber-900 cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Install Help Bottom Sheet Modal */}
        {showInstallHelp && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in"
            onClick={() => setShowInstallHelp(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Install Worship Team App
                  </h3>
                </div>
                <button
                  onClick={() => setShowInstallHelp(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-stone-600">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <p className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <span>📱 iPhone / iPad (Safari)</span>
                  </p>
                  <p className="leading-relaxed">
                    1. Tap the <strong>Share</strong> button (square with arrow up at the bottom).<br />
                    2. Scroll down and tap <strong>"Add to Home Screen"</strong>.<br />
                    3. Tap <strong>"Add"</strong> in the top right.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <p className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <span>🤖 Android / Chrome / PC</span>
                  </p>
                  <p className="leading-relaxed">
                    Tap the <strong>Menu (⋮)</strong> in your browser and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstallHelp(false)}
                className="w-full py-2.5 rounded-2xl bg-[#121212] text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
