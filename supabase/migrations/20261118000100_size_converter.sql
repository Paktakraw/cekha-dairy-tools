-- Feature: Global Size Converter (docs/features/size-converter.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

-- โปรไฟล์สัดส่วน (ตัวเอง/คนรอบตัว) เก็บเป็น cm เสมอ (รอบนิ้วเป็น mm)
create table public.size_profiles (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  name                    text not null check (length(btrim(name)) > 0 and char_length(name) <= 50),
  demographic             text not null check (demographic in ('men', 'women')),
  is_self                 boolean not null default false,
  unit_pref               text not null default 'cm' check (unit_pref in ('cm', 'inch')),
  height_cm               numeric(5, 1) check (height_cm between 30 and 250),
  foot_length_cm          numeric(5, 1) check (foot_length_cm between 5 and 40),
  foot_width_cm           numeric(5, 1) check (foot_width_cm between 3 and 20),
  chest_cm                numeric(5, 1) check (chest_cm between 20 and 250),
  waist_cm                numeric(5, 1) check (waist_cm between 20 and 250),
  hip_cm                  numeric(5, 1) check (hip_cm between 20 and 250),
  head_cm                 numeric(5, 1) check (head_cm between 30 and 80),
  finger_circumference_mm numeric(5, 1) check (finger_circumference_mm between 30 and 100),
  -- ใช้เป็นเป้าของ composite FK จาก size_notes (บังคับให้บันทึกเป็นของผู้ใช้คนเดียวกับโปรไฟล์)
  constraint size_profiles_id_user_unique unique (id, user_id)
);

create unique index size_profiles_user_name_unique on public.size_profiles (user_id, lower(btrim(name)));
-- โปรไฟล์ "ฉัน" ได้ 1 อันต่อผู้ใช้
create unique index size_profiles_user_self_unique on public.size_profiles (user_id) where is_self;
create index size_profiles_user_id_idx on public.size_profiles (user_id);

-- บันทึกไซส์ที่เคยใส่ได้จริง (ผูกกับโปรไฟล์ ลบโปรไฟล์ = ลบบันทึก)
create table public.size_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  profile_id uuid not null,
  brand      text not null check (length(btrim(brand)) > 0 and char_length(brand) <= 50),
  product    text check (char_length(product) <= 100),
  size_label text not null check (length(btrim(size_label)) > 0 and char_length(size_label) <= 30),
  fit        text not null default 'good' check (fit in ('good', 'tight', 'loose')),
  note       text check (char_length(note) <= 500),
  constraint size_notes_profile_fk
    foreign key (profile_id, user_id) references public.size_profiles (id, user_id) on delete cascade
);

create index size_notes_user_id_idx on public.size_notes (user_id);
create index size_notes_profile_created_idx on public.size_notes (profile_id, created_at desc);
create index size_notes_user_brand_idx on public.size_notes (user_id, lower(brand));

create trigger size_profiles_set_updated_at
  before update on public.size_profiles
  for each row execute function public.set_updated_at();

create trigger size_notes_set_updated_at
  before update on public.size_notes
  for each row execute function public.set_updated_at();

alter table public.size_profiles enable row level security;
alter table public.size_notes enable row level security;

create policy "size_profiles_select_own" on public.size_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "size_profiles_insert_own" on public.size_profiles
  for insert to authenticated with check (auth.uid() = user_id);
create policy "size_profiles_update_own" on public.size_profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "size_profiles_delete_own" on public.size_profiles
  for delete to authenticated using (auth.uid() = user_id);

create policy "size_notes_select_own" on public.size_notes
  for select to authenticated using (auth.uid() = user_id);
create policy "size_notes_insert_own" on public.size_notes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "size_notes_update_own" on public.size_notes
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "size_notes_delete_own" on public.size_notes
  for delete to authenticated using (auth.uid() = user_id);
