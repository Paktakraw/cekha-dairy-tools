# Feature: Theme (โหมดสว่าง / มืด)

- **ID:** `theme` (ฟีเจอร์ระดับ App Shell ไม่มีหน้าและ route ของตัวเอง)
- **Route:** -
- **Folder:** `src/app/providers/` (ThemeProvider), `src/shared/` (ปุ่ม, hook, service, utils)
- **Status:** In scope (Phase 10) — **ร่าง รอผู้ใช้ยืนยัน spec**

## Overview
ผู้ใช้กดสลับธีมของแอปได้ 2 โหมด คือ สว่าง และ มืด ค่าที่เลือกบันทึกกับบัญชีผู้ใช้ใน Supabase
เปิดแอปครั้งแรกเป็นโหมดสว่างเสมอ หลังจากนั้นเป็นไปตามค่าที่ผู้ใช้เลือกไว้

## Requirements

### ปุ่มสลับธีม
- ปุ่มแบบ 2 ปุ่มเคียงกัน เป็นไอคอนอย่างเดียว ไม่มีข้อความ:
  - ไอคอนพระอาทิตย์ (`Sun`) = โหมดสว่าง
  - ไอคอนพระจันทร์ (`Moon`) = โหมดมืด
- ปุ่มของโหมดที่ใช้อยู่แสดงสถานะ "เลือกอยู่" ชัดเจน (พื้นเข้ม/ขอบ) ตามกฎมินิมอลขาว ดำ เทา
- ทุกปุ่มมี Tooltip และ aria-label ภาษาไทย ("โหมดสว่าง", "โหมดมืด") และบอกสถานะด้วย `aria-pressed`
- วางที่ Sidebar (ใช้ได้ทั้ง Sidebar บนคอมและเมนูแบบพับบนมือถือ) ต้องแสดงได้ทั้งตอน Sidebar ย่อและขยาย
- กดแล้วเปลี่ยนธีมทันที ไม่ reload หน้า

### ค่าเริ่มต้นและการจำค่า
- ผู้ใช้ที่ยังไม่เคยเลือก = สว่าง (ไม่ดูการตั้งค่าของเครื่อง)
- ค่าที่เลือกเก็บในตาราง `user_preferences` ผูกกับ `user_id` (ผู้ใช้ Anonymous ได้ค่าของตัวเอง; ตอนเปลี่ยนเป็น Login จริงในอนาคตผูก user เดิมแล้วค่ายังอยู่)
- เปิดแอปแล้วโหลดค่าจาก Supabase มาใช้ เมื่อบันทึกไม่สำเร็จ แสดง Toast ข้อผิดพลาดภาษาไทย ธีมที่เลือกยังใช้ต่อในหน้านั้น
- **แคชในเบราว์เซอร์ (localStorage) ช่วยกันหน้าจอวาบขาว:** เก็บสำเนาของค่าล่าสุดไว้ใช้ตั้งธีมก่อน React โหลด (สคริปต์ inline ใน `index.html`) Supabase ยังเป็นข้อมูลหลัก เมื่อโหลดค่าจาก Supabase ได้แล้วให้ใช้ค่านั้นและอัปเดตแคช; ถ้าแคชอ่านไม่ได้ (เช่น โหมดส่วนตัว) แอปยังทำงานได้ปกติ
- ค่าที่ไม่รู้จักทั้งจากแคชและจาก Supabase ให้ถือเป็น "สว่าง"

### การแสดงผลโหมดมืด
- โทนเดิมของโปรเจค (ขาว ดำ เทา) กลับสี ไม่เพิ่มสีสดใหม่; สีเขียว/แดงโทนหม่น (ตัวเลขรายรับ/รายจ่าย, ป้าย "คุ้มที่สุด", ปุ่มลบ) ต้องยังอ่านง่ายและคอนทราสต์พอ
- ทุกหน้าที่มีอยู่ (หน้าหลัก To-do, สุ่มเลือก, รายรับ-รายจ่าย, แคลอรี่, เทียบราคาต่อหน่วย, Login, ไม่พบหน้า) และ Modal/Dialog/Toast/Dropdown/Input รองรับ
- ตั้ง `color-scheme` ให้ตรงโหมด เพื่อให้ scrollbar และ control ของเบราว์เซอร์กลืนกับธีม

