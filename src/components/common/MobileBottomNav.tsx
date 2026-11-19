import React, { useState } from 'react';
import {
  Home,
  Music2,
  Calendar,
  MoreHorizontal,
  Users,
  CheckSquare,
  Megaphone,
  FolderOpen,
  X,
  ListMusic,
  UserCheck
} from 'lucide-react';
import { useWorship, AppModule } from '../../context/WorshipContext';

export const MobileBottomNav: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentUser,
    setIsAuthModalOpen,
    unreadNotifCount
  } = useWorship();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const navTabs: Array<{ id: AppModule; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'lineups', label: 'Lineups', icon: ListMusic },
    { id: 'songs', label: 'Songs', icon: Music2 },
    { id: 'rehearsals', label: 'Calendar', icon: Calendar },
  ];

  const moreItems: Array<{ id: AppModule; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'vocalists', label: 'Vocalists & Team', icon: Users },
    { id: 'tasks', label: 'Tasks & Duties', icon: CheckSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'resources', label: 'Files & Resources', icon: FolderOpen },
  ];

  const isMoreActive = ['vocalists', 'tasks', 'announcements', 'resources'].includes(activeModule);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BJ';

  return (
    <>
      {/* "More" Drawer for Mobile */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-40 md:hidden flex flex-col justify-end animate-fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-[#1F1F21] rounded-t-3xl p-5 pb-9 shadow-modal border-t border-[#35312B] text-[#F5F0E6] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#35312B]">
              <span className="text-xs font-bold text-[#F5F0E6] tracking-wider uppercase">More Worship Modules</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Account Strip inside Mobile Drawer */}
            <div className="my-3 p-3 rounded-2xl bg-[#161616] border border-[#35312B] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#1F1F21] border border-[#35312B] text-[#F5F0E6] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs ring-1 ring-[#D9A441]/40">
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
                  <p className="text-xs font-bold text-[#F5F0E6] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#D9A441] font-semibold truncate">
                    {currentUser.username ? `@${currentUser.username}` : currentUser.role_title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#D9A441] text-[#101010] hover:bg-[#F5C15D] transition-colors flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#101010]" />
                <span>Account</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#D9A441] text-[#101010] border-[#D9A441] shadow-sm font-bold'
                        : 'bg-[#161616] border-[#35312B] text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#101010]/95 backdrop-blur-xl border-t border-[#35312B] md:hidden px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)] no-print">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveModule(tab.id);
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-[#D9A441] font-extrabold' : 'text-[#AAA5A0] hover:text-[#F5F0E6]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] text-[#D9A441] scale-110' : 'stroke-[1.8] text-[#AAA5A0]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#E57373] text-[#101010] text-[9px] font-black px-1 rounded-full min-w-3.5 text-center leading-3 shadow-2xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 transition-colors ${isActive ? 'font-black text-[#D9A441]' : 'font-medium'}`}>{tab.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 bg-[#D9A441] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
            isMoreActive || isMoreMenuOpen
              ? 'text-[#D9A441] font-extrabold'
              : 'text-[#AAA5A0] hover:text-[#F5F0E6]'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 transition-transform ${isMoreActive || isMoreMenuOpen ? 'stroke-[2.5] text-[#D9A441] scale-110' : 'stroke-[1.8] text-[#AAA5A0]'}`} />
          <span className={`text-[10px] mt-1 transition-colors ${isMoreActive || isMoreMenuOpen ? 'font-black text-[#D9A441]' : 'font-medium'}`}>More</span>
          {(isMoreActive || isMoreMenuOpen) && (
            <div className="w-4 h-0.5 bg-[#D9A441] rounded-full mt-0.5" />
          )}
        </button>
      </nav>
    </>
  );
};
