'use client';

import { useState, useEffect } from 'react';
import { Habit, HabitLog } from '@/lib/types';
import { getStreak } from '@/lib/storage';
import { APP_VERSION } from '@/lib/appVersion';
import AddHabitForm from '@/components/AddHabitForm';
import type { NotifPermission, NotificationSettings, PushStatus } from '@/hooks/useNotification';
import type { CoachTone } from '@/components/HomeTab';

interface Props {
  habits: Habit[];
  logs: HabitLog[];
  showAddForm: boolean;
  canAddMore: boolean;
  onAddHabit: (name: string, icon: string) => void;
  onDeleteHabit: (id: string) => void;
  onGoHome: () => void;
  onShowAddForm: () => void;
  onCancelAddForm: () => void;
  onSignOut?: () => void;
  signOutLoading?: boolean;
  userEmail?: string;
  notifPermission: NotifPermission;
  notifSettings: NotificationSettings;
  notifSaving: boolean;
  notifSaveMsg: string;
  pushStatus: PushStatus;
  onRequestPermission: () => void;
  onTestNotification: () => void;
  onSendPushTest: () => void;
  onSaveNotifSettings: (s: NotificationSettings) => void;
  coachTone: CoachTone;
  onCoachToneChange: (t: CoachTone) => void;
}

