# PROGRESS.md — Daily Life Portal

> Claude อัปเดตไฟล์นี้ทุกครั้งที่จบ Phase หรือจบ session
> อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

## Current Status
- **Current Phase:** Phase 7 — Refactoring, Testing & Documentation
- **Status:** Not started (Phase 6 ผู้ใช้ยืนยันเสร็จแล้ว)
- **Last Updated:** 2026-11-09

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
- [ ] Phase 7: Refactoring, Testing & Documentation

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

## Migrations Applied
- `20261109000000_core.sql` — ต้องรันก่อน (ผู้ใช้เป็นผู้รัน)
- `20261109000100_todo.sql` — ผู้ใช้รันแล้ว/ต้องรันก่อน
- `20261109000200_todo_status_unique_limits.sql` — ผู้ใช้รันแล้ว
- `20261109000300_randomizer.sql` — ผู้ใช้รันแล้ว
- `20261109000400_finance.sql` — ผู้ใช้รันและทดสอบแล้ว (ผู้ใช้ยืนยัน Phase 6)

## Known Issues / TODO
- ผู้ใช้จะขอปรับเพิ่มเติมหลังเห็นหน้าซอฟต์แวร์จริง (หลัง Phase 2 เป็นต้นไป)

## Next Step
- เริ่ม Phase 7 ได้ทันที: ตรวจ Structure/Duplication/Error Handling/Responsive, ทดสอบ CRUD และ Edge Cases ทุกฟีเจอร์, เขียน `README.md`, `docs/adding-a-feature.md`, สรุปแนวทางเพิ่ม Login จริง
- ผู้ใช้กำลังจะ push ขึ้น GitHub และ deploy บน Vercel (ดูขั้นตอนใน Decisions Log)
