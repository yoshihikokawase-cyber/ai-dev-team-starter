'use client';

import { useState } from 'react';
import { Habit, HabitLog, WeeklyReportData } from '@/lib/types';
import HabitCard from '@/components/HabitCard';
import AddHabitForm from '@/components/AddHabitForm';
import WeeklySummary from '@/components/WeeklySummary';
import WeeklyReport from '@/components/WeeklyReport';
import { getStreak, getPast7Days } from '@/lib/storage';

interface Props {
  habits: Habit[];
  logs: HabitLog[];
  level: number;
  xpInLevel: number;
  xpForNext: number;
  overallStreak: number;
  completedToday: number;
  report: WeeklyReportData | null;
  loadingReport: boolean;
  reportError: string;
  showAddForm: boolean;
  canAddMore: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddHabit: (name: string, icon: string) => void;
  onShowAddForm: () => void;
  onCancelAddForm: () => void;
  onGenerateReport: () => void;
}

/**
 * 今日まだ未完了の習慣の中から「今日まずやるべき1件」を選ぶ。
 * 優先順位: ストリーク継続中 > 今週の達成数が多い > リスト順
 */
function getRecommendedHabit(
  habits: Habit[],
  logs: HabitLog[]
): { habit: Habit; statusText: string } | null {
  const today = new Date().toISOString().split('T')[0];
  const past7 = getPast7Days();

  const incomplete = habits.filter(
    (h) => !logs.some((l) => l.habitId === h.id && l.date === today)
  );
  if (incomplete.length === 0) return null;

  const scored = incomplete.map((habit) => {
    const streak = getStreak(habit.id, logs);
    const weekCount = logs.filter(
      (l) => l.habitId === habit.id && past7.includes(l.date)
    ).length;
    return { habit, streak, weekCount };
  });

  scored.sort((a, b) => {
    if (a.streak > 0 && b.streak === 0) return -1;
    if (a.streak === 0 && b.streak > 0) return 1;
    return b.weekCount - a.weekCount;
  });

  const top = scored[0];

  let statusText: string;
  if (top.streak >= 2) {
    statusText = `🔥 ${top.streak}日つづいてる — キープしよう`;
  } else if (top.streak === 1) {
    statusText = '✨ 1日つづいた — 今日も続けよう';
  } else if (top.weekCount >= 6) {
    statusText = '今週あと1回で目標達成';
  } else {
    statusText = '今日はまだ未完了です';
  }

  return { habit: top.habit, statusText };
}

/**
 * 行動を直接促す1行メッセージを返す。
 * 「状況の説明」ではなく「今すぐやること」を伝える。
 */
function getActionMessage(
  completedToday: number,
  total: number,
  overallStreak: number
): string {
  if (total === 0) return 'まず1つ、習慣を追加してみましょう';
  if (completedToday === total) return '今日は全部達成！明日も続けましょう 🎉';

  const remaining = total - completedToday;
  const hours = new Date().getHours();

  if (completedToday === 0) {
    if (overallStreak >= 3) return `${overallStreak}日継続中！今日も1つ押してみましょう`;
    return 'まず1つ押してみましょう';
  }
  if (hours >= 20) return `残り${remaining}つ — 今夜中に記録しましょう ⏰`;
  return `残り${remaining}つ — 1つ押すだけでOKです`;
}

// ─── 週次ふり返りコメント ─────────────────────────────────────────

/**
 * 過去7日間の完了率（0〜1）と今日の状態から、1〜2行のコメントを返す。
 *
 * weekRate の区分:
 *   良い週  … 0.6 以上（60%+）
 *   普通    … 0.3 以上 0.6 未満
 *   悪い週  … 0.3 未満
 */
function getWeeklyReflection(weekRate: number, mood: Mood | null): string {
  const isGoodWeek = weekRate >= 0.6;
  const isBadWeek  = weekRate < 0.3;

  if (isGoodWeek) {
    if (mood === 'good')   return 'この調子！積み上げが確実に力になっています。';
    if (mood === 'tired')  return 'いい1週間でした。今日は充電の日でOK。';
    return 'いいペースです。このまま続けましょう。';
  }

  if (isBadWeek) {
    if (mood === 'good')   return '今日から流れが変わります。まず1つ押してみましょう。';
    if (mood === 'tired')  return '無理しなくていい。1つだけでもゼロより全然いい。';
    return '少しペースが落ちても大丈夫。今日の1つが次につながります。';
  }

  // 普通の週（30〜59%）
  if (mood === 'good')   return '着実に続いています。今日は少し伸ばしてみましょう。';
  if (mood === 'tired')  return '続けているだけで十分。今日は守ることが正解です。';
  return '安定したペースです。焦らず積み上げましょう。';
}

