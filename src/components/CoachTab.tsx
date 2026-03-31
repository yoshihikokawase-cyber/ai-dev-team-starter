'use client';

import { Habit, HabitLog, WeeklyReportData } from '@/lib/types';
import { getStreak, getPast7Days } from '@/lib/storage';
import { parseCoaching } from '@/lib/coaching';

interface Props {
  habits: Habit[];
  logs: HabitLog[];
  report: WeeklyReportData | null;
  loadingReport: boolean;
  reportError: string;
  onGenerateReport: () => void;
  onGoHome: () => void;
}

/** 過去7日で最も達成が少ない習慣を返す（改善候補） */
function getWeakestHabit(habits: Habit[], logs: HabitLog[]): Habit | null {
  if (habits.length === 0) return null;
  const days = getPast7Days();
  return [...habits].sort((a, b) => {
    const aCount = days.filter((d) => logs.some((l) => l.habitId === a.id && l.date === d)).length;
    const bCount = days.filter((d) => logs.some((l) => l.habitId === b.id && l.date === d)).length;
    return aCount - bCount;
  })[0];
}

/** ストリークが最も長い習慣を返す */
function getTopStreakHabit(habits: Habit[], logs: HabitLog[]): Habit | null {
  if (habits.length === 0) return null;
  return [...habits].sort(
    (a, b) => getStreak(b.id, logs) - getStreak(a.id, logs)
  )[0];
}

/** ロジックに基づいた改善提案を最大3件返す */
function buildSuggestions(habits: Habit[], logs: HabitLog[]): string[] {
  const suggestions: string[] = [];
  const weak = getWeakestHabit(habits, logs);
  const top = getTopStreakHabit(habits, logs);
  const hours = new Date().getHours();

  if (weak) {
    const weakStreak = getStreak(weak.id, logs);
    if (weakStreak === 0) {
      suggestions.push(
        `${weak.icon} 「${weak.name}」が最近できていません。まず3日連続を目指しましょう`
      );
    } else {
      suggestions.push(
        `${weak.icon} 「${weak.name}」の達成率を上げると、全体が安定します`
      );
    }
  }

  if (hours < 10) {
    suggestions.push('🌅 朝のうちに1つ完了させると、残りも続けやすくなります');
  } else if (hours >= 20) {
    suggestions.push('🌙 寝る前の振り返りタイム。未完了の習慣を確認しましょう');
  } else {
    suggestions.push('⏰ 習慣は毎日同じ時間に行うと、より速く定着します');
  }

  if (top && getStreak(top.id, logs) >= 3) {
    suggestions.push(
      `🔥 「${top.name}」のストリークが${getStreak(top.id, logs)}日！この勢いを他の習慣にも活かしましょう`
    );
  } else {
    suggestions.push('💡 記録をつける習慣自体が、最も重要なファーストステップです');
  }

  return suggestions.slice(0, 3);
}

/** AIコーチのメインメッセージを返す */
function buildMainMessage(habits: Habit[], logs: HabitLog[]): string {
  if (habits.length === 0) {
    return '習慣を追加して、コーチングを始めましょう！';
  }
  const weak = getWeakestHabit(habits, logs);
  const top = getTopStreakHabit(habits, logs);

  if (weak && getStreak(weak.id, logs) === 0) {
    return `${weak.icon} 「${weak.name}」が3日以上未達です。小さな目標から再スタートしましょう`;
  }
  if (top && getStreak(top.id, logs) >= 7) {
    return `${top.icon} 「${top.name}」が${getStreak(top.id, logs)}日連続！習慣が定着してきています`;
  }
  return '📊 分析中：記録が増えると、より精度の高いアドバイスができます';
}

/** AIコーチ画面 */
export default function CoachTab({
  habits,
  logs,
  report,
  loadingReport,
  reportError,
  onGenerateReport,
  onGoHome,
}: Props) {
  const mainMessage = buildMainMessage(habits, logs);
  const suggestions = buildSuggestions(habits, logs);

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4 animate-fadeIn">

      {/* ── ヘッダー ── */}
      <header className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">🤖 AIコーチ</h2>
        <p className="text-xs text-gray-400 mt-0.5">あなた専用のアドバイス</p>
      </header>

      {/* ── コーチからのメインメッセージ ── */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 mb-4 text-white shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">🤖</span>
          <div>
            <p className="text-xs opacity-70 mb-1">コーチからのメッセージ</p>
            <p className="font-semibold leading-snug">{mainMessage}</p>
          </div>
        </div>
      </div>

      {/* ── 分析 → 提案フロー ── */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          💡 今日の改善提案
        </h3>
        {suggestions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">
            習慣を追加すると提案が表示されます
          </p>
        )}
      </div>

      {/* ── AIレポート（週次） ── */}
      {habits.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">📋 AIレポート（週次）</h3>
            {report && (
              <span className="text-xs text-gray-400">
                {new Date(report.generatedAt).toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>
          <button
            onClick={onGenerateReport}
            disabled={loadingReport}
            className="w-full bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loadingReport ? '🔄 AIが分析中...' : '🤖 AIレポートを生成する'}
          </button>
          {reportError && (
            <p className="text-red-500 text-xs mt-2 text-center">{reportError}</p>
          )}
          {report && (() => {
            const parts = parseCoaching(report.content);
            if (parts) {
              return (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-600 mb-1">🎉 よかったこと</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{parts.positive}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-amber-600 mb-1">📊 分析</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{parts.analysis}</p>
                  </div>
                  <div className="p-4 bg-blue-500 rounded-xl shadow-sm">
                    <p className="text-xs font-semibold text-blue-100 mb-1">▶ 今すぐやること</p>
                    <p className="text-sm font-bold text-white leading-relaxed mb-3">{parts.action}</p>
                    <button
                      onClick={onGoHome}
                      className="w-full bg-white text-blue-600 text-sm font-bold py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      ホームで記録する →
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.content}
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── フィードバック履歴 ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          🗓 フィードバック履歴
        </h3>
        {report ? (
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-500">最新レポート</span>
              <span className="text-xs text-gray-400">
                {new Date(report.generatedAt).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
              {report.content.slice(0, 120)}...
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            AIレポートを生成すると履歴が表示されます
          </p>
        )}
      </div>
    </div>
  );
}
