-- Feature: Expiry Tracker — เพิ่มหมวด "รักษาพยาบาล" (medical)
-- ต้องรัน 20261116000100_expiry_tracker.sql ก่อน
-- เปลี่ยนเฉพาะ CHECK ของคอลัมน์ category ข้อมูลเดิมไม่ได้รับผลกระทบ

alter table public.reminder_items drop constraint reminder_items_category_check;

alter table public.reminder_items
  add constraint reminder_items_category_check
  check (category in ('document', 'vehicle', 'home', 'medical', 'subscription', 'other'));
