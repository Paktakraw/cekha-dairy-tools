# PROGRESS.md — Daily Life Portal

> Claude อัปเดตไฟล์นี้ทุกครั้งที่จบ Phase หรือจบ session
> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

## Current Status
- **Current Phase:** Phase 14 ปิดแล้ว — ยังไม่เริ่ม Phase ถัดไป (รอผู้ใช้สั่ง)
- **Status:** Phase 14 (บัญชีผู้ใช้) ผู้ใช้ยืนยันเสร็จแล้ว 2026-11-22 — รอ push + เปิด PR จาก `feature/auth` แล้ว tag `v0.6.0` (เลขใน package.json ปรับเป็น 0.6.0 แล้ว); Phase 12 (ไซส์ไหนคือฉัน) ผู้ใช้ยืนยันเสร็จแล้ว 2026-11-18 — รอ merge PR จาก `feature/size-converter` แล้ว tag `v0.4.0` (เลขใน package.json ปรับเป็น 0.4.0 แล้ว); Phase 11 ปิดแล้ว (merge แล้ว)
- **Last Updated:** 2026-11-22

## Phase Checklist
- [x] Phase 0: Architecture Review (อ่าน spec ทุกไฟล์ใน `docs/features/` + ตอบ Open Questions)
- [x] Phase 1: Project Setup
- [x] Phase 2: App Shell
- [x] Phase 3: Supabase & Auth Foundation
- [x] Phase 4: Feature — To-do List (`docs/features/todo.md`)
- [x] Phase 5: Feature — Randomizer (`docs/features/randomizer.md`)
- [x] Phase 6: Feature — Income & Expense (`docs/features/finance.md`)
  - [x] Categories
  - [x] Transactions
  - [x] Summary & Filters
- [x] Phase 7: Refactoring, Testing & Documentation
- [x] Phase 8: Feature — Calorie (`docs/features/calorie.md`) — เสร็จ ผู้ใช้ยืนยันแล้ว
  - [x] BMR / TDEE (dropdown ระดับกิจกรรม, บันทึกโปรไฟล์)
  - [x] รายการอาหาร (`foods` + ข้อมูลตั้งต้น 102 เมนู)
  - [x] บันทึกอาหารที่กินและคำนวณแคลอรี่
- [x] Phase 9: Feature — Unit Price Comparator (`docs/features/unit-price.md`) — เสร็จ ผู้ใช้ยืนยันแล้ว
- [x] Phase 10: Theme โหมดสว่าง/มืด (`docs/features/theme.md`) — เสร็จ ผู้ใช้ยืนยันแล้ว
  - [x] สรุปรายสัปดาห์/รายเดือน
- [x] Phase 11: Feature — Expiry & Maintenance Tracker (`docs/features/expiry-tracker.md`) — spec ยืนยันแล้ว โค้ดเสร็จ ผู้ใช้ยืนยัน Phase เสร็จแล้ว (2026-11-17)
  - [x] Migration → Types → Service → Hook → UI
  - [x] Pure utils + เทสต์ (วันที่/รอบ/สถานะสี/ตามระยะ/เตือน/สรุปเดือนหน้า/validation)
- [x] Phase 12: Feature — Global Size Converter (`docs/features/size-converter.md`) — spec ยืนยันแล้ว (2026-11-18) โค้ดเสร็จ ผู้ใช้ยืนยัน Phase เสร็จแล้ว (2026-11-18)
- [x] Phase 13: Feature — ตัวฉันวันนี้ / Daily Vibe Check (`docs/features/mood.md`) — spec ยืนยันแล้ว (2026-11-19) โค้ดเสร็จบน `feature/mood` ผู้ใช้ยืนยัน Phase และสั่งปรับเลขเป็น 0.5.0 (2026-11-20) (lint/build/เทสต์ 148 ผ่าน, migration ทดสอบบน Postgres ชั่วคราวผ่าน; รีวิว OCR แล้ว)
- [x] Phase 14: Feature — Auth สมัคร/เข้าสู่ระบบ/ออกจากระบบ (`docs/features/auth.md`) — spec ยืนยันแล้ว (2026-11-21) โค้ดเสร็จบน `feature/auth` แก้ตามผลรีวิว ocr ข้อ 1–7 แล้ว (lint/build/เทสต์ 163 ผ่าน) ผู้ใช้ทดสอบ TC-AUTH-M01–M13 ผ่านบน Supabase จริงและยืนยัน Phase เสร็จ (2026-11-22) เลขเวอร์ชันปรับเป็น 0.6.0; ลืมรหัสผ่าน = ผู้ดูแลตั้งใหม่ให้ตาม `docs/admin-password-reset.md`

## Decisions Log
> รูปแบบ: วันที่ — หัวข้อ — สิ่งที่ตัดสินใจ — เหตุผล

