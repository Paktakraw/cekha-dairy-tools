-- หมวดหมู่เริ่มต้นเป็นภาษาไทย (แอปใช้ภาษาไทยทั้งหมด)
-- 1) เปลี่ยนชื่อหมวดหมู่เริ่มต้นเดิม (ภาษาอังกฤษ) ที่มีอยู่แล้วเป็นภาษาไทย
--    - แก้เฉพาะแถวที่ชื่อตรงกับชื่อเริ่มต้นเดิมเป๊ะ ๆ เท่านั้น (หมวดหมู่ที่ผู้ใช้สร้างเองไม่ถูกแตะ)
--    - รายการรายรับ-รายจ่ายเดิมไม่หาย เพราะอ้างอิงด้วย id ไม่ใช่ชื่อ
--    - ข้ามแถวที่ผู้ใช้มีหมวดหมู่ชื่อภาษาไทยเดียวกันอยู่แล้ว (กันชื่อซ้ำ)
update public.categories c
set name = m.th
from (values
  ('Salary', 'income', 'เงินเดือน'),
  ('Freelance', 'income', 'งานฟรีแลนซ์'),
  ('Investment', 'income', 'การลงทุน'),
  ('Other Income', 'income', 'รายรับอื่น ๆ'),
  ('Food & Beverage', 'expense', 'อาหารและเครื่องดื่ม'),
  ('Transportation', 'expense', 'การเดินทาง'),
  ('Shopping', 'expense', 'ช้อปปิ้ง'),
  ('Utilities', 'expense', 'ค่าสาธารณูปโภค'),
  ('Entertainment', 'expense', 'ความบันเทิง'),
  ('Healthcare', 'expense', 'สุขภาพ'),
  ('Other Expense', 'expense', 'รายจ่ายอื่น ๆ')
) as m(en, type, th)
where c.name = m.en
  and c.type = m.type
  and not exists (
    select 1 from public.categories x
    where x.user_id = c.user_id and x.type = c.type and lower(btrim(x.name)) = lower(m.th)
  );

-- 2) ฟังก์ชัน seed สำหรับผู้ใช้ใหม่ ใช้ชื่อภาษาไทย (พฤติกรรมอื่นเหมือนเดิม: idempotent, security invoker)
create or replace function public.seed_default_categories()
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.categories (name, type)
  select v.name, v.type
  from (values
    ('เงินเดือน', 'income'),
    ('งานฟรีแลนซ์', 'income'),
    ('การลงทุน', 'income'),
    ('รายรับอื่น ๆ', 'income'),
    ('อาหารและเครื่องดื่ม', 'expense'),
    ('การเดินทาง', 'expense'),
    ('ช้อปปิ้ง', 'expense'),
    ('ค่าสาธารณูปโภค', 'expense'),
    ('ความบันเทิง', 'expense'),
    ('สุขภาพ', 'expense'),
    ('รายจ่ายอื่น ๆ', 'expense')
  ) as v(name, type)
  where auth.uid() is not null
    and not exists (select 1 from public.categories c where c.user_id = auth.uid())
  on conflict do nothing;
$$;

revoke execute on function public.seed_default_categories() from public, anon;
grant execute on function public.seed_default_categories() to authenticated;
