# Feature: Income & Expense Tracker

- **ID:** `finance`
- **Route:** `/finance` (หน้าย่อย: `/finance/transactions`, `/finance/summary`, `/finance/categories`)
- **Folder:** `src/features/finance/`
- **Status:** In scope (Phase 6)

## Overview
บันทึกรายรับ-รายจ่ายประจำวัน ดูสรุปภาพรวม และจัดการหมวดหมู่
แบ่งเป็น 3 หน้าย่อยภายในฟีเจอร์ (Transactions, Summary, Categories) ลำดับการพัฒนา: Categories → Transactions → Summary

## Requirements

### Categories
- CRUD หมวดหมู่ (ชื่อ, ประเภท Income/Expense, Description optional)
- แสดงแยก Income / Expense ชัดเจน
- ห้ามชื่อซ้ำภายในประเภทเดียวกันของผู้ใช้คนเดียวกัน
- ห้ามลบหมวดหมู่ที่มี Transaction อ้างอิงอยู่ และแจ้งผู้ใช้ให้เข้าใจว่าทำไมลบไม่ได้
- แก้ชื่อหมวดหมู่แล้ว Transaction เดิมต้องไม่หาย
- หมวดหมู่เริ่มต้น:
  - รายรับ: เงินเดือน, งานฟรีแลนซ์, การลงทุน, รายรับอื่น ๆ
  - รายจ่าย: อาหารและเครื่องดื่ม, การเดินทาง, ช้อปปิ้ง, ค่าสาธารณูปโภค, ความบันเทิง, สุขภาพ, รายจ่ายอื่น ๆ
  - (เดิมเป็นชื่ออังกฤษ ปรับเป็นภาษาไทยด้วย migration `20261110000100_finance_thai_categories.sql`)

### Transactions
- ฟิลด์:
  - **Date:** default วันนี้, เลือกย้อนหลังได้, ห้ามเลือกอนาคต, แก้ไขภายหลังได้
  - **Type:** income / expense
  - **Category:** แสดงเฉพาะหมวดหมู่ที่ตรงกับ Type ที่เลือก
  - **Amount:** ต้อง > 0, แสดงผลแบบ 1,000.00
  - **Description:** optional
- เพิ่ม แก้ไข ลบ (มี Confirmation)
- Form Validation ก่อนบันทึก และ Reset Form หลังบันทึกสำเร็จ
- แสดงรายการล่าสุดหลังบันทึกสำเร็จ
- ถ้ายังไม่มีหมวดหมู่ ให้แสดงข้อความพร้อมลิงก์ไปหน้า Categories

### Summary
- **Summary Cards:** Total Income, Total Expense, Total Transactions (ไม่แสดง Net Balance ตามคำขอผู้ใช้)
- **ตารางประวัติ:** Date, Type, Category, Description, Amount, Action (แก้ไข/ลบ) เรียงจากวันที่ล่าสุดก่อน
- **Filter:** ช่วงวันที่, เดือน/ปี, ประเภท, หมวดหมู่, ค้นหาจาก Description, ปุ่ม "ล้างตัวกรอง" (Reset Filter)
- Summary Cards คำนวณตาม Filter ที่เลือก
- **Category Summary:** ยอดรวมแยกตามหมวดหมู่ ให้เห็นว่าหมวดไหนใช้จ่ายมากที่สุด
- Empty State เมื่อไม่มีข้อมูลตรงกับ Filter

## Database
ตาราง `categories` (+ คอลัมน์มาตรฐานตาม CLAUDE.md ข้อ 6)

| Field | Type | Rule |
|---|---|---|
| name | text | NOT NULL, ไม่เป็นค่าว่าง, ความยาว ≤ 50 |
| type | text | NOT NULL, CHECK in ('income','expense') |
| description | text | nullable, ความยาว ≤ 200 |

- UNIQUE (user_id, type, lower(btrim(name))) — ไม่สนตัวพิมพ์ใหญ่/เล็ก
- UNIQUE (id, type) เพื่อรองรับ composite FK จาก transactions

