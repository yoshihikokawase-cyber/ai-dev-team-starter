'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

interface Props {
  supabase: SupabaseClient;
}

/** Supabase の英語エラーを日本語に変換 */
function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials'))
    return 'メールアドレスまたはパスワードが正しくありません';
  if (msg.includes('Email not confirmed'))
    return 'メールが未確認です。確認メールをご確認ください';
  if (msg.includes('User already registered') || msg.includes('already been registered'))
    return 'このメールアドレスはすでに登録されています';
  if (msg.includes('Password should be at least'))
    return 'パスワードは6文字以上で設定してください';
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'しばらく時間をおいてから再試行してください';
  if (msg.includes('Unable to validate email address'))
    return '有効なメールアドレスを入力してください';
  return 'エラーが発生しました。もう一度お試しください';
}

export default function AuthForm({ supabase }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(translateError(error.message));
      } else {
        // メール確認が有効な場合はメッセージ表示
        // 無効な場合は onAuthStateChange が SIGNED_IN を発火してアプリに遷移する
        setMessage('確認メールを送信しました。メールをご確認ください。');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateError(error.message));
      }
    }

    setLoading(false);
  }

  function switchMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setMessage('');
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* ロゴ */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">⚡ TapHabit</h1>
          <p className="text-sm text-gray-400 mt-1">毎日の習慣を1タップで記録</p>
        </div>

        {/* フォームカード */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
            />
            <input
              type="password"
              placeholder="パスワード（6文字以上）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
            />

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            {message && (
              <p className="text-xs text-emerald-600 text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-indigo-600 disabled:opacity-60 transition-colors mt-1"
            >
              {loading
                ? '処理中...'
                : mode === 'signin'
                ? 'ログイン'
                : 'アカウントを作成'}
            </button>
          </form>

          <button
            onClick={switchMode}
            className="w-full text-xs text-indigo-500 hover:text-indigo-700 mt-4 transition-colors"
          >
            {mode === 'signin'
              ? 'アカウントをお持ちでない方はこちら'
              : 'すでにアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
}
