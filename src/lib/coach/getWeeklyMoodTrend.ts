import type { Mood } from './commentTemplates';
import { getMoodHistory } from './moodHistory';

export type WeeklyMoodTrend = 'tired-heavy' | 'good-heavy' | 'mixed';

/**
 * 直近7日間の mood 履歴から傾向を判定する。
 * - tired が最多 → 'tired-heavy'
 * - good が最多  → 'good-heavy'
 * - それ以外      → 'mixed'
 */
export function getWeeklyMoodTrend(): WeeklyMoodTrend {
  const history = getMoodHistory();
  if (history.length === 0) return 'mixed';

  // 直近7日に絞る
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const recent = history.filter((e) => e.date >= cutoffStr);
  if (recent.length === 0) return 'mixed';

  const counts: Record<Mood, number> = { tired: 0, normal: 0, good: 0 };
  for (const e of recent) {
    counts[e.mood]++;
  }

  const max = Math.max(counts.tired, counts.normal, counts.good);
  if (counts.tired === max) return 'tired-heavy';
  if (counts.good === max) return 'good-heavy';
  return 'mixed';
}
