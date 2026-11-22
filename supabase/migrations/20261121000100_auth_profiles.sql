-- Feature: Auth (docs/features/auth.md)
-- ต้องรัน core migration (set_updated_at) ก่อน
--
-- ตัวตนใน auth.users ใช้อีเมลสังเคราะห์ <username>@... (ดู src/features/auth/utils/auth.ts)
-- ข้อมูลโปรไฟล์จริง (ชื่อ/อีเมล/เบอร์) เก็บในตาราง profiles ซึ่งสร้างโดย trigger ตอนสมัคร
-- (atomic: ถ้า username/อีเมล/เบอร์ซ้ำ การสมัครทั้งหมดจะล้มเหลว ไม่เหลือบัญชีกึ่งกลาง)

create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  username   text not null check (username ~ '^[a-z0-9_.]{3,30}$'),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 100),
  last_name  text not null check (char_length(btrim(last_name)) between 1 and 100),
  email      text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone      text not null check (phone ~ '^0[0-9]{9}$'),
  -- unique constraint สร้าง index บน user_id ให้อยู่แล้ว
  constraint profiles_user_unique unique (user_id)
);

-- ห้ามซ้ำ (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
create unique index profiles_username_unique on public.profiles (lower(username));
create unique index profiles_email_unique on public.profiles (lower(email));
create unique index profiles_phone_unique on public.profiles (phone);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- อ่านได้เฉพาะของตัวเอง; ไม่มี policy INSERT/UPDATE/DELETE เพราะโปรไฟล์ถูกเขียนโดย trigger เท่านั้น
-- (การแก้โปรไฟล์อยู่นอก scope ของเวอร์ชันนี้ — เพิ่ม policy ในไฟล์ migration ใหม่เมื่อทำ)
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = user_id);

-- สร้างโปรไฟล์อัตโนมัติเมื่อมีผู้ใช้ใหม่ที่ส่ง metadata มาจากหน้าสมัคร (ข้ามผู้ใช้ anonymous)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.is_anonymous, false) or new.raw_user_meta_data->>'username' is null then
    return new;
  end if;

  -- ตัวตนที่ใช้ล็อกอิน (ส่วนหน้าอีเมลสังเคราะห์) ต้องตรงกับ username ในโปรไฟล์
  -- กันการเรียก Supabase ตรง ๆ ด้วย metadata ที่ไม่ตรงกับอีเมล (ชื่อที่แสดงจะได้ไม่ต่างจากชื่อล็อกอิน)
  if lower(split_part(new.email, '@', 1)) <> new.raw_user_meta_data->>'username' then
    raise exception 'username does not match login identity';
  end if;

  insert into public.profiles (user_id, username, first_name, last_name, email, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    btrim(new.raw_user_meta_data->>'first_name'),
    btrim(new.raw_user_meta_data->>'last_name'),
    btrim(new.raw_user_meta_data->>'email'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ตรวจก่อนสมัครว่าฟิลด์ไหนถูกใช้แล้ว เพื่อแจ้งผู้ใช้ตรงจุด (คืนรายชื่อฟิลด์: username / email / phone)
-- เรียกได้ก่อนล็อกอิน; ตัว unique index ข้างบนยังเป็นด่านบังคับจริง
create or replace function public.check_register_available(p_username text, p_email text, p_phone text)
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(array_remove(array[
    case when exists (select 1 from public.profiles where lower(username) = lower(btrim(p_username))) then 'username' end,
    case when exists (select 1 from public.profiles where lower(email) = lower(btrim(p_email))) then 'email' end,
    case when exists (select 1 from public.profiles where phone = btrim(p_phone)) then 'phone' end
  ], null), '{}'::text[]);
$$;

revoke all on function public.check_register_available(text, text, text) from public;
grant execute on function public.check_register_available(text, text, text) to anon, authenticated;
