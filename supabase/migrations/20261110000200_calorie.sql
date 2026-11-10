-- Feature: Calorie (docs/features/calorie.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

-- โปรไฟล์ BMR/TDEE: 1 แถวต่อผู้ใช้
create table public.calorie_profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  sex            text not null check (sex in ('male', 'female')),
  age            int not null check (age between 10 and 100),
  weight_kg      numeric(5, 1) not null check (weight_kg between 20 and 300),
  height_cm      numeric(4, 1) not null check (height_cm between 100 and 250),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  bmr            int not null check (bmr > 0),
  tdee           int not null check (tdee > 0),
  constraint calorie_profiles_user_unique unique (user_id)
);

-- รายการอาหารของผู้ใช้ (ข้อมูลตั้งต้นถูกคัดลอกให้ผู้ใช้แต่ละคนผ่าน seed_default_foods())
create table public.foods (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  name          text not null check (length(btrim(name)) > 0 and char_length(name) <= 100),
  serving_unit  text not null check (length(btrim(serving_unit)) > 0 and char_length(serving_unit) <= 20),
  kcal_per_unit numeric(7, 1) not null check (kcal_per_unit between 0 and 10000),
  -- seed = ข้อมูลตั้งต้น (ค่าโดยประมาณ), user = ผู้ใช้เพิ่มเอง
  source        text not null default 'user' check (source in ('seed', 'user'))
);

-- ชื่อห้ามซ้ำของผู้ใช้คนเดียวกัน (ไม่สนตัวพิมพ์ใหญ่/เล็ก และช่องว่างหัวท้าย)
create unique index foods_user_name_unique on public.foods (user_id, lower(btrim(name)));
create index foods_user_id_idx on public.foods (user_id);

-- รายการอาหารที่กิน: เก็บสำเนาชื่อ/หน่วย/แคลอรี่ ณ ตอนที่บันทึก
-- (แก้หรือลบอาหารในตาราง foods ภายหลังจึงไม่ทำให้ประวัติเปลี่ยน)
create table public.food_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- ยอมให้เลือกวันที่ล่วงหน้า +1 วัน เพราะ current_date ของ DB เป็น UTC อาจช้ากว่าเวลาไทย (UTC+7)
  -- การตรวจวันที่ตามเวลาท้องถิ่นแบบเข้มงวดทำที่ Form
  eaten_on      date not null default current_date check (eaten_on <= current_date + 1),
  meal          text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id       uuid references public.foods(id) on delete set null,
  food_name     text not null check (length(btrim(food_name)) > 0 and char_length(food_name) <= 100),
  serving_unit  text not null check (length(btrim(serving_unit)) > 0 and char_length(serving_unit) <= 20),
  kcal_per_unit numeric(7, 1) not null check (kcal_per_unit between 0 and 10000),
  quantity      numeric(6, 2) not null check (quantity > 0 and quantity <= 100)
);

create index food_entries_user_id_idx on public.food_entries (user_id);
create index food_entries_user_id_date_idx on public.food_entries (user_id, eaten_on);
create index food_entries_food_id_idx on public.food_entries (food_id);

create trigger calorie_profiles_set_updated_at
  before update on public.calorie_profiles
  for each row execute function public.set_updated_at();

create trigger foods_set_updated_at
  before update on public.foods
  for each row execute function public.set_updated_at();

create trigger food_entries_set_updated_at
  before update on public.food_entries
  for each row execute function public.set_updated_at();

alter table public.calorie_profiles enable row level security;
alter table public.foods enable row level security;
alter table public.food_entries enable row level security;

create policy "calorie_profiles_select_own" on public.calorie_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "calorie_profiles_insert_own" on public.calorie_profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "calorie_profiles_update_own" on public.calorie_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "calorie_profiles_delete_own" on public.calorie_profiles
  for delete to authenticated using (auth.uid() = user_id);

create policy "foods_select_own" on public.foods
  for select to authenticated using (auth.uid() = user_id);
create policy "foods_insert_own" on public.foods
  for insert to authenticated with check (auth.uid() = user_id);
create policy "foods_update_own" on public.foods
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "foods_delete_own" on public.foods
  for delete to authenticated using (auth.uid() = user_id);

