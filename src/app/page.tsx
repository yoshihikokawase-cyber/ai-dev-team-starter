'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog, WeeklyReportData } from '@/lib/types';
import {
  getHabits,
  saveHabits,
  getLogs,
  saveLogs,
  getToday,
  isCompletedToday,
  getWeeklyReport,
  saveWeeklyReport,
  getPast7Days,
} from '@/lib/storage';
import HabitCard from '@/components/HabitCard';
import AddHabitForm from '@/components/AddHabitForm';
import WeeklyReport from '@/components/WeeklyReport';
import Toast from '@/components/Toast';
import WeeklySummary from '@/components/WeeklySummary';

const MAX_HABITS = 10;

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [toast, setToast] = useState<{ message: string; isSpecial: boolean } | null>(null);

  useEffect(() => {
    setHabits(getHabits());
    setLogs(getLogs());
    setReport(getWeeklyReport());
  }, []);

  function handleAddHabit(name: string, icon: string) {
    if (habits.length >= MAX_HABITS) return;
    setShowAddForm(false); // 二重送信防止: フォームを先に閉じる
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      icon,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveHabits(updated);
    setShowAddForm(false);
  }

  function handleDeleteHabit(habitId: string) {
    const updatedHabits = habits.filter((h) => h.id !== habitId);
    const updatedLogs = logs.filter((l) => l.habitId !== habitId);
    setHabits(updatedHabits);
    setLogs(updatedLogs);
    saveHabits(updatedHabits);
    saveLogs(updatedLogs);
  }

  const handleCloseToast = useCallback(() => setToast(null), []);

  function handleToggle(habitId: string) {
    const today = getToday();
    const alreadyDone = isCompletedToday(habitId, logs);

    let updatedLogs: HabitLog[];
    if (alreadyDone) {
      updatedLogs = logs.filter(
        (l) => !(l.habitId === habitId && l.date === today)
      );
    } else {
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date: today,
        completedAt: new Date().toISOString(),
      };
      updatedLogs = [...logs, newLog];

      // トースト表示
      const nowCompletedCount = habits.filter((h) =>
        isCompletedToday(h.id, updatedLogs)
      ).length;
      if (nowCompletedCount === habits.length) {
        setToast({ message: '🎉 全部完了！今日もよくできました！', isSpecial: true });
      } else {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          setToast({ message: `${habit.icon} ${habit.name} 完了！`, isSpecial: false });
        }
      }
    }
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  }

  async function handleGenerateReport() {
    if (habits.length === 0) return;
    setLoadingReport(true);
    setReportError('');

    const days = getPast7Days();
    const habitStats = habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      completedDays: days.filter((day) =>
        logs.some((l) => l.habitId === habit.id && l.date === day)
      ).length,
    }));

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: habitStats }),
      });

      if (!res.ok) throw new Error('レポート生成に失敗しました');

      const data = await res.json();
      const weekStart = days[0];
      const weekEnd = days[6];

      const newReport: WeeklyReportData = {
        generatedAt: new Date().toISOString(),
        content: data.report,
        weekStart,
        weekEnd,
      };
      setReport(newReport);
      saveWeeklyReport(newReport);
    } catch {
      setReportError('レポートの生成に失敗しました。APIキーを確認してください。');
    } finally {
      setLoadingReport(false);
    }
  }

  const today = new Date().toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const completedToday = habits.filter((h) =>
    isCompletedToday(h.id, logs)
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          isSpecial={toast.isSpecial}
          onClose={handleCloseToast}
        />
      )}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">⚡ QuickHabit</h1>
          <p data-testid="today-date" className="text-sm text-gray-500 mt-1">
            {today}
          </p>
        </header>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div
            data-testid="progress-section"
            className="bg-white rounded-xl border border-gray-200 p-4 mb-4"
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>今日の達成</span>
              <span data-testid="progress-count">
                {completedToday} / {habits.length}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                data-testid="progress-bar"
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{
                  width:
                    habits.length > 0
                      ? `${(completedToday / habits.length) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <AddHabitForm
            onAdd={handleAddHabit}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Add button */}
        {!showAddForm && habits.length < MAX_HABITS && (
          <button
            data-testid="show-add-form"
            onClick={() => setShowAddForm(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors mb-4 text-sm font-medium"
          >
            + 習慣を追加する
          </button>
        )}

        {/* Habit list */}
        {habits.length === 0 && !showAddForm ? (
          <div
            data-testid="empty-state"
            className="text-center py-12 text-gray-400"
          >
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">まだ習慣がありません</p>
            <p className="text-sm mt-1">上のボタンから最初の習慣を追加しましょう</p>
          </div>
        ) : (
          <div
            data-testid="habit-list"
            className="flex flex-col gap-3 mb-6"
          >
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={logs}
                onToggle={handleToggle}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}

        {/* Weekly Summary */}
        {habits.length > 0 && (
          <WeeklySummary habits={habits} logs={logs} />
        )}

        {/* AI Report section */}
        {habits.length > 0 && (
          <div className="mt-2">
            <button
              data-testid="generate-report-btn"
              onClick={handleGenerateReport}
              disabled={loadingReport}
              className="w-full bg-purple-500 text-white rounded-xl py-3 font-semibold hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loadingReport ? '🔄 AIが分析中...' : '🤖 AIレポートを生成する'}
            </button>

            {reportError && (
              <p
                data-testid="report-error"
                className="text-red-500 text-xs mt-2 text-center"
              >
                {reportError}
              </p>
            )}

            {report && <WeeklyReport report={report} />}
          </div>
        )}
      </div>
    </main>
  );
}
