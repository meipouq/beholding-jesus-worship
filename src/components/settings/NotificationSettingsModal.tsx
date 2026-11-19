import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import {
  getIOSSupportStatus,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  getExistingSubscription,
  getStoredPushPreferences,
  saveStoredPushPreferences,
  PushCategoryPreferences,
  IOSSupportStatus
} from '../../services/pushNotifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useWorship();
  const [supportStatus, setSupportStatus] = useState<IOSSupportStatus>({
    isIOSDevice: false,
    isStandalonePWA: false,
    canReceivePush: false,
    message: '',
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [preferences, setPreferences] = useState<PushCategoryPreferences>(getStoredPushPreferences());

  useEffect(() => {
    if (!isOpen) return;

    const status = getIOSSupportStatus();
    setSupportStatus(status);

    if (typeof Notification !== 'undefined') {
      setPermissionState(Notification.permission);
    }

    getExistingSubscription().then((sub) => {
      setIsSubscribed(!!sub);
    });

    if (status.isIOSDevice && !status.isStandalonePWA) {
      setIsGuideOpen(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await subscribeUserToPush(currentUser.id);
      if (res.success) {
        setIsSubscribed(true);
        setPermissionState('granted');
        setFeedback({
          type: 'success',
          text: 'Push notifications successfully activated on this device!',
        });
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to activate push notifications.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Unexpected error while requesting push subscription.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePush = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await unsubscribeUserFromPush(currentUser.id);
      setIsSubscribed(false);
      setFeedback({
        type: 'info',
        text: 'Push notifications have been disabled for this device.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Failed to revoke device subscription.',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (key: keyof PushCategoryPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    saveStoredPushPreferences(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#FAF7F2] border-b border-[#E8E1D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E1D1B] text-amber-400 flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight">
                Notification Settings
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Web Push & iOS Device Synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Status Banner */}
          <div className="p-4 rounded-2xl border bg-[#FDFCFA] border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Device Status
              </span>
              {isSubscribed ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active & Subscribed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                  <Info className="w-3.5 h-3.5" />
                  Not Subscribed
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {supportStatus.message}
            </p>

            {/* Main Action Button */}
            <div className="pt-1">
              {!isSubscribed ? (
                <button
                  onClick={handleEnablePush}
                  disabled={loading || (supportStatus.isIOSDevice && !supportStatus.isStandalonePWA)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1E1D1B] hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{loading ? 'Activating...' : 'Enable Web Push Notifications'}</span>
                </button>
              ) : (
                <button
                  onClick={handleDisablePush}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Revoke / Disable on this Device</span>
                </button>
              )}
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : feedback.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}
          </div>

          {/* iOS / iPadOS Installation Guide Accordion */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="w-full p-4 text-left flex items-center justify-between bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-bold text-stone-900">
                  iPhone & iPad Setup Guide (iOS 16.4+)
                </span>
              </div>
              {isGuideOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {isGuideOpen && (
              <div className="p-4 sm:p-5 space-y-3.5 text-xs text-stone-600 border-t border-stone-100 bg-white">
                <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-amber-900 leading-relaxed font-medium">
                  <strong>Apple Requirement:</strong> iOS Safari only delivers background push notifications to Web Apps added to your Home Screen.
                </div>

                <ol className="space-y-3 pl-1 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Open this website in <strong>Safari</strong> on your iPhone or iPad.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> at the bottom toolbar in Safari.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-stone-700" />, then tap <strong>Add</strong> in the top right.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Open the installed <strong>Worship Team</strong> icon from your Home Screen.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      5
                    </span>
                    <span>
                      Return to this Settings dialog and tap <strong>Enable Web Push Notifications</strong>.
                    </span>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Notification Categories Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
              <ShieldCheck className="w-4 h-4 text-stone-500" />
              <span>Notification Categories</span>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl bg-white overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">Lineup Published & Changes</p>
                  <p className="text-[11px] text-stone-500">When new Sunday lineups are released or updated</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.lineup}
                  onChange={() => toggleCategory('lineup')}
                  className="w-4 h-4 text-stone-900 rounded-sm focus:ring-amber-500 accent-[#1E1D1B]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">Vocalist & Role Assignments</p>
                  <p className="text-[11px] text-stone-500">When you are assigned as Worship Leader or Singer</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.assignment}
                  onChange={() => toggleCategory('assignment')}
                  className="w-4 h-4 text-stone-900 rounded-sm focus:ring-amber-500 accent-[#1E1D1B]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">Rehearsals & Events</p>
                  <p className="text-[11px] text-stone-500">Rehearsal schedules, time adjustments, and venue changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.rehearsal}
                  onChange={() => toggleCategory('rehearsal')}
                  className="w-4 h-4 text-stone-900 rounded-sm focus:ring-amber-500 accent-[#1E1D1B]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">Team Announcements</p>
                  <p className="text-[11px] text-stone-500">Important church worship ministry bulletins</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.announcement}
                  onChange={() => toggleCategory('announcement')}
                  className="w-4 h-4 text-stone-900 rounded-sm focus:ring-amber-500 accent-[#1E1D1B]"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">Service Reminders</p>
                  <p className="text-[11px] text-stone-500">Upcoming Sunday morning countdown and call-times</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reminder}
                  onChange={() => toggleCategory('reminder')}
                  className="w-4 h-4 text-stone-900 rounded-sm focus:ring-amber-500 accent-[#1E1D1B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E1D5] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