ตาราง `transactions` (+ คอลัมน์มาตรฐาน)

| Field | Type | Rule |
|---|---|---|
| transaction_date | date | NOT NULL, DEFAULT current_date, CHECK ≤ current_date + 1 (เผื่อ timezone; Form ตรวจเข้มงวดตามเวลาท้องถิ่น) |
| type | text | NOT NULL, CHECK in ('income','expense') |
| category_id | uuid | NOT NULL |
| amount | numeric(12,2) | NOT NULL, CHECK (amount > 0) |
| description | text | nullable, ความยาว ≤ 200 |

- FK (category_id, type) → categories(id, type) ON DELETE RESTRICT
  → บังคับให้ type ของ transaction ตรงกับ type ของ category ที่ระดับ Database
- Index: `user_id`, `(user_id, transaction_date)`, `category_id`

## UI / พฤติกรรมที่ตัดสินใจเพิ่มตอน implement
- Layout ของฟีเจอร์: Header sticky + เมนูย่อย 3 แท็บ (บันทึกรายการ / สรุป / หมวดหมู่); `/finance` redirect ไป `/finance/transactions`
- ประเภทของหมวดหมู่เปลี่ยนไม่ได้ตอนแก้ไข (Transaction เดิมอ้างอิง type; composite FK บังคับที่ DB)
- Seed หมวดหมู่: เรียก RPC `seed_default_categories()` อัตโนมัติเมื่อโหลดแล้วยังไม่มีหมวดหมู่เลย
- หน้า Transactions: Form เพิ่มรายการ + 10 รายการล่าสุด (แก้ไข/ลบได้) พร้อม Toggle กรองตามประเภท (ทั้งหมด/รายรับ/รายจ่าย)
- หน้า Summary: Filter ที่ Database; เลือก "เดือน/ปี" จะใช้แทนช่วงวันที่; ค้นหา Description แบบ debounce 300ms; ดึงทุกรายการที่ตรงกับ filter (แบ่งก้อนละ 1,000) แล้วคำนวณ Summary/Category Summary ฝั่ง Client (รวมเป็นสตางค์เพื่อไม่ให้ทศนิยมคลาดเคลื่อน); ตารางประวัติแบ่งหน้า 10 รายการ
- Section "เพิ่มรายการ" (หน้า Transactions) และ "ตัวกรอง" (หน้า Summary) ยุบ/ขยายได้ด้วยลูกศรมุมบนขวา (ค่าเริ่มต้น: ย่อไว้เสมอทุกครั้งที่เปิดหน้า ไม่จำสถานะ; เนื้อหาไม่ถูกลบตอนยุบ จึงไม่เสียค่าที่กรอกไว้; ตัวกรองแสดง "กำลังกรองอยู่" แม้ยุบ)
- แสดงเงินเป็น ฿1,000.00; รายรับสีเขียวหม่น รายจ่ายสีแดงหม่น
- Migration: `20261109000400_finance.sql`

## Suggested Components
- `components/categories/`: `CategoryForm`, `CategoryTable`
- `components/transactions/`: `TransactionForm`, `TransactionTable`, `TransactionRow`
- `components/summary/`: `SummaryCards`, `CategorySummary`, `TransactionFilters`
- Hooks: `useCategories`, `useTransactions`, `useTransactionFilters`
- Services: `categoryService`, `transactionService`
- Utils: คำนวณ summary (pure function)
- Pages: `TransactionPage`, `SummaryPage`, `CategoryPage`

## Decisions (Phase 0)
1. Seed หมวดหมู่เริ่มต้น → RPC function `seed_default_categories()` (idempotent) เรียกอัตโนมัติเมื่อผู้ใช้ยังไม่มีหมวดหมู่
2. Filter ทำที่ Database (query); คำนวณ Summary ด้วย pure function ฝั่ง Client จากผลลัพธ์ที่ filter แล้ว
3. แสดงสกุลเงินเป็นบาท (฿)

## Out of Scope
- หลายสกุลเงิน, Budget/งบประมาณ, กราฟ, Export CSV, รายการซ้ำอัตโนมัติ (recurring)