- 2026-11-09 — ตำแหน่ง spec — ย้ายไฟล์ spec ทั้งหมดเข้า `docs/features/` — ให้ตรงกับ CLAUDE.md
- 2026-11-09 — Randomizer: เปลี่ยนกลุ่มระหว่าง Session — Reset อัตโนมัติ — pool ใหม่ไม่ตรงกับเดิม พฤติกรรมคาดเดาได้
- 2026-11-09 — Randomizer: แก้/ลบรายการหรือกลุ่มระหว่าง Session — ลบรายการออกจากทั้งสอง pool, แก้ label ตาม id, ลบ/แก้กลุ่มที่เลือกอยู่ให้ Reset — รักษาความสอดคล้องของ pool
- 2026-11-09 — Randomizer: Session หลังรีเฟรช — หายเมื่อรีเฟรช (ไม่ใช้ localStorage) — เรียบง่าย ไม่มี state ค้าง
- 2026-11-09 — Finance: seed หมวดหมู่ — RPC `seed_default_categories()` idempotent เรียกอัตโนมัติเมื่อยังไม่มีหมวดหมู่ — ผู้ใช้ไม่ต้องทำเอง ไม่ซ้ำ
- 2026-11-09 — Finance: Filter/Summary — Filter ที่ Database, คำนวณ Summary ด้วย pure function ฝั่ง Client — ข้อมูลส่วนบุคคลขนาดเล็ก ทดสอบง่าย
- 2026-11-09 — Finance: สกุลเงิน — แสดงเป็นบาท (฿) — ใช้งานในไทย
- 2026-11-09 — โครงสร้าง shared UI — จัดกลุ่ม `ui/` เป็น button/form/overlay/feedback/toast + barrel `index.ts`, แยก Input/Select/Textarea เป็นไฟล์ละตัว — อ่านง่ายและ import สั้น (ผู้ใช้ยืนยันแล้ว)
- 2026-11-09 — To-do v2 — สถานะเปลี่ยนเป็น pending/in_progress/done (เดิม completed), เพิ่ม `completed_at` ตั้งด้วย DB trigger, ชื่อห้ามซ้ำด้วย unique index (lower(btrim)), จำกัดชื่อ ≤100 และ description ≤1000 (บังคับทั้ง DB และ Form), Pagination 10/หน้าที่ฝั่ง Database, Filter เป็น toggle หลายค่า, Header หน้า sticky — ตามคำขอผู้ใช้; อัปเดต `docs/features/todo.md` แล้ว
- 2026-11-09 — Finance UI — หน้า Transactions เพิ่ม Toggle กรองประเภทที่รายการล่าสุด; หน้า Summary เอาการ์ดยอดคงเหลือ (Net Balance) ออก (ฟังก์ชัน `summarize` ยังคำนวณ netBalance ไว้) — ตามคำขอผู้ใช้
- 2026-11-09 — Design ภาพรวม — (1) Breakpoint หลักของ layout เป็น `lg` (1024px): ต่ำกว่านี้ (มือถือ/แท็บเล็ต) Sidebar เป็น drawer + แถบเมนูบนที่ sticky, padding ของ main ปรับตามจอ (`p-4 sm:p-6 lg:p-8`), Modal เลื่อนได้เมื่อจอเตี้ย; (2) ตั้งแต่ `lg` Sidebar เป็น sticky เต็มความสูงจอ ไม่เลื่อนตามเนื้อหา; (3) ปุ่ม/Toggle/Tab ทุกตัวมีไอคอน (รวม filter สถานะ To-do, dropdown สถานะ, tab Randomizer, filter ประเภท Finance, ปุ่มยืนยันลบใช้ไอคอนถังขยะ); เพิ่ม shared `PageHeader` (sticky header ใช้ร่วมกัน To-do/Randomizer/Finance) — ตามคำขอผู้ใช้
- 2026-11-09 — Finance UI — เพิ่ม shared `CollapsibleSection` (ลูกศรยุบ/ขยาย) ใช้กับ section "เพิ่มรายการ" และ "ตัวกรอง"; ซ่อนด้วย `hidden` ไม่ unmount เพื่อไม่ให้ค่าที่กรอกหาย — ตามคำขอผู้ใช้
- 2026-11-09 — Sidebar บนคอม — ย่อเป็นแถบไอคอน (w-16) / ขยาย (w-64) ได้ด้วยปุ่มที่หัว Sidebar, ค่าเริ่มต้น = ย่อไว้, จำค่าที่ผู้ใช้เลือกใน localStorage (key `sidebar-collapsed`); drawer บนมือถือ/แท็บเล็ตแสดงเต็มเสมอ — ตามคำขอผู้ใช้
- 2026-11-09 — Finance UI — section "เพิ่มรายการ" และ "ตัวกรอง" ตั้งค่าเริ่มต้นเป็นย่อไว้เสมอ (`defaultOpen={false}`, ไม่จำสถานะข้ามการเปิดหน้า) — ตามคำขอผู้ใช้
- 2026-11-09 — การยืนยัน Phase — ผู้ใช้ยืนยัน Phase 6 เสร็จแล้ว และสั่งให้ session ถัดไปเริ่ม Phase 7 ได้ทันทีโดยไม่ต้องรอยืนยันอีก — ผู้ใช้จบงานวันนี้ที่ Phase 6
- 2026-11-09 — Deploy — เพิ่ม `vercel.json` (SPA rewrite ให้ React Router ทำงานเมื่อรีเฟรชที่ path ย่อย); Env บน Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- 2026-11-10 — ภาษา — UI ทั้งแอปเป็นภาษาไทย: ชื่อแอป "เสขาประจำวัน" (เดิมใช้ "พอร์ทัลชีวิตประจำวัน" ผู้ใช้สั่งเปลี่ยนเมื่อ 2026-11-10), ฟีเจอร์ "รายการงาน" / "สุ่มเลือก" / "รายรับ-รายจ่าย", ปุ่ม "ล้างตัวกรอง" / "เริ่มสุ่มใหม่", ข้อความ Login/Auth, `<html lang="th">`, หมวดหมู่เริ่มต้นเป็นไทย (migration ใหม่ เปลี่ยนชื่อเฉพาะแถวที่เป็นชื่อเริ่มต้นเดิมเป๊ะ ๆ) — ตามคำขอผู้ใช้; เพิ่มกฎใน CLAUDE.md ข้อ 5
- 2026-11-10 — Refactor — รวมโค้ดซ้ำ: `serviceFail` (error ของ Service 4 ไฟล์), `ErrorState` (กล่อง error+ลองใหม่ 6 จุด), `FormActions` (ปุ่มยกเลิก/บันทึก 4 ฟอร์ม); ลบ `netBalance` ที่ไม่ใช้; ลบ .gitkeep
- 2026-11-10 — Bundle — lazy load หน้าตามฟีเจอร์ (`lazyPages.ts`) + แยก vendor chunk (react / router / supabase) ผ่าน `manualChunks` ใน vite.config.ts: bundle หลักจาก 553 kB เหลือ 27 kB และคำเตือน chunk ใหญ่เกินหายไป
- 2026-11-10 — เทสต์ — ใช้ `node:test` ของ Node (ไม่ติดตั้งไลบรารีเพิ่ม) เทสต์ pure functions 18 เคส ใน `tests/` รันด้วย `npm test`; ไม่ทำ UI/E2E test เพราะกฎโปรเจกต์ไม่ให้เพิ่มไลบรารีโดยไม่ยืนยัน
- 2026-11-10 — ฟีเจอร์ใหม่ Calorie Calculator — ผู้ใช้ขอโมดูลแคลอรี่ 2 ฟังก์ชัน (1. คำนวณ BMR 2. คำนวณแคลอรี่จากอาหารที่กิน — ร่างแรกตีความข้อ 2 เป็น TDEE ผิด แก้แล้ว); ร่าง spec `docs/features/calorie.md` (id `calorie`, route `/calorie/*`, ตาราง `calorie_profiles` + `food_entries`, สูตร Mifflin-St Jeor) และเพิ่มใน Feature Index เป็น Phase 8 — รอผู้ใช้ยืนยัน spec ตาม CLAUDE.md ข้อ 2.2
- 2026-11-10 — การยืนยัน Phase — ผู้ใช้ยืนยัน Phase 7 ว่าทุกอย่างโอเค (ผมไม่ได้ตรวจสอบเองว่ารัน migration ภาษาไทยแล้วหรือยัง จึงคงสถานะ migration ไว้ตามเดิมด้านล่าง)
- 2026-11-10 — Calorie: แหล่งข้อมูลอาหาร — ไม่ใช้ API ภายนอก (ไม่มี API อาหารไทยที่ฟรี+ใบอนุญาตชัดเจน; ThaiFCD และ HDmall ห้ามคัดลอกโดยไม่ได้รับอนุญาต) ใช้ตาราง `foods` ต่อผู้ใช้ + ข้อมูลตั้งต้น 102 เมนูจากไฟล์ที่ผู้ใช้ให้ (แก้สะกดและตัดรายการซ้ำแล้ว ที่ `docs/features/calorie-foods-seed.csv`, ค่าโดยประมาณ ยังไม่ตรวจกับแหล่งทางการ) seed ผ่าน RPC แบบเดียวกับ Finance; เพิ่ม TDEE (dropdown ระดับกิจกรรม); `food_entries` เก็บสำเนาชื่อ/แคลอรี่ตอนบันทึก — ตามคำขอผู้ใช้; อัปเดต spec แล้ว
- 2026-11-10 — การยืนยัน Phase — ผู้ใช้ยืนยัน Phase 8 (แคลอรี่) เสร็จแล้ว
- 2026-11-16 — การยืนยัน spec Expiry Tracker — ผู้ใช้ตอบ: ชื่อเมนู "อย่าลืมฉัน" path `/expiry-tracker`; เตือนในแอปเท่านั้น; "ทำแล้ว" ไม่มีรอบ = ถามวันครบกำหนดใหม่ (กรอก = เลื่อน, ว่าง = เก็บถาวรผ่านคอลัมน์ `archived_at`); แนบไฟล์ = เตรียมรองรับในอนาคต (ผมตีความว่าเผื่อโครงสร้างเท่านั้น ไม่ทำช่องอัปโหลดเพราะกฎข้อ 10.5 ห้าม UI ที่ไม่มี Function — ผู้ใช้ยังไม่ได้ยืนยันการตีความนี้); ไม่ล็อกชีวมิติ; ยอมรับข้อจำกัด Anonymous; ระดับเตือนเลือกจากชุดสำเร็จรูปและพิมพ์เองได้; สรุปค่าใช้จ่ายเป็นเดือนปฏิทินถัดไป; หน่วยระยะพิมพ์เอง; ไม่เชื่อมรายรับ-รายจ่าย
- 2026-11-16 — Expiry Tracker: การออกแบบ — "ทำแล้ว" ใช้ RPC `complete_reminder` ธุรกรรมเดียว (เพิ่ม log + เลื่อนวัน/เก็บถาวร) วันครบกำหนดใหม่คำนวณฝั่ง Client; รอบเดือนใช้วันสิ้นเดือนเมื่อไม่มีวันนั้น และนับรอบซ้ำจากวันตั้งต้น (ไม่บวกต่อกัน) ไม่ให้เพี้ยนสะสม; ช่องช่าง/ตามระยะแสดงเฉพาะหมวดยานพาหนะ ของใช้ในบ้าน อื่น ๆ; ประวัติเปิดเป็น Modal; หมวดคงที่ในโค้ด ไม่ใช่ตาราง
- 2026-11-16 — Expiry Tracker: ปรับตามผู้ใช้หลังเห็นหน้าจอ — เพิ่มหมวด "รักษาพยาบาล" (`medical`; migration ใหม่ `20261116000200_expiry_tracker_medical.sql` เปลี่ยนเฉพาะ CHECK แทนการแก้ไฟล์เดิมตามกฎข้อ 6), เอาตัวกรองหมวดหมู่ออกจากหน้ารายการ, เอาปุ่ม "เพิ่มรายการแรก" ใน Empty State ออก เหลือปุ่ม "เพิ่มรายการ" (+) ด้านบนปุ่มเดียว; อัปเดต spec/testing/README แล้ว
- 2026-11-17 — Expiry Tracker: แสดงวันที่เตือนที่คำนวณได้ — ในฟอร์มเพิ่ม/แก้ไข ทุกระดับเตือนแสดงวันที่จริง (วันครบกำหนด − N วัน) และมีพรีวิวขณะพิมพ์จำนวนวันเอง (ผมตีความคำขอ "เลือกวันแบบกำหนดเอง" ว่าหมายถึงระดับเตือนล่วงหน้าแบบพิมพ์เอง ไม่ใช่ให้คำนวณวันครบกำหนดจากจำนวนวัน — รอผู้ใช้ยืนยัน)
- 2026-11-17 — Expiry Tracker: ปรับตามผู้ใช้ — (1) เตือนล่วงหน้าเลือกได้ระดับเดียว (UI เท่านั้น คอลัมน์ `remind_before_days` ยังเป็นอาร์เรย์ ไม่ต้องมี migration; รายการเก่าที่มีหลายระดับยังแสดง/ทำงานได้จนกว่าจะแก้ไข), (2) ช่อง "อีกกี่วัน" เติมวันครบกำหนดให้ (ยืนยันการตีความจากข้อความก่อนหน้า: ผู้ใช้ต้องการอย่างนี้) สองช่องสัมพันธ์กันสองทาง
- 2026-11-16 — ฟีเจอร์ใหม่ Expiry & Maintenance Tracker — ผู้ใช้ขอระบบเตือนเอกสารหมดอายุ/ซ่อมบำรุง/ค่าสมาชิก; ร่าง spec `docs/features/expiry-tracker.md` เป็น Phase 11 แบ่งเป็นรอบ: v1 = หมวดหมู่ รอบทำซ้ำ ตามระยะทาง สีไฟจราจร สรุปเดือนหน้า ประวัติ เตือนในแอป; แนบไฟล์ (Storage) รอตัดสินใจ, เตือนนอกแอปและล็อกชีวมิติเลื่อนเฟส เพราะเกิน Stack ปัจจุบัน; รวมหมวด Subscription เข้ากับฟีเจอร์นี้ ไม่สร้างโมดูลแยก — รอผู้ใช้ตอบ Open Questions และยืนยัน spec ตามข้อ 2.2
- 2026-11-13 — การยืนยัน Phase — ผู้ใช้ยืนยัน Phase 10 (Theme) เสร็จแล้ว
- 2026-11-13 — การยืนยัน — ผู้ใช้ยืนยัน Phase 9 และยืนยัน spec Theme; ตอบ Open Questions: ปุ่มอยู่ทั้งแถบบนมือถือและ Sidebar, ใช้แคช localStorage กันหน้าจอวาบ (Supabase เป็นค่าหลัก), ยอมรับข้อจำกัดของผู้ใช้ Anonymous
- 2026-11-13 — Theme: รายละเอียดการออกแบบ — สลับสีกลางของ Tailwind (`--color-white`, `gray-*`, red/emerald/amber/green) ที่ `src/styles/index.css` เมื่อ `<html data-theme="dark">` โดยไม่ต้องใส่ `dark:` ในคอมโพเนนต์ (กลับด้านโทนเทา ปุ่มพื้นเข้ม/ตัวอักษรขาวจึงกลายเป็นพื้นสว่าง/ตัวอักษรมืดเอง); `ThemeProvider` ใน `src/app/providers/` (อยู่ใน AuthProvider), `preferenceService` ใน `src/shared/services/`, ตาราง `user_preferences` + migration; โหลดค่าจาก Supabase แล้วทับแคช ถ้าผู้ใช้กดเองก่อนโหลดเสร็จใช้ค่าที่กด; บันทึกเบื้องหลังโดยส่งเฉพาะค่าล่าสุด; คอมไม่มีแถบบน ปุ่มบนคอมจึงอยู่ที่ Sidebar; `IconButton` เพิ่ม prop `active`; เทสต์ใหม่ 3 เคส (รวม 61)
- 2026-11-13 — ฟีเจอร์ใหม่ Theme สว่าง/มืด — ผู้ใช้ตอบ: เริ่มต้นสว่างเสมอ แล้วเป็นไปตามค่าที่ผู้ใช้เลือก; บันทึกกับบัญชีใน Supabase (ตาราง `user_preferences`); ปุ่ม 2 ปุ่มเป็นไอคอนอย่างเดียว (พระอาทิตย์/พระจันทร์); ร่าง spec `docs/features/theme.md` เป็น Phase 10 — รอผู้ใช้ยืนยัน spec ตามข้อ 2.2 (หมายเหตุ: ยังไม่ได้รับการยืนยัน Phase 9)
- 2026-11-12 — การยืนยัน spec Unit Price — ผู้ใช้พิมพ์ "ยืนยัน spec" เริ่ม Phase 9; ตัวเลือกหน่วยผลลัพธ์ต่อกลุ่ม: น้ำหนัก 1 ก./100 ก./1 กก., ปริมาตร 1 มล./100 มล./1 ล. (ค่าเริ่มต้น 100), ชิ้น 1 ชิ้น
- 2026-11-12 — Design Unit Price (ผู้ใช้ขอหลังเห็นงาน) — (1) ผลแสดงเมื่อกดปุ่ม "เปรียบเทียบ" เท่านั้น และถูกล้างเมื่อแก้ข้อมูล (แทนการอัปเดตทันทีใน spec เดิม; อัปเดต spec แล้ว); (2) ตัวเลือกวางเป็นคอลัมน์เคียงข้างกันทุกขนาดจอ (2–3 คอลัมน์) dropdown หน่วยใช้ชื่อย่อ; (3) ป้าย "คุ้มที่สุด" เป็นสีเขียว (ขยายข้อยกเว้นสีเขียวจาก CLAUDE.md ข้อ 5 ตามที่ผู้ใช้ขอ)
- 2026-11-12 — Unit Price: รายละเอียดการออกแบบ — คำนวณฝั่ง Client ล้วน (`utils/unitPrice.ts`, `units.ts`, `format.ts`); ราคาเท่ากันตัดสินด้วย tolerance สัมพัทธ์ 1e-9; ตัวเลือกที่ไม่ถูกต้องถูกข้ามจากการเทียบ; ไม่มี Supabase/migration/service; เทสต์ใหม่ 19 เคส (รวม 58)
- 2026-11-12 — ตอบ Open Questions Unit Price — ไม่เก็บประวัติ (ไม่มี DB), สูงสุด 3 ตัวเลือก, ไม่มีช่องจำนวนแพ็ก, ผู้ใช้เลือกหน่วยผลลัพธ์เองได้, หน่วยนับ "ชิ้น" คำเดียว, ชื่อเมนู "เทียบราคาต่อหน่วย" `/unit-price`; อัปเดต spec แล้ว — ยังรอผู้ใช้พิมพ์ "ยืนยัน spec"
- 2026-11-12 — ฟีเจอร์ใหม่ Unit Price Comparator — ผู้ใช้ขอโมดูลเทียบราคาต่อหน่วย (2–3 ตัวเลือก; กรัม/มก./กก., มล./ล., ชิ้น); ร่าง spec `docs/features/unit-price.md` (id `unit-price`, ไม่มี Database ใน v1, คำนวณฝั่ง Client เป็น pure function) และเพิ่มใน Feature Index เป็น Phase 9 — รอผู้ใช้ตอบ Open Questions และยืนยัน spec ตาม CLAUDE.md ข้อ 2.2
- 2026-11-10 — การยืนยัน spec Calorie — ผู้ใช้ตอบ Open Questions: บันทึกโปรไฟล์ลง Supabase, ใช้ตัวคูณกิจกรรมมาตรฐาน, สูตร Mifflin-St Jeor อย่างเดียว, ดูย้อนหลังได้ทุกวัน + สรุปเทียบรายสัปดาห์/รายเดือน (เพิ่มจาก spec เดิม), ชื่อเมนู "แคลอรี่" และพิมพ์ "ยืนยัน spec"
- 2026-11-10 — Calorie: รายละเอียดการออกแบบ — TDEE = BMR ที่ปัดแล้ว × ตัวคูณ (ผู้ใช้ตรวจสอบเองได้); แคลอรี่ต่อรายการปัดครั้งเดียวด้วยจำนวนเต็ม (`entryCalories`); สัปดาห์เริ่มวันจันทร์; ค่าเฉลี่ยต่อวันคิดเฉพาะวันที่มีบันทึก; สรุปช่วงคำนวณฝั่ง client (pure function) เหมือน Finance; seed อาหารผ่าน RPC `seed_default_foods()` ต่อผู้ใช้ (RLS ไม่ต้องมีตารางกลาง); `food_entries` เก็บสำเนาชื่อ/หน่วย/แคลอรี่ (`food_id` เป็น ON DELETE SET NULL); โปรไฟล์ใช้ upsert `onConflict: user_id`; เพิ่ม `formatMonth` ใน shared
- 2026-11-10 — Design (มือถือ) — (1) Header มือถือเปลี่ยนจาก sticky เป็น `fixed` + spacer h-14 ใน MainLayout และ `overflow-x-clip` ที่ root กันหน้าเลื่อนซ้ายขวา (PageHeader ยัง sticky ที่ top-14); (2) ตารางรายการ Finance เหลือ 3 คอลัมน์ซ้อนสองบรรทัด (วันที่/ประเภท · รายละเอียด/หมวดหมู่ · จำนวนเงิน/ปุ่ม) ไม่ต้องเลื่อนซ้ายขวา ใช้ทุกขนาดจอ; (3) เมนูย่อยแคลอรี่: ปุ่มเล็กลง เรียง บันทึกอาหาร · สรุป · BMR/TDEE และย้าย "รายการอาหาร" ไปท้ายสุดแบบไม่มีกรอบสีจาง (มือถือเหลือไอคอน); (4) หน้าบันทึกอาหาร: มื้อเช้า/กลางวัน/เย็น/ของว่างใช้ `CollapsibleSection` ยุบไว้เป็นค่าเริ่มต้น แสดงจำนวนรายการและแคลอรี่รวมข้างชื่อ — ตามคำขอผู้ใช้
- 2026-11-10 — Design แคลอรี่ หน้าบันทึกอาหาร — ปุ่ม "เพิ่มอาหาร" ย้ายไปชิดขวาในแถวเดียวกับหัวข้อวันที่เหนือการ์ดแคลอรี่รวม (ไม่ใช่แถวตัวเลือกวันที่) และลดขนาดปุ่ม: เพิ่ม prop `size` ('md' | 'sm') ให้ `Button` และ `IconButton` (shared) — ตามคำขอผู้ใช้ (เข้าใจผิดครั้งแรกว่าหมายถึงแถวตัวเลือกวันที่ แก้แล้ว)
- 2026-11-13 — เปลี่ยนชื่อโมดูลที่แสดงในแอป (ผู้ใช้ขอ) — รายการงาน → วันนี้ทำอะไรดี, สุ่มเลือก → สับสนช่วยหน่อย, รายรับ-รายจ่าย → เงินฉันไปไหน, แคลอรี่ → ผอมไปด้วยกัน, เทียบราคาต่อหน่วย → อันไหนถูกกว่า บอกมา; เปลี่ยนเฉพาะ `name` ใน `index.tsx` ของแต่ละฟีเจอร์ หัวข้อหน้า (h1) และ aria-label เมนูย่อย ส่วน id/path/โฟลเดอร์/ข้อความอื่นไม่เปลี่ยน (Sidebar, หน้าหลัก, Router อ่านจาก Registry อัตโนมัติ); spec เดิมที่อ้างชื่อเก่าในประวัติการตัดสินใจจึงไม่แก้
- 2026-11-18 — ฟีเจอร์ใหม่ Global Size Converter — ผู้ใช้ขอโมดูล "ไซส์ไหนคือฉัน" (โปรไฟล์สัดส่วนหลายคน ตัวแปลงรองเท้า/เสื้อ/กางเกง/แหวน/หมวก คำแนะนำเผื่อไซส์ จดไซส์ที่เคยใส่); ตรวจสูตรที่ผู้ใช้ให้มาแล้วปรับ 3 จุดใน spec: US หญิง = US ชาย + 1.5, ใช้ส่วนเผื่อหัวรองเท้า 1.7 cm ค่าเดียว, เบอร์แหวน EU แสดงทั้งแบบ ISO (รอบวง−40) และรอบวงตรง ๆ ไม่แสดงมาตรฐานแหวน "ไทย" เพราะไม่มีแหล่งยืนยัน; ร่าง spec `docs/features/size-converter.md` เป็น Phase 12 บน branch `docs/size-converter-spec` — ผู้ใช้ตอบ Open Questions ครบ 7 ข้อแล้ว (ไม่ทำฐานข้อมูลแบรนด์/หมวดเด็ก/widget/คู่มือภาพ เน้นผู้ใช้วัยรุ่น) — รอผู้ใช้ยืนยัน spec ตามข้อ 2.2
- 2026-11-18 — Phase 12 ระหว่างทำ — เสื้อผ้ามีตัวเลือกแค่ พอดีตัว/Oversize (+1 ไซส์), รองเท้า ปกติ/หน้าเท้ากว้าง (+0.5 cm), ตัดกระโปรงออกจาก v1 (ไม่มีแหล่งอ้างอิง), ตารางเสื้อผ้าเป็นค่าประมาณจากหลายแหล่ง; โปรไฟล์แรกตั้ง is_self อัตโนมัติ (ใช้เป็นค่าเริ่มต้นที่เลือก) แต่ไม่แสดงป้าย "ฉัน" ตามที่ผู้ใช้สั่ง
- 2026-11-19 — ฟีเจอร์ใหม่ ตัวฉันวันนี้ (Daily Vibe Check) — ผู้ใช้ขอโมดูลเช็กอารมณ์ด้วยอิโมจิ 5 ระดับ + แท็กบริบท + ปฏิทิน/การ์ดสรุปแชร์ภาพ + การ์ดปลอบใจ; ร่าง `docs/features/mood.md` เป็น Phase 13 บน branch `docs/mood-spec`; ชี้ว่าส่วน "เทียบกับการดื่มน้ำ" และ "เสียงฝนโหมด Focus" อ้างฟีเจอร์ที่ยังไม่มีในแอป จึงตั้งเป็น Open Questions/Out of Scope แทนการสร้างเอง — รอผู้ใช้ตอบและยืนยัน spec ตามข้อ 2.2
- 2026-11-19 — ตัวฉันวันนี้ ผู้ใช้ยืนยัน spec — ตัดน้ำและปุ่มแชร์ออก, ขยายข้อยกเว้นสีเป็นโทนหม่น 5 ระดับ (เฉพาะฟีเจอร์นี้), ปฏิทินเริ่มวันอาทิตย์, ใส่เบอร์ 1323, แจ้งเตือนเช็กอินแสดงในหน้าฟีเจอร์เอง
- 2026-11-19 — ตัวฉันวันนี้ เพิ่มเมนู "ตั้งค่า" ให้ผู้ใช้เพิ่ม/แก้/ลบแท็กเรื่องราว-กิจกรรมเอง (ผู้ขอเพิ่มหลังโค้ดแรกเสร็จ; เดิมอยู่ใน Out of Scope) — ผู้ใช้ตอบ: ลบแท็กแล้วถอดออกจากเช็กอินเก่าด้วย, แก้/ลบได้ทุกแท็กรวมแท็กเริ่มต้น, ชื่อ ≤ 20 ตัวอักษร รวม ≤ 30 แท็ก ห้ามซ้ำในกลุ่ม; ออกแบบ: ตาราง `mood_tags` + `mood_entries.tags` เก็บ id เป็นข้อความ (ไม่ใช้ตารางเชื่อม เพื่อคงโค้ด upsert เดิม) + trigger ถอดแท็กตอนลบ/ตรวจ id ตอนเขียน, migration ใหม่ `…000200_mood_custom_tags.sql` (ไม่แก้ไฟล์แรก) พร้อมแปลงข้อมูลเดิม; อัปเดต spec `docs/features/mood.md` หัวข้อ 6
- 2026-11-19 — เอกสารระดับระบบ — ผู้ใช้สั่งสร้างโฟลเดอร์ `docs/spec/` (PRD แบบเรียบง่ายเน้นฝั่งธุรกิจ + System Design: สถาปัตยกรรม ER/schema ฐานข้อมูล workflow sequence diagram) และ `docs/testing/` (test case พร้อมรหัสเคส + ผลทดสอบรอบล่าสุด) อัปเดตถึงโค้ดปัจจุบัน (v0.4.1) และเพิ่มกฎใน CLAUDE.md ข้อ 10.11: ก่อนเปิด PR ต้องอัปเดตเอกสารเหล่านี้ให้ตรงกับโค้ดก่อนเสมอ; test-cases.md สร้างจากชื่อเทสต์ใน `tests/` และเช็กลิสต์ใน `docs/testing.md` (ผลรายข้อของการทดสอบด้วยมือไม่เคยถูกบันทึก ระบุไว้ตรง ๆ ใน test-results.md)

