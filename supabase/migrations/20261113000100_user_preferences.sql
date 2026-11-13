-- Feature: Theme (docs/features/theme.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

-- การตั้งค่าส่วนตัวของผู้ใช้: 1 แถวต่อผู้ใช้ (ตอนนี้มีแค่ธีม เพิ่มคอลัมน์อื่นได้ภายหลัง)
create table public.user_preferences (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  theme      text not null default 'light' check (theme in ('light', 'dark')),
  -- unique constraint สร้าง index บน user_id ให้อยู่แล้ว
  constraint user_preferences_user_unique unique (user_id)
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own" on public.user_preferences
  for select to authenticated using (auth.uid() = user_id);
create policy "user_preferences_insert_own" on public.user_preferences
  for insert to authenticated with check (auth.uid() = user_id);
create policy "user_preferences_update_own" on public.user_preferences
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_preferences_delete_own" on public.user_preferences
  for delete to authenticated using (auth.uid() = user_id);
