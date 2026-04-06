import type { Mood } from './commentTemplates';

const MOOD_HISTORY_KEY = 'taphabit_mood_history';

export type MoodHistoryEntry = {
  date: string;
  mood: Mood;
  coachVariant?: 'A' | 'B';
  coachTone?: 'soft' | 'strong';
};

/** 過去の mood 記録を取得（最大30件） */
export function getMoodHistory(): MoodHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOOD_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 今日の mood を保存（同日は上書き） */
export function saveTodayMood(
  date: string,
  mood: Mood,
  coachVariant: 'A' | 'B',
  coachTone: 'soft' | 'strong'
): void {
  if (typeof window === 'undefined') return;
  const history = getMoodHistory().filter((e) => e.date !== date);
  history.push({ date, mood, coachVariant, coachTone });
  // 直近30件だけ保持
  const trimmed = history.slice(-30);
  localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(trimmed));
}