## Completed Work
- Phase 0: อ่าน spec, ตัดสิน Open Questions, อัปเดต spec ใน `docs/features/`
- Phase 1: Vite + React 19 + TS strict, Tailwind v4 (`@tailwindcss/vite`), react-router-dom, lucide-react, @supabase/supabase-js, โครงโฟลเดอร์ตาม CLAUDE.md 4.3, `.env.example`, `.env` อยู่ใน .gitignore; `npm run build` และ `npm run lint` ผ่าน
- Phase 2: `FeatureConfig` + `featureRegistry.ts` (Sidebar/Portal/Router สร้างจาก Registry), MainLayout/Sidebar/Header (Mobile drawer), PortalHomePage, NotFoundPage, Shared UI (Button, IconButton พร้อม tooltip+aria-label, Input/Select/Textarea ใน `Field.tsx`, Modal, ConfirmDialog, EmptyState, Spinner, Toast + `useToast`), placeholder 3 ฟีเจอร์; build และ lint ผ่าน
- Phase 3 (โค้ด): `shared/lib/supabase.ts`, `AuthProvider`/`AuthContext`/`useAuth`, `ProtectedRoute` (แสดง loading/error+retry), `LoginPage` โครงเปล่า, `vite-env.d.ts`, core migration `supabase/migrations/20261109000000_core.sql` (`set_updated_at()`); build/lint ผ่าน ทดสอบ anonymous sign-in กับ Supabase จริงแล้ว (ผู้ใช้ยืนยัน)
- 2026-11-09 — Env var — ใช้ `VITE_SUPABASE_URL` และ `VITE_SUPABASE_PUBLISHABLE_KEY` (ไม่ใช้ชื่อ anon) — ตรงกับคำเรียกของ Supabase และ `.env` ของผู้ใช้
- Phase 4 (โค้ด): migration `20261109000100_todo.sql` (tasks + trigger + RLS 4 policy), `types/task.ts`, `taskService` (คืน `ServiceResult`), `useTasks`, `TaskForm`/`TaskItem`/`TaskList`, `TodoPage` (Loading/Error+retry/Empty, Toast, ConfirmDialog ตอนลบ, คลิกที่งานเพื่อขยายรายละเอียด); build/lint ผ่าน ยังไม่ได้ทดสอบกับ Supabase จริง
- Phase 4: To-do List เสร็จและผู้ใช้ยืนยันแล้ว (รวมสถานะ 3 ค่า+สี, Pagination, Filter, completed_at)
- Phase 5 (โค้ด): migration `20261109000300_randomizer.sql`, `types/random.ts`, `utils/pool.ts` (pure: buildPool/splitPool/pickRandomItem — ทดสอบด้วย Node แล้วผ่าน), `randomService`, `useGroups` (CRUD), `useRandomSession` (derive pool จาก items+excludedIds ตาม Decisions Log), components (GroupSelector, RandomPicker, ExcludedList, GroupList, ItemList, GroupForm, ItemForm, NameForm), `RandomizerPage` 2 แท็บ; build/lint ผ่าน ยังไม่ได้ทดสอบกับ Supabase จริง
- Phase 5: Randomizer เสร็จและผู้ใช้ยืนยันแล้ว (รวม animation สุ่ม ~1 วินาที และยุบ/ขยายกลุ่ม)
- Phase 6 (โค้ด): migration `20261109000400_finance.sql` (categories, transactions, composite FK, RLS, RPC seed), types/constants, `categoryService`/`transactionService`, hooks (`useCategories`, `useTransactions`, `useTransactionFilters`), `utils/summary.ts` (pure, ทดสอบด้วย Node แล้วผ่าน), shared `formatCurrency`/`formatDate`, components (categories/transactions/summary), `FinanceLayout` + 3 หน้า (`/finance/transactions|summary|categories`); build/lint ผ่าน ยังไม่ได้ทดสอบกับ Supabase จริง
- Phase 7: ภาษาไทยทั้งแอป, Refactor, lazy load + vendor chunks, เทสต์ 18 เคส (`npm test`), ตรวจ DB แบบอ่านอย่างเดียว (ครบ 5 ตาราง, คอลัมน์ใหม่มี, RLS ซ่อนข้อมูลจากผู้ใช้ที่ไม่ล็อกอิน, seed RPC ปฏิเสธ anon), เอกสาร: `README.md`, `docs/adding-a-feature.md`, `docs/future-login.md`, `docs/testing.md`; lint/build/test ผ่าน
- Phase 8 (โค้ด): migration `20261110000200_calorie.sql` (3 ตาราง + RLS + trigger + RPC seed 102 เมนู จาก `docs/features/calorie-foods-seed.csv`), `types/calorie.ts`, `constants.ts`, utils (`bmr`, `summary`, `dates`, `format` — pure), services (`profileService`, `foodService`, `entryService`), hooks (`useBmrProfile`, `useFoods`, `useFoodEntries`), components (BmrForm, BmrResultCards, FoodPicker, FoodEntryForm, MealSection, DaySummaryCard, DateNavigator, CalorieBar, FoodForm), pages 4 หน้า (`/calorie/food|summary|foods|bmr`), ลงทะเบียนใน Registry; เทสต์ใหม่ 21 เคส (รวม 39); lint/build/test ผ่าน ยังไม่ได้ทดสอบกับ Supabase จริง

