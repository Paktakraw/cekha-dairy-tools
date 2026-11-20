-- Feature: ตัวฉันวันนี้ — แท็กที่ผู้ใช้ตั้งค่าเองได้ (docs/features/mood.md หัวข้อ 6)
-- ต้องรัน 20261119000100_mood.sql ก่อน (ไฟล์นี้แปลงข้อมูลเดิมที่ใช้แท็กแบบ id คงที่ให้ด้วย)

-- 1) เลิกบังคับว่าแท็กต้องอยู่ในชุดคงที่ (ตอนนี้ tags เก็บ id ของ mood_tags เป็นข้อความ)
alter table public.mood_entries drop constraint mood_entries_tags_check;

-- 2) ตารางแท็กของผู้ใช้
create table public.mood_tags (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  group_kind text not null check (group_kind in ('story', 'activity')),
  name       text not null check (length(btrim(name)) > 0 and char_length(name) <= 20),
  -- ตั้งอัตโนมัติโดย trigger = ลำดับถัดไปในกลุ่ม (ใช้เรียงแสดงผล)
  sort_order integer not null default 0
);

create unique index mood_tags_user_group_name_unique on public.mood_tags (user_id, group_kind, lower(btrim(name)));
create index mood_tags_user_id_idx on public.mood_tags (user_id);

create trigger mood_tags_set_updated_at
  before update on public.mood_tags
  for each row execute function public.set_updated_at();

-- จำกัด 30 แท็กต่อผู้ใช้ และตั้ง sort_order (security invoker: นับเฉพาะของผู้ใช้เองภายใต้ RLS)
create or replace function public.mood_tags_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.mood_tags where user_id = new.user_id) >= 30 then
    raise exception 'mood_tags_limit: ครบ 30 แท็กแล้ว' using errcode = '23514';
  end if;
  new.sort_order := coalesce(
    (select max(sort_order) from public.mood_tags where user_id = new.user_id and group_kind = new.group_kind), 0
  ) + 1;
  return new;
end;
$$;

create trigger mood_tags_before_insert
  before insert on public.mood_tags
  for each row execute function public.mood_tags_before_insert();

alter table public.mood_tags enable row level security;

create policy "mood_tags_select_own" on public.mood_tags
  for select to authenticated using (auth.uid() = user_id);
create policy "mood_tags_insert_own" on public.mood_tags
  for insert to authenticated with check (auth.uid() = user_id);
create policy "mood_tags_update_own" on public.mood_tags
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mood_tags_delete_own" on public.mood_tags
  for delete to authenticated using (auth.uid() = user_id);

-- 3) แปลงข้อมูลเดิม: ผู้ใช้ที่มีรายการเช็กอินอยู่แล้วได้แท็กเริ่มต้น 11 อัน แล้วแทน id คงที่เดิม (legacy) ด้วย id ใหม่
-- (ใช้ CTE แทนตารางชั่วคราว เพราะ SQL Editor อาจไม่รันทั้งไฟล์ในธุรกรรมเดียว)
insert into public.mood_tags (user_id, group_kind, name)
select u.user_id, d.group_kind, d.name
from (select distinct user_id from public.mood_entries) u
cross join (values
  ('story', 'การเรียน/สอบ', 1), ('story', 'การเงิน', 2), ('story', 'เพื่อน', 3),
  ('story', 'ความรัก', 4), ('story', 'ครอบครัว', 5), ('story', 'สุขภาพ/การนอน', 6),
  ('activity', 'กินของอร่อย', 1), ('activity', 'ฟังเพลง', 2), ('activity', 'ดูหนัง/ซีรีส์', 3),
  ('activity', 'ออกกำลังกาย', 4), ('activity', 'ช้อปปิ้ง', 5)
) as d(group_kind, name, ord)
order by u.user_id, d.group_kind desc, d.ord
on conflict do nothing;

