-- Feature: Randomizer (docs/features/randomizer.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

create table public.random_groups (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null check (length(btrim(name)) > 0 and char_length(name) <= 50)
);

create table public.random_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  group_id    uuid not null references public.random_groups(id) on delete cascade,
  label       text not null check (length(btrim(label)) > 0 and char_length(label) <= 100)
);

-- ชื่อกลุ่มห้ามซ้ำต่อผู้ใช้ (ไม่สนตัวพิมพ์ใหญ่/เล็ก และช่องว่างหัวท้าย)
create unique index random_groups_user_name_unique
  on public.random_groups (user_id, lower(btrim(name)));

create index random_groups_user_id_idx on public.random_groups (user_id);
create index random_items_user_id_idx on public.random_items (user_id);
create index random_items_group_id_idx on public.random_items (group_id);

create trigger random_groups_set_updated_at
  before update on public.random_groups
  for each row execute function public.set_updated_at();

create trigger random_items_set_updated_at
  before update on public.random_items
  for each row execute function public.set_updated_at();

alter table public.random_groups enable row level security;
alter table public.random_items enable row level security;

create policy "random_groups_select_own" on public.random_groups
  for select to authenticated using (auth.uid() = user_id);
create policy "random_groups_insert_own" on public.random_groups
  for insert to authenticated with check (auth.uid() = user_id);
create policy "random_groups_update_own" on public.random_groups
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "random_groups_delete_own" on public.random_groups
  for delete to authenticated using (auth.uid() = user_id);

create policy "random_items_select_own" on public.random_items
  for select to authenticated using (auth.uid() = user_id);
create policy "random_items_insert_own" on public.random_items
  for insert to authenticated with check (auth.uid() = user_id);
create policy "random_items_update_own" on public.random_items
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "random_items_delete_own" on public.random_items
  for delete to authenticated using (auth.uid() = user_id);