### Technical Notes
- **วิธีทำ:** ปรับค่าสีกลางของ Tailwind v4 (CSS variables ของ `gray-*` และ `white`) ใน `src/styles/index.css` ให้สลับเมื่อ `<html data-theme="dark">` เพื่อให้คอมโพเนนต์เดิมส่วนใหญ่เป็นโหมดมืดได้โดยไม่ต้องใส่ `dark:` ทีละไฟล์ จุดที่สีผูกกับความหมาย (เขียว/แดง/ป้าย) ปรับเฉพาะจุด
- Layering: ปุ่ม → `useTheme` (Context ใน `ThemeProvider`) → `preferenceService` → Supabase; Component ไม่เรียก Supabase ตรง
- ThemeProvider อยู่ใน AuthProvider เพราะต้องรอ session ก่อนโหลด/บันทึกค่า
- Pure function `resolveTheme(value: unknown): Theme` (ตรวจค่า คืน `light` เมื่อไม่รู้จัก) ใน `src/shared/utils/theme.ts` พร้อมเทสต์ใน `tests/theme.test.ts`
- บันทึกด้วย upsert `onConflict: 'user_id'` (เหมือนโปรไฟล์ในโมดูลแคลอรี่)
- บันทึกต้องไม่รบกวนการใช้งาน: เปลี่ยนธีมทันทีแล้วบันทึกเบื้องหลัง; กดสลับเร็ว ๆ ใช้ค่าสุดท้ายเป็นผล

## Database
ตาราง `user_preferences` (+ คอลัมน์มาตรฐานตาม CLAUDE.md ข้อ 6) — 1 แถวต่อผู้ใช้ ออกแบบให้เพิ่มการตั้งค่าอื่นได้ในอนาคต

| Field | Type | Rule |
|---|---|---|
| theme | text | NOT NULL DEFAULT 'light', CHECK (theme in ('light', 'dark')) |
| (user_id) | uuid | UNIQUE (1 แถวต่อผู้ใช้) |

Migration: `supabase/migrations/20261113000100_user_preferences.sql` (ไฟล์ใหม่ ไม่แก้ไฟล์เดิม) — trigger `set_updated_at`, เปิด RLS และ Policy `auth.uid() = user_id` ครบ SELECT / INSERT / UPDATE / DELETE

Index: `user_id` (unique constraint ครอบอยู่แล้ว)

## Suggested Components
- Components: `ThemeToggle` (`src/shared/components/layout/`) วางใน `Sidebar`
- Providers/Hooks: `ThemeProvider` + `ThemeContext` (`src/app/providers/`), `useTheme` (`src/shared/hooks/`)
- Services: `preferenceService` (`src/shared/services/` — โหลดและ upsert ค่าธีม คืน `ServiceResult`)
- Utils: `theme.ts` (`resolveTheme`, ชื่อ key ของแคช)
- Types: `Theme = 'light' | 'dark'`
- อื่น ๆ: สคริปต์ตั้งธีมก่อนโหลดใน `index.html`, ค่าสีใน `src/styles/index.css`

## Open Questions
1. ตำแหน่งปุ่ม: ผมวางที่ Sidebar อย่างเดียว (มือถือเปิดจากเมนูพับ) ถ้าอยากให้อยู่บนแถบบนมือถือด้วย ระบุเพิ่มได้
2. ยืนยันการใช้แคช localStorage เป็นตัวช่วยกันหน้าจอวาบขาว (ค่าหลักยังอยู่ที่ Supabase ตามที่ผู้ใช้ต้องการ)
3. ข้อควรรู้: ผู้ใช้ Anonymous ที่ล้างข้อมูลเบราว์เซอร์จะได้บัญชีใหม่ ค่าธีมเดิมไม่ติดตามมา จนกว่าจะมี Login จริง (docs/future-login.md) — ยอมรับได้ไหม

## Out of Scope
- โหมด "ตามเครื่อง" (system) และการตามการตั้งค่าเครื่องอัตโนมัติ
- ธีมสีอื่นนอกจากสว่าง/มืด, การปรับสีเอง
- การตั้งค่าส่วนตัวอื่น ๆ (ตารางรองรับการขยาย แต่ยังไม่ทำ)
