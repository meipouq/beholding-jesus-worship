// Beholding Jesus Worship Team - Web Push & iOS PWA Service
// Manages browser service worker registration, push subscriptions, VAPID key integration,
// and comprehensive iOS / iPadOS capability detection.

import { getSupabase } from './supabase';

export const PUBLIC_VAPID_KEY =
  'BCykR7uJot_OyVgiG_UVZlgqyRvVvFXhtrgXkAv7mKxpbK61PaNh1jw9nZTUoDEJLu1dSWZ3xHlaU64KOeCgxGE';

export interface PushCategoryPreferences {
  lineup: boolean;
  assignment: boolean;
  rehearsal: boolean;
  announcement: boolean;
  reminder: boolean;
}

export const DEFAULT_PUSH_CATEGORIES: PushCategoryPreferences = {
  lineup: true,
  assignment: true,
  rehearsal: true,
  announcement: true,
  reminder: true,
};

export interface IOSSupportStatus {
  isIOSDevice: boolean;
  isStandalonePWA: boolean;
  canReceivePush: boolean;
  iosVersionEstimated?: string;
  message: string;
}

// Convert VAPID base64 public key to Uint8Array required by PushManager
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Detect iOS / iPadOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const isIOSPlatform = /iPhone|iPad|iPod/i.test(ua);
  const isIPadOS =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return isIOSPlatform || isIPadOS;
}

// Detect if app is currently launched in Standalone Home Screen mode
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  return isStandaloneMedia || isIOSStandalone;
}

// Check standard Web Push API support
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Complete iOS capability and requirement detection
export function getIOSSupportStatus(): IOSSupportStatus {
  const ios = isIOS();
  const standalone = isStandalone();
  const supported = isPushSupported();

  if (!ios) {
    return {
      isIOSDevice: false,
      isStandalonePWA: standalone,
      canReceivePush: supported,
      message: supported
        ? 'Web Push is fully supported by your browser.'
        : 'Push notifications are not supported in this browser.',
    };
  }

  // iOS Device
  if (!supported) {
    return {
      isIOSDevice: true,
      isStandalonePWA: standalone,
      canReceivePush: false,
      message:
        'iOS 16.4 or later is required for Web Push. Please verify your iOS version in Settings > General > About.',
    };
  }

  if (!standalone) {
    return {
      isIOSDevice: true,
      isStandalonePWA: false,
      canReceivePush: false,
      message:
        'Apple iOS requires installing the app to your Home Screen before Push Notifications can be enabled.',
    };
  }

  return {
    isIOSDevice: true,
    isStandalonePWA: true,
    canReceivePush: true,
    message: 'App is running in Home Screen mode. Web Push notifications are fully active and supported!',
  };
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

// Check existing subscription
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.warn('Error reading existing subscription:', err);
    return null;
  }
}

// Subscribe current device to Web Push (triggered ONLY on explicit user action)
export async function subscribeUserToPush(userId: string): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: false, error: 'Web Push is not supported on this browser.' };
  }

  const iosStatus = getIOSSupportStatus();
  if (iosStatus.isIOSDevice && !iosStatus.isStandalonePWA) {
    return {
      success: false,
      error: 'Please add this app to your Home Screen from Safari first before enabling notifications.',
    };
  }

  try {
    // 1. Request user permission on click
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error:
          permission === 'denied'
            ? 'Notification permission was denied in your browser settings.'
            : 'Notification permission was dismissed.',
      };
    }

    // 2. Ensure Service Worker is registered
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = (await registerServiceWorker()) || undefined;
    }
    if (!reg) {
      return { success: false, error: 'Failed to initialize service worker registration.' };
    }

    // 3. Obtain Push Subscription with Public VAPID Key
    const applicationServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    // 4. Extract subscription keys
    const rawKeys = sub.toJSON().keys;
    const p256dh = rawKeys?.p256dh || '';
    const auth = rawKeys?.auth || '';

    // 5. Store / sync subscription in Supabase
    const supabase = getSupabase();
    if (supabase) {
      const platformStr = iosStatus.isIOSDevice
        ? 'ios-pwa'
        : /Android/i.test(navigator.userAgent)
        ? 'android'
        : 'desktop';

      const { error: subErr } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          endpoint: sub.endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent.slice(0, 255),
          platform: platformStr,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,endpoint' }
      );
      if (subErr) {
        console.error('Supabase push_subscriptions upsert error:', subErr);
        return {
          success: false,
          error:
            subErr.code === '42501'
              ? 'Database permission error. Please run the Supabase RLS policy update in SQL Editor.'
              : 'Database rejected subscription: ' + subErr.message,
        };
      }
    }

    return { success: true, subscription: sub };
  } catch (err: any) {
    console.error('Subscription error:', err);
    return { success: false, error: err?.message || 'Failed to subscribe to Web Push' };
  }
}

// Revoke push subscription for current device
export async function unsubscribeUserFromPush(userId: string): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        const supabase = getSupabase();
        if (supabase) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('endpoint', endpoint);
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to unsubscribe from push:', err);
    return false;
  }
}

// Local storage helpers for notification category preferences
const PREF_STORAGE_KEY = 'bj_push_preferences';

export function getStoredPushPreferences(): PushCategoryPreferences {
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PUSH_CATEGORIES, ...JSON.parse(raw) };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_PUSH_CATEGORIES;
}

export function saveStoredPushPreferences(prefs: PushCategoryPreferences): void {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    // ignore
  }
}

export async function syncPushPreferencesToSupabase(
  userId: string,
  prefs: PushCategoryPreferences,
  pushEnabled: boolean = true
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  try {
    await supabase.from('push_preferences').upsert(
      {
        user_id: userId,
        push_enabled: pushEnabled,
        categories: prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  } catch (err) {
    console.warn('Failed to sync push preferences to Supabase:', err);
  }
}

export interface BroadcastPushPayload {
  title: string;
  body: string;
  url?: string;
  category?: 'lineup' | 'assignment' | 'rehearsal' | 'announcement' | 'reminder' | 'general';
  notification_id?: string;
}

// Dispatches a Web Push alert to all registered and eligible devices via Vercel serverless function
export async function dispatchPushBroadcast(
  payload: BroadcastPushPayload
): Promise<{ success: boolean; sentCount?: number; error?: string }> {
  try {
    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, sentCount: data.sentCount };
  } catch (err: any) {
    console.warn('dispatchPushBroadcast warning:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
