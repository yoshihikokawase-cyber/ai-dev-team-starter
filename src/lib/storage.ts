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
