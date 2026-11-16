import React from 'react';
import {
  LayoutDashboard,
  Music2,
  Users,
  ListMusic,
  Calendar,
  CheckSquare,
  MessageCircle,
  Megaphone,
  FolderOpen,
  Settings
} from 'lucide-react';
import { useWorship, AppModule } from '../../context/WorshipContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, unreadNotifCount, conversations } = useWorship();

  const totalUnreadChat = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const navItems: Array<{ id: AppModule; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'songs', label: 'Song Library', icon: Music2 },
    { id: 'vocalists', label: 'Vocalists', icon: Users },
    { id: 'lineups', label: 'Service Lineups', icon: ListMusic },
    { id: 'rehearsals', label: 'Rehearsals', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'chat', label: 'Team Chat', icon: MessageCircle, badge: totalUnreadChat },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'resources', label: 'Files & Resources', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1E1D1B] text-stone-300 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none border-r border-[#2C2A26] no-print">
      {/* Top Header & Branding */}
      <div className="p-4 pb-2">
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

      {/* Bottom Signature: "For His Glory" (Matches Reference Image) */}
      <div className="p-5 pb-6">
        <div className="transform -rotate-6 transition-transform hover:rotate-0 duration-300">
          <img 
            src="/images/for_his_glory.png" 
            alt="For His Glory" 
            className="w-36 h-auto object-contain opacity-90 hover:opacity-100 transition-opacity filter drop-shadow-sm select-none"
            onError={(e) => {
              // Fallback to stylized text if image ever fails
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const text = document.createElement('span');
                text.className = 'font-cursive text-2xl text-white italic tracking-wider';
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
