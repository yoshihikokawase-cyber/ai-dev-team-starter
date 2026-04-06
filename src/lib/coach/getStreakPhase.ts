export type StreakPhase = 'start' | 'entry' | 'week' | 'strong';

/**
 * 連続日数を継続段階に変換する。
 * start:  0〜2日（始まったばかり）
 * entry:  3〜6日（習慣化の入口）
 * week:   7〜13日（1週間超）
 * strong: 14日以上（定着ゾーン）
 */
export function getStreakPhase(streakDays: number): StreakPhase {
  if (streakDays <= 2) return 'start';
  if (streakDays <= 6) return 'entry';
  if (streakDays <= 13) return 'week';
  return 'strong';
}
