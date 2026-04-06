import type { Mood } from './commentTemplates';
import type { WeeklyMoodTrend } from './getWeeklyMoodTrend';
import { getStreakPhase } from './getStreakPhase';
import { pickCommentFromDb } from './pickCommentFromDb';

export type CoachTone = 'soft' | 'strong';

export type CoachCommentInput = {
  mood: Mood;
  weekRate: number;
  streakDays: number;
  coachTone: CoachTone;
  weeklyMoodTrend: WeeklyMoodTrend;
  variant: 'A' | 'B';
  /** 同条件で同じコメントを返したい場合に渡す（例: 日付文字列） */
  seedHint?: string;
};

/**
 * 状態 × 週傾向 × streak段階 でコメントを返す。
 *
 * coachTone は将来の拡張ポイントとして受け取るが、
 * 現時点では variant / seedHint がメインの分岐軸。
 *
 * 優先順位:
 * 1. tired → DB の tired プールから（variant バイアスなし）
 * 2. weeklyMoodTrend で回復 / 好調バイアスを決定
 * 3. streakDays → phase に変換してプール絞り込み
 * 4. variant A/B でインデックスをシフト
 * 5. seedHint があれば deterministic、なければ random
 */
export function getCoachComment({
  mood,
  weeklyMoodTrend,
  streakDays,
  variant,
  seedHint,
}: CoachCommentInput): string {
  const phase = getStreakPhase(streakDays);

  return pickCommentFromDb({
    mood,
    trend: weeklyMoodTrend,
    phase,
    variant,
    seedHint,
  });
}
