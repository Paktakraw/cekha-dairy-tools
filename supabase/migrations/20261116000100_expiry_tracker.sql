-- Feature: Expiry & Maintenance Tracker (docs/features/expiry-tracker.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

-- รายการที่ต้องจำ (เอกสารหมดอายุ ซ่อมบำรุง ค่าสมาชิก ฯลฯ)
create table public.reminder_items (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  category           text not null check (category in ('document', 'vehicle', 'home', 'subscription', 'other')),
  name               text not null check (length(btrim(name)) > 0 and char_length(name) <= 100),
  due_date           date not null,
  -- รอบทำซ้ำ: ต้องมีทั้งคู่หรือไม่มีเลย
  repeat_every       int check (repeat_every > 0 and repeat_every <= 1000),
  repeat_unit        text check (repeat_unit in ('day', 'month', 'year')),
  -- จำนวนวันที่เตือนล่วงหน้า (หลายระดับ) ค่าแต่ละตัว 0-730
  remind_before_days int[] not null default '{}'
    check (
      cardinality(remind_before_days) <= 10
      and array_position(remind_before_days, null) is null
      and 0 <= all (remind_before_days)
      and 730 >= all (remind_before_days)
    ),
  cost               numeric(12, 2) check (cost >= 0 and cost <= 100000000),
  provider_name      text check (char_length(provider_name) <= 100),
  provider_phone     text check (char_length(provider_phone) <= 30),
  note               text check (char_length(note) <= 500),
  -- ตามระยะทาง/การใช้งาน: กรอกครบชุดหรือไม่กรอกเลย
  usage_unit         text check (length(btrim(usage_unit)) > 0 and char_length(usage_unit) <= 20),
  usage_interval     numeric(10, 1) check (usage_interval > 0),
  usage_last_done    numeric(10, 1) check (usage_last_done >= 0),
  usage_current      numeric(10, 1) check (usage_current >= 0),
  -- NULL = ใช้งานอยู่, มีค่า = เก็บถาวร
  archived_at        timestamptz,
  constraint reminder_items_repeat_pair check ((repeat_every is null) = (repeat_unit is null)),
  constraint reminder_items_usage_set check (
    (usage_unit is null and usage_interval is null and usage_last_done is null and usage_current is null)
    or (usage_unit is not null and usage_interval is not null and usage_last_done is not null and usage_current is not null)
  )
);

create index reminder_items_user_id_idx on public.reminder_items (user_id);
create index reminder_items_user_due_idx on public.reminder_items (user_id, due_date);

-- ประวัติการทำ: เก็บสำเนาชื่อ ณ ตอนทำ ลบรายการ = ลบประวัติ
create table public.reminder_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  item_id        uuid not null references public.reminder_items(id) on delete cascade,
  item_name      text not null check (length(btrim(item_name)) > 0 and char_length(item_name) <= 100),
  done_on        date not null,
  cost           numeric(12, 2) check (cost >= 0 and cost <= 100000000),
  provider_name  text check (char_length(provider_name) <= 100),
  provider_phone text check (char_length(provider_phone) <= 30),
  note           text check (char_length(note) <= 500),
  usage_value    numeric(10, 1) check (usage_value >= 0)
);

create index reminder_logs_user_id_idx on public.reminder_logs (user_id);
create index reminder_logs_item_done_idx on public.reminder_logs (item_id, done_on desc);

create trigger reminder_items_set_updated_at
  before update on public.reminder_items
  for each row execute function public.set_updated_at();

create trigger reminder_logs_set_updated_at
  before update on public.reminder_logs
  for each row execute function public.set_updated_at();

alter table public.reminder_items enable row level security;
alter table public.reminder_logs enable row level security;

create policy "reminder_items_select_own" on public.reminder_items
  for select to authenticated using (auth.uid() = user_id);
create policy "reminder_items_insert_own" on public.reminder_items
  for insert to authenticated with check (auth.uid() = user_id);
create policy "reminder_items_update_own" on public.reminder_items
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminder_items_delete_own" on public.reminder_items
  for delete to authenticated using (auth.uid() = user_id);

create policy "reminder_logs_select_own" on public.reminder_logs
  for select to authenticated using (auth.uid() = user_id);
create policy "reminder_logs_insert_own" on public.reminder_logs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "reminder_logs_update_own" on public.reminder_logs
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminder_logs_delete_own" on public.reminder_logs
  for delete to authenticated using (auth.uid() = user_id);

-- บันทึก "ทำแล้ว": เพิ่มประวัติ + (เลื่อนวันครบกำหนด หรือเก็บถาวร) ในธุรกรรมเดียว
-- - security invoker: ทำงานภายใต้ RLS ของผู้ใช้เอง จึงแตะได้เฉพาะรายการของตัวเอง
-- - p_next_due null + p_archive true = เก็บถาวร; p_next_due มีค่า = เลื่อนวันครบกำหนด
create or replace function public.complete_reminder(
  p_item_id        uuid,
  p_done_on        date,
  p_cost           numeric,
  p_provider_name  text,
  p_provider_phone text,
  p_note           text,
  p_usage_value    numeric,
  p_next_due       date,
  p_archive        boolean
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_name text;
begin
  select name into v_name from public.reminder_items where id = p_item_id for update;
  if not found then
    raise exception 'reminder item not found' using errcode = 'P0002';
  end if;

  if not p_archive and p_next_due is null then
    raise exception 'next due date required unless archiving' using errcode = '22023';
  end if;

  insert into public.reminder_logs (item_id, item_name, done_on, cost, provider_name, provider_phone, note, usage_value)
  values (p_item_id, v_name, p_done_on, p_cost, p_provider_name, p_provider_phone, p_note, p_usage_value);

  update public.reminder_items
  set due_date        = case when p_archive then due_date else p_next_due end,
      archived_at     = case when p_archive then now() else null end,
      usage_last_done = case when usage_unit is not null and p_usage_value is not null then p_usage_value else usage_last_done end,
      usage_current   = case when usage_unit is not null and p_usage_value is not null then p_usage_value else usage_current end
  where id = p_item_id;
end;
$$;

revoke execute on function public.complete_reminder(uuid, date, numeric, text, text, text, numeric, date, boolean) from public, anon;
grant execute on function public.complete_reminder(uuid, date, numeric, text, text, text, numeric, date, boolean) to authenticated;
