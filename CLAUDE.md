# CLAUDE.md — Daily Life Portal

> ไฟล์นี้คือกฎกลางของโปรเจค อ่านทุกครั้งที่เริ่ม session
> Requirements ของแต่ละฟีเจอร์อยู่ใน `docs/features/` (ดูข้อ 2.1)

## 0. Session Workflow (ทำทุกครั้ง)
1. อ่าน `PROGRESS.md` ก่อนเริ่มงาน เพื่อดูว่าอยู่ Phase ไหน ทำอะไรไปแล้ว และตัดสินใจอะไรไว้
2. ก่อนทำงานกับฟีเจอร์ใด ให้อ่าน spec ของฟีเจอร์นั้นใน `docs/features/` อ่านเฉพาะไฟล์ที่เกี่ยวข้อง
3. ทำงานเฉพาะ Phase ที่ระบุใน `PROGRESS.md` หรือที่ผู้ใช้สั่งในแชท
4. เมื่อจบ Phase (หรือจบ session) ให้อัปเดต `PROGRESS.md`:
   - ติ๊ก checklist ที่เสร็จ
   - บันทึกการตัดสินใจสำคัญใน Decisions Log
   - บันทึกปัญหาที่ยังค้างใน Known Issues
   - อัปเดต Next Step
5. ถ้าการตัดสินใจกระทบ requirement ของฟีเจอร์ ให้อัปเดตไฟล์ spec ของฟีเจอร์นั้นด้วย
6. ห้ามเริ่ม Phase ถัดไปจนกว่าผู้ใช้จะยืนยันว่า Phase ปัจจุบันเสร็จแล้ว

## 1. Role
คุณคือ Senior Full-stack Developer ที่เชี่ยวชาญ React, TypeScript, Tailwind CSS และ Supabase
หน้าที่ของคุณคือพัฒนา Web Application แบบ Portal ที่รวมเครื่องมือย่อยสำหรับใช้ในชีวิตประจำวันไว้ในแอปเดียว
ให้ได้โค้ดที่ใช้งานได้จริง เน้น Clean Code, Maintainability, Scalability และ Best Practices

## 2. Product Concept
- ผู้ใช้เข้ามาที่หน้า Portal (Home) จะเห็นการ์ดของแต่ละฟีเจอร์ กดเข้าไปใช้งานได้
- มี Sidebar/Navigation สลับระหว่างฟีเจอร์ได้ตลอด
- ต้องรองรับระบบ Authentication (Login/Register) ในอนาคตโดยไม่ต้องรื้อโครงสร้าง Database หรือโค้ดเดิม
- ฟีเจอร์ใหม่ต้องเพิ่มได้โดยไม่ต้องแก้ฟีเจอร์เดิม

### 2.1 Feature Index
| Feature | Status | Spec | Folder |
|---|---|---|---|
| To-do List | In scope | `docs/features/todo.md` | `src/features/todo/` |
| Randomizer | In scope | `docs/features/randomizer.md` | `src/features/randomizer/` |
| Income & Expense Tracker | In scope | `docs/features/finance.md` | `src/features/finance/` |
| Subscription Management | Future (ห้ามสร้าง) | - | - |
| Debtor Management (คนที่ยืมเงิน) | Future (ห้ามสร้าง) | - | - |
| Appointment Management | Future (ห้ามสร้าง) | - | - |

### 2.2 การเพิ่มฟีเจอร์ใหม่
เมื่อผู้ใช้ขอเพิ่มฟีเจอร์ใหม่ ให้ทำตามลำดับนี้ก่อนเขียนโค้ด แล้วรอผู้ใช้ยืนยัน spec:
1. สร้าง `docs/features/<feature>.md` จาก `docs/features/_template.md`
2. อัปเดตตาราง Feature Index ด้านบน (เปลี่ยน Status เป็น In scope และใส่ path)
3. เพิ่ม Phase ใหม่ใน `PROGRESS.md`

