'use client';

import { useState, useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" 例: "21:00"
}

/**
 * ブラウザ通知の Permission 管理・スケジューリング・Supabase 保存を担当するカスタムフック。
 * ページを開いている間だけ動作するシンプルなクライアントサイドスケジューラー。
 */
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

  // インターバルと二重発火防止用の ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFiredRef = useRef<string>('');

  // ── ① 初回: ブラウザ側でのみ Permission を読み取る（SSR 安全）
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotifPermission);
  }, []);

  // ── ② Supabase から通知設定をロード
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

  // ── ③ 通知スケジューラー（30秒ごとに現在時刻と照合）
  useEffect(() => {
    // 前回のインターバルをクリア
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
      // 当日・当該時刻の一意キー（二重発火防止）
      const todayKey = `${now.toISOString().slice(0, 10)}-${settings.time}`;

      if (
        now.getHours() === hh &&
        now.getMinutes() === mm &&
        lastFiredRef.current !== todayKey
      ) {
        lastFiredRef.current = todayKey;
        new Notification('QuickHabit 🔔', {
          body: '今日の習慣を記録しましょう！',
          icon: '/favicon.ico',
        });
      }
    }, 30_000); // 30秒ごと

    intervalRef.current = id;
    return () => clearInterval(id);
  }, [settings, permission]);

  /** 通知許可をリクエスト（必ずボタン押下経由で呼ぶこと） */
  async function requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as NotifPermission);
  }

  /** テスト通知を即時発火 — permission は state ではなく Notification.permission を直参照 */
  function sendTestNotification() {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    console.log('[QuickHabit] testNotification clicked');
    console.log('[QuickHabit] Notification.permission:', Notification.permission);

    if (Notification.permission !== 'granted') {
      alert('通知が許可されていません。ブラウザのサイト設定から通知を許可してください。');
      return;
    }

    try {
      new Notification('QuickHabit テスト通知 🔔', {
        body: '今日の習慣を1つ記録しよう',
      });
      console.log('[QuickHabit] notification created');
    } catch (error) {
      console.error('[QuickHabit] test notification failed', error);
    }
  }

  /** 設定を Supabase に upsert 保存 */
  async function saveSettings(next: NotificationSettings) {
    if (!userId) return;
    setSaving(true);
    setSaveMsg('');
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
      setSaveMsg('保存に失敗しました ✗');
    } else {
      setSettings(next);
      setSaveMsg('保存しました ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    }
  }

  return {
    permission,
    settings,
    saving,
    saveMsg,
    requestPermission,
    sendTestNotification,
    saveSettings,
  };
}
