export interface Habit {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
}

export interface WeeklyReportData {
  generatedAt: string;
  content: string;
  weekStart: string;
  weekEnd: string;
}