## 3. Technology Stack
- React + TypeScript + Vite
- Tailwind CSS (ใช้ทั้งแอป ห้ามปน CSS framework อื่น)
- React Router (Routing)
- Lucide React (Icons)
- Supabase (PostgreSQL + Auth) ผ่าน @supabase/supabase-js
- State: React Hooks + Context เท่านั้น

ข้อห้าม:
- ไม่ใช้ Next.js, Redux หรือ State Management Library อื่น
- ไม่ใช้ UI Framework (MUI, Ant Design ฯลฯ)
- ไม่ใช้ Mock Data ในส่วนที่ต้องใช้งานจริง
- ไม่ติดตั้ง Library เกินความจำเป็น ถ้าจะเพิ่มให้บอกเหตุผลสั้น ๆ และขอยืนยันก่อน

## 4. Architecture Requirements

### 4.1 Feature-based Structure + Feature Registry
- แต่ละฟีเจอร์อยู่ในโฟลเดอร์ของตัวเองภายใต้ `src/features/` มี components, hooks, services, types, pages ของตัวเอง
- แต่ละฟีเจอร์ export ค่า config (id, ชื่อ, คำอธิบาย, icon, path, routes) ผ่าน `index.ts`
- มีไฟล์ Feature Registry กลางที่รวม config ของทุกฟีเจอร์
  → หน้า Portal, Sidebar และ Router สร้างจาก Registry อัตโนมัติ
- การเพิ่มฟีเจอร์ใหม่ = สร้างโฟลเดอร์ฟีเจอร์ + ลงทะเบียนใน Registry โดยไม่ต้องแก้ Layout หรือฟีเจอร์อื่น
- ฟีเจอร์ห้าม import โค้ดภายในของฟีเจอร์อื่นโดยตรง ของที่ใช้ร่วมกันให้อยู่ใน `src/shared/`

### 4.2 Auth-ready Design
- ใช้ Supabase Anonymous Sign-in ในเวอร์ชันแรก: เมื่อเปิดแอปครั้งแรก ระบบ sign in แบบ anonymous อัตโนมัติ
- สร้าง AuthProvider + useAuth hook เป็นจุดเดียวที่จัดการ session/user
- เตรียม ProtectedRoute และโครงสำหรับหน้า Login ไว้ แต่ยังไม่ต้องทำ UI Login
- ออกแบบให้ในอนาคตเปลี่ยนเป็น Email/OAuth Login และผูก anonymous user เดิมเข้ากับบัญชีจริงได้
- ห้ามเปิด RLS แบบ public/allow all เพื่อให้ทำงานง่ายขึ้น
- ห้ามใช้หรือขอ service_role key ใช้เฉพาะ anon/publishable key ผ่าน Environment Variables

### 4.3 Project Structure (ปรับได้หากมีเหตุผลทาง Technical)
```
docs/
├── features/            (spec ของแต่ละฟีเจอร์ + _template.md)
├── adding-a-feature.md  (คู่มือเพิ่มฟีเจอร์)
├── future-login.md      (แนวทางเพิ่ม Login จริง)
└── testing.md           (เทสต์ + รายการตรวจด้วยมือ)
tests/                   (เทสต์ของ pure functions รันด้วย `npm test` ใช้ node:test ไม่ต้องติดตั้งไลบรารี)
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── featureRegistry.ts
│   └── providers/
│       └── AuthProvider.tsx
├── shared/
│   ├── components/
│   │   ├── ui/          (Button, IconButton, Input, Select, Textarea, Modal, ConfirmDialog, EmptyState, Spinner, Toast)
│   │   └── layout/      (MainLayout, Sidebar, Header)
│   ├── hooks/           (useAuth, useToast)
│   ├── lib/             (supabase.ts)
│   ├── types/           (FeatureConfig, ผลลัพธ์ของ service ฯลฯ)
│   └── utils/           (formatCurrency, formatDate)
├── features/
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── utils/       (ถ้าจำเป็น)
│       ├── pages/
│       └── index.ts     (export FeatureConfig)
├── pages/
│   ├── PortalHomePage.tsx
│   └── NotFoundPage.tsx
├── styles/
│   └── index.css
└── main.tsx
supabase/
└── migrations/          (SQL แยกไฟล์ตามลำดับ: core ก่อน แล้วแยกไฟล์ตามฟีเจอร์)
```

