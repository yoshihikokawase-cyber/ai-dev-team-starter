-- QuickHabit — Supabase スキーマ定義
-- Supabase ダッシュボードの SQL Editor で実行してください

-- ─── habits テーブル ────────────────────────────────────────────────
create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  icon        text not null default '💪',
  created_at  timestamptz default now() not null
);

-- ─── habit_logs テーブル ────────────────────────────────────────────
create table if not exists habit_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  habit_id     uuid references habits(id) on delete cascade not null,
  date         date not null,
  completed_at timestamptz default now() not null,
  unique (habit_id, date)   -- 同一習慣・同一日の重複を防ぐ
);

-- ─── インデックス ────────────────────────────────────────────────────
create index if not exists habits_user_id_idx     on habits     (user_id);
create index if not exists habit_logs_user_id_idx on habit_logs (user_id);
create index if not exists habit_logs_habit_id_idx on habit_logs (habit_id);
create index if not exists habit_logs_date_idx    on habit_logs (date);

-- ─── RLS（Row Level Security） ──────────────────────────────────────
alter table habits     enable row level security;
alter table habit_logs enable row level security;

-- habits: 自分のデータのみ全操作可能
create policy "habits: own data only"
  on habits for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- habit_logs: 自分のデータのみ全操作可能
create policy "habit_logs: own data only"
  on habit_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
