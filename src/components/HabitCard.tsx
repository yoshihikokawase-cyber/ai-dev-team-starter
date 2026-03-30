'use client';

import { useState } from 'react';
import { Habit, HabitLog } from '@/lib/types';
import { isCompletedToday, getStreak, getWeekStatus } from '@/lib/storage';
import HabitMiniGraph from '@/components/HabitMiniGraph';

interface Props {
  habit: Habit;
  logs: HabitLog[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, logs, onToggle, onDelete }: Props) {
  const completed = isCompletedToday(habit.id, logs);
  const streak = getStreak(habit.id, logs);
  const weekStatus = getWeekStatus(habit.id, logs);

  // +XP フロート表示
  const [showXP, setShowXP] = useState(false);
  // 完了直後のバウンスアニメーション
  const [bouncing, setBouncing] = useState(false);

  function handleToggle() {
    if (!completed) {
      // 未完了 → 完了のとき XP + バウンス
      setShowXP(true);
      setBouncing(true);
      setTimeout(() => setShowXP(false), 900);
      setTimeout(() => setBouncing(false), 400);
    }
    onToggle(habit.id);
  }

  // マイルストーン定義
  const MILESTONES: Record<number, string> = {
    3:  '🎉 3日連続！継続してます',
    7:  '🔥 1週間達成！',
    14: '⭐ 2週間達成！',
    30: '🏆 1ヶ月達成！',
  };
  const milestone = completed ? MILESTONES[streak] : undefined;

  return (
    <div
      data-testid="habit-card"
      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
        completed
          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-indigo-200 shadow-sm'
      }`}
    >
      {/* +10 XP フロートテキスト */}
      {showXP && (
        <span className="absolute top-2 right-16 text-indigo-500 font-bold text-xs animate-xpFloat pointer-events-none select-none">
          +10 XP
        </span>
      )}

      {/* アイコン・習慣名・ストリーク・完了ボタン・削除ボタン */}
      <div className="flex items-center justify-between">
        {/* 左：完了ボタン（視線の最初の着地点） */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-3">
          <button
            data-testid="habit-toggle"
            onClick={handleToggle}
            className={`w-14 h-14 rounded-full text-2xl font-bold transition-all duration-200 flex items-center justify-center ${
              completed
                ? 'bg-emerald-400 text-white shadow-lg'
                : 'bg-white border-2 border-indigo-300 text-indigo-400 shadow-sm hover:border-indigo-400 hover:bg-indigo-50 active:scale-95 animate-pulseRing'
            } ${bouncing ? 'animate-checkBounce' : ''}`}
            aria-label={completed ? '記録済み（タップで取り消し）' : '今日の記録をする'}
          >
            {completed ? '✓' : '○'}
          </button>
        </div>

        {/* 右：習慣名・ストリーク・削除ボタン */}
        <div className="flex items-center justify-between flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0">{habit.icon}</span>
            <div className="min-w-0">
              <p
                data-testid="habit-name"
                className={`font-semibold truncate ${
                  completed ? 'text-emerald-700 line-through decoration-emerald-300' : 'text-gray-800'
                }`}
              >
                {habit.name}
              </p>
              <p data-testid="habit-streak" className="text-xs text-gray-400">
                {streak > 0 ? `🔥 ${streak}日連続` : '今日から始めよう'}
              </p>
            </div>
          </div>

          {/* 削除ボタン — 邪魔にならないサイズ */}
          <button
            data-testid="habit-delete"
            onClick={() => onDelete(habit.id)}
            className="ml-2 w-7 h-7 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-base leading-none flex items-center justify-center flex-shrink-0"
            aria-label={`${habit.name}を削除`}
          >
            ×
          </button>
        </div>
      </div>

      {/* 7日間ミニグラフ */}
      <HabitMiniGraph weekStatus={weekStatus} />

      {/* マイルストーン達成バッジ */}
      {milestone && (
        <div className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 animate-fadeIn">
          {milestone}
        </div>
      )}
    </div>
  );
}
