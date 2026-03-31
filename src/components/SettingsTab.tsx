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
  onShowAddForm: () => void;
  onCancelAddForm: () => void;
}

/** トグルスイッチ UI（通知設定など） */
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-label={label}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-indigo-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/** 設定・習慣管理画面 */
export default function SettingsTab({
  habits,
  logs,
  showAddForm,
  canAddMore,
  onAddHabit,
  onDeleteHabit,
  onShowAddForm,
  onCancelAddForm,
}: Props) {
  // 通知設定は UI のみ（実装は将来の差し替えポイント）
  const [morningNotify, setMorningNotify] = useState(false);
  const [eveningNotify, setEveningNotify] = useState(false);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 animate-fadeIn">

      {/* ── ヘッダー ── */}
      <header className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">⚙️ 設定</h2>
        <p className="text-xs text-gray-400 mt-0.5">習慣の管理・通知設定</p>
      </header>

      {/* ── 登録習慣一覧 ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">📋 登録習慣一覧</h3>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {habits.length} / 10
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
                      <p className="text-xs text-gray-400">
                        毎日 ·{' '}
                        {streak > 0 ? `🔥 ${streak}日連続` : 'まだ記録なし'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="ml-3 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    aria-label={`${habit.name}を削除`}
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
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

      {/* ── 通知設定（UI のみ・将来の実装ポイント） ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">🔔 通知設定</h3>
          <span className="text-xs text-gray-400 bg-amber-50 text-amber-500 rounded-full px-2 py-0.5">
            近日実装
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">🌅 朝の通知</p>
              <p className="text-xs text-gray-400">毎朝 7:00 にリマインド</p>
            </div>
            <ToggleSwitch
              checked={morningNotify}
              onChange={setMorningNotify}
              label="朝の通知切り替え"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">🌙 夜の通知</p>
              <p className="text-xs text-gray-400">毎晩 21:00 にリマインド</p>
            </div>
            <ToggleSwitch
              checked={eveningNotify}
              onChange={setEveningNotify}
              label="夜の通知切り替え"
            />
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
