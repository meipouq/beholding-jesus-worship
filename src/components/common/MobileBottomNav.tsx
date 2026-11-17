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
          className="fixed inset-0 bg-black/60 z-40 md:hidden flex flex-col justify-end animate-fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 pb-9 shadow-modal border-t border-stone-200 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 tracking-wider uppercase">More Worship Modules</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active User Account Strip inside Mobile Drawer */}
            <div className="my-3 p-3 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#1E1D1B] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                  {currentUser.avatar && currentUser.avatar.includes('/') ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-amber-800 font-semibold truncate">
                    {currentUser.username ? `@${currentUser.username}` : currentUser.role_title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#1E1D1B] text-white hover:bg-stone-800 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
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
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-[#1E1D1B] text-white border-[#1E1D1B] shadow-sm'
                        : 'bg-[#F8F5EE] border-stone-200/80 text-stone-700 hover:bg-stone-100'
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E8E1D5]/90 md:hidden px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.03)] no-print">
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
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#1E1D1B] font-extrabold' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] text-[#1E1D1B] scale-110' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-black px-1 rounded-full min-w-3.5 text-center leading-3 shadow-2xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 transition-colors ${isActive ? 'font-black text-[#1E1D1B]' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            isMoreActive || isMoreMenuOpen
              ? 'text-[#1E1D1B] font-extrabold'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 transition-transform ${isMoreActive || isMoreMenuOpen ? 'stroke-[2.5] text-[#1E1D1B] scale-110' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] mt-1 transition-colors ${isMoreActive || isMoreMenuOpen ? 'font-black text-[#1E1D1B]' : 'font-medium'}`}>More</span>
        </button>
      </nav>
    </>
  );
};
