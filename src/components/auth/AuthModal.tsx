import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Music,
  Mic2,
  KeyRound,
  ArrowRight,
  Shield,
  Church
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { AuthService } from '../../services/auth';
import { TeamMember } from '../../types';
import { Logo } from '../common/Logo';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginUser,
    registerUser,
    logoutUser,
    setCurrentUser
  } = useWorship();

  const [mode, setMode] = useState<'login' | 'register'>('login');

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

  // Username live availability check
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available?: boolean; message?: string }>({ checking: false });

  // Quick switcher registered list
  const [registeredList, setRegisteredList] = useState<Array<{ id: string; username: string; name: string; role_title: string; avatar: string }>>([]);

  // Reset password state
  const [showReset, setShowReset] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      AuthService.fetchRegisteredMembers().then(members => {
        if (members && members.length > 0) {
          setRegisteredList(members);
        }
      });
      setLoginError(null);
      setRegError(null);
    }
  }, [isAuthModalOpen]);

  // Debounced username availability check
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
    }, 400);

    return () => clearTimeout(timer);
  }, [regUsername]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await loginUser(loginUsername, loginPassword);
      if (res.success) {
        setIsAuthModalOpen(false);
        setLoginPassword('');
      } else {
        setLoginError(res.error || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred.');
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
        setRegSuccess(`Account @${regUsername} successfully created!`);
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 800);
      } else {
        setRegError(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickSwitch = async (username: string) => {
    setLoginUsername(username);
    setLoginPassword('');
    // Try auto-logging in if demo or standard team password
    const res = await loginUser(username, 'Member2026!');
    if (res.success) {
      setIsAuthModalOpen(false);
    } else {
      // Focus password input for user to type their custom password
      setLoginError(`Enter password for @${username}`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg(null);
    const res = await AuthService.resetPassword(resetUsername, newPassword);
    setResetLoading(false);
    if (res.success) {
      setResetMsg({ type: 'success', text: `Password for @${resetUsername} updated successfully! You can now log in.` });
      setLoginUsername(resetUsername);
      setLoginPassword(newPassword);
      setTimeout(() => setShowReset(false), 1500);
    } else {
      setResetMsg({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-modal border border-[#E8E2D7] animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#1E1D1B] flex items-center justify-center text-white shadow-soft">
              <Church className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                Beholding Jesus Church
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Worship Team Live Account Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Status */}
        {currentUser && (
          <div className="my-3.5 p-3 rounded-2xl bg-[#FAF6F0] border border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.avatar && currentUser.avatar.includes('/') ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {currentUser.name} {currentUser.username ? <span className="text-amber-800 font-medium">(@{currentUser.username})</span> : null}
                </p>
                <p className="text-[10px] text-stone-500 truncate">
                  {currentUser.role_title} • Active Author
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                setLoginUsername('');
                setLoginPassword('');
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-stone-600 hover:text-red-600 hover:bg-red-50 border border-stone-200 transition-all shrink-0"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Inspiring Scripture Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900">
          <p className="text-[11px] italic font-medium leading-relaxed">
            "God is Spirit, and those who worship Him must worship in spirit and truth."
          </p>
          <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase block mt-0.5">
            — John 4:24
          </span>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="flex items-center bg-[#F2ECE1] p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In with Username
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Unique Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. quopiem or johnmiko"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowReset(!showReset)}
                  className="text-[10px] font-bold text-amber-800 hover:underline"
                >
                  {showReset ? 'Hide Reset' : 'Forgot / Reset?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot / Reset password accordion */}
            {showReset && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <KeyRound className="w-3.5 h-3.5 text-amber-800" />
                  <span>Quick Password Reset</span>
                </div>
                {resetMsg && (
                  <p className={`text-[11px] font-medium ${resetMsg.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                    {resetMsg.text}
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Username to reset (e.g. quopiem)"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-stone-200 bg-white"
                />
                <input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-xl border border-stone-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading || !resetUsername.trim() || !newPassword.trim()}
                  className="w-full py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] transition-colors disabled:opacity-40"
                >
                  {resetLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !loginUsername.trim() || !loginPassword.trim()}
              className="w-full py-3 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold tracking-wide shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {loginLoading ? (
                <span>Signing in to live account...</span>
              ) : (
                <>
                  <span>Sign In as Worship Author</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Switcher for Registered Team Members */}
            {registeredList.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Or Quick One-Click Switch to Existing Team Account:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {registeredList.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleQuickSwitch(m.username)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#FAF6F0] hover:bg-[#1E1D1B] text-stone-700 hover:text-white border border-stone-200 transition-all flex items-center gap-1.5"
                    >
                      <span className="text-amber-700 font-bold">@{m.username}</span>
                      <span className="text-[10px] opacity-75">({m.name.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
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
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Unique Username */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-700">
                  Unique Username * (used for live sync & authorship)
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
                  placeholder="e.g. mikoworship or sarah_vocals"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Role & Vocal Range */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Vocal Range / Part
                </label>
                <select
                  value={regVocalRange}
                  onChange={(e) => setRegVocalRange(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer"
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
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Ministry Role
                </label>
                <select
                  value={regRoleTitle}
                  onChange={(e) => setRegRoleTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer"
                >
                  <option value="Worship Leader">Worship Leader</option>
                  <option value="Worship Team Vocalist">Worship Team Vocalist</option>
                  <option value="Acoustic Guitarist">Acoustic Guitarist</option>
                  <option value="Keyboardist / Pianist">Keyboardist / Pianist</option>
                  <option value="Electric Guitarist">Electric Guitarist</option>
                  <option value="Bass Guitarist">Bass Guitarist</option>
                  <option value="Drummer">Drummer</option>
                  <option value="Sound & Multimedia">Sound & Multimedia</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-stone-200 bg-[#FAF6F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
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
              className="w-full py-3 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 text-white text-xs font-bold tracking-wide shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {regLoading ? (
                <span>Registering to Supabase Cloud...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Create Account & Start Serving</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
