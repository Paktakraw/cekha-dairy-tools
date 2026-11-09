# Feature: To-do List

- **ID:** `todo`
- **Route:** `/todo`
- **Folder:** `src/features/todo/`
- **Status:** In scope (Phase 4)

## Overview
จัดการรายการงานที่ต้องทำ เพิ่ม ดู แก้ไข เปลี่ยนสถานะ กรองตามสถานะ และลบได้

## Requirements
- **Create:** ชื่อ (required), Description (optional), สถานะเริ่มต้น `pending`
- **ชื่องาน:** ห้ามว่าง, ห้ามซ้ำภายในผู้ใช้เดียวกัน (ไม่สนตัวพิมพ์ใหญ่/เล็ก และช่องว่างหัวท้าย), ยาวไม่เกิน 100 ตัวอักษร
- **Description:** ยาวไม่เกิน 1,000 ตัวอักษร; Form แสดงตัวนับตัวอักษร
- **Read:** แสดงรายการ (ชื่อ, Description, Status, วันที่สร้าง) และคลิกที่งานเพื่อขยายดูรายละเอียดเต็ม
- **สถานะ:** `pending` (รอดำเนินการ), `in_progress` (กำลังทำ), `done` (เสร็จแล้ว) เปลี่ยนผ่าน dropdown ในแต่ละรายการ (ไม่ใช้ปุ่มติ๊ก)
- **เวลาที่เสร็จ:** เมื่อสถานะเป็น `done` แสดงวัน-เวลาที่เสร็จ; เมื่อเปลี่ยนกลับเป็นสถานะอื่นจะล้างค่า (ตั้งโดย Database trigger)
- **Filter:** Toggle ตามสถานะ เลือกได้หลายค่า ไม่เลือกเลย = แสดงทุกสถานะ
- **Pagination:** แสดงสูงสุด 10 รายการต่อหน้า (เรียงสร้างล่าสุดก่อน) แบ่งหน้าที่ฝั่ง Database
- **Header ของหน้า:** ชื่อหน้าอยู่ซ้าย ปุ่ม "เพิ่มงาน" อยู่ขวา และติดอยู่กับที่ (sticky) ขณะเลื่อนรายการ
- **Update:** แก้ชื่อ/Description
- **Delete:** ลบพร้อม Confirmation
- อัปเดต UI โดยไม่ Reload หน้า
- มี Loading, Error, Empty State และ Toast ตามกฎกลาง

## Database
ตาราง `tasks` (+ คอลัมน์มาตรฐานตาม CLAUDE.md ข้อ 6)

| Field | Type | Rule |
|---|---|---|
| title | text | NOT NULL, ไม่เป็นค่าว่าง, ความยาว ≤ 100, UNIQUE (user_id, lower(btrim(title))) |
| description | text | nullable, ความยาว ≤ 1000 |
| status | text | NOT NULL, DEFAULT 'pending', CHECK in ('pending','in_progress','done') |
| completed_at | timestamptz | nullable, trigger ตั้งเป็น now() เมื่อ status เปลี่ยนเป็น 'done' และ NULL เมื่อไม่ใช่ |

Index: `user_id`, `(user_id, created_at)`, `(user_id, status, created_at)`

Migration: `20261109000100_todo.sql` (เริ่มต้น), `20261109000200_todo_status_unique_limits.sql` (สถานะ 3 ค่า, completed_at, unique, ความยาว)

## Suggested Components
- `TaskList`, `TaskItem`, `TaskForm`, `TaskStatusFilter`
- Shared: `Pagination`
- Hook: `useTasks`
- Service: `taskService`
- Page: `TodoPage`

## Open Questions
- (ไม่มี)

## Out of Scope
- Due date, Priority, Tags, การจัดเรียงแบบลากวาง
