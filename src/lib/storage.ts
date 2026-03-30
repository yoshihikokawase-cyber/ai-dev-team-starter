import { Habit, HabitLog, WeeklyReportData } from './types';

const HABITS_KEY = 'quickhabit_habits';
const LOGS_KEY = 'quickhabit_logs';
const REPORT_KEY = 'quickhabit_report';

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getLogs(): HabitLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLogs(logs: HabitLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function isCompletedToday(habitId: string, logs: HabitLog[]): boolean {
  const today = getToday();
  return logs.some((log) => log.habitId === habitId && log.date === today);
}

export function getStreak(habitId: string, logs: HabitLog[]): number {
  const habitLogs = logs
    .filter((log) => log.habitId === habitId)
    .map((log) => log.date)
    .sort((a, b) => b.localeCompare(a));

  if (habitLogs.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (habitLogs.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getWeeklyReport(): WeeklyReportData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(REPORT_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveWeeklyReport(report: WeeklyReportData): void {
  localStorage.setItem(REPORT_KEY, JSON.stringify(report));
}

export function getPast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// ─── XP / レベル ───────────────────────────────────────────────

/** 総XP（1完了 = 10 XP） */
export function getTotalXP(logs: HabitLog[]): number {
  return logs.length * 10;
}

/** 現在のレベル（100 XP ごとに1レベル、最低 Lv.1） */
export function getLevel(logs: HabitLog[]): number {
  return Math.floor(getTotalXP(logs) / 100) + 1;
}

/** レベル進捗情報（ホーム・統計画面で使用） */
export function getLevelProgress(logs: HabitLog[]): {
  level: number;
  xpInLevel: number; // 現在レベル内の XP（0〜99）
  xpForNext: number; // 次レベルまでに必要な XP（常に 100）
} {
  const totalXP = getTotalXP(logs);
  const level = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;
  return { level, xpInLevel, xpForNext: 100 };
}

// ─── 全体ストリーク ──────────────────────────────────────────────

/** 1つでも習慣を達成した日が何日連続しているか（全体ストリーク） */
export function getOverallStreak(logs: HabitLog[]): number {
  const completedDates = [...new Set(logs.map((l) => l.date))].sort((a, b) =>
    b.localeCompare(a)
  );
  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (completedDates.includes(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── 今月の達成率 ────────────────────────────────────────────────

/** 今月（1日〜今日）の全習慣の達成率（%） */
export function getMonthlyRate(logs: HabitLog[], habits: Habit[]): number {
  if (habits.length === 0) return 0;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysPassed = now.getDate(); // 1〜31

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthLogs = logs.filter((l) => l.date.startsWith(monthStr));
  const possible = habits.length * daysPassed;
  return possible > 0 ? Math.round((monthLogs.length / possible) * 100) : 0;
}

// ─── DayStatus（既存） ───────────────────────────────────────────

export interface DayStatus {
  date: string;       // YYYY-MM-DD
  dayLabel: string;   // 月火水木金土日
  completed: boolean;
  isToday: boolean;
}

export function getWeekStatus(habitId: string, logs: HabitLog[]): DayStatus[] {
  const days = getPast7Days();
  const today = getToday();
  const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

  return days.map((date) => {
    const d = new Date(date);
    return {
      date,
      dayLabel: DAY_LABELS[d.getDay()],
      completed: logs.some((l) => l.habitId === habitId && l.date === date),
      isToday: date === today,
    };
  });
}