create policy "food_entries_select_own" on public.food_entries
  for select to authenticated using (auth.uid() = user_id);
create policy "food_entries_insert_own" on public.food_entries
  for insert to authenticated with check (auth.uid() = user_id);
create policy "food_entries_update_own" on public.food_entries
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "food_entries_delete_own" on public.food_entries
  for delete to authenticated using (auth.uid() = user_id);

-- Seed รายการอาหารตั้งต้น 102 เมนู (ค่าโดยประมาณ ต่อ 1 หน่วย) ให้ผู้ใช้ปัจจุบัน
-- ข้อมูลจากไฟล์ที่ผู้ใช้ให้มา (แก้คำสะกดและตัดรายการซ้ำแล้ว) ดู docs/features/calorie-foods-seed.csv
-- - security invoker: ทำงานภายใต้ RLS ของผู้ใช้เอง จึงสร้างได้เฉพาะของตัวเอง
-- - idempotent: ถ้าผู้ใช้มีอาหารอยู่แล้วจะไม่ทำอะไร และ on conflict do nothing กันการเรียกซ้อนกัน
create or replace function public.seed_default_foods()
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.foods (name, serving_unit, kcal_per_unit, source)
  select v.name, v.unit, v.kcal, 'seed'
  from (values
    ('ข้าวผัดกุ้ง', 'จาน', 450),
    ('ข้าวผัดหมู', 'จาน', 520),
    ('ข้าวผัดไก่', 'จาน', 480),
    ('ข้าวผัดปู', 'จาน', 550),
    ('ข้าวผัดกะเพรา', 'จาน', 500),
    ('ข้าวผัดต้มยำ', 'จาน', 470),
    ('ข้าวผัดสับปะรด', 'จาน', 490),
    ('ข้าวผัดพริกเผา', 'จาน', 460),
    ('ข้าวคลุกกะปิ', 'จาน', 530),
    ('ข้าวหน้าเป็ด', 'จาน', 610),
    ('ข้าวหน้าไก่', 'จาน', 580),
    ('ข้าวหน้าหมูแดง', 'จาน', 620),
    ('ข้าวขาหมู', 'จาน', 680),
    ('ข้าวมันไก่', 'จาน', 560),
    ('ข้าวหมูกรอบ', 'จาน', 720),
    ('ข้าวราดแกงเขียวหวาน', 'จาน', 520),
    ('ข้าวราดแกงเผ็ด', 'จาน', 510),
    ('ข้าวราดพะแนง', 'จาน', 540),
    ('ข้าวซอยไก่', 'ถ้วย', 480),
    ('ข้าวต้มปลา', 'ถ้วย', 280),
    ('ข้าวต้มกุ้ง', 'ถ้วย', 260),
    ('โจ๊ก', 'ถ้วย', 240),
    ('ผัดไทยกุ้งสด', 'จาน', 450),
    ('ผัดซีอิ๊ว', 'จาน', 520),
    ('ผัดขี้เมา', 'จาน', 490),
    ('ราดหน้า', 'จาน', 560),
    ('ก๋วยเตี๋ยวเนื้อ', 'ถ้วย', 380),
    ('ก๋วยเตี๋ยวหมู', 'ถ้วย', 350),
    ('ก๋วยเตี๋ยวไก่', 'ถ้วย', 320),
    ('ก๋วยเตี๋ยวเรือ', 'ถ้วย', 420),
    ('เส้นใหญ่น้ำตก', 'จาน', 480),
    ('ต้มยำก๋วยเตี๋ยว', 'ถ้วย', 390),
    ('เย็นตาโฟ', 'ถ้วย', 340),
    ('บะหมี่เกี๊ยว', 'ถ้วย', 410),
    ('บะหมี่หมูแดง', 'ถ้วย', 450),
    ('แกงเขียวหวานไก่', 'ถ้วย', 280),
    ('แกงเผ็ดหมู', 'ถ้วย', 290),
    ('แกงส้ม', 'ถ้วย', 150),
    ('แกงมัสมั่น', 'ถ้วย', 350),
    ('แกงพะแนง', 'ถ้วย', 310),
    ('แกงจืดเต้าหู้หมูสับ', 'ถ้วย', 120),
    ('ต้มยำกุ้ง', 'ถ้วย', 200),
    ('ต้มข่าไก่', 'ถ้วย', 220),
    ('กะเพราหมูสับ', 'จาน', 420),
    ('กะเพราไก่', 'จาน', 380),
    ('กะเพราทะเล', 'จาน', 350),
    ('ผัดกะเพราเป็ดกรอบ', 'จาน', 580),
    ('ผัดพริกแกงหมู', 'จาน', 390),
    ('ผัดฉ่าปลาดุก', 'จาน', 320),
    ('ผัดเผ็ดหมู', 'จาน', 360),
    ('ผัดผักบุ้งไฟแดง', 'จาน', 180),
    ('ผัดผักรวม', 'จาน', 150),
    ('ผัดหมี่โคราช', 'จาน', 480),
    ('ผัดวุ้นเส้น', 'จาน', 320),
    ('ผัดมะเขือยาว', 'จาน', 160),
    ('ผัดฟักทองใส่ไข่', 'จาน', 220),
    ('ไข่เจียว', 'จาน', 280),
    ('ไข่เจียวหมูสับ', 'จาน', 340),
    ('ไข่ดาว', 'ชิ้น', 120),
    ('ไก่ทอด', 'ชิ้น', 250),
    ('ปีกไก่ทอด', 'ชิ้น', 180),
    ('หมูทอด', 'ชิ้น', 320),
    ('ปลาทอด', 'ชิ้น', 280),
    ('ปลาดุกทอด', 'ชิ้น', 240),
    ('เต้าหู้ทอด', 'ชิ้น', 80),
    ('ปอเปี๊ยะทอด', 'ชิ้น', 150),
    ('ขนมปังหน้ากุ้ง', 'ชิ้น', 120),
    ('ทอดมันปลา', 'ชิ้น', 90),
    ('ทอดมันกุ้ง', 'ชิ้น', 110),
    ('กุ้งทอดกระเทียม', 'จาน', 380),
    ('ไก่ย่าง', 'ชิ้น', 220),
    ('หมูย่าง', 'ชิ้น', 280),
    ('ปลาเผา', 'ชิ้น', 250),
    ('หมูสะเต๊ะ', 'ไม้', 90),
    ('ปลานึ่งมะนาว', 'จาน', 280),
    ('ปลานึ่งซีอิ๊ว', 'จาน', 300),
    ('ปูนึ่ง', 'ตัว', 180),
    ('หอยนางรมนึ่ง', 'ตัว', 50),
    ('ส้มตำไทย', 'จาน', 150),
    ('ส้มตำปู', 'จาน', 180),
    ('ส้มตำปลาร้า', 'จาน', 160),
    ('ยำวุ้นเส้น', 'จาน', 180),
    ('ยำถั่วพู', 'จาน', 120),
    ('ยำทะเล', 'จาน', 200),
    ('ยำหมูยอ', 'จาน', 220),
    ('ยำมะม่วง', 'จาน', 130),
    ('ยำปลาดุกฟู', 'จาน', 280),
    ('ลาบหมู', 'จาน', 250),
    ('ลาบไก่', 'จาน', 220),
    ('ลาบเป็ด', 'จาน', 280),
    ('น้ำตกหมู', 'จาน', 240),
    ('น้ำตกเนื้อ', 'จาน', 260),
    ('กล้วยทอด', 'ชิ้น', 120),
    ('ข้าวเหนียวมะม่วง', 'จาน', 350),
    ('ทับทิมกรอบ', 'ถ้วย', 180),
    ('บัวลอย', 'ถ้วย', 220),
    ('ลอดช่อง', 'ถ้วย', 150),
    ('สาคูเปียก', 'ถ้วย', 160),
    ('ขนมถ้วย', 'ชิ้น', 70),
    ('ขนมครก', 'ชิ้น', 85),
    ('ขนมเบื้อง', 'ชิ้น', 150),
    ('โรตีกล้วย', 'ชิ้น', 280)
  ) as v(name, unit, kcal)
  where auth.uid() is not null
    and not exists (select 1 from public.foods f where f.user_id = auth.uid())
  on conflict do nothing;
$$;

revoke execute on function public.seed_default_foods() from public, anon;
grant execute on function public.seed_default_foods() to authenticated;
