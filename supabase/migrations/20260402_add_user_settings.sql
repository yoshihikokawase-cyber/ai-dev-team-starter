-- Day20: 通知設定テーブル追加
-- Supabase SQL Editor で実行してください

create table if not exists public.user_settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  notifications_enabled boolean not null default false,
  notification_time    text,                      -- 例: "21:00"
  updated_at           timestamptz not null default now()
);

-- RLS 有効化
alter table public.user_settings enable row level security;

-- 自分のレコードのみ参照・操作可能
create policy "user_settings: own data only"
  on public.user_settings
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
