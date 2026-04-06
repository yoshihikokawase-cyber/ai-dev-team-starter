'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { Habit, HabitLog, WeeklyReportData } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
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
import type { CoachTone } from '@/components/HomeTab';
import StatsTab from '@/components/StatsTab';
import CoachTab from '@/components/CoachTab';
import SettingsTab from '@/components/SettingsTab';
import AuthForm from '@/components/AuthForm';
import { useNotification } from '@/hooks/useNotification';

const MAX_HABITS = 10;
const COACH_TONE_KEY = 'taphabit_coach_tone';

// ─── Supabase 行型 → アプリ型 変換 ──────────────────────────────────

type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
};
type LogRow = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed_at: string;
};

function toHabit(row: HabitRow): Habit {
  return { id: row.id, name: row.name, icon: row.icon, createdAt: row.created_at };
}
function toLog(row: LogRow): HabitLog {
  return { id: row.id, habitId: row.habit_id, date: row.date, completedAt: row.completed_at };
}

// ────────────────────────────────────────────────────────────────────

export default function AppPage() {
  const supabase = useMemo(() => createClient(), []);

  // ── Auth ──────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── タブ ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // ── データ ───────────────────────────────────────────────────────
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dbError, setDbError] = useState('');

  // ── UI 状態 ──────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [toast, setToast] = useState<{ message: string; isSpecial: boolean } | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // ── 応援スタイル（localStorage 永続化） ──────────────────────────
  const [coachTone, setCoachTone] = useState<CoachTone>(() => {
    if (typeof window === 'undefined') return 'soft';
    return (localStorage.getItem(COACH_TONE_KEY) as CoachTone) || 'soft';
  });

  function handleCoachToneChange(tone: CoachTone) {
    setCoachTone(tone);
    localStorage.setItem(COACH_TONE_KEY, tone);
  }

  // ── 通知設定 ──────────────────────────────────────────────────────
  const {
    permission: notifPermission,
    settings: notifSettings,
    saving: notifSaving,
    saveMsg: notifSaveMsg,
    pushStatus,
    requestPermission,
    sendTestNotification,
    saveSettings: saveNotifSettings,
  } = useNotification(supabase, user?.id);

  // ── 認証状態の監視 ───────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // ── ログイン後にデータロード ─────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      return;
    }
    loadData();
    setReport(getWeeklyReport());
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setDataLoading(true);
    setDbError('');
    try {
      const [{ data: habitRows, error: hErr }, { data: logRows, error: lErr }] =
        await Promise.all([
          supabase.from('habits').select('*').order('created_at'),
          supabase.from('habit_logs').select('*').order('date'),
        ]);
      if (hErr) throw hErr;
      if (lErr) throw lErr;
      setHabits((habitRows ?? []).map(toHabit));
      setLogs((logRows ?? []).map(toLog));
    } catch {
      setDbError('データの読み込みに失敗しました。再読み込みしてください。');
    } finally {
      setDataLoading(false);
    }
  }

  // ── 習慣の追加 ────────────────────────────────────────────────────
  async function handleAddHabit(name: string, icon: string) {
    if (!user || habits.length >= MAX_HABITS) return;
    setShowAddForm(false);
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, icon, user_id: user.id })
      .select()
      .single();
    if (error) {
      setToast({ message: '習慣の追加に失敗しました', isSpecial: false });
      return;
    }
    setHabits((prev) => [...prev, toHabit(data as HabitRow)]);
  }

  // ── 習慣の削除（habit_logs は FK cascade で自動削除） ────────────
  async function handleDeleteHabit(habitId: string) {
    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    if (error) {
      setToast({ message: '削除に失敗しました', isSpecial: false });
      return;
    }
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
  }

  const handleCloseToast = useCallback(() => setToast(null), []);

  // ── 習慣の完了トグル ──────────────────────────────────────────────
  async function handleToggle(habitId: string) {
    if (!user) return;
    const today = getToday();
    const alreadyDone = isCompletedToday(habitId, logs);

    if (alreadyDone) {
      // 取り消し
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', today);
      if (error) {
        setToast({ message: '記録の取り消しに失敗しました', isSpecial: false });
        return;
      }
      setLogs((prev) => prev.filter((l) => !(l.habitId === habitId && l.date === today)));
    } else {
      // 完了記録
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, date: today })
        .select()
        .single();
      if (error) {
        setToast({ message: '記録の保存に失敗しました', isSpecial: false });
        return;
      }
      const updatedLogs = [...logs, toLog(data as LogRow)];
      setLogs(updatedLogs);

      // 全完了チェック
      const nowCompleted = habits.filter((h) => isCompletedToday(h.id, updatedLogs)).length;
      if (nowCompleted === habits.length) {
        setToast({ message: '🎉 全部完了！今日もよくできました！', isSpecial: true });
      } else {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          setToast({ message: `${habit.icon} ${habit.name} 完了！ +10 XP`, isSpecial: false });
        }
      }
    }
  }

  // ── AIレポート生成 ────────────────────────────────────────────────
  async function handleGenerateReport() {
    if (habits.length === 0) return;
    const today = getToday();
    if (report?.generatedAt && report.generatedAt.startsWith(today)) return;

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

  // ── サインアウト ─────────────────────────────────────────────────
  async function handleSignOut() {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setHabits([]);
    setLogs([]);
    setReport(null);
    setSignOutLoading(false);
  }

  // ── 派生値 ───────────────────────────────────────────────────────
  const completedToday = habits.filter((h) => isCompletedToday(h.id, logs)).length;
  const overallStreak = getOverallStreak(logs);
  const { level, xpInLevel, xpForNext } = getLevelProgress(logs);
  const monthlyRate = getMonthlyRate(logs, habits);

  // ── 認証ローディング ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">読み込み中...</p>
      </div>
    );
  }

  // ── 未ログイン → 認証フォーム ────────────────────────────────────
  if (!user) {
    return <AuthForm supabase={supabase} />;
  }

  // ── メインアプリ ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* トースト通知 */}
      {toast && (
        <Toast message={toast.message} isSpecial={toast.isSpecial} onClose={handleCloseToast} />
      )}

      {/* DB エラーバナー */}
      {dbError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-center gap-3">
          <p className="text-xs text-red-600">{dbError}</p>
          <button
            onClick={loadData}
            className="text-xs font-semibold text-red-500 underline hover:text-red-700 transition-colors"
          >
            再試行
          </button>
        </div>
      )}

      {/* タブコンテンツ（データロード中は薄く）*/}
      <div className={`pb-20 transition-opacity duration-200 ${dataLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
            coachTone={coachTone}
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
            onGoHome={() => setActiveTab('home')}
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
            onGoHome={() => setActiveTab('home')}
            onShowAddForm={() => setShowAddForm(true)}
            onCancelAddForm={() => setShowAddForm(false)}
            onSignOut={handleSignOut}
            signOutLoading={signOutLoading}
            userEmail={user.email}
            notifPermission={notifPermission}
            notifSettings={notifSettings}
            notifSaving={notifSaving}
            notifSaveMsg={notifSaveMsg}
            pushStatus={pushStatus}
            onRequestPermission={requestPermission}
            onTestNotification={sendTestNotification}
            onSendPushTest={() => { console.log('[page] onSendPushTest callback fired'); }}
            onSaveNotifSettings={saveNotifSettings}
            coachTone={coachTone}
            onCoachToneChange={handleCoachToneChange}
          />
        )}
      </div>

      {/* ボトムナビゲーション */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