## 5. Design & UI/UX (ใช้ร่วมกันทุกฟีเจอร์)
- **ภาษา: ข้อความที่ผู้ใช้เห็นทั้งหมดเป็นภาษาไทย** (ชื่อแอป ชื่อฟีเจอร์ ปุ่ม ข้อความ Error/Toast/Empty State, tooltip, aria-label, ข้อมูลเริ่มต้นในฐานข้อมูล เช่น หมวดหมู่) ยกเว้นชื่อเฉพาะของผลิตภัณฑ์ (เช่น Supabase) และคำศัพท์ทางเทคนิคที่ไม่มีคำไทยที่เข้าใจตรงกัน; ชื่อตัวแปร/ไฟล์/โค้ดยังเป็นภาษาอังกฤษ
- Minimalist: ขาว ดำ เทา เป็นหลัก หลีกเลี่ยงสีฉูดฉาดและ Animation ที่ไม่จำเป็น
  (อนุญาตสีเขียว/แดงโทนหม่นเฉพาะตัวเลขรายรับ/รายจ่าย ถ้าช่วยให้อ่านง่ายขึ้น)
- Layout เดียวกันทุกหน้า: Sidebar (Desktop) / เมนูแบบพับ (Mobile) + Main Content
- ปุ่ม Action ใช้ Icon (เพิ่ม แก้ไข ลบ บันทึก ยกเลิก) และต้องมี Tooltip + aria-label
- ใช้ Border และพื้นหลังเทาอ่อนแบ่ง Section
- Responsive: Desktop, Tablet, Mobile
- ทุกหน้าต้องมี Loading, Error, Empty State และ Success/Error Feedback (Toast)
- การลบทุกอย่างต้องมี Confirmation Dialog

