'use client';

import { useState } from 'react';
import { Habit, HabitLog } from '@/lib/types';
import { getStreak } from '@/lib/storage';
import AddHabitForm from '@/components/AddHabitForm';

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
}

/** 設定・習慣管理画面 */
export default function SettingsTab({
  habits,
  logs,
  showAddForm,
  canAddMore,
  onAddHabit,
  onDeleteHabit,
  onGoHome,
  onShowAddForm,
  onCancelAddForm,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const remaining = 10 - habits.length;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 animate-fadeIn">

      {/* ── ヘッダー ── */}
      <header className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">⚙️ 設定</h2>
        <p className="text-xs text-gray-400 mt-0.5">習慣の管理・通知設定</p>
      </header>

      {/* ── ① 今日の習慣へ戻るCTA ── */}
      <button
        onClick={onGoHome}
        className="w-full bg-indigo-500 text-white rounded-2xl py-3 font-semibold text-sm hover:bg-indigo-600 transition-colors mb-4"
      >
        ▶ 今日の習慣をやる
      </button>

      {/* ── 登録習慣一覧 ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">📋 登録習慣一覧</h3>
          {/* ② 登録数を「あと◯個」表示に */}
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {remaining > 0 ? `あと${remaining}個登録できます` : '上限に達しました'}
          </span>
        </div>

        {habits.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            まだ習慣が登録されていません
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map((habit) => {
              const streak = getStreak(habit.id, logs);
              const doneYesterday = logs.some(
                (l) => l.habitId === habit.id && l.date === yesterdayStr
              );

              /* ③ ストリーク文脈テキスト */
              const streakLabel =
                streak >= 2
                  ? `🔥 ${streak}日連続・昨日も達成`
                  : streak === 1
                  ? '🔥 昨日達成！今日も続けよう'
                  : doneYesterday
                  ? '昨日やった・今日も記録しよう'
                  : 'まだ記録なし';

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{habit.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {habit.name}
                      </p>
                      <p className="text-xs text-gray-400">{streakLabel}</p>
                    </div>
                  </div>

                  {/* ④ 削除：確認ダイアログ付きゴミ箱アイコン */}
                  {confirmId === habit.id ? (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => { onDeleteHabit(habit.id); setConfirmId(null); }}
                        className="text-xs text-red-500 font-semibold px-2 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        削除
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-xs text-gray-400 px-2 py-1 hover:text-gray-600 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(habit.id)}
                      className="ml-3 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      aria-label={`${habit.name}を削除`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 習慣追加フォーム */}
        {showAddForm && (
          <div className="mt-3">
            <AddHabitForm onAdd={onAddHabit} onCancel={onCancelAddForm} />
          </div>
        )}

        {/* 習慣追加ボタン */}
        {!showAddForm && canAddMore && (
          <button
            onClick={onShowAddForm}
            className="w-full mt-3 border-2 border-dashed border-indigo-200 rounded-xl py-2.5 text-indigo-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all text-sm font-medium"
          >
            ＋ 習慣を追加する
          </button>
        )}
      </div>

      {/* ── ⑤ 通知設定（未実装・操作不可で明示） ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">🔔 通知設定</h3>
          <span className="text-xs bg-amber-50 text-amber-500 rounded-full px-2 py-0.5">
            近日実装
          </span>
        </div>
        <div className="flex flex-col gap-4 opacity-40 pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">🌅 朝の通知</p>
              <p className="text-xs text-gray-400">毎朝 7:00 にリマインド</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">🌙 夜の通知</p>
              <p className="text-xs text-gray-400">毎晩 21:00 にリマインド</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── アプリ情報 ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">ℹ️ アプリ情報</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'バージョン',    value: 'Day15 / v2.0' },
            { label: 'データ保存',    value: 'ローカル (localStorage)' },
            { label: '登録習慣数',    value: `${habits.length} / 10` },
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
