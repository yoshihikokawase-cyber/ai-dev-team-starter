'use client';

import { Habit, HabitLog } from '@/lib/types';
import { getPast7Days } from '@/lib/storage';

interface Props {
  habits: Habit[];
  logs: HabitLog[];
  level: number;
  xpInLevel: number;
  xpForNext: number;
  overallStreak: number;
  monthlyRate: number;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * レベルから「あなたは上位X%」ラベルを返す
 * ※ 実際のランキングデータがある場合はここを API 接続に差し替える
 */
function getRankLabel(level: number): string {
  if (level >= 15) return '上位5%';
  if (level >= 10) return '上位10%';
  if (level >= 7)  return '上位18%';
  if (level >= 5)  return '上位30%';
  if (level >= 3)  return '上位45%';
  return '上位60%';
}

/** 統計画面 */
export default function StatsTab({
  habits,
  logs,
  level,
  xpInLevel,
  xpForNext,
  overallStreak,
  monthlyRate,
}: Props) {
  const today = new Date().toISOString().split('T')[0];
  const past7Days = getPast7Days();
  const totalXP = (level - 1) * 100 + xpInLevel;

  // 過去7日間の各日の達成数・達成率
  const weeklyData = past7Days.map((date) => {
    const d = new Date(date);
    const completed = habits.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.date === date)
    ).length;
    const rate = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    return {
      date,
      dayLabel: DAY_LABELS[d.getDay()],
      completed,
      rate,
      isToday: date === today,
    };
  });

  const weekAvgRate =
    weeklyData.length > 0
      ? Math.round(weeklyData.reduce((s, d) => s + d.rate, 0) / weeklyData.length)
      : 0;

  const rankLabel = getRankLabel(level);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 animate-fadeIn">

      {/* ── ヘッダー ── */}
      <header className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">📊 統計</h2>
        <p className="text-xs text-gray-400 mt-0.5">成長の記録</p>
      </header>

      {/* ── 3つのサマリーカード ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="text-xl font-semibold text-orange-400">🔥{overallStreak}</div>
          <div className="text-xs text-gray-500 mt-1">つづいてる日数</div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-indigo-500">Lv.{level}</div>
          <div className="text-xs text-gray-500 mt-1">レベル</div>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-emerald-500">{monthlyRate}%</div>
          <div className="text-xs text-gray-500 mt-1">今月達成率</div>
        </div>
      </div>

      {/* ── XP・レベル進捗バー ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">⭐ 経験値</span>
          <span className="text-xs text-gray-400">合計 {totalXP} XP</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-500 w-12">Lv.{level}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${(xpInLevel / xpForNext) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-indigo-400 w-12 text-right">
            Lv.{level + 1}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          あと {xpForNext - xpInLevel} XP でレベルアップ
        </p>
      </div>

      {/* ── 週間グラフ ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-700">📅 週間グラフ</span>
          <span className="text-xs text-gray-400">週平均 {weekAvgRate}%</span>
        </div>
        {habits.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">
            習慣を追加するとグラフが見られます
          </p>
        ) : (
          <>
            {/* バーグラフ */}
            <div className="flex items-end justify-between gap-1.5 h-20">
              {weeklyData.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      day.isToday
                        ? 'bg-indigo-500'
                        : day.rate >= 80
                        ? 'bg-emerald-400'
                        : day.rate > 0
                        ? 'bg-indigo-200'
                        : 'bg-gray-100'
                    }`}
                    style={{
                      height: `${Math.max(day.rate, day.rate === 0 ? 5 : 10)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            {/* 曜日ラベル */}
            <div className="flex justify-between gap-1.5 mt-1.5">
              {weeklyData.map((day) => (
                <span
                  key={day.date}
                  className={`flex-1 text-center text-xs ${
                    day.isToday ? 'text-indigo-500 font-bold' : 'text-gray-400'
                  }`}
                >
                  {day.dayLabel}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── 今月サマリー ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📆 今月のサマリー</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">達成率</span>
          <span
            className={`text-lg font-bold ${
              monthlyRate >= 80
                ? 'text-emerald-500'
                : monthlyRate >= 50
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}
          >
            {monthlyRate}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${
              monthlyRate >= 80 ? 'bg-emerald-400' : 'bg-indigo-400'
            }`}
            style={{ width: `${monthlyRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ※ 先月比は過去データが増えると表示されます
        </p>
      </div>

      {/* ── ランキングバナー ── */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-75 mb-1">継続ランキング（推定）</p>
            <p className="text-2xl font-bold">{rankLabel}</p>
            <p className="text-xs opacity-60 mt-1">Lv.{level} · {totalXP} XP 獲得</p>
          </div>
          <span className="text-5xl">🏆</span>
        </div>
      </div>
    </div>
  );
}
