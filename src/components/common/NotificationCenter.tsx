import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  ListMusic,
  Music2,
  Calendar,
  CheckSquare,
  Megaphone,
  MessageCircle,
  Settings,
  Zap
} from 'lucide-react';
import { useWorship, AppModule } from '../../context/WorshipContext';
import { getExistingSubscription } from '../../services/pushNotifications';

export const NotificationCenter: React.FC<{
  onClose: () => void;
  onOpenSettings?: () => void;
}> = ({ onClose, onOpenSettings }) => {
  const [isPushSubscribed, setIsPushSubscribed] = useState(true);
  const {
    notifications,
    markNotifRead,
    markAllNotifsRead,
    setActiveModule
  } = useWorship();

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  useEffect(() => {
    getExistingSubscription().then((sub) => {
      setIsPushSubscribed(!!sub);
    });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'lineup':
        return <ListMusic className="w-4 h-4 text-emerald-600" />;
      case 'song':
        return <Music2 className="w-4 h-4 text-amber-600" />;
      case 'rehearsal':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-purple-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-rose-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-stone-600" />;
    }
  };

  const handleClick = (notifId: string, module?: string) => {
    markNotifRead(notifId);
    if (module) {
      setActiveModule(module as AppModule);
    }
    onClose();
  };

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
        onClick={onClose}
      />

      <div
        className="fixed left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-12 sm:w-96 bg-[#1F1F21] rounded-3xl shadow-modal border border-[#35312B] p-4 sm:p-5 z-50 animate-slide-up text-[#F5F0E6]"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center justify-between pb-3 border-b border-[#35312B]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#D9A441]" />
          <h3 className="text-sm font-bold text-[#F5F0E6] tracking-wide">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={() => markAllAll()}
              className="text-[11px] font-medium text-[#D9A441] hover:text-[#F5C15D] flex items-center gap-1 cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={handleOpenSettings}
            className="p-1 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626] transition-colors cursor-pointer"
            title="Notification Settings & iOS Push"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Web Push Setup Strip */}
      {!isPushSubscribed && (
        <div className="mt-2.5 mb-1 p-2.5 sm:p-3 rounded-2xl bg-[#161616] border border-[#35312B] flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#262626] border border-[#35312B] text-[#D9A441] flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-[#D9A441]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#F5F0E6] leading-tight">Web Push Alerts</p>
              <p className="text-[10px] text-[#AAA5A0] truncate">Get alerted when app is closed</p>
            </div>
          </div>
          <button
            onClick={handleOpenSettings}
            className="px-3 py-1.5 rounded-xl bg-[#D9A441] hover:bg-[#F5C15D] active:scale-95 text-[#101010] text-[11px] font-extrabold shadow-2xs shrink-0 cursor-pointer transition-transform"
          >
            Enable
          </button>
        </div>
      )}

      <div className="max-h-80 overflow-y-auto mt-2 space-y-1.5 divide-y divide-[#35312B]/40">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#AAA5A0]">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif.id, notif.link_module)}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer flex gap-3 ${
                notif.is_read ? 'hover:bg-[#262626] opacity-75' : 'bg-[#262626] hover:bg-[#2e2e2e] border border-[#35312B]'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#161616] border border-[#35312B] shrink-0 self-start shadow-2xs">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-[#F5F0E6] truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-[#AAA5A0] shrink-0">
                    {notif.created_at}
                  </span>
                </div>
                <p className="text-[11px] text-[#AAA5A0] line-clamp-2 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );

  function markAllAll() {
    markAllNotifsRead();
  }
};
