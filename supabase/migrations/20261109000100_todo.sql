-- Feature: To-do List (docs/features/todo.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  title       text not null check (length(btrim(title)) > 0),
  description text,
  status      text not null default 'pending' check (status in ('pending', 'completed'))
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_user_id_created_at_idx on public.tasks (user_id, created_at);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select to authenticated using (auth.uid() = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert to authenticated with check (auth.uid() = user_id);

create policy "tasks_update_own" on public.tasks
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete to authenticated using (auth.uid() = user_id);