update public.mood_entries e
set tags = coalesce((
  select array_agg(t.id::text order by t.group_kind desc, t.sort_order)
  from unnest(e.tags) as legacy_id
  join (values
    ('study', 'story', 'การเรียน/สอบ'), ('money', 'story', 'การเงิน'), ('friends', 'story', 'เพื่อน'),
    ('love', 'story', 'ความรัก'), ('family', 'story', 'ครอบครัว'), ('health', 'story', 'สุขภาพ/การนอน'),
    ('food', 'activity', 'กินของอร่อย'), ('music', 'activity', 'ฟังเพลง'), ('watch', 'activity', 'ดูหนัง/ซีรีส์'),
    ('workout', 'activity', 'ออกกำลังกาย'), ('shopping', 'activity', 'ช้อปปิ้ง')
  ) as d(legacy, group_kind, name) on d.legacy = legacy_id
  join public.mood_tags t on t.user_id = e.user_id and t.group_kind = d.group_kind and t.name = d.name
), '{}')
where cardinality(e.tags) > 0;

-- 4) กฎใหม่ของ mood_entries.tags: ไม่ซ้ำ และไม่เกิน 30
alter table public.mood_entries
  add constraint mood_entries_tags_check check (public.mood_tags_unique(tags) and cardinality(tags) <= 30);

-- ทุก id ต้องเป็นแท็กของผู้ใช้เองที่ยังมีอยู่ ข้ามเมื่อถูกเรียกจาก trigger อื่น (เช่น ตอนลบแท็ก/ลบผู้ใช้แบบ cascade
-- ที่แท็กอื่นอาจถูกลบไปพร้อมกันแล้ว) จึงตรวจเฉพาะที่ผู้ใช้เขียนตรง ๆ (trigger depth = 1)
create or replace function public.mood_entries_validate_tags()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;
  if exists (
    select 1 from unnest(new.tags) as tag_id
    where not exists (
      select 1 from public.mood_tags m where m.id::text = tag_id and m.user_id = new.user_id
    )
  ) then
    raise exception 'mood_entries: มีแท็กที่ไม่มีอยู่' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger mood_entries_validate_tags
  before insert or update of tags on public.mood_entries
  for each row execute function public.mood_entries_validate_tags();

-- ลบแท็ก = ถอดออกจากรายการเช็กอินเก่าทุกวันของผู้ใช้ (security invoker: ภายใต้ RLS ของผู้ใช้เอง)
create or replace function public.mood_tags_after_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.mood_entries
  set tags = array_remove(tags, old.id::text)
  where user_id = old.user_id and tags @> array[old.id::text];
  return old;
end;
$$;

create trigger mood_tags_after_delete
  after delete on public.mood_tags
  for each row execute function public.mood_tags_after_delete();

-- 5) RPC: ใส่แท็กเริ่มต้นให้ผู้ใช้ที่ยังไม่มีแท็กเลย (idempotent; security invoker)
create or replace function public.seed_default_mood_tags()
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.mood_tags (group_kind, name)
  select v.group_kind, v.name
  from (values
    ('story', 'การเรียน/สอบ', 1), ('story', 'การเงิน', 2), ('story', 'เพื่อน', 3),
    ('story', 'ความรัก', 4), ('story', 'ครอบครัว', 5), ('story', 'สุขภาพ/การนอน', 6),
    ('activity', 'กินของอร่อย', 1), ('activity', 'ฟังเพลง', 2), ('activity', 'ดูหนัง/ซีรีส์', 3),
    ('activity', 'ออกกำลังกาย', 4), ('activity', 'ช้อปปิ้ง', 5)
  ) as v(group_kind, name, ord)
  where not exists (select 1 from public.mood_tags)
  order by v.group_kind desc, v.ord
  on conflict do nothing;
$$;

revoke execute on function public.seed_default_mood_tags() from public, anon;
grant execute on function public.seed_default_mood_tags() to authenticated;
