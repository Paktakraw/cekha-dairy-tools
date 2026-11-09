# Feature: <ชื่อฟีเจอร์>

- **ID:** `<feature-id>`
- **Route:** `/<feature-id>`
- **Folder:** `src/features/<feature-id>/`
- **Status:** In scope (Phase <N>)

## Overview
<ฟีเจอร์นี้ทำอะไร ใช้ในสถานการณ์ไหน 1–3 บรรทัด>

## Requirements
- <สิ่งที่ผู้ใช้ทำได้ แยกเป็น Create / Read / Update / Delete หรือแยกตามหน้าจอ>
- <กฎทางธุรกิจ เช่น validation, ข้อห้าม>
- มี Loading, Error, Empty State และ Toast ตามกฎกลาง

## Database
ตาราง `<table_name>` (+ คอลัมน์มาตรฐานตาม CLAUDE.md ข้อ 6)

| Field | Type | Rule |
|---|---|---|
| <field> | <type> | <NOT NULL / CHECK / FK / UNIQUE> |

Index: `user_id`, <ฟิลด์ที่ใช้ Filter/Sort>

## Suggested Components
- Components: <...>
- Hooks: <...>
- Services: <...>
- Pages: <...>

## Open Questions
1. <สิ่งที่ต้องตัดสินใจก่อนเริ่มทำ>

## Out of Scope
- <สิ่งที่ไม่ทำในเวอร์ชันนี้>
