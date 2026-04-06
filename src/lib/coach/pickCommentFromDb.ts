import type { Mood } from './commentTemplates';
import type { WeeklyMoodTrend } from './getWeeklyMoodTrend';
import type { StreakPhase } from './getStreakPhase';
import { commentDb } from './commentDb';

type PickOptions = {
  mood: Mood;
  trend: WeeklyMoodTrend;
  phase: StreakPhase;
  variant?: 'A' | 'B';
  seedHint?: string;
};

/** pool から通常ランダムで1件選ぶ */
function randomPick(pool: readonly string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * seedHint から deterministic なインデックスを得る。
 * 同じ seed なら同じ文を返す（軽量ハッシュ）。
 */
function seededPick(pool: readonly string[], seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

/**
 * variant A/B でプールの選択範囲をずらす。
 * tired の場合は variant バイアスを弱くする（全体から選ぶ）。
 */
function applyVariant(pool: readonly string[], variant: 'A' | 'B', isTired: boolean): readonly string[] {
  if (isTired || pool.length <= 2) return pool;
  if (variant === 'A') {
    // 前半 2/3（やさしい系）
    return pool.slice(0, Math.max(1, Math.ceil(pool.length * 0.67)));
  }
  // 後半 2/3（行動促進系）
  return pool.slice(Math.floor(pool.length * 0.33));
}

/**
 * commentDb から条件に合うプールを取得し、1件返す。
 *
 * 優先順位:
 * 1. mood === 'tired' → 最優先で保護（variant バイアスなし）
 * 2. trend === 'tired-heavy' → normal/good でも回復寄り
 * 3. trend × phase でプールを選択
 * 4. variant バイアス適用
 * 5. seedHint があれば deterministic pick、なければ random
 */
export function pickCommentFromDb({
  mood,
  trend,
  phase,
  variant,
  seedHint,
}: PickOptions): string {
  let pool: readonly string[];

  // ── tired: 最優先保護 ────────────────────────────────────────────────────
  if (mood === 'tired') {
    pool = trend === 'tired-heavy'
      ? commentDb.tired.tiredHeavy
      : commentDb.tired.base[phase];
    // tired は variant バイアスを掛けない（守り優先）
    return seedHint ? seededPick(pool, seedHint) : randomPick(pool);
  }

  // ── normal ───────────────────────────────────────────────────────────────
  if (mood === 'normal') {
    if (trend === 'tired-heavy') {
      pool = commentDb.normal.tiredHeavy;
    } else if (trend === 'good-heavy') {
      pool = commentDb.normal.goodHeavy[phase];
    } else {
      pool = commentDb.normal.mixed[phase];
    }
  } else {
    // ── good ─────────────────────────────────────────────────────────────
    if (trend === 'tired-heavy') {
      pool = commentDb.good.tiredHeavy;
    } else if (trend === 'good-heavy') {
      pool = commentDb.good.goodHeavy[phase];
    } else {
      pool = commentDb.good.mixed[phase];
    }
  }

  // variant バイアス適用
  if (variant) {
    pool = applyVariant(pool, variant, false);
  }

  return seedHint ? seededPick(pool, seedHint) : randomPick(pool);
}
