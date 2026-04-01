# Supabase セットアップガイド

## 1. Supabase プロジェクト作成

1. https://supabase.com/dashboard にアクセス
2. "New project" を作成
3. プロジェクト名・パスワード・リージョン（Northeast Asia / Tokyo 推奨）を設定

---

## 2. テーブル作成（初回のみ）

Supabase ダッシュボード → **SQL Editor** で `supabase/schema.sql` の内容を貼り付けて実行。

```
supabase/schema.sql
```

作成されるテーブル:
- `habits` — ユーザーごとの習慣定義
- `habit_logs` — 習慣の完了記録（日次）

RLS（Row Level Security）が有効化され、ユーザーは自分のデータのみ操作可能。

---

## 3. 環境変数

### ローカル開発 (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=your-anthropic-key
```

**値の確認場所:** Supabase ダッシュボード → プロジェクト → Settings → API

### Vercel 本番環境

Vercel ダッシュボード → プロジェクト → **Settings → Environment Variables** に以下を追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL | Production / Preview / Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon public key | Production / Preview / Development |
| `ANTHROPIC_API_KEY` | Anthropic API キー | Production / Preview / Development |

---

## 4. Supabase Authentication 設定

Supabase ダッシュボード → **Authentication → Providers → Email**

| 設定 | 推奨値 | 説明 |
|------|--------|------|
| Enable Email provider | ON | メール認証を有効化 |
| Confirm email | OFF（開発中） / ON（本番） | OFF にするとサインアップ直後にログイン可能 |

### Vercel の Redirect URL 設定（本番）

Authentication → URL Configuration → **Redirect URLs** に追加:

```
https://your-vercel-app.vercel.app/**
```

---

## 5. デプロイ後の確認チェックリスト

- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] `ANTHROPIC_API_KEY` が設定されている
- [ ] `supabase/schema.sql` を SQL Editor で実行済み
- [ ] Supabase Authentication でメール認証が有効
- [ ] Vercel の Redirect URL に本番 URL を追加済み
- [ ] サインアップ → ログイン → 習慣追加 → ログアウト の動線を確認
