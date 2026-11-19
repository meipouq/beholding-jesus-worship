import React from 'react';
import {
  LayoutDashboard,
  Music2,
  Users,
  ListMusic,
  Calendar,
  CheckSquare,
  Megaphone,
  FolderOpen,
  UserCheck,
  LogIn
} from 'lucide-react';
import { useWorship, AppModule } from '../../context/WorshipContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen
  } = useWorship();

  const navItems: Array<{ id: AppModule; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'songs', label: 'Song Library', icon: Music2 },
    { id: 'lineups', label: 'Service Lineups', icon: ListMusic },
    { id: 'vocalists', label: 'Vocalists & Team', icon: Users },
    { id: 'rehearsals', label: 'Rehearsals & Events', icon: Calendar },
    { id: 'tasks', label: 'Tasks & Duties', icon: CheckSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'resources', label: 'Files & Resources', icon: FolderOpen },
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BJ';

  return (
    <aside className="w-64 bg-[#161616] text-[#AAA5A0] flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none border-r border-[#35312B] no-print">
      {/* Top Header & Branding */}
      <div className="p-4 pb-2 overflow-y-auto">
        {/* macOS Window Controls */}
        <div className="flex items-center gap-2 mb-4 px-1 pt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EC6A5E] hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F5BF4F] hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#61C554] hover:opacity-80 transition-opacity cursor-pointer" />
        </div>

        <div className="flex flex-col items-center justify-center text-center pb-4">
          <Logo variant="dark" size="lg" showText={false} className="mb-2" />
          <h1 className="font-sans font-extrabold tracking-widest text-[#F5F0E6] text-[13.5px] uppercase leading-tight">
            Beholding Jesus
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#D9A441] mt-0.5 font-bold">
            Worship Team
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1F1F21] text-[#D9A441] border border-[#D9A441]/30 shadow-xs font-semibold'
                    : 'text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#D9A441]' : 'text-[#AAA5A0]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span className="bg-[#E57373] text-[#101010] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Account Card & Signature */}
      <div className="p-4 pt-2 border-t border-[#35312B] space-y-3">
        {/* User Account Bar */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full text-left p-2.5 rounded-2xl bg-[#1F1F21] hover:bg-[#262626] border border-[#35312B] hover:border-[#D9A441]/40 transition-all group flex items-center justify-between gap-2.5 cursor-pointer"
          title="Account Settings / Log In / Register"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#161616] text-[#F5F0E6] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-[#35312B] ring-1 ring-[#D9A441]/30">
              <img
                src={currentUser.avatar && currentUser.avatar.includes('/') ? currentUser.avatar : '/images/worship_team_profile.png'}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/worship_team_profile.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#F5C15D] transition-colors truncate leading-tight">
                  {currentUser.name}
                </span>
              </div>
              <p className="text-[10px] text-[#D9A441] font-semibold truncate">
                {currentUser.username ? `@${currentUser.username}` : currentUser.role_title}
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg bg-[#161616] border border-[#35312B] text-[#AAA5A0] group-hover:text-[#D9A441] transition-colors shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-[#D9A441]" />
          </div>
        </button>

        {/* Signature: "For His Glory" */}
        <div className="px-2 pt-1 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <img 
            src="/images/for_his_glory.png" 
            alt="For His Glory" 
            className="w-32 h-auto object-contain opacity-85 hover:opacity-100 transition-opacity filter drop-shadow-sm select-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const text = document.createElement('span');
                text.className = 'font-cursive text-xl text-[#AAA5A0] italic tracking-wider';
                text.innerText = 'For His Glory';
                parent.appendChild(text);
              }
            }}
          />
        </div>
      </div>
    </aside>
  );
};