## Migrations Applied
- `20261119000200_mood_custom_tags.sql` — เขียนแล้ว **ยังไม่ได้รันบน Supabase จริง** (ทดสอบบน Postgres ชั่วคราวผ่าน: แปลงข้อมูลเดิม, seed, trigger จำกัด 30/ถอดแท็กตอนลบ, RLS) ต้องรันหลัง `…000100_mood.sql`
- `20261119000100_mood.sql` — เขียนแล้ว **ยังไม่ได้รันบน Supabase จริง** (ทดสอบบน Postgres ชั่วคราว: เพิ่ม/upsert ได้, RLS แยกผู้ใช้, CHECK/UNIQUE ปฏิเสธค่าผิด) ต้องรันหลัง core migration
- `20261109000000_core.sql` — ต้องรันก่อน (ผู้ใช้เป็นผู้รัน)
- `20261109000100_todo.sql` — ผู้ใช้รันแล้ว/ต้องรันก่อน
- `20261109000200_todo_status_unique_limits.sql` — ผู้ใช้รันแล้ว
- `20261109000300_randomizer.sql` — ผู้ใช้รันแล้ว
- `20261109000400_finance.sql` — ผู้ใช้รันและทดสอบแล้ว (ผู้ใช้ยืนยัน Phase 6)
- `20261110000100_finance_thai_categories.sql` — เขียนแล้ว **ยังไม่ได้รันบน Supabase** (ผู้ใช้ยืนยัน Phase 7 แล้ว แต่ผมไม่ได้ตรวจว่ารันหรือยัง)
- `20261110000200_calorie.sql` — ผู้ใช้รันบน Supabase แล้ว (ตรวจพบ 3 ตาราง / 12 policies / 1 function) และยืนยัน Phase 8
- `20261113000100_user_preferences.sql` — ผู้ใช้รันแล้วและยืนยัน Phase 10
- `20261116000200_expiry_tracker_medical.sql` — เขียนแล้ว **ยังไม่ได้รันบน Supabase จริง** (ทดสอบบน Postgres ชั่วคราว: ข้อมูลเดิมไม่กระทบ, รับ `medical`, ปฏิเสธหมวดอื่นที่ไม่รู้จัก) ต้องรันหลังไฟล์ `…000100`
- `20261116000100_expiry_tracker.sql` — เขียนแล้ว **ยังไม่ได้รันบน Supabase จริง** (ผมทดสอบกับ PostgreSQL 14 ชั่วคราวในเครื่องที่จำลอง `auth.uid()`: สร้างได้, RPC ทั้งเลื่อนวัน/เก็บถาวรถูกต้อง, CHECK ปฏิเสธค่าผิด, RLS แยกผู้ใช้, anon เรียก RPC ไม่ได้, ลบรายการแล้วประวัติหายตาม)

