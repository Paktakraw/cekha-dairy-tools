-- Feature: ตัวฉันวันนี้ / Daily Vibe Check (docs/features/mood.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

-- แท็กต้องไม่ซ้ำกัน (CHECK ใช้ subquery ตรง ๆ ไม่ได้ จึงห่อด้วยฟังก์ชัน immutable)
create or replace function public.mood_tags_unique(tags text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select cardinality(tags) = cardinality(array(select distinct t from unnest(tags) as t));
$$;

-- เช็กอินอารมณ์รายวัน (วันละ 1 รายการต่อผู้ใช้) mood: 1 = ดิ่ง ... 5 = ปังสุด
create table public.mood_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_date date not null,
  mood       smallint not null check (mood between 1 and 5),
  tags       text[] not null default '{}'
    check (
      tags <@ array['study', 'money', 'friends', 'love', 'family', 'health', 'food', 'music', 'watch', 'workout', 'shopping']::text[]
      and public.mood_tags_unique(tags)
    ),
  note       text check (char_length(note) between 1 and 100),
  -- เผื่อ timezone: เซิร์ฟเวอร์เป็น UTC แต่ผู้ใช้อยู่ UTC+7 (ฝั่ง client ตรวจวันอนาคตแบบเข้มงวดอีกชั้น)
  constraint mood_entries_not_future check (entry_date <= current_date + 1),
  constraint mood_entries_user_date_unique unique (user_id, entry_date)
);

create index mood_entries_user_id_idx on public.mood_entries (user_id);

create trigger mood_entries_set_updated_at
  before update on public.mood_entries
  for each row execute function public.set_updated_at();

alter table public.mood_entries enable row level security;

create policy "mood_entries_select_own" on public.mood_entries
  for select to authenticated using (auth.uid() = user_id);
create policy "mood_entries_insert_own" on public.mood_entries
  for insert to authenticated with check (auth.uid() = user_id);
create policy "mood_entries_update_own" on public.mood_entries
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mood_entries_delete_own" on public.mood_entries
  for delete to authenticated using (auth.uid() = user_id);
