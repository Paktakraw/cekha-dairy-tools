-- To-do v2: สถานะ 3 ค่า, เวลาที่เสร็จ (completed_at), ชื่อห้ามซ้ำ, จำกัดความยาว
-- หมายเหตุ: ถ้ามีข้อมูลเดิมที่ชื่อซ้ำกัน (ไม่สนตัวพิมพ์/ช่องว่างหัวท้าย) หรือยาวเกินกำหนด
-- migration นี้จะ error ให้แก้หรือลบข้อมูลเหล่านั้นก่อน แล้วรันใหม่

-- 1) สถานะ: completed -> done และเพิ่ม in_progress
alter table public.tasks drop constraint tasks_status_check;
update public.tasks set status = 'done' where status = 'completed';
alter table public.tasks
  add constraint tasks_status_check check (status in ('pending', 'in_progress', 'done'));

-- 2) เวลาที่เสร็จ
alter table public.tasks add column completed_at timestamptz;
update public.tasks set completed_at = updated_at where status = 'done';

-- ตั้ง/ล้าง completed_at อัตโนมัติเมื่อสถานะเปลี่ยน (บังคับที่ระดับ Database)
create or replace function public.tasks_set_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'done' then
    if tg_op = 'INSERT' or old.status is distinct from 'done' then
      new.completed_at := now();
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger tasks_set_completed_at
  before insert or update on public.tasks
  for each row execute function public.tasks_set_completed_at();

-- 3) ชื่อห้ามซ้ำต่อผู้ใช้ (ไม่สนตัวพิมพ์ใหญ่/เล็ก และช่องว่างหัวท้าย)
-- ข้อมูลเดิมที่ชื่อซ้ำ: เก็บรายการที่สร้างก่อนไว้ตามเดิม ที่เหลือเปลี่ยนเป็น "ชื่อ (2)", "ชื่อ (3)" ... (ไม่ลบข้อมูล)
update public.tasks t
set title = left(btrim(t.title), 90) || ' (' || d.rn || ')'
from (
  select id,
         row_number() over (
           partition by user_id, lower(btrim(title))
           order by created_at, id
         ) as rn
  from public.tasks
) d
where t.id = d.id and d.rn > 1;

create unique index tasks_user_title_unique
  on public.tasks (user_id, lower(btrim(title)));

-- 4) จำกัดความยาว (ต้องตรงกับค่าใน src/features/todo/constants.ts)
alter table public.tasks
  add constraint tasks_title_length_check check (char_length(title) <= 100),
  add constraint tasks_description_length_check check (description is null or char_length(description) <= 1000);

-- index สำหรับ filter ตามสถานะ + เรียงตามวันที่สร้าง
create index tasks_user_id_status_created_at_idx on public.tasks (user_id, status, created_at);
