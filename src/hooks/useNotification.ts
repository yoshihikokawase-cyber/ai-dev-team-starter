'use client';

import { useState, useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  registerServiceWorker,
  subscribePush,
  extractSubscriptionData,
} from '@/lib/pushUtils';

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface NotificationSettings {
  enabled: boolean;
  time: string;
}

export type PushStatus =
  | 'idle'
  | 'subscribing'
  | 'subscribed'
  | 'permission_denied'
  | 'unsupported'
  | 'error';

export function useNotification(
  supabase: SupabaseClient,
  userId: string | undefined
) {
  const [permission, setPermission] = useState<NotifPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: '21:00',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pushStatus, setPushStatus] = useState<PushStatus>('idle');

  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFiredRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotifPermission);
    registerServiceWorker().then((reg) => {
      swRegRef.current = reg;
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_settings')
      .select('notifications_enabled, notification_time')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings({
            enabled: (data as { notifications_enabled: boolean; notification_time: string | null }).notifications_enabled ?? false,
            time: (data as { notifications_enabled: boolean; notification_time: string | null }).notification_time ?? '21:00',
          });
        }
      });
  }, [userId, supabase]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!settings.enabled || permission !== 'granted') return;
    const id = setInterval(() => {
      const now = new Date();
      const parts = settings.time.split(':');
      const hh = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const todayKey = `${now.toISOString().slice(0, 10)}-${settings.time}`;
      if (now.getHours() === hh && now.getMinutes() === mm && lastFiredRef.current !== todayKey) {
        lastFiredRef.current = todayKey;
        new Notification('QuickHabit', {
          body: '\u4ECA\u65E5\u306E\u7FD2\u6163\u3092\u8A18\u9332\u3057\u307E\u3057\u3087\u3046\uFF01',
          icon: '/favicon.ico',
        });
      }
    }, 30_000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [settings, permission]);

  async function requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as NotifPermission);
    return result;
  }

  function sendTestNotification() {
    console.log('[QuickHabit] sendTestNotification called');
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') {
      alert('\u901A\u77E5\u304C\u8A31\u53EF\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u30D6\u30E9\u30A6\u30B6\u306E\u30B5\u30A4\u30C8\u8A2D\u5B9A\u304B\u3089\u901A\u77E5\u3092\u8A31\u53EF\u3057\u3066\u304F\u3060\u3055\u3044\u3002');
      return;
    }
    try {
      new Notification('QuickHabit \u30ED\u30FC\u30AB\u30EB\u30C6\u30B9\u30C8', {
        body: '\u4ECA\u65E5\u306E\u7FD2\u6163\u30921\u3064\u8A18\u9332\u3057\u3088\u3046',
      });
      console.log('[QuickHabit] local notification created');
    } catch (error) {
      console.error('[QuickHabit] local test notification failed', error);
    }
  }

  async function enablePushSubscription(): Promise<boolean> {
    console.log('[Push] enablePushSubscription called. userId:', userId);
    if (!userId) { console.warn('[Push] No userId, aborting'); return false; }
    if (typeof window === 'undefined' || !('PushManager' in window)) {
      console.warn('[Push] PushManager not supported');
      setPushStatus('unsupported');
      return false;
    }
    setPushStatus('subscribing');

    let perm = Notification.permission;
    console.log('[Push] Current permission:', perm);
    if (perm === 'default') {
      perm = await Notification.requestPermission();
      setPermission(perm as NotifPermission);
    }
    if (perm !== 'granted') {
      console.warn('[Push] Permission not granted:', perm);
      setPushStatus('permission_denied');
      return false;
    }

    let reg = swRegRef.current;
    if (!reg) {
      console.log('[Push] No cached SW reg, registering...');
      reg = await registerServiceWorker();
      swRegRef.current = reg;
    }
    if (!reg) {
      console.error('[Push] SW registration failed');
      setPushStatus('error');
      return false;
    }
    console.log('[Push] SW registration OK:', reg.scope);

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
    console.log('[Push] VAPID key present:', vapidKey.length > 0, '(length:', vapidKey.length, ')');
    const sub = await subscribePush(reg, vapidKey);
    if (!sub) {
      console.error('[Push] subscribePush returned null');
      setPushStatus('error');
      return false;
    }

    const subData = extractSubscriptionData(sub);
    console.log('[Push] subscription.toJSON():', sub.toJSON());
    console.log('[Push] extracted data — endpoint:', subData.endpoint.slice(0, 60) + '...', 'p256dh:', subData.p256dh.slice(0, 10) + '...', 'auth:', subData.auth.slice(0, 10) + '...');

    const { error } = await supabase.from('push_subscriptions').upsert(
      { user_id: userId, endpoint: subData.endpoint, p256dh: subData.p256dh, auth: subData.auth, subscription_json: subData.subscription_json, is_active: true },
      { onConflict: 'user_id,endpoint' }
    );
    if (error) {
      console.error('[Push] Supabase upsert failed. code:', error.code, 'message:', error.message, 'details:', error.details, 'hint:', error.hint);
      setPushStatus('error');
      return false;
    }

    setPushStatus('subscribed');
    console.log('[Push] Subscription saved to Supabase successfully');
    return true;
  }

  async function disablePushSubscription() {
    if (!userId) return;
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId);
    const reg = swRegRef.current;
    if (reg) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    }
    setPushStatus('idle');
    console.log('[Push] Unsubscribed');
  }

  async function saveSettings(next: NotificationSettings) {
    if (!userId) return;
    setSaving(true);
    setSaveMsg('');

    console.log('[Push] saveSettings called. next.enabled:', next.enabled, 'settings.enabled:', settings.enabled, 'pushStatus:', pushStatus);

    // enablePushSubscription は「有効化したい、かつまだ購読済みでない」場合に実行
    // settings.enabled が既に true でも pushStatus が 'subscribed' でなければ再購読する
    // （前回セッションで保存したが Push 購読が取れていないケースに対応）
    if (next.enabled && pushStatus !== 'subscribed') {
      console.log('[Push] Calling enablePushSubscription (pushStatus was:', pushStatus, ')');
      await enablePushSubscription();
    }
    if (!next.enabled && settings.enabled) {
      await disablePushSubscription();
    }

    const { error } = await supabase.from('user_settings').upsert(
      {
        user_id: userId,
        notifications_enabled: next.enabled,
        notification_time: next.time,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    setSaving(false);
    if (error) {
      setSaveMsg('\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F \u2717');
    } else {
      setSettings(next);
      setSaveMsg('\u4FDD\u5B58\u3057\u307E\u3057\u305F \u2713');
      setTimeout(() => setSaveMsg(''), 2500);
    }
  }

  return {
    permission,
    settings,
    saving,
    saveMsg,
    pushStatus,
    requestPermission,
    sendTestNotification,
    saveSettings,
    enablePushSubscription,
    disablePushSubscription,
  };
}
