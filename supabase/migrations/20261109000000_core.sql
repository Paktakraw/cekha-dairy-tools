-- Core migration: ฟังก์ชันกลางที่ใช้ซ้ำทุกตารางของทุกฟีเจอร์
-- ใช้งาน: CREATE TRIGGER ... BEFORE UPDATE ON <table> FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
