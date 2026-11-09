# Feature: Randomizer (Custom Randomizer & Multi-Group Selector)

- **ID:** `randomizer`
- **Route:** `/randomizer`
- **Folder:** `src/features/randomizer/`
- **Status:** In scope (Phase 5)

## Overview
เครื่องมือสุ่มเอนกประสงค์ ผู้ใช้สร้างกลุ่มข้อมูล (เช่น ร้านอาหาร, สถานที่เที่ยว, รายชื่อ)
เลือกได้หลายกลุ่มพร้อมกันเพื่อรวมเป็นกองสุ่มเดียว และรายการที่สุ่มได้แล้วจะถูกตัดออกชั่วคราวเพื่อไม่ให้ซ้ำ

## Requirements

### Data Management
- สร้าง แก้ไข ลบ กลุ่ม (เช่น อาหารเช้า, อาหารกลางวัน)
- เพิ่มรายการเข้ากลุ่มทีละรายการ แก้ไขและลบรายการได้
- ข้อมูลกลุ่มและรายการเก็บถาวรใน Supabase (ไม่หายเมื่อรีเฟรชหรือปิดเบราว์เซอร์)

### Randomization
- เลือกได้มากกว่า 1 กลุ่มพร้อมกัน (Checkbox หรือ Tag) แล้วรวมรายการทั้งหมดเป็น **Current Pool**
- สุ่ม 1 รายการจาก Current Pool
- รายการที่สุ่มได้ย้ายไป **Excluded Pool** และไม่ถูกสุ่มซ้ำจนกว่าจะ Reset
- ปุ่ม **Reset Session** คืนรายการทั้งหมดจาก Excluded Pool กลับเข้า Current Pool
- เมื่อ Current Pool ว่าง ให้แสดงข้อความแนะนำให้ Reset
- แสดงผลการสุ่มล่าสุดให้เห็นชัด และแสดงรายการใน Excluded Pool

### Technical Notes
- Session การสุ่ม (Current/Excluded Pool) เป็น State ฝั่ง Client ไม่เก็บใน Database
- Logic การสุ่มแยกเป็น pure function ใน `utils/` ที่ทดสอบได้ ไม่ผูกกับ UI
- ถ้ารายการเดียวกันในชื่อซ้ำอยู่คนละกลุ่ม ให้นับเป็นคนละรายการ (อ้างอิงด้วย id ไม่ใช่ข้อความ)

## Database
ตาราง `random_groups` (+ คอลัมน์มาตรฐานตาม CLAUDE.md ข้อ 6)

| Field | Type | Rule |
|---|---|---|
| name | text | NOT NULL, ไม่เป็นค่าว่าง, ความยาว ≤ 50, UNIQUE (user_id, lower(btrim(name))) |

ตาราง `random_items` (+ คอลัมน์มาตรฐาน)

| Field | Type | Rule |
|---|---|---|
| group_id | uuid | NOT NULL, FK → random_groups(id) ON DELETE CASCADE |
| label | text | NOT NULL, ไม่เป็นค่าว่าง, ความยาว ≤ 100 |

Index: `user_id` ทั้งสองตาราง, `random_items(group_id)`

## UI
- หน้าเดียว 2 แท็บ: **สุ่ม** (เลือกกลุ่ม, ผลการสุ่ม, Reset Session, รายการที่สุ่มไปแล้ว) และ **จัดการกลุ่ม** (CRUD กลุ่ม/รายการ)
- Header ของหน้า sticky: ชื่อหน้าซ้าย ปุ่ม "เพิ่มกลุ่ม" ขวา
- เพิ่ม/แก้ไขกลุ่มและรายการผ่าน Modal; ลบมี Confirmation (ลบกลุ่มจะลบรายการในกลุ่มด้วย)
- Migration: `20261109000300_randomizer.sql`

## Suggested Components
- `GroupList`, `GroupForm`, `ItemList`, `GroupSelector`, `RandomPicker`, `ExcludedList`
- Hooks: `useGroups` (CRUD กลุ่ม/รายการ), `useRandomSession` (Current/Excluded Pool)
- Utils: ฟังก์ชันสุ่ม, ฟังก์ชันรวม pool
- Page: `RandomizerPage`

## Decisions (Phase 0)
1. เปลี่ยนกลุ่มที่เลือกระหว่าง Session → Reset Session อัตโนมัติ
2. ลบรายการระหว่าง Session → ลบออกจากทั้ง Current/Excluded Pool; แก้ไข label → อัปเดตตาม id; ลบหรือแก้กลุ่มที่ถูกเลือกอยู่ → Reset Session
3. Session หายเมื่อรีเฟรชหน้า (state ฝั่ง client เท่านั้น ไม่ใช้ localStorage)

## Out of Scope
- สุ่มหลายรายการพร้อมกัน, น้ำหนักการสุ่ม (weighted), ประวัติการสุ่มถาวร, Animation วงล้อ