## Known Issues / TODO
- ตัวฉันวันนี้: ยังไม่ได้ทดสอบหน้าจอจริง/Responsive/โหมดมืด (สีพื้นระดับอารมณ์ 5 ระดับ) ด้วยตา และยังไม่ได้ทดสอบกับ Supabase จริง; ข้อความให้กำลังใจ/ปลอบใจเป็นร่างภาษาวัยรุ่นของ Claude ผู้ใช้ปรับเองได้ที่ `src/features/mood/utils/messages.ts`; เบอร์สายด่วน 1323 (กรมสุขภาพจิต) ผู้ใช้สั่งให้ใส่ — ควรตรวจเบอร์ล่าสุดกับแหล่งทางการก่อนปล่อยจริง (ยังไม่ได้ตรวจออนไลน์ใน session นี้)
- ยังไม่ได้ตรวจ Responsive ด้วยตาจริงบนอุปกรณ์/เบราว์เซอร์ (ตรวจจากโค้ดเท่านั้น) และยังไม่ได้รันรายการตรวจด้วยมือใน `docs/testing.md` กับข้อมูลจริง (ผู้ใช้ต้องทำ)
- ไม่มีเทสต์ระดับ UI/E2E (ต้องเพิ่มไลบรารี เช่น Vitest + Testing Library หรือ Playwright — รอผู้ใช้ยืนยัน)
- ผู้ใช้จะขอปรับเพิ่มเติมหลังเห็นหน้าซอฟต์แวร์จริง (หลัง Phase 2 เป็นต้นไป)
- Calorie: ตัวเลขแคลอรี่ของอาหารตั้งต้น 102 เมนูเป็นค่าประมาณที่ไม่ทราบที่มา ยังไม่ได้ตรวจกับแหล่งทางการ (แอปแสดงป้าย "ค่าโดยประมาณ"); ตัวคูณกิจกรรมยังไม่ได้เทียบกับบทความ Petcharavej (เปิดไม่ได้)
- Calorie: การ upsert โปรไฟล์ (`onConflict: user_id`) และ RPC seed ยังไม่ได้ทดสอบกับ Supabase จริง; ถ้าผู้ใช้ลบอาหารจนหมด ระบบ seed กลับมาให้ตอนเปิดหน้าครั้งถัดไป
- Calorie: ยังไม่ได้ตรวจ Responsive ด้วยตาจริง
- Theme: ผู้ใช้รัน migration และทดสอบผ่านแล้ว (ตามที่ผู้ใช้แจ้ง ผมไม่ได้ตรวจเอง)
- Expiry Tracker: ยังไม่ได้ทดสอบหน้าจอจริง/Responsive/โหมดมืดด้วยตา และยังไม่ได้ทดสอบกับ Supabase จริง (ทดสอบเฉพาะ pure function และ SQL บน Postgres ชั่วคราว); เตือนได้เฉพาะตอนเปิดแอป ไม่มีการเตือนนอกแอป
- Size Converter: ยังไม่ได้ทดสอบหน้าจอจริง/Responsive/โหมดมืดด้วยตา และยังไม่ได้ทดสอบกับ Supabase จริง; ตารางเสื้อผ้าเป็นค่าประมาณจากหลายแหล่งที่ไม่ตรงกัน (JP ยืนยันไม่ได้แน่ชัด)
- Unit Price: ยังไม่ได้ทดสอบหน้าจอจริง/Responsive ด้วยตา (ทดสอบเฉพาะ pure function)