// ─── 今日の状態 ────────────────────────────────────────────────────

type Mood = 'good' | 'normal' | 'tired';

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'good',   emoji: '😊', label: '調子いい'       },
  { key: 'normal', emoji: '😐', label: 'ふつう'          },
  { key: 'tired',  emoji: '😞', label: 'ちょっとしんどい' },
];

const MOOD_COMMENTS: Record<Mood, string> = {
  good:   '今日は一段上を狙いましょう',
  normal: '無理せず積み上げていきましょう',
  tired:  '1分でもOK。ゼロにしないことが勝ちです',
};

// ────────────────────────────────────────────────────────────────────

/** ホーム画面（メインタブ） */
export default function HomeTab({
  habits,
  logs,
  level,
  xpInLevel,
  xpForNext,
  overallStreak,
  completedToday,
  report,
  loadingReport,
  reportError,
  showAddForm,
  canAddMore,
  onToggle,
  onDelete,
  onAddHabit,
  onShowAddForm,
  onCancelAddForm,
  onGenerateReport,
}: Props) {
  const [mood, setMood] = useState<Mood | null>(null);

  const total = habits.length;
  const completionRate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
  const xpToNext = xpForNext - xpInLevel;
  const isEvening = new Date().getHours() >= 20;
  const todayDate = new Date().toISOString().slice(0, 10);
  const reportGeneratedToday = report?.generatedAt?.startsWith(todayDate) ?? false;

  const todayStr = new Date().toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const actionMessage = getActionMessage(completedToday, total, overallStreak);
  const recommended = total > 0 ? getRecommendedHabit(habits, logs) : null;

  // 過去7日間の完了率（0〜1）
  const past7 = getPast7Days();
  const weekLogCount = logs.filter((l) => past7.includes(l.date)).length;
  const weekRate = total > 0 ? weekLogCount / (total * 7) : 0;
  const weeklyReflection = getWeeklyReflection(weekRate, mood);

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-4 animate-fadeIn">

      {/* ── ヘッダー（コンパクト） ── */}
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">⚡ TapHabit</h1>
          <p data-testid="today-date" className="text-xs text-gray-400 mt-0.5">
            {todayStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-100 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-green-700">Lv.{level}</span>
          </div>
          <div className="bg-orange-100 rounded-full px-3 py-1">
            <span className="text-xs font-semibold text-orange-400">🔥{overallStreak}日</span>
          </div>
        </div>
      </header>

      {/* ── ① 今日の状態 3択 ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <p className="text-xs font-bold text-gray-400 mb-3 tracking-wide uppercase">今日の状態</p>
        <div className="flex gap-2">
          {MOODS.map(({ key, emoji, label }) => (
            <button
              key={key}
              onClick={() => setMood(key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-150 active:scale-95 ${
                mood === key
                  ? 'bg-green-50 ring-2 ring-green-400 ring-offset-1'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              aria-pressed={mood === key}
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <span
                className={`text-[11px] font-semibold leading-tight text-center ${
                  mood === key ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
        {mood && (
          <div className="mt-3 px-3 py-2 bg-green-50 rounded-xl animate-fadeIn">
            <p className="text-xs text-green-700 font-medium">{MOOD_COMMENTS[mood]}</p>
          </div>
        )}
      </div>

      {/* ── ② 今日まずこれ CTA（習慣あり・未完了あり） ── */}
      {recommended && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 animate-fadeIn">
          <p className="text-xs font-bold text-green-600 mb-2 tracking-wide">今日まずこれ</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{recommended.habit.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{recommended.habit.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{recommended.statusText}</p>
            </div>
            <button
              onClick={() => onToggle(recommended.habit.id)}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 text-white text-xl font-bold hover:bg-green-600 transition-colors active:scale-95 flex items-center justify-center"
              aria-label={`${recommended.habit.name}を完了`}
            >
              ○
            </button>
          </div>
        </div>
      )}

      {/* ── ② 今日の習慣リスト（最優先・最上部） ── */}
      {total === 0 && !showAddForm ? (
        <div data-testid="empty-state" className="text-center py-14 text-gray-400">
          <p className="text-5xl mb-4">🌱</p>
          <p className="font-semibold text-gray-500">まず1つ、習慣を作ろう</p>
          <p className="text-sm mt-1">下のボタンからすぐ始められます</p>
        </div>
      ) : (
        <div data-testid="habit-list" className="flex flex-col gap-3 mb-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logs}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* ── ② 習慣追加フォーム ── */}
      {showAddForm && (
        <div className="mb-4">
          <AddHabitForm onAdd={onAddHabit} onCancel={onCancelAddForm} />
        </div>
      )}

      {/* ── ③ 今やることカード（完了後も継続促進） ── */}
      {total > 0 && completedToday > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-3 shadow-sm border-l-4 border-green-500 animate-fadeIn">
          <p className="text-xs font-bold text-green-600 mb-2 tracking-wide">今やること</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                {completedToday === total
                  ? '今日はできた。この調子で明日も'
                  : `まずは1回。あと${total - completedToday}つ`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
              <span>⭐</span>
              <span>
                {completedToday === total
                  ? '連続の土台ができた'
                  : `あと ${xpToNext} XP で Lv.${level + 1}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── ④ 進捗バー + XPカウントダウン ── */}
      {total > 0 && (
        <div data-testid="progress-section" className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span data-testid="progress-count" className="text-sm font-bold text-gray-800">
              {completedToday} / {total} できた
            </span>
            <span
              className={`text-xs font-bold ${
                completedToday === total
                  ? 'text-emerald-500'
                  : xpToNext <= 20
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              {completedToday === total
                ? 'ナイス達成 🎉'
                : `あと${xpToNext} XP → Lv.${level + 1}`}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              data-testid="progress-bar"
              className={`h-2.5 rounded-full transition-all duration-700 ${
                completionRate === 100 ? 'bg-emerald-400' : 'bg-green-500'
              }`}
              style={{ width: completionRate > 0 ? `${completionRate}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* ── ④-b 週次ふり返り ── */}
      {total > 0 && (
        <div className="bg-white rounded-2xl px-4 py-3.5 mb-3 shadow-sm flex items-start gap-3">
          <span className="text-lg mt-0.5 flex-shrink-0">
            {weekRate >= 0.6 ? '🌟' : weekRate >= 0.3 ? '📈' : '💪'}
          </span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              週のふり返り
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{weeklyReflection}</p>
          </div>
        </div>
      )}

      {/* ── ⑤ AI行動促進メッセージ（未完了時のみ表示） ── */}
      {total > 0 && completedToday < total && (
        <div
          className={`rounded-xl px-3 py-2 mb-4 flex items-center gap-2 ${
            isEvening && completedToday < total
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-green-50 border border-green-100'
          }`}
        >
          <span className="text-base">🤖</span>
          <p
            className={`text-xs font-medium ${
              isEvening && completedToday < total ? 'text-amber-700' : 'text-green-700'
            }`}
          >
            {actionMessage}
          </p>
        </div>
      )}

      {/* ── ⑤ 習慣追加ボタン（目立たせすぎない） ── */}
      {!showAddForm && canAddMore && (
        <button
          data-testid="show-add-form"
          onClick={onShowAddForm}
          className="w-full text-gray-400 text-xs py-2 hover:text-indigo-400 transition-colors mb-4"
        >
          ＋ 新しい習慣を追加
        </button>
      )}

      {/* ── ⑥ 週次サマリー（data-testid 保持） ── */}
      {total > 0 && <WeeklySummary habits={habits} logs={logs} />}

      {/* ── ⑦ AIレポート（data-testid 保持） ── */}
      {total > 0 && (
        <div className="mt-2">
          <button
            data-testid="generate-report-btn"
            onClick={onGenerateReport}
            disabled={loadingReport || reportGeneratedToday}
            className="w-full bg-green-500 text-white rounded-2xl py-3 font-semibold text-sm hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loadingReport
              ? '🔄 AIが分析中...'
              : reportGeneratedToday
              ? '✅ 今日のふり返り生成済み'
              : '📊 今週のふり返りを生成する'}
          </button>
          {reportGeneratedToday && (
            <p className="text-xs text-center text-gray-400 mt-1">明日また更新できます</p>
          )}
          {reportError && (
            <p data-testid="report-error" className="text-red-500 text-xs mt-2 text-center">
              {reportError}
            </p>
          )}
          {report && <WeeklyReport report={report} />}
        </div>
      )}
    </div>
  );
}
