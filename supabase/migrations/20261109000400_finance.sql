-- Feature: Income & Expense Tracker (docs/features/finance.md)
-- ต้องรัน core migration (set_updated_at) ก่อน

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null check (length(btrim(name)) > 0 and char_length(name) <= 50),
  type        text not null check (type in ('income', 'expense')),
  description text check (description is null or char_length(description) <= 200),
  -- รองรับ composite FK จาก transactions
  constraint categories_id_type_unique unique (id, type)
);

-- ชื่อห้ามซ้ำภายในประเภทเดียวกันของผู้ใช้คนเดียวกัน (ไม่สนตัวพิมพ์ใหญ่/เล็ก และช่องว่างหัวท้าย)
create unique index categories_user_type_name_unique
  on public.categories (user_id, type, lower(btrim(name)));
create index categories_user_id_idx on public.categories (user_id);

create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  transaction_date date not null default current_date
    -- ห้ามเลือกอนาคต: เผื่อ +1 วัน เพราะ current_date ของ DB เป็น UTC อาจช้ากว่าเวลาท้องถิ่น (เช่น ไทย UTC+7)
    -- การตรวจวันที่ตามเวลาท้องถิ่นแบบเข้มงวดทำที่ Form
    check (transaction_date <= current_date + 1),
  type             text not null check (type in ('income', 'expense')),
  category_id      uuid not null,
  amount           numeric(12, 2) not null check (amount > 0),
  description      text check (description is null or char_length(description) <= 200),
  -- บังคับให้ type ของ transaction ตรงกับ type ของ category และห้ามลบ category ที่ถูกใช้อยู่
  constraint transactions_category_fk
    foreign key (category_id, type) references public.categories (id, type) on delete restrict
);

create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_user_id_date_idx on public.transactions (user_id, transaction_date);
create index transactions_category_id_idx on public.transactions (category_id);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "categories_select_own" on public.categories
  for select to authenticated using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories
  for insert to authenticated with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories
  for delete to authenticated using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions
  for select to authenticated using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete to authenticated using (auth.uid() = user_id);

-- Seed หมวดหมู่เริ่มต้นให้ผู้ใช้ปัจจุบัน (เรียกจาก client เมื่อยังไม่มีหมวดหมู่)
-- - security invoker: ทำงานภายใต้ RLS ของผู้ใช้เอง จึงสร้างได้เฉพาะของตัวเอง
-- - idempotent: ถ้ามีหมวดหมู่อยู่แล้วจะไม่ทำอะไร และ on conflict do nothing กันการเรียกซ้อนกัน
create or replace function public.seed_default_categories()
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.categories (name, type)
  select v.name, v.type
  from (values
    ('Salary', 'income'),
    ('Freelance', 'income'),
    ('Investment', 'income'),
    ('Other Income', 'income'),
    ('Food & Beverage', 'expense'),
    ('Transportation', 'expense'),
    ('Shopping', 'expense'),
    ('Utilities', 'expense'),
    ('Entertainment', 'expense'),
    ('Healthcare', 'expense'),
    ('Other Expense', 'expense')
  ) as v(name, type)
  where auth.uid() is not null
    and not exists (select 1 from public.categories c where c.user_id = auth.uid())
  on conflict do nothing;
$$;

revoke execute on function public.seed_default_categories() from public, anon;
grant execute on function public.seed_default_categories() to authenticated;