## Next Step
- Phase 14 (บัญชีผู้ใช้): push `feature/auth` → เปิด PR (label `feature`) → merge → tag `v0.6.0`; ตั้ง `VITE_AUTH_EMAIL_DOMAIN` ใน Vercel (ค่า `VITE_*` ฝังตอน build ต้อง Redeploy) และปิด Confirm email บน Supabase ของ production; รัน `20261121000100_auth_profiles.sql` บน production; เลขเวอร์ชันใน package.json เป็น 0.6.0 แล้ว (ยังไม่ได้ tag)
- Phase 13 (ตัวฉันวันนี้): ผู้ใช้เปิด PR จาก `feature/mood` (label `feature`) → merge → tag `v0.5.0` → รัน `20261119000100_mood.sql` แล้ว `20261119000200_mood_custom_tags.sql` ตามลำดับใน SQL Editor (ถ้ายังไม่ได้รัน) → ทดสอบตามเช็กลิสต์ใน `docs/testing.md` (ยังไม่มีบันทึกผลรายข้อ)
- ผู้ใช้: merge PR จาก `feature/size-converter` (label `feature`) → สร้าง tag/release `v0.4.0` จาก `main` (เลขใน `package.json` เป็น 0.4.0 แล้ว) → รัน `20261118000100_size_converter.sql` ใน SQL Editor ถ้ายังไม่ได้รัน
- ยังไม่เริ่ม Phase ถัดไป จนกว่าผู้ใช้สั่ง; Login จริงดู `docs/future-login.md`; ฟีเจอร์ Debtor / Appointment ต้องเริ่มจาก spec ตามข้อ 2.2
