import React, { useState } from 'react';
import {
  Home,
  Music2,
  Calendar,
  MessageCircle,
  MoreHorizontal,
  Users,
  CheckSquare,
  Megaphone,
  FolderOpen,
  Settings,
  X,
  ListMusic
} from 'lucide-react';
import { useWorship, AppModule } from '../../context/WorshipContext';

export const MobileBottomNav: React.FC = () => {
  const { activeModule, setActiveModule, conversations } = useWorship();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const totalUnreadChat = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const navTabs: Array<{ id: AppModule; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'songs', label: 'Songs', icon: Music2 },
    { id: 'rehearsals', label: 'Calendar', icon: Calendar },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: totalUnreadChat },
  ];

  const moreItems: Array<{ id: AppModule; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'lineups', label: 'Service Lineups', icon: ListMusic },
    { id: 'vocalists', label: 'Vocalists Directory', icon: Users },
    { id: 'tasks', label: 'Tasks & Assignments', icon: CheckSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'resources', label: 'Files & Resources', icon: FolderOpen },
    { id: 'settings', label: 'Settings & Backups', icon: Settings },
  ];

  const isMoreActive = ['lineups', 'vocalists', 'tasks', 'announcements', 'resources', 'settings'].includes(activeModule);

  return (
    <>
      {/* "More" Drawer for Mobile */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden flex flex-col justify-end animate-fade-in"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 pb-8 shadow-modal border-t border-stone-200 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-sm font-bold text-stone-900 tracking-wider uppercase">More Modules</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
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
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isActive
                        ? 'bg-[#1E1D1B] text-white border-[#1E1D1B] shadow-sm'
                        : 'bg-[#F8F5EE] border-stone-200/80 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E2D7] md:hidden px-3 py-2 flex items-center justify-around shadow-lg no-print">
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
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive ? 'text-[#1E1D1B] font-semibold' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 text-center leading-3">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isMoreActive || isMoreMenuOpen
              ? 'text-[#1E1D1B] font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1">More</span>
        </button>
      </nav>
    </>
  );
};
