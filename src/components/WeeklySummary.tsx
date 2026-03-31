'use client';

import { Habit, HabitLog } from '@/lib/types';
import { getPast7Days, getStreak } from '@/lib/storage';

interface Props {
  habits: Habit[];
  logs: HabitLog[];
}

export default function WeeklySummary({ habits, logs }: Props) {
  const days = getPast7Days();
  const totalSlots = habits.length * 7;

  const completedSlots = habits.reduce((sum, habit) => {
    return (
      sum +
      days.filter((day) => logs.some((l) => l.habitId === habit.id && l.date === day)).length
    );
  }, 0);

  const overallRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  const habitStats = habits.map((habit) => {
    const completedDays = days.filter((day) =>
      logs.some((l) => l.habitId === habit.id && l.date === day)
    ).length;
    const streak = getStreak(habit.id, logs);
    return { habit, completedDays, streak };
  });

  const topStreak = habitStats.reduce(
    (best, cur) => (cur.streak > best.streak ? cur : best),
    habitStats[0]
  );

  return (
    <div
      data-testid="weekly-summary"
      className="bg-white rounded-xl border border-gray-200 p-4 mb-4"
    >
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        📊 7日間の記録
        <span className="text-xs font-normal text-gray-400">（過去7日間）</span>
      </h3>

      {/* 全体達成率 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">今週の達成率</span>
        <span
          data-testid="weekly-overall-rate"
          className={`text-lg font-bold ${
            overallRate >= 80
              ? 'text-green-500'
              : overallRate >= 50
              ? 'text-yellow-500'
              : 'text-gray-400'
          }`}
        >
          {overallRate}%
        </span>
      </div>

      {/* 各習慣の達成数 */}
      <div className="flex flex-col gap-2 mb-3">
        {habitStats.map(({ habit, completedDays }) => (
          <div
            key={habit.id}
            data-testid="weekly-habit-row"
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700 flex items-center gap-1 truncate">
              <span>{habit.icon}</span>
              <span className="truncate">{habit.name}</span>
            </span>
            <span className="text-gray-500 flex-shrink-0 ml-2">
              <span
                data-testid="weekly-habit-count"
                className={completedDays >= 5 ? 'text-green-500 font-semibold' : ''}
              >
                {completedDays}
              </span>
              /7
            </span>
          </div>
        ))}
      </div>

      {/* 最長ストリーク */}
      {topStreak && topStreak.streak > 0 && (
        <div
          data-testid="weekly-top-streak"
          className="text-xs text-gray-500 border-t border-gray-100 pt-2"
        >
          🔥 最長ストリーク: <span className="font-semibold text-orange-500">{topStreak.habit.name}</span> {topStreak.streak}日連続
        </div>
      )}
    </div>
  );
}
