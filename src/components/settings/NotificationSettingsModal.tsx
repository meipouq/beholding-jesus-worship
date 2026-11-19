import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Info,
  BellRing
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import {
  getIOSSupportStatus,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  getExistingSubscription,
  getStoredPushPreferences,
  saveStoredPushPreferences,
  syncPushPreferencesToSupabase,
  dispatchPushBroadcast,
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
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [preferences, setPreferences] = useState<PushCategoryPreferences>(getStoredPushPreferences());

  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const status = getIOSSupportStatus();
    setSupportStatus(status);

    if (typeof Notification !== 'undefined') {
      setPermissionState(Notification.permission);
    }

    getExistingSubscription().then((sub) => {
      setIsSubscribed(!!sub);
    });

    // Keep guide collapsed initially so the Enable button is immediately visible without scrolling
    setIsGuideOpen(false);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSendTestPush = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await dispatchPushBroadcast({
        title: '🔔 Worship Team Test Alert',
        body: `Hello ${currentUser.name}! Push notifications are working perfectly on your device.`,
        url: '/',
        category: 'general',
      });
      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Test alert dispatched! Sent to ${res.sentCount || 1} active device(s). Check your Lock Screen or Notification Center!`,
        });
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to dispatch test notification.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Error triggering test notification.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleEnablePush = async () => {
    // If on iOS and not yet running from Home Screen, guide the user
    if (supportStatus.isIOSDevice && !supportStatus.isStandalonePWA) {
      setIsGuideOpen(true);
      setFeedback({
        type: 'info',
        text: 'Apple requires adding this app to your iPhone Home Screen first (see steps below), then launching it from your Home Screen to enable notifications.',
      });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await subscribeUserToPush(currentUser.id);
      if (res.success) {
        setIsSubscribed(true);
        setPermissionState('granted');
        await syncPushPreferencesToSupabase(currentUser.id, preferences, true);
        setFeedback({
          type: 'success',
          text: 'Push notifications are now active! You will receive alerts even when the app is closed.',
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
      await syncPushPreferencesToSupabase(currentUser.id, preferences, false);
      setFeedback({
        type: 'info',
        text: 'Push notifications have been turned off for this device.',
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
    syncPushPreferencesToSupabase(currentUser.id, updated, isSubscribed);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-xs overscroll-contain flex flex-col justify-start sm:justify-center items-center p-3 sm:p-4 pt-14 pb-8 sm:py-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1F1F21] rounded-3xl shadow-2xl border border-[#35312B] overflow-hidden animate-slide-up flex flex-col shrink-0 max-h-[84dvh] sm:max-h-[85vh] my-auto sm:my-0 text-[#F5F0E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:py-4 bg-[#161616] border-b border-[#35312B] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#262626] border border-[#35312B] text-[#D9A441] flex items-center justify-center shadow-2xs">
              <BellRing className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#F5F0E6] leading-tight">
                Notification Settings
              </h3>
              <p className="text-[11px] text-[#AAA5A0] font-medium">
                Push alerts when the app is closed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body with smooth touch scrolling */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          
          {/* PRIMARY ACTION CARD (Pinned at top - immediately visible without scrolling) */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#35312B] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5F0E6]">
                Web Push Notifications
              </span>
              {isSubscribed ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#78B887]/15 text-[#78B887] border border-[#78B887]/30 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#78B887]" />
                  Active & Subscribed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#262626] text-[#AAA5A0] border border-[#35312B]">
                  <Info className="w-3.5 h-3.5 text-[#AAA5A0]" />
                  Not Enabled
                </span>
              )}
            </div>

            <p className="text-xs text-[#AAA5A0] leading-relaxed font-medium">
              Get notified for new Sunday lineups, singer assignments, and rehearsals even when this app is closed or locked.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!isSubscribed ? (
                <button
                  onClick={handleEnablePush}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#D9A441] hover:bg-[#F5C15D] active:scale-[0.98] text-[#101010] font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-[#101010] fill-[#101010]" />
                  <span>{loading ? 'Activating...' : 'Enable Web Push Notifications'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSendTestPush}
                    disabled={testing}
                    className="w-full py-3 px-4 rounded-2xl bg-[#D9A441] hover:bg-[#F5C15D] active:scale-[0.98] text-[#101010] font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4 fill-[#101010] text-[#101010]" />
                    <span>{testing ? 'Sending alert...' : 'Send Test Notification to this Device'}</span>
                  </button>
                  <button
                    onClick={handleDisablePush}
                    disabled={loading}
                    className="w-full py-2 px-4 rounded-2xl bg-[#262626] hover:bg-[#333] active:scale-[0.98] text-[#E57373] border border-[#35312B] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Turn Off Notifications on this Device</span>
                  </button>
                </>
              )}
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-[#78B887]/15 text-[#78B887] border border-[#78B887]/30'
                    : feedback.type === 'error'
                    ? 'bg-[#E57373]/15 text-[#E57373] border border-[#E57373]/30'
                    : 'bg-[#D9A441]/15 text-[#F5C15D] border border-[#D9A441]/30'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#78B887] mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-medium">{feedback.text}</span>
              </div>
            )}
          </div>

          {/* iPhone & iPad Setup Guide (Collapsible Accordion) */}
          <div className="border border-[#35312B] rounded-2xl overflow-hidden bg-[#161616] shadow-2xs">
            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="w-full p-3.5 text-left flex items-center justify-between bg-[#1F1F21] hover:bg-[#262626] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D9A441]" />
                <span className="text-xs font-bold text-[#F5F0E6]">
                  iPhone & iPad Setup Guide (iOS 16.4+)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#D9A441] bg-[#262626] border border-[#35312B] px-2 py-0.5 rounded-full">
                  {isGuideOpen ? 'Hide' : 'View Steps'}
                </span>
                {isGuideOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#AAA5A0]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#AAA5A0]" />
                )}
              </div>
            </button>

            {isGuideOpen && (
              <div className="p-4 space-y-3 text-xs text-[#AAA5A0] border-t border-[#35312B] bg-[#161616]">
                <div className="bg-[#262626] border border-[#35312B] p-2.5 rounded-xl text-[#F5F0E6] leading-relaxed font-medium">
                  <strong className="text-[#D9A441]">Apple Requirement:</strong> On iPhone/iPad, push notifications work after adding the app to your Home Screen from Safari.
                </div>

                <ol className="space-y-2.5 pl-0.5 font-medium text-[#AAA5A0]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#262626] border border-[#35312B] text-[#D9A441] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Open this site in <strong className="text-[#F5F0E6]">Safari</strong> on your iPhone or iPad.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#262626] border border-[#35312B] text-[#D9A441] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Tap the <strong className="text-[#F5F0E6]">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-[#D9A441]" /> in the Safari toolbar.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#262626] border border-[#35312B] text-[#D9A441] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Scroll down and tap <strong className="text-[#F5F0E6]">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#D9A441]" />, then tap <strong className="text-[#F5F0E6]">Add</strong>.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#78B887]/20 border border-[#78B887]/40 text-[#78B887] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Open <strong className="text-[#F5F0E6]">Worship Team</strong> from your Home Screen and tap <strong className="text-[#D9A441]">Enable Web Push Notifications</strong>!
                    </span>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Notification Categories Preferences */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#AAA5A0]">
              <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
              <span>Notification Categories</span>
            </div>

            <div className="divide-y divide-[#35312B] border border-[#35312B] rounded-2xl bg-[#161616] overflow-hidden shadow-2xs">
              <label className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#262626] transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-[#F5F0E6]">Lineup Published & Changes</p>
                  <p className="text-[11px] text-[#AAA5A0]">When new Sunday lineups are released or updated</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.lineup}
                  onChange={() => toggleCategory('lineup')}
                  className="w-4 h-4 text-[#D9A441] rounded-sm focus:ring-[#D9A441] accent-[#D9A441] cursor-pointer"
                />
              </label>

              <label className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#262626] transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-[#F5F0E6]">Vocalist & Role Assignments</p>
                  <p className="text-[11px] text-[#AAA5A0]">When you are assigned as Worship Leader or Singer</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.assignment}
                  onChange={() => toggleCategory('assignment')}
                  className="w-4 h-4 text-[#D9A441] rounded-sm focus:ring-[#D9A441] accent-[#D9A441] cursor-pointer"
                />
              </label>

              <label className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#262626] transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-[#F5F0E6]">Rehearsals & Events</p>
                  <p className="text-[11px] text-[#AAA5A0]">Schedule adjustments and venue announcements</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.rehearsal}
                  onChange={() => toggleCategory('rehearsal')}
                  className="w-4 h-4 text-[#D9A441] rounded-sm focus:ring-[#D9A441] accent-[#D9A441] cursor-pointer"
                />
              </label>

              <label className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#262626] transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-[#F5F0E6]">Team Announcements</p>
                  <p className="text-[11px] text-[#AAA5A0]">Ministry bulletins and team notices</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.announcement}
                  onChange={() => toggleCategory('announcement')}
                  className="w-4 h-4 text-[#D9A441] rounded-sm focus:ring-[#D9A441] accent-[#D9A441] cursor-pointer"
                />
              </label>

              <label className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#262626] transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-[#F5F0E6]">Service Reminders</p>
                  <p className="text-[11px] text-[#AAA5A0]">Sunday morning countdown and call times</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reminder}
                  onChange={() => toggleCategory('reminder')}
                  className="w-4 h-4 text-[#D9A441] rounded-sm focus:ring-[#D9A441] accent-[#D9A441] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-3 sm:p-4 bg-[#161616] border-t border-[#35312B] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333] border border-[#35312B] text-[#F5F0E6] text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
