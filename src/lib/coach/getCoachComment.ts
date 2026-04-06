import type { Mood } from './commentTemplates';
import { tiredComments, normalComments, goodComments } from './commentTemplates';
import type { WeeklyMoodTrend } from './getWeeklyMoodTrend';

export type CoachTone = 'soft' | 'strong';

export type CoachCommentInput = {
  mood: Mood;
  weekRate: number;
  streakDays: number;
  coachTone: CoachTone;
  weeklyMoodTrend: WeeklyMoodTrend;
  variant: 'A' | 'B';
};

/** streakDays を継続段階に変換 */
function streakPhase(days: number): 'start' | 'entry' | 'week' | 'strong' {
  if (days <= 2) return 'start';
  if (days <= 6) return 'entry';
  if (days <= 13) return 'week';
  return 'strong';
}

/** 配列からランダムに1件返す（シード不要） */
function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * mood / weekRate / streakDays / coachTone / weeklyMoodTrend / variant
 * を組み合わせてAIコーチコメントを返す。
 *
 * 優先順位:
 * 1. tired → 必ず保護（strong tone でも和らげる）
 * 2. weeklyMoodTrend が tired-heavy → good/normal でも回復寄り
 * 3. streakDays が week/strong → 継続への言及コメント優先
 * 4. variant A/B で候補インデックスをシフト
 * 5. ランダム選択
 */
export function getCoachComment({
  mood,
  weeklyMoodTrend,
  streakDays,
  coachTone,
  weekRate,
  variant,
}: CoachCommentInput): string {
  // ── tired: tone に関わらず無理させない ───────────────────────────────
  if (mood === 'tired') {
    // tired-heavy の週は特に前半（守り系）から選ぶ
    const pool = weeklyMoodTrend === 'tired-heavy'
      ? tiredComments.slice(0, 12)
      : tiredComments;
    return pickWithVariant(pool, variant);
  }

  // ── weeklyMoodTrend が tired-heavy → normal/good でも回復寄りに ──────
  if (weeklyMoodTrend === 'tired-heavy') {
    // 週全体が疲弊気味なら tired コメントの後半（少し前向き）から選ぶ
    return pickWithVariant(tiredComments.slice(8), variant);
  }

  // ── good ────────────────────────────────────────────────────────────
  if (mood === 'good') {
    const phase = streakPhase(streakDays);

    if (weekRate < 0.3) {
      // 悪い週 + good → 再開優先（good コメントの前半から）
      return pickWithVariant(goodComments.slice(0, 8), variant);
    }

    if (weekRate >= 0.6 || weeklyMoodTrend === 'good-heavy') {
      // 好調週 + good → 後半の「伸ばす」系
      const pool = phase === 'strong' || phase === 'week'
        ? goodComments.slice(10)
        : goodComments.slice(5);
      return pickWithVariant(pool, variant);
    }

    // 普通の週 + good
    return pickWithVariant(goodComments, variant);
  }

  // ── normal ──────────────────────────────────────────────────────────
  const phase = streakPhase(streakDays);

  if (weekRate >= 0.6) {
    // 良い週 + normal → 安定継続を称える後半コメント
    const pool = coachTone === 'strong'
      ? normalComments.slice(10)
      : normalComments.slice(5, 15);
    return pickWithVariant(pool, variant);
  }

  if (weekRate < 0.3) {
    // 悪い週 + normal → 再開・小さく積む前半コメント
    const pool = coachTone === 'strong'
      ? normalComments.slice(0, 10)
      : normalComments.slice(0, 8);
    return pickWithVariant(pool, variant);
  }

  // 普通の週 + normal（streak も考慮）
  if (phase === 'week' || phase === 'strong') {
    // 7日以上継続 → 継続の価値を少しにおわせる中盤コメント
    return pickWithVariant(normalComments.slice(6, 16), variant);
  }

  return pickWithVariant(normalComments, variant);
}

/**
 * variant A/B でインデックスのオフセットを変える。
 * A: 前寄り（やさしい系）、B: 後ろ寄り（行動促進系）
 */
function pickWithVariant(pool: string[], variant: 'A' | 'B'): string {
  if (pool.length === 0) return pick(tiredComments); // fallback
  if (variant === 'A') {
    // 前半2/3から選ぶ
    const sub = pool.slice(0, Math.max(1, Math.ceil(pool.length * 0.67)));
    return pick(sub);
  } else {
    // 後半2/3から選ぶ
    const sub = pool.slice(Math.floor(pool.length * 0.33));
    return pick(sub);
  }
}
