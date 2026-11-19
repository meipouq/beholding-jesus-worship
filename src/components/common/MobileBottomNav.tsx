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
            className="bg-[#211C17] rounded-t-3xl p-5 pb-9 shadow-modal border-t border-[#393027] text-[#FFF5E6] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#393027]">
              <span className="text-xs font-bold text-[#FFF5E6] tracking-wider uppercase">More Worship Modules</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Account Strip inside Mobile Drawer */}
            <div className="my-3 p-3 rounded-2xl bg-[#181510] border border-[#393027] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#211C17] border border-[#393027] text-[#FFF5E6] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs ring-1 ring-[#E5AF45]/40">
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
                  <p className="text-xs font-bold text-[#FFF5E6] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#E5AF45] font-semibold truncate">
                    {currentUser.username ? `@${currentUser.username}` : currentUser.role_title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-[#E5AF45] to-[#D69F35] hover:from-[#FFC85C] hover:to-[#E5AF45] text-[#100E0B] transition-all flex items-center gap-1 shrink-0 shadow-[0_0_10px_rgba(229,175,69,0.25)] cursor-pointer active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#100E0B]" />
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
                        ? 'bg-gradient-to-r from-[#E5AF45] to-[#D69F35] text-[#100E0B] border-[#FFC85C]/60 shadow-[0_0_12px_rgba(229,175,69,0.3)] font-black'
                        : 'bg-[#181510] border-[#393027] text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]'
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#100E0B]/95 backdrop-blur-xl border-t border-[#393027] md:hidden px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.6)] no-print">
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
                isActive ? 'text-[#FFC85C] font-extrabold' : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] text-[#FFC85C] scale-110 drop-shadow-[0_0_8px_rgba(229,175,69,0.5)]' : 'stroke-[1.8] text-[#B8ADA0]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#E57373] text-[#100E0B] text-[9px] font-black px-1 rounded-full min-w-3.5 text-center leading-3 shadow-2xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 transition-colors ${isActive ? 'font-black text-[#FFC85C]' : 'font-medium'}`}>{tab.label}</span>
              {isActive && (
                <div className="w-5 h-1 bg-gradient-to-r from-[#E5AF45] to-[#FFC85C] rounded-full mt-0.5 shadow-[0_0_8px_rgba(229,175,69,0.5)]" />
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 cursor-pointer ${
            isMoreActive || isMoreMenuOpen
              ? 'text-[#FFC85C] font-extrabold'
              : 'text-[#B8ADA0] hover:text-[#FFF5E6]'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 transition-transform ${isMoreActive || isMoreMenuOpen ? 'stroke-[2.5] text-[#FFC85C] scale-110 drop-shadow-[0_0_8px_rgba(229,175,69,0.5)]' : 'stroke-[1.8] text-[#B8ADA0]'}`} />
          <span className={`text-[10px] mt-1 transition-colors ${isMoreActive || isMoreMenuOpen ? 'font-black text-[#FFC85C]' : 'font-medium'}`}>More</span>
          {(isMoreActive || isMoreMenuOpen) && (
            <div className="w-5 h-1 bg-gradient-to-r from-[#E5AF45] to-[#FFC85C] rounded-full mt-0.5 shadow-[0_0_8px_rgba(229,175,69,0.5)]" />
          )}
        </button>
      </nav>
    </>
  );
};
