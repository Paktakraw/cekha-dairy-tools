# Feature: บัญชีผู้ใช้ (สมัคร / เข้าสู่ระบบ / ออกจากระบบ)

- **ID:** `auth`
- **Route:** `/login`, `/register` (ไม่อยู่ใน Sidebar — เป็นหน้าสาธารณะ)
- **Folder:** `src/features/auth/` (+ แก้ `src/app/providers/AuthProvider.tsx`, `src/app/ProtectedRoute.tsx`)
- **Status:** In scope (Phase 14) — spec ยืนยันแล้ว 2026-11-21 โค้ดเสร็จบน `feature/auth` รอผู้ใช้ทดสอบ

## Overview
แทนที่ Anonymous Sign-in ด้วยบัญชีจริง: สมัครสมาชิกด้วยชื่อจริง นามสกุล username อีเมล เบอร์โทร password แล้วเข้าสู่ระบบด้วย **username + password** เมื่อเข้าสู่ระบบแล้วสถานะคงอยู่ (รีเฟรช/ปิดเปิดเบราว์เซอร์ก็ยังอยู่) จนกว่าจะกดออกจากระบบ

## Requirements
- **สมัครสมาชิก:** กรอก ชื่อจริง, นามสกุล, username, อีเมล, เบอร์โทร, password (+ ยืนยัน password)
- **ห้ามซ้ำ:** username, อีเมล, เบอร์โทร (เทียบแบบไม่สนตัวพิมพ์เล็ก/ใหญ่และช่องว่าง) — บังคับที่ Database (unique index) และแจ้งข้อความไทยบอกว่าฟิลด์ไหนซ้ำ
- **ชื่อในระบบ (display name) = username** แสดงที่ Header/Sidebar
- **เข้าสู่ระบบ:** username + password
- **คงสถานะ:** ใช้ Supabase session (persistSession + autoRefreshToken) เก็บใน localStorage ไม่หมดอายุจนกว่าผู้ใช้ออกจากระบบเอง
- **ออกจากระบบ:** ปุ่มไอคอนพร้อม Tooltip/aria-label + Confirmation Dialog → ล้าง session → กลับหน้า `/login`
- ผู้ที่ยังไม่ล็อกอินเข้าหน้าอื่นไม่ได้ (redirect ไป `/login`); ผู้ที่ล็อกอินแล้วเข้า `/login` `/register` จะถูกส่งกลับหน้าแรก
- Validation ฝั่ง Form: username 3–30 ตัว (a-z, 0-9, `_`, `.`), password ≥ 8 ตัวอักษรและไม่เกิน 72 ไบต์ (bcrypt; ภาษาไทยตัวละ 3 ไบต์), อีเมลรูปแบบถูกต้อง, เบอร์โทรไทย 10 หลัก
- มี Loading, Error และ Toast ตามกฎกลาง; ข้อความ error ของการล็อกอินไม่บอกว่า username หรือ password ผิดข้อใด

## Technical Approach (ข้อเสนอ)
Supabase Auth ล็อกอินด้วยอีเมล/เบอร์เท่านั้น จึงใช้ **อีเมลสังเคราะห์** `<username>@<โดเมนจาก VITE_AUTH_EMAIL_DOMAIN>` เป็นตัวตนใน `auth.users` (ทำให้ username ซ้ำไม่ได้ในตัว และล็อกอินด้วย username ได้โดยไม่ต้อง lookup ที่เปิดเผยข้อมูลแก่คนนอก) ส่วนอีเมลจริง/เบอร์/ชื่อเก็บในตาราง `profiles` พร้อม unique index ต้องปิด “Confirm email” ใน Supabase

## Database
ตาราง `profiles` (+ คอลัมน์มาตรฐานตาม CLAUDE.md ข้อ 6; `user_id` UNIQUE)

| Field | Type | Rule |
|---|---|---|
| username | text | NOT NULL, CHECK รูปแบบ, UNIQUE (lower) |
| first_name | text | NOT NULL, ≤ 100 |
| last_name | text | NOT NULL, ≤ 100 |
| email | text | NOT NULL, UNIQUE (lower) |
| phone | text | NOT NULL, CHECK 10 หลัก, UNIQUE |

RLS: `auth.uid() = user_id` ทั้ง 4 คำสั่ง Index: `user_id`
Migration ใหม่: `supabase/migrations/20261121000100_auth_profiles.sql` (ไม่แก้ไฟล์เดิม)

## Suggested Components
- Components: `AuthForm` field ร่วม, `LogoutButton`
- Hooks: `useRegister`, `useLogin` (ส่วน session อยู่ที่ `useAuth` เดิม เพิ่ม `signIn`, `signUp`, `signOut`)
- Services: `authService` (signUp + insert profile, signIn, signOut, แปลง error ซ้ำเป็นข้อความไทย)
- Utils (pure + เทสต์ใน `tests/`): `toAuthEmail(username)`, `validateRegister(input)`, `normalizePhone`
- Pages: `LoginPage`, `RegisterPage`

## Decisions (ผู้ใช้ตอบแล้ว 2026-11-21)
1. ข้อมูลเดิมของ anonymous: **ล้างทั้งหมดแล้วเริ่มใหม่** (ใช้ `supabase/scripts/reset_all_user_data.sql` รันเองใน SQL Editor) session anonymous ที่ค้างในเบราว์เซอร์ถูกล้างอัตโนมัติ
2. ห้ามซ้ำ: username, อีเมล, เบอร์โทร (ไม่รวมชื่อจริง/นามสกุล)
3. ใช้อีเมลสังเคราะห์เป็นตัวตนใน Supabase Auth; ตัดการรีเซ็ตรหัสผ่านออกก่อน (ดูแนวทางกู้รหัสผ่านใน PROGRESS.md)
4. `profiles` มีเฉพาะ policy SELECT — เขียนผ่าน trigger `handle_new_user` เท่านั้น; RPC `check_register_available` เปิดให้ก่อนล็อกอินเพื่อแจ้งฟิลด์ซ้ำ (ยอมรับว่าตรวจเดาได้ว่า username/อีเมล/เบอร์ใดมีในระบบ)

## Out of Scope
- ลืม/รีเซ็ต password, ยืนยันอีเมล/เบอร์ด้วย OTP, OAuth, แก้ไขโปรไฟล์, เปลี่ยน password
