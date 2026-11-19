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
import { NotificationSettingsModal } from '../settings/NotificationSettingsModal';
import { getExistingSubscription } from '../../services/pushNotifications';

export const NotificationCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(true);
  const {
    notifications,
    markNotifRead,
    markAllNotifsRead,
    setActiveModule
  } = useWorship();

  useEffect(() => {
    getExistingSubscription().then((sub) => {
      setIsPushSubscribed(!!sub);
    });
  }, [isSettingsOpen]);

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
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
        onClick={onClose}
      />

      <div
        className="fixed left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-12 sm:w-96 bg-white rounded-3xl shadow-modal border border-stone-200 p-4 sm:p-5 z-50 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-stone-700" />
          <h3 className="text-sm font-bold text-stone-900 tracking-wide">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={() => markAllAll()}
              className="text-[11px] font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Notification Settings & iOS Push"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Web Push Setup Strip */}
      {!isPushSubscribed && (
        <div className="mt-2.5 mb-1 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#1E1D1B] text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 leading-tight">Web Push Alerts</p>
              <p className="text-[10px] text-stone-600 truncate">Get alerted when app is closed</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#1E1D1B] hover:bg-stone-800 active:scale-95 text-white text-[11px] font-extrabold shadow-2xs shrink-0 cursor-pointer transition-transform"
          >
            Enable
          </button>
        </div>
      )}

      <div className="max-h-80 overflow-y-auto mt-2 space-y-1.5 divide-y divide-stone-50">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif.id, notif.link_module)}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer flex gap-3 ${
                notif.is_read ? 'hover:bg-stone-50 opacity-75' : 'bg-[#FAF6F0] hover:bg-[#F4ECE0]'
              }`}
            >
              <div className="p-2 rounded-lg bg-white border border-stone-100 shrink-0 self-start shadow-2xs">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {notif.created_at}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    <NotificationSettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
    />
    </>
  );

  function markAllAll() {
    markAllNotifsRead();
  }
};