export default function SettingsTab({
  habits, logs, showAddForm, canAddMore,
  onAddHabit, onDeleteHabit, onGoHome, onShowAddForm, onCancelAddForm,
  onSignOut, signOutLoading, userEmail,
  notifPermission, notifSettings, notifSaving, notifSaveMsg, pushStatus,
  onRequestPermission, onTestNotification, onSendPushTest, onSaveNotifSettings,
  coachTone, onCoachToneChange,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pushTestMsg, setPushTestMsg] = useState('');
  const [draftEnabled, setDraftEnabled] = useState(notifSettings.enabled);
  const [draftTime, setDraftTime] = useState(notifSettings.time);

  useEffect(() => {
    setDraftEnabled(notifSettings.enabled);
    setDraftTime(notifSettings.time);
  }, [notifSettings]);

  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const remaining = 10 - habits.length;

  async function handleSendPushTest() {
    console.log('[Push] Push test button clicked');
    setPushTestMsg('送信中...');
    try {
      console.log('[Push] Fetching /api/push-send ...');
      const res = await fetch('/api/push-send', { method: 'POST' });
      console.log('[Push] /api/push-send responded:', res.status, res.ok);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log('[Push] Push send success:', data);
        setPushTestMsg('Push通知を送信しました ✓');
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('[Push] Push send failed. status:', res.status, 'body:', data);
        setPushTestMsg(`送信失敗: ${data.error ?? res.status}`);
      }
    } catch (err) {
      console.error('[Push] fetch threw an error:', err);
      setPushTestMsg('送信失敗（ネットワークエラー）');
    }
    setTimeout(() => setPushTestMsg(''), 4000);
    onSendPushTest();
  }

  const pushStatusLabel: Record<PushStatus, string | null> = {
    idle: null,
    subscribing: '購読中...',
    subscribed: 'Push購読済み ✓',
    permission_denied: '通知が拒否されています',
    unsupported: 'Push非対応ブラウザ',
    error: 'Push設定に失敗しました',
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 animate-fadeIn">
      <header className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">⚙️ 設定</h2>
        <p className="text-xs text-gray-400 mt-0.5">習慣の管理・通知設定</p>
      </header>
      <button onClick={onGoHome} className="w-full bg-indigo-500 text-white rounded-2xl py-3 font-semibold text-sm hover:bg-indigo-600 transition-colors mb-4">
        ▶ 今日の習慣をやる
      </button>

      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">📋 登録習慣一覧</h3>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {remaining > 0 ? `あと${remaining}個登録できます` : '上限に達しました'}
          </span>
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">ホームから習慣を追加しよう</p>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map((habit) => {
              const streak = getStreak(habit.id, logs);
              const doneYesterday = logs.some((l) => l.habitId === habit.id && l.date === yesterdayStr);
              const streakLabel = streak >= 2 ? `🔥 ${streak}日連続・昨日も達成`
                : streak === 1 ? '🔥 昨日達成！今日も続けよう'
                : doneYesterday ? '昨日やった・今日も記録しよう'
                : 'まだ記録なし';
              return (
                <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{habit.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{habit.name}</p>
                      <p className="text-xs text-gray-400">{streakLabel}</p>
                    </div>
                  </div>
                  {confirmId === habit.id ? (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => { onDeleteHabit(habit.id); setConfirmId(null); }} className="text-xs text-red-500 font-semibold px-2 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">削除</button>
                      <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 px-2 py-1 hover:text-gray-600 transition-colors">キャンセル</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(habit.id)} className="ml-3 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors flex-shrink-0" aria-label={`${habit.name}を削除`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {showAddForm && <div className="mt-3"><AddHabitForm onAdd={onAddHabit} onCancel={onCancelAddForm} /></div>}
        {showAddForm === false && canAddMore && (
          <button onClick={onShowAddForm} className="w-full mt-3 border-2 border-dashed border-indigo-200 rounded-xl py-2.5 text-indigo-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all text-sm font-medium">
            ＋ 習慣を追加する
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">🔔 通知設定</h3>
          {notifPermission === 'unsupported' ? <span className="text-xs bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">非対応</span>
          : notifPermission === 'granted' ? <span className="text-xs bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5">許可済み ✓</span>
          : notifPermission === 'denied' ? <span className="text-xs bg-red-50 text-red-500 rounded-full px-2 py-0.5">拒否済み</span>
          : <span className="text-xs bg-amber-50 text-amber-500 rounded-full px-2 py-0.5">未設定</span>}
        </div>
        {notifPermission === 'unsupported' && <p className="text-xs text-gray-400 text-center py-2">このブラウザは通知に対応していません</p>}
        {notifPermission === 'denied' && <p className="text-xs text-red-400 bg-red-50 rounded-xl px-3 py-2 mb-3">ブラウザで通知が拒否されています。ブラウザの設定から許可してください。</p>}
        {notifPermission !== 'unsupported' && (
          <div className="flex flex-col gap-4">
            {notifPermission === 'default' && (
              <button onClick={onRequestPermission} className="w-full bg-indigo-500 text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-indigo-600 transition-colors">
                🔔 通知を有効にする
              </button>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">通知を受け取る</p>
                <p className="text-xs text-gray-400">Push通知（ブラウザを閉じても届く）</p>
              </div>
              <button
                onClick={() => setDraftEnabled((v) => !v)}
                disabled={notifPermission !== 'granted'}
                className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${draftEnabled ? 'bg-indigo-500' : 'bg-gray-200'}`}
                aria-label="通知ON/OFF"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${draftEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">通知時刻</p>
                <p className="text-xs text-gray-400">1日1回</p>
              </div>
              <input type="time" value={draftTime} onChange={(e) => setDraftTime(e.target.value)} disabled={notifPermission !== 'granted'}
                className="text-sm text-gray-700 font-medium border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed" />
            </div>
            {pushStatusLabel[pushStatus] && (
              <p className={`text-xs px-3 py-2 rounded-xl ${
                pushStatus === 'subscribed' ? 'bg-emerald-50 text-emerald-600'
                : pushStatus === 'subscribing' ? 'bg-blue-50 text-blue-500'
                : 'bg-red-50 text-red-500'
              }`}>
                {pushStatusLabel[pushStatus]}
              </p>
            )}
            <button
              onClick={() => onSaveNotifSettings({ enabled: draftEnabled, time: draftTime })}
              disabled={notifSaving || notifPermission !== 'granted'}
              className="w-full bg-gray-800 text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {notifSaving ? '保存中...' : '保存する'}
            </button>
            <button
              onClick={() => { console.log('[QuickHabit] local test clicked'); onTestNotification(); }}
              className="w-full border border-gray-200 text-gray-600 text-sm font-medium rounded-xl py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              📣 ローカル通知テスト
            </button>
            <button
              onClick={handleSendPushTest}
              disabled={pushStatus === 'subscribing'}
              className="w-full border border-indigo-200 text-indigo-600 text-sm font-medium rounded-xl py-2.5 hover:bg-indigo-50 active:bg-indigo-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🚀 Push通知テスト（サーバー送信）
            </button>
            {pushTestMsg && (
              <p className={`text-xs text-center font-medium ${pushTestMsg.includes('✓') ? 'text-emerald-600' : 'text-red-500'}`}>
                {pushTestMsg}
              </p>
            )}
            {notifSaveMsg && (
              <p className={`text-xs text-center font-medium ${notifSaveMsg.includes('✗') ? 'text-red-500' : 'text-emerald-600'}`}>
                {notifSaveMsg}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 応援スタイル ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">💬 応援スタイル</h3>
        <p className="text-xs text-gray-400 mb-3">AIコーチのコメントのトーンを選べます</p>
        <div className="flex gap-2">
          {(
            [
              { key: 'soft'   as CoachTone, label: 'やさしく', desc: '安心感・許可を出す' },
              { key: 'strong' as CoachTone, label: 'しっかり', desc: '少し背中を押す' },
            ] as const
          ).map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => onCoachToneChange(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all duration-150 active:scale-95 ${
                coachTone === key
                  ? 'bg-green-50 ring-2 ring-green-400 ring-offset-1'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              aria-pressed={coachTone === key}
            >
              <span className={`text-sm font-bold ${coachTone === key ? 'text-green-700' : 'text-gray-700'}`}>
                {label}
              </span>
              <span className="text-xs text-gray-400">{desc}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2.5 text-center">
          ※ しんどいときは、どちらも無理させません
        </p>
      </div>

      {onSignOut && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 アカウント</h3>
          {userEmail && <p className="text-xs text-gray-400 mb-3 truncate">{userEmail}</p>}
          <button onClick={onSignOut} disabled={signOutLoading} className="w-full text-sm font-medium text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl py-2 transition-colors disabled:opacity-50">
            {signOutLoading ? 'サインアウト中...' : 'サインアウト'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">ℹ️ アプリ情報</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'バージョン', value: APP_VERSION },
            { label: 'データ保存', value: 'Supabase (クラウド)' },
            { label: '登録習慣数', value: `${habits.length} / 10` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
