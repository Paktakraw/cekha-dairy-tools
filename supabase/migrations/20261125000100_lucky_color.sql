-- Feature: สีที่ใช่ / Personalized Daily Lucky Color (docs/features/lucky-color.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

-- วันเกิดของผู้ใช้ (1 แถวต่อผู้ใช้ บันทึกแบบ upsert)
create table public.lucky_color_profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  birth_day  text not null
    check (birth_day in ('sun', 'mon', 'tue', 'wed_day', 'wed_night', 'thu', 'fri', 'sat'))
);

-- unique (user_id) สร้าง index บน user_id ให้แล้ว

create trigger lucky_color_profiles_set_updated_at
  before update on public.lucky_color_profiles
  for each row execute function public.set_updated_at();

alter table public.lucky_color_profiles enable row level security;

create policy "lucky_color_profiles_select_own" on public.lucky_color_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "lucky_color_profiles_insert_own" on public.lucky_color_profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "lucky_color_profiles_update_own" on public.lucky_color_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lucky_color_profiles_delete_own" on public.lucky_color_profiles
  for delete to authenticated using (auth.uid() = user_id);
