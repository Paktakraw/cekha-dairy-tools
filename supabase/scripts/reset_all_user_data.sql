-- ⚠️ ทำลายข้อมูล — ไม่ใช่ migration ห้ามรันอัตโนมัติ
-- ลบผู้ใช้ทั้งหมด (รวมผู้ใช้ anonymous เดิม) ข้อมูลทุกตารางของทุกฟีเจอร์ถูกลบตามด้วย
-- เพราะทุกตารางอ้างอิง auth.users แบบ ON DELETE CASCADE
-- ใช้ตอนเริ่มระบบบัญชีใหม่ (Phase 14) — รันเองใน Supabase SQL Editor หลังรัน migration auth_profiles แล้วเท่านั้น
-- ย้อนกลับไม่ได้ ถ้าต้องการเก็บข้อมูลไว้ให้ Backup ก่อน

delete from auth.users;
