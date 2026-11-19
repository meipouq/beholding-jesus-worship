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
    isAuthenticated,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginUser,
    registerUser,
    logoutUser
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

  useEffect(() => {
    if (isAuthModalOpen) {
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
      setRegError('Passwords do not match. Please ensure both fields are identical.');
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="bg-[#211C17] rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-[#393027] text-[#FFF5E6] animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#393027]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#181510] border border-[#393027] flex items-center justify-center text-[#E5AF45] shadow-soft">
              <Church className="w-5 h-5 text-[#E5AF45]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#FFF5E6] leading-tight">
                Beholding Jesus Church
              </h2>
              <p className="text-[11px] text-[#B8ADA0] font-medium">
                Worship Team Live Account Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Status */}
        {isAuthenticated && currentUser && (
          <div className="my-3.5 p-3 rounded-2xl bg-[#181510] border border-[#393027] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#211C17] border border-[#393027] text-[#FFF5E6] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
                <img
                  src={currentUser.avatar && currentUser.avatar.includes('/') ? currentUser.avatar : '/images/worship_team_profile.png'}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/worship_team_profile.png';
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#FFF5E6] truncate">
                  {currentUser.name} {currentUser.username ? <span className="text-[#E5AF45] font-medium">(@{currentUser.username})</span> : null}
                </p>
                <p className="text-[10px] text-[#B8ADA0] truncate">
                  {currentUser.role_title || 'Worship Team Member'} • Active
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                setIsAuthModalOpen(false);
                setLoginUsername('');
                setLoginPassword('');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#B8ADA0] hover:text-[#E57373] hover:bg-[#29231C] border border-[#393027] shadow-2xs hover:shadow-soft active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Inspiring Scripture Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-[#181510] border border-[#E5AF45]/30 text-[#FFF5E6]">
          <p className="text-[11px] italic font-medium leading-relaxed text-[#FFF5E6]/90">
            "God is Spirit, and those who worship Him must worship in spirit and truth."
          </p>
          <span className="text-[10px] font-bold tracking-wider text-[#E5AF45] uppercase block mt-0.5">
            — John 4:24
          </span>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="flex items-center bg-[#181510] p-1.5 rounded-2xl mb-4 border border-[#393027]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              mode === 'login'
                ? 'bg-[#E5AF45] text-[#100E0B] shadow-soft'
                : 'text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]'
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
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              mode === 'register'
                ? 'bg-[#E5AF45] text-[#100E0B] shadow-soft'
                : 'text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="p-3 rounded-2xl bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E57373]" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#B8ADA0] mb-1">
                Unique Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#B8ADA0]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B8ADA0] hover:text-[#FFF5E6]"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#B8ADA0] mt-1 pl-1">
                Forgot password? Please contact your worship ministry leader.
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading || !loginUsername.trim() || !loginPassword.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] text-xs font-black tracking-wide shadow-[0_4px_18px_rgba(229,175,69,0.3)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 group cursor-pointer"
            >
              {loginLoading ? (
                <span>Signing in to live account...</span>
              ) : (
                <>
                  <span>Sign In as Worship Author</span>
                  <ArrowRight className="w-4 h-4 text-[#100E0B] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {regError && (
              <div className="p-3 rounded-2xl bg-[#E57373]/10 border border-[#E57373]/30 text-[#E57373] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E57373]" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-2xl bg-[#79BB8B]/10 border border-[#79BB8B]/30 text-[#79BB8B] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#79BB8B]" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-[#B8ADA0] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. John Miko Sarsalijo"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#B8ADA0]">
                  Username *
                </label>
                {usernameStatus.checking ? (
                  <span className="text-[10px] text-[#B8ADA0]">Checking...</span>
                ) : usernameStatus.available !== undefined ? (
                  <span className={`text-[10px] font-bold ${usernameStatus.available ? 'text-[#79BB8B]' : 'text-[#E57373]'}`}>
                    {usernameStatus.message}
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="e.g. mikoworship or sarah_vocals"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none"
                />
              </div>
            </div>

            {/* Ministry Role & Conditional Vocal Range */}
            {(() => {
              const isVocalRole = regRoleTitle === 'Worship Leader' || regRoleTitle === 'Worship Team Vocalist';
              return (
                <div className={isVocalRole ? "grid grid-cols-2 gap-2.5" : "space-y-1"}>
                  <div>
                    <label className="block text-[11px] font-bold text-[#B8ADA0] mb-1">
                      Ministry Role
                    </label>
                    <select
                      value={regRoleTitle}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setRegRoleTitle(newRole);
                        const isVocal = newRole === 'Worship Leader' || newRole === 'Worship Team Vocalist';
                        if (!isVocal) {
                          setRegVocalRange('Instrumentalist');
                        } else if (regVocalRange === 'Instrumentalist') {
                          setRegVocalRange('Soprano');
                        }
                      }}
                      className="w-full text-xs px-3 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none cursor-pointer"
                    >
                      <option value="Worship Leader" className="bg-[#181510] text-[#FFF5E6]">Worship Leader</option>
                      <option value="Worship Team Vocalist" className="bg-[#181510] text-[#FFF5E6]">Vocalist</option>
                      <option value="Acoustic Guitarist" className="bg-[#181510] text-[#FFF5E6]">Acoustic Guitarist</option>
                      <option value="Keyboardist / Pianist" className="bg-[#181510] text-[#FFF5E6]">Keyboardist / Pianist</option>
                      <option value="Electric Guitarist" className="bg-[#181510] text-[#FFF5E6]">Electric Guitarist</option>
                      <option value="Bass Guitarist" className="bg-[#181510] text-[#FFF5E6]">Bass Guitarist</option>
                      <option value="Drummer" className="bg-[#181510] text-[#FFF5E6]">Drummer</option>
                      <option value="Sound & Multimedia" className="bg-[#181510] text-[#FFF5E6]">Sound & Multimedia</option>
                    </select>
                  </div>

                  {isVocalRole && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#B8ADA0] mb-1">
                        Vocal Range
                      </label>
                      <select
                        value={regVocalRange}
                        onChange={(e) => setRegVocalRange(e.target.value as any)}
                        className="w-full text-xs px-3 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none cursor-pointer"
                      >
                        <option value="Soprano" className="bg-[#181510] text-[#FFF5E6]">Soprano</option>
                        <option value="Mezzo-Soprano" className="bg-[#181510] text-[#FFF5E6]">Mezzo-Soprano</option>
                        <option value="Alto" className="bg-[#181510] text-[#FFF5E6]">Alto</option>
                        <option value="Tenor" className="bg-[#181510] text-[#FFF5E6]">Tenor</option>
                        <option value="Baritone" className="bg-[#181510] text-[#FFF5E6]">Baritone</option>
                        <option value="Bass" className="bg-[#181510] text-[#FFF5E6]">Bass</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-[#B8ADA0] mb-1">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B8ADA0] hover:text-[#FFF5E6]"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-[#B8ADA0] mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B8ADA0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-type your password"
                  className={`w-full text-xs pl-10 pr-3 py-2.5 rounded-2xl border bg-[#181510] text-[#FFF5E6] focus:outline-none transition-colors ${
                    regConfirmPassword && regPassword !== regConfirmPassword
                      ? 'border-[#E57373] focus:border-[#E57373] focus:ring-1 focus:ring-[#E57373]'
                      : regConfirmPassword && regPassword === regConfirmPassword
                      ? 'border-[#79BB8B] focus:border-[#79BB8B] focus:ring-1 focus:ring-[#79BB8B]'
                      : 'border-[#393027] focus:border-[#E5AF45] focus:ring-1 focus:ring-[#E5AF45]'
                  }`}
                />
              </div>
              {/* Password Match Status */}
              {regConfirmPassword && regPassword !== regConfirmPassword && (
                <p className="text-[11px] text-[#E57373] font-semibold flex items-center gap-1.5 mt-1.5 px-0.5 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#E57373]" />
                  <span>Passwords do not match. Please ensure both fields are identical.</span>
                </p>
              )}
              {regConfirmPassword && regPassword === regConfirmPassword && regPassword.length >= 6 && (
                <p className="text-[11px] text-[#79BB8B] font-semibold flex items-center gap-1.5 mt-1.5 px-0.5 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#79BB8B]" />
                  <span>Passwords match</span>
                </p>
              )}
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] text-xs font-black tracking-wide shadow-[0_4px_18px_rgba(229,175,69,0.3)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 group cursor-pointer"
            >
              {regLoading ? (
                <span>Registering to Supabase Cloud...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#100E0B] group-hover:rotate-12 transition-transform" />
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