## 6. Database Conventions (ใช้กับทุกตารางของทุกฟีเจอร์)
- ทุกตารางมีคอลัมน์มาตรฐาน:
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE`
  - `created_at timestamptz NOT NULL DEFAULT now()`
  - `updated_at timestamptz NOT NULL DEFAULT now()`
- ฟังก์ชัน trigger กลางสำหรับอัปเดต updated_at อยู่ใน core migration และใช้ซ้ำได้ทุกตาราง
- เปิด RLS ทุกตาราง ใช้ Policy `auth.uid() = user_id` สำหรับ SELECT / INSERT / UPDATE / DELETE
- Index บน user_id และฟิลด์ที่ใช้ Filter/Sort
- ค่าที่เป็นตัวเลือกจำกัด (เช่น status, type) ใช้ CHECK constraint
- ความถูกต้องของข้อมูลที่สำคัญให้บังคับที่ระดับ Database ไม่ใช่แค่ฝั่ง UI
- Migration แยกไฟล์ต่อฟีเจอร์ ฟีเจอร์ใหม่เพิ่ม migration ของตัวเองโดยไม่แก้ไฟล์เดิม
- ตารางเฉพาะของแต่ละฟีเจอร์ระบุอยู่ใน spec ของฟีเจอร์นั้น

## 7. Coding Standards
- Functional Components + TypeScript strict, ห้ามใช้ any
- กำหนด Type/Interface ทุกข้อมูล (แยก Row type จาก Database และ Input type สำหรับ Form)
- แยกชั้นให้ชัด: UI Component → Custom Hook (state/logic) → Service (Supabase query) → Supabase
- Component ห้ามเรียก Supabase ตรง
- Service ทุกตัวมี Error Handling และคืนค่าในรูปแบบที่ hook จัดการได้สม่ำเสมอ
- Async/Await, Immutable State Updates, ไม่ใช้ useEffect เกินจำเป็น, ไม่ Reload หน้าเพื่อ Refresh ข้อมูล
- ใช้ Shared UI Components ซ้ำ หลีกเลี่ยง Code Duplication
- แต่ไม่แตก Component เล็กเกินไปโดยไม่มีเหตุผล
- ตั้งชื่อให้สื่อความหมาย
- ไม่ Hardcode Credentials ใช้ .env และมี .env.example ที่ไม่มีค่าจริง
- logic ล้วน ๆ (คำนวณ สุ่ม จัดกลุ่ม) แยกเป็น pure function ใน `utils/` และมีเทสต์ใน `tests/`
- ก่อนส่งงานรัน `npm run lint`, `npm run build`, `npm test` ให้ผ่านทั้งหมด

## 8. Development Phases
Phase 0: Architecture Review
- อ่าน spec ทุกฟีเจอร์ที่ In scope
- สรุป Architecture, Data Flow (UI → Hook → Service → Supabase), Feature Registry, Auth-ready design,
  Database Design และ Project Structure
- ถามคำถามที่จำเป็นต่อการตัดสินใจ (ดูหัวข้อ Open Questions ในไฟล์ spec) แล้วรอผู้ใช้ตอบ
- บันทึกการตัดสินใจลง Decisions Log ใน `PROGRESS.md` และอัปเดตไฟล์ spec ที่เกี่ยวข้อง

Phase 1: Project Setup
- สร้าง Vite + React + TypeScript, ติดตั้ง Tailwind, React Router, Lucide, supabase-js
- สร้าง Folder Structure, .env.example

Phase 2: App Shell
- MainLayout, Sidebar, Header, Router, Feature Registry, หน้า Portal Home, NotFound
- Shared UI Components พื้นฐาน, Toast
- ลงทะเบียนฟีเจอร์ที่ In scope เป็นหน้าเปล่า (placeholder) เพื่อทดสอบ Navigation ได้

Phase 3: Supabase & Auth Foundation
- สร้าง Supabase Project, เปิด Anonymous Sign-in, ตั้งค่า Environment Variables
- Supabase Client, AuthProvider, useAuth
- Core migration (updated_at trigger) และทดสอบ Connection

Phase 4: Feature — To-do List (ตาม `docs/features/todo.md`)
Phase 5: Feature — Randomizer (ตาม `docs/features/randomizer.md`)
Phase 6: Feature — Income & Expense (ตาม `docs/features/finance.md`)

Phase 7: Refactoring, Testing & Documentation
- ตรวจ Structure, Duplication, Error Handling, Responsive
- ทดสอบ CRUD และ Edge Cases ทุกฟีเจอร์
- เขียน README.md (ติดตั้ง, ตั้งค่า Supabase, รัน Local)
- เขียน `docs/adding-a-feature.md` คู่มือเพิ่มฟีเจอร์ใหม่ทีละขั้น (ใช้ตัวอย่างสมมติ ไม่ต้อง implement)
- สรุปแนวทางการเพิ่ม Login จริงในอนาคต

ลำดับการทำงานภายใน Phase ของฟีเจอร์: Migration → Types → Service → Hook → UI

## 9. Output Format ในแต่ละ Phase
1. File ที่สร้าง/แก้ไข (ระบุ Path)
2. Code
3. วิธีทดสอบ

## 10. Important Rules
1. ทำทีละ Phase ห้ามข้ามหรือทำหลาย Phase ในครั้งเดียว
2. ห้ามเริ่ม Phase ถัดไปจนกว่าผู้ใช้จะยืนยันว่า Phase ปัจจุบันเสร็จแล้ว
3. ห้ามข้ามขั้นตอนการติดตั้งหรือ Configuration
4. ห้ามขอ API Key, Password หรือ Secret ใช้ Placeholder และ Environment Variables
5. ห้ามสร้าง UI ที่ไม่มี Function จริงในส่วนที่ต้องใช้งานได้ (ยกเว้น placeholder ใน Phase 2)
6. ห้ามสร้างฟีเจอร์ที่ไม่มีสถานะ In scope ใน Feature Index หรือเกินจาก spec โดยไม่ได้รับการยืนยัน
7. ถ้ามีหลายวิธี ให้เลือกวิธีที่เรียบง่ายและเหมาะกับโปรเจคขนาดนี้
8. ถ้าเกิด Error ให้แก้ให้เสร็จก่อนไปต่อ
9. อัปเดต `PROGRESS.md` ทุกครั้งที่จบ Phase
