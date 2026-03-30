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
  getOverallStreak,
  getLevelProgress,
  getMonthlyRate,
} from '@/lib/storage';
import Toast from '@/components/Toast';
import BottomNav, { TabId } from '@/components/BottomNav';
import HomeTab from '@/components/HomeTab';
import StatsTab from '@/components/StatsTab';
import CoachTab from '@/components/CoachTab';
import SettingsTab from '@/components/SettingsTab';

const MAX_HABITS = 10;

export default function Home() {
  // ── タブ状態 ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // ── データ状態 ────────────────────────────────────────────────
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [toast, setToast] = useState<{ message: string; isSpecial: boolean } | null>(null);

  // ── 初期ロード ────────────────────────────────────────────────
  useEffect(() => {
    setHabits(getHabits());
    setLogs(getLogs());
    setReport(getWeeklyReport());
  }, []);

  // ── 習慣の追加 ────────────────────────────────────────────────
  function handleAddHabit(name: string, icon: string) {
    if (habits.length >= MAX_HABITS) return;
    setShowAddForm(false); // 二重送信防止：先に閉じる
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      icon,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveHabits(updated);
  }

  // ── 習慣の削除 ────────────────────────────────────────────────
  function handleDeleteHabit(habitId: string) {
    const updatedHabits = habits.filter((h) => h.id !== habitId);
    const updatedLogs = logs.filter((l) => l.habitId !== habitId);
    setHabits(updatedHabits);
    setLogs(updatedLogs);
    saveHabits(updatedHabits);
    saveLogs(updatedLogs);
  }

  const handleCloseToast = useCallback(() => setToast(null), []);

  // ── 習慣の完了トグル ──────────────────────────────────────────
  function handleToggle(habitId: string) {
    const today = getToday();
    const alreadyDone = isCompletedToday(habitId, logs);

    let updatedLogs: HabitLog[];

    if (alreadyDone) {
      // 取り消し
      updatedLogs = logs.filter(
        (l) => !(l.habitId === habitId && l.date === today)
      );
    } else {
      // 完了記録
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date: today,
        completedAt: new Date().toISOString(),
      };
      updatedLogs = [...logs, newLog];

      // 全完了かどうかでトーストを分岐
      const nowCompletedCount = habits.filter((h) =>
        isCompletedToday(h.id, updatedLogs)
      ).length;

      if (nowCompletedCount === habits.length) {
        setToast({ message: '🎉 全部完了！今日もよくできました！', isSpecial: true });
      } else {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          setToast({
            message: `${habit.icon} ${habit.name} 完了！ +10 XP`,
            isSpecial: false,
          });
        }
      }
    }

    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  }

  // ── AIレポート生成 ────────────────────────────────────────────
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
      const newReport: WeeklyReportData = {
        generatedAt: new Date().toISOString(),
        content: data.report,
        weekStart: days[0],
        weekEnd: days[6],
      };
      setReport(newReport);
      saveWeeklyReport(newReport);
    } catch {
      setReportError('レポートの生成に失敗しました。APIキーを確認してください。');
    } finally {
      setLoadingReport(false);
    }
  }

  // ── 派生値（全タブで共有） ────────────────────────────────────
  const completedToday = habits.filter((h) => isCompletedToday(h.id, logs)).length;
  const overallStreak = getOverallStreak(logs);
  const { level, xpInLevel, xpForNext } = getLevelProgress(logs);
  const monthlyRate = getMonthlyRate(logs, habits);

  // ── レンダリング ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* トースト通知 */}
      {toast && (
        <Toast
          message={toast.message}
          isSpecial={toast.isSpecial}
          onClose={handleCloseToast}
        />
      )}

      {/* タブコンテンツ（ボトムナビ分の余白 pb-20） */}
      <div className="pb-20">
        {activeTab === 'home' && (
          <HomeTab
            habits={habits}
            logs={logs}
            level={level}
            xpInLevel={xpInLevel}
            xpForNext={xpForNext}
            overallStreak={overallStreak}
            completedToday={completedToday}
            report={report}
            loadingReport={loadingReport}
            reportError={reportError}
            showAddForm={showAddForm}
            canAddMore={habits.length < MAX_HABITS}
            onToggle={handleToggle}
            onDelete={handleDeleteHabit}
            onAddHabit={handleAddHabit}
            onShowAddForm={() => setShowAddForm(true)}
            onCancelAddForm={() => setShowAddForm(false)}
            onGenerateReport={handleGenerateReport}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            habits={habits}
            logs={logs}
            level={level}
            xpInLevel={xpInLevel}
            xpForNext={xpForNext}
            overallStreak={overallStreak}
            monthlyRate={monthlyRate}
          />
        )}

        {activeTab === 'coach' && (
          <CoachTab
            habits={habits}
            logs={logs}
            report={report}
            loadingReport={loadingReport}
            reportError={reportError}
            onGenerateReport={handleGenerateReport}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            habits={habits}
            logs={logs}
            showAddForm={showAddForm}
            canAddMore={habits.length < MAX_HABITS}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            onShowAddForm={() => setShowAddForm(true)}
            onCancelAddForm={() => setShowAddForm(false)}
          />
        )}
      </div>

      {/* ボトムナビゲーション */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
