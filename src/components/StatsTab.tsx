'use client';

import { useState, useEffect } from 'react';
import { Habit, HabitLog } from '@/lib/types';
import { getPast7Days } from '@/lib/storage';
import { getLast7DaysMood } from '@/lib/coach/moodHistory';
import type { MoodLog } from '@/lib/coach/moodHistory';
import { getWeeklyMoodTrend } from '@/lib/coach/getWeeklyMoodTrend';

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

type FlowState = {
  label: string;
  icon: string;
  color: string;   // Tailwind text color
  bg: string;      // Tailwind bg color
};

/** weekRate・streakDays・moodTrend から「今の流れ」を返す */
function getFlowState(
  weekRate: number,
  streakDays: number,
  moodTrend: ReturnType<typeof getWeeklyMoodTrend>
): FlowState {
  if (moodTrend === 'tired-heavy') {
    return { label: '回復優先', icon: '🌱', color: 'text-amber-700', bg: 'bg-amber-50' };
  }
  if (weekRate >= 0.6 && streakDays >= 3) {
    return { label: 'いい流れ', icon: '🌊', color: 'text-green-700', bg: 'bg-green-50' };
  }
  if (weekRate >= 0.4 || streakDays >= 3) {
    return { label: '安定中', icon: '📈', color: 'text-indigo-700', bg: 'bg-indigo-50' };
  }
  if (weekRate < 0.3 && streakDays === 0) {
    return { label: '立て直し中', icon: '🔄', color: 'text-blue-700', bg: 'bg-blue-50' };
  }
  return { label: '安定中', icon: '📈', color: 'text-indigo-700', bg: 'bg-indigo-50' };
}

/** 今週 vs 先週の比較テキストを返す */
function getWeekComparisonText(thisWeekCount: number, lastWeekCount: number): string {
  const diff = thisWeekCount - lastWeekCount;
  if (diff > 0) return `先週より +${diff}日 達成`;
  if (diff === 0) return '先週と同じペース';
  return `今週は少しゆっくり。でも戻せます`;
}

/** streakDays から次の達成ラインを返す */
function getNextMilestone(streakDays: number, completedToday: boolean): string {
  if (streakDays === 0) return completedToday ? '今日の1回で連続スタート！' : '今日やると連続スタートです';
  const milestones = [3, 7, 14, 30, 60, 100];
  const next = milestones.find((m) => m > streakDays);
  if (!next) return `${streakDays}日継続中。この流れを続けよう`;
  const diff = next - streakDays;
  if (diff === 1) return `あと1日で${next}日継続`;
  return `あと${diff}日で${next}日継続`;
}

const MOOD_CONFIG = {
  good:   { emoji: '😊', label: '調子いい', bg: 'bg-green-100',  ring: 'ring-green-300',  text: 'text-green-700' },
  normal: { emoji: '😐', label: 'ふつう',   bg: 'bg-gray-100',   ring: 'ring-gray-300',   text: 'text-gray-500'  },
  tired:  { emoji: '😞', label: 'しんどい', bg: 'bg-amber-100',  ring: 'ring-amber-300',  text: 'text-amber-700' },
} as const;

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
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);

  useEffect(() => {
    setMoodLogs(getLast7DaysMood());
  }, []);

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

  // 日付 → mood のマップ
  const moodByDate = Object.fromEntries(moodLogs.map((l) => [l.date, l.mood]));
  const recordedCount = past7Days.filter((d) => moodByDate[d]).length;

  // 先週（8〜14日前）の完了日数
  const prev7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 + i));
    return d.toISOString().split('T')[0];
  });
  const thisWeekCount = past7Days.filter((d) =>
    logs.some((l) => l.date === d)
  ).length;
  const lastWeekCount = prev7Days.filter((d) =>
    logs.some((l) => l.date === d)
  ).length;

  // 今日完了しているか
  const completedToday = logs.some((l) => l.date === today);

  // 今の流れ / 先週比較 / 次の達成ライン
  const moodTrend = getWeeklyMoodTrend();
  const weekRate = habits.length > 0 ? thisWeekCount / (habits.length * 7) : 0;
  const flowState = getFlowState(weekRate, overallStreak, moodTrend);
  const weekComparisonText = getWeekComparisonText(thisWeekCount, lastWeekCount);
  const nextMilestone = getNextMilestone(overallStreak, completedToday);


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

      {/* ── 今週の状態推移 ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-700">🌡 今週の状態</span>
          <span className="text-xs text-gray-400">
            {recordedCount > 0 ? `${recordedCount}日分の記録` : '記録なし'}
          </span>
        </div>

        <div className="flex justify-between gap-1">
          {past7Days.map((date) => {
            const d = new Date(date);
            const dayLabel = DAY_LABELS[d.getDay()];
            const mood = moodByDate[date] as keyof typeof MOOD_CONFIG | undefined;
            const isToday = date === today;
            const cfg = mood ? MOOD_CONFIG[mood] : null;

            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                {/* 状態アイコン */}
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all ${
                    cfg
                      ? `${cfg.bg} ring-1 ${cfg.ring}`
                      : isToday
                      ? 'bg-indigo-50 ring-1 ring-indigo-200'
                      : 'bg-gray-50'
                  }`}
                >
                  {cfg ? (
                    <span role="img" aria-label={cfg.label}>{cfg.emoji}</span>
                  ) : (
                    <span className="text-gray-300 text-sm">·</span>
                  )}
                </div>
                {/* 曜日 */}
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? 'text-indigo-500 font-bold' : 'text-gray-400'
                  }`}
                >
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="flex gap-3 mt-3 justify-center">
          {(Object.entries(MOOD_CONFIG) as [keyof typeof MOOD_CONFIG, typeof MOOD_CONFIG[keyof typeof MOOD_CONFIG]][]).map(([, cfg]) => (
            <span key={cfg.label} className={`text-[10px] ${cfg.text} flex items-center gap-1`}>
              {cfg.emoji} {cfg.label}
            </span>
          ))}
        </div>
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

      {/* ── 自分の流れカード ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">

        {/* 今の流れ */}
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-3 ${flowState.bg}`}>
          <span className="text-2xl">{flowState.icon}</span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">今の流れ</p>
            <p className={`text-lg font-bold ${flowState.color}`}>{flowState.label}</p>
          </div>
        </div>

        {/* 先週比較 + 次の達成ライン */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-base">📅</span>
            <p className="text-sm text-gray-700">{weekComparisonText}</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-base">🎯</span>
            <p className="text-sm text-gray-700">{nextMilestone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
