'use client';

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

  return (
    <div
      data-testid="habit-card"
      className={`p-4 rounded-xl border-2 transition-all ${
        completed
          ? 'border-green-400 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* 上段: アイコン・名前・ストリーク・操作ボタン */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{habit.icon}</span>
          <div className="min-w-0">
            <p
              data-testid="habit-name"
              className="font-semibold text-gray-800 truncate"
            >
              {habit.name}
            </p>
            <p
              data-testid="habit-streak"
              className="text-sm text-gray-500"
            >
              {streak > 0 ? `🔥 ${streak}日連続` : '今日から始めよう'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            data-testid="habit-toggle"
            onClick={() => onToggle(habit.id)}
            className={`w-12 h-12 rounded-full text-xl font-bold transition-all duration-200 ${
              completed
                ? 'bg-green-400 text-white shadow-md scale-110 animate-[pop_0.2s_ease-out]'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:scale-105'
            }`}
            aria-label={completed ? '記録済み（タップで取り消し）' : '今日の記録をする'}
          >
            {completed ? '✓' : '○'}
          </button>
          <button
            data-testid="habit-delete"
            onClick={() => onDelete(habit.id)}
            className="w-8 h-8 rounded-full text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
            aria-label={`${habit.name}を削除`}
          >
            ×
          </button>
        </div>
      </div>

      {/* 下段: 7日グラフ */}
      <HabitMiniGraph weekStatus={weekStatus} />
    </div>
  );
}
