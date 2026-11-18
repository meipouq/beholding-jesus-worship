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
    <aside className="w-64 bg-[#1E1D1B] text-stone-300 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none border-r border-[#2C2A26] no-print">
      {/* Top Header & Branding */}
      <div className="p-4 pb-2 overflow-y-auto">
        {/* macOS Window Controls */}
        <div className="flex items-center gap-2 mb-4 px-1 pt-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EC6A5E] hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F5BF4F] hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#61C554] hover:opacity-80 transition-opacity cursor-pointer" />
        </div>

        <div className="flex flex-col items-center justify-center text-center pb-4">
          <Logo variant="light" size="lg" showText={false} className="mb-2" />
          <h1 className="font-sans font-bold tracking-widest text-white text-[13.5px] uppercase leading-tight">
            Beholding Jesus
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone-400 mt-0.5 font-medium">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#383531] text-white shadow-sm font-semibold'
                    : 'text-[#9E9B95] hover:text-white hover:bg-[#252320]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-[#9E9B95]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Account Card & Signature */}
      <div className="p-4 pt-2 border-t border-[#2C2A26]/80 space-y-3">
        {/* User Account Bar */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full text-left p-2.5 rounded-2xl bg-[#282622] hover:bg-[#34312C] border border-[#3C3832] transition-all group flex items-center justify-between gap-2.5"
          title="Account Settings / Log In / Register"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white text-[#1E1D1B] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-white/20">
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
                <span className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.name}
                </span>
              </div>
              <p className="text-[10px] text-amber-300/80 truncate">
                {currentUser.username ? `@${currentUser.username}` : currentUser.role_title}
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg bg-[#1E1D1B] text-stone-400 group-hover:text-white transition-colors shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
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
                text.className = 'font-cursive text-xl text-stone-400 italic tracking-wider';
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
