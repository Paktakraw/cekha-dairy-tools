# เสขาประจำวัน (Daily Life Portal)

เว็บแอปรวมเครื่องมือย่อยสำหรับใช้ในชีวิตประจำวันไว้ในที่เดียว ใช้งานผ่านหน้า Portal ที่แสดงการ์ดของแต่ละเครื่องมือ และมีเมนูด้านข้างสลับไปมาได้

| เครื่องมือ | คำอธิบาย | เส้นทาง |
|---|---|---|
| วันนี้ทำอะไรดี | จัดการงานที่ต้องทำ แยกสถานะ รอดำเนินการ / กำลังทำ / เสร็จแล้ว พร้อมตัวกรองและแบ่งหน้า | `/todo` |
| สับสนช่วยหน่อย | สร้างกลุ่มรายการ เลือกหลายกลุ่มรวมเป็นกองเดียวแล้วสุ่มโดยไม่ซ้ำ | `/randomizer` |
| เงินฉันไปไหน | บันทึกรายการ จัดการหมวดหมู่ และดูสรุปตามตัวกรอง | `/finance` |
| ผอมไปด้วยกัน | คำนวณ BMR/TDEE, เลือกอาหารจากรายการเพื่อบันทึกแคลอรี่ที่กิน และดูสรุปรายสัปดาห์/รายเดือน | `/calorie` |
| อันไหนถูกกว่า บอกมา | กรอกราคาและปริมาณ 2–3 ตัวเลือก ระบบบอกว่าตัวไหนคุ้มที่สุดต่อกรัม/มิลลิลิตร/ชิ้น (ไม่บันทึกข้อมูล ไม่ใช้ฐานข้อมูล) | `/unit-price` |
| อย่าลืมฉัน | จดเอกสารหมดอายุ งานซ่อมบำรุง และค่าสมาชิก ระบบแสดงสถานะสีตามวันครบกำหนด เตือนในแอป คำนวณรอบถัดไปเมื่อกด "ทำแล้ว" เก็บประวัติ และสรุปค่าใช้จ่ายเดือนหน้า | `/expiry-tracker` |
| ไซส์ไหนคือฉัน | บันทึกสัดส่วนจริงของตัวเอง/คนรอบตัว แล้วแปลงเป็นไซส์รองเท้า เสื้อ กางเกง แหวน หมวก (US/UK/EU/JP/KR/CN) พร้อมคำแนะนำเผื่อไซส์ และจดไซส์ที่เคยใส่ได้จริง | `/size-converter` |
| ตัวฉันวันนี้ | เช็กอารมณ์ประจำวันด้วยอิโมจิ 5 ระดับ เลือกแท็ก (เพิ่ม/แก้/ลบแท็กเองได้) และเขียนข้อความสั้น ดูปฏิทินและการ์ดสรุปรายเดือน มีการ์ดปลอบใจเมื่อเหนื่อย/ดิ่ง | `/mood` |

แอปแสดงผลเป็นภาษาไทยทั้งหมด ใช้งานได้บนมือถือ แท็บเล็ต และคอมพิวเตอร์

## เทคโนโลยี

- React 19 + TypeScript (strict) + Vite
- Tailwind CSS v4, Lucide React (ไอคอน), React Router
- Supabase (PostgreSQL + Auth) ผ่าน `@supabase/supabase-js`
- State: React Hooks + Context เท่านั้น (ไม่ใช้ Redux หรือ UI Framework)

## ติดตั้งและรันในเครื่อง

ต้องมี Node.js 22.18 ขึ้นไป (แนะนำ Node 24) เพราะตัวรันเทสต์รันไฟล์ TypeScript ด้วยความสามารถของ Node โดยตรง

```bash
npm install
cp .env.example .env     # แล้วแก้ค่าตามหัวข้อถัดไป
npm run dev              # เปิด http://localhost:5173
```

### ตั้งค่า Supabase

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
2. ที่ **Authentication → Providers → Email** ปิด **Confirm email** (แอปสมัคร/เข้าสู่ระบบด้วย username โดยใช้อีเมลสังเคราะห์เป็นตัวตนใน Supabase จึงยืนยันอีเมลไม่ได้) และปิด **Anonymous Sign-ins** ได้ (ไม่ใช้แล้ว)
3. ไปที่ **Project Settings → API** แล้วนำค่าใส่ `.env`:
   ```
   VITE_SUPABASE_URL=<Project URL>
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable (anon) key>
   ```
   - ใช้ได้เฉพาะ publishable/anon key เท่านั้น **ห้ามใส่ secret / service_role key** ในโปรเจกต์นี้
   - Vite อ่านได้เฉพาะตัวแปรที่ขึ้นต้นด้วย `VITE_` และต้องรีสตาร์ท `npm run dev` หลังแก้ `.env`
4. เปิด **SQL Editor** แล้วรันไฟล์ใน `supabase/migrations/` **ตามลำดับชื่อไฟล์** (วางเนื้อหาทั้งไฟล์แล้วกด Run ทีละไฟล์):

   | ลำดับ | ไฟล์ | เนื้อหา |
   |---|---|---|
   | 1 | `20261109000000_core.sql` | ฟังก์ชันกลาง `set_updated_at()` |
   | 2 | `20261109000100_todo.sql` | ตาราง `tasks` + RLS |
   | 3 | `20261109000200_todo_status_unique_limits.sql` | สถานะ 3 ค่า, เวลาที่เสร็จ, ชื่อห้ามซ้ำ, จำกัดความยาว |
   | 4 | `20261109000300_randomizer.sql` | ตาราง `random_groups`, `random_items` + RLS |
   | 5 | `20261109000400_finance.sql` | ตาราง `categories`, `transactions` + RLS + ฟังก์ชัน seed |
   | 6 | `20261110000100_finance_thai_categories.sql` | หมวดหมู่เริ่มต้นเป็นภาษาไทย |
   | 7 | `20261110000200_calorie.sql` | ตาราง `calorie_profiles`, `foods`, `food_entries` + RLS + ฟังก์ชัน seed รายการอาหารตั้งต้น 102 เมนู |
   | 8 | `20261113000100_user_preferences.sql` | ตาราง `user_preferences` (ธีมสว่าง/มืดของผู้ใช้) + RLS |
   | 9 | `20261116000100_expiry_tracker.sql` | ตาราง `reminder_items`, `reminder_logs` + RLS + ฟังก์ชัน `complete_reminder()` |
   | 10 | `20261116000200_expiry_tracker_medical.sql` | เพิ่มหมวด "รักษาพยาบาล" ให้ `reminder_items` |
   | 11 | `20261118000100_size_converter.sql` | ตาราง `size_profiles`, `size_notes` + RLS |
   | 12 | `20261119000100_mood.sql` | ตาราง `mood_entries` + RLS (เช็กอินอารมณ์รายวัน) |
   | 13 | `20261119000200_mood_custom_tags.sql` | ตาราง `mood_tags` (แท็กที่ผู้ใช้ตั้งค่าเอง) + RLS + trigger + ฟังก์ชัน seed แท็กเริ่มต้น |
   | 14 | `20261121000100_auth_profiles.sql` | ตาราง `profiles` (ชื่อ/username/อีเมล/เบอร์ ห้ามซ้ำ) + trigger สร้างโปรไฟล์ตอนสมัคร + RPC `check_register_available` |

   ถ้าต้องการล้างข้อมูลเก่าของผู้ใช้ anonymous ทั้งหมดก่อนเริ่มใช้บัญชีจริง ให้รัน `supabase/scripts/reset_all_user_data.sql` เอง (ลบผู้ใช้และข้อมูลทุกตาราง ย้อนกลับไม่ได้ ไม่ใช่ migration)

   ไฟล์ที่ 6 จะเปลี่ยนชื่อหมวดหมู่เริ่มต้นเดิมที่เป็นภาษาอังกฤษ (เช่น Salary) ให้เป็นภาษาไทย โดยแตะเฉพาะชื่อที่ตรงกับค่าเริ่มต้นเดิมเท่านั้น หมวดหมู่ที่ผู้ใช้สร้างเองและรายการรายรับ-รายจ่ายเดิมไม่ได้รับผลกระทบ

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันเซิร์ฟเวอร์สำหรับพัฒนา |
| `npm run build` | ตรวจ TypeScript แล้ว build สำหรับ production (ผลลัพธ์ในโฟลเดอร์ `dist/`) |
| `npm run lint` | ตรวจโค้ดด้วย oxlint |
| `npm test` | รันเทสต์อัตโนมัติ (ดู [docs/testing.md](docs/testing.md)) |

## โครงสร้างโปรเจกต์

```
docs/
├── features/            spec ของแต่ละฟีเจอร์ (+ _template.md)
├── spec/                PRD และ System Design ของทั้งแอป
├── testing/             test case และผลการทดสอบ
├── adding-a-feature.md  คู่มือเพิ่มฟีเจอร์ใหม่
├── future-login.md      สถานะ Login ปัจจุบันและแนวทางต่อยอด (รีเซ็ตรหัสทางอีเมล ฯลฯ)
├── admin-password-reset.md  คู่มือผู้ดูแล: ตั้งรหัสผ่านใหม่ให้ผู้ใช้ที่ลืม
├── user-manual.md       คู่มือการใช้งานระบบ (ผู้ใช้ทั่วไป / ต้นทางเอกสารฝึกอบรม)
└── testing.md           การทดสอบ และรายการตรวจด้วยมือ
src/
├── app/                 App, router, featureRegistry, AuthProvider, ProtectedRoute
├── shared/              ส่วนที่ใช้ร่วมกัน: components (ui, layout), hooks, lib, types, utils
├── features/<ชื่อ>/     components, hooks, services, types, utils, pages ของแต่ละฟีเจอร์
├── pages/               หน้าหลัก, 404 (หน้า Login/สมัครอยู่ใน features/auth)
└── styles/
supabase/migrations/     SQL ของฐานข้อมูล แยกไฟล์ตามลำดับ
supabase/scripts/        สคริปต์ที่ผู้ดูแลรันเอง (ไม่ใช่ migration) เช่น ล้างข้อมูลผู้ใช้ทั้งหมด
tests/                   เทสต์ของ pure functions
```

### หลักการสำคัญ

- **ชั้นข้อมูล:** UI Component → Custom Hook → Service → Supabase (Component ไม่เรียก Supabase ตรง)
- **เพิ่มฟีเจอร์ได้โดยไม่แก้ฟีเจอร์เดิม:** ฟีเจอร์แต่ละตัวลงทะเบียนใน `src/app/featureRegistry.ts` แล้ว Sidebar, หน้าหลัก และ Router สร้างจาก Registry อัตโนมัติ
- **ข้อมูลแยกตามผู้ใช้:** ทุกตารางมี `user_id` และเปิด RLS (`auth.uid() = user_id`) ความถูกต้องของข้อมูลสำคัญ (ชื่อซ้ำ ความยาว จำนวนเงิน > 0 ฯลฯ) บังคับที่ระดับฐานข้อมูล ไม่ใช่แค่หน้าจอ
- **บัญชีผู้ใช้:** สมัคร/เข้าสู่ระบบด้วย username + password (session คงอยู่จนกว่าจะออกจากระบบ) ลืมรหัสผ่านให้ผู้ดูแลตั้งใหม่ ดู [docs/admin-password-reset.md](docs/admin-password-reset.md) และแนวทางต่อยอดที่ [docs/future-login.md](docs/future-login.md)

## Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. ที่ Vercel เลือก **Add New → Project** แล้วเลือก repo นี้ (ตรวจเจอ Vite อัตโนมัติ)
3. ใส่ Environment Variables ทั้ง 2 ตัวข้างต้น (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) แล้ว Deploy
4. ไฟล์ [vercel.json](vercel.json) ตั้ง rewrite ให้ทุก path กลับไปที่ `index.html` เพื่อให้ React Router ทำงานเมื่อรีเฟรชหน้าย่อย
5. ที่ Supabase → **Authentication → URL Configuration** ใส่โดเมนของ Vercel เป็น Site URL และ Redirect URL

หมายเหตุ: ค่า `VITE_*` ถูกฝังตอน build ถ้าแก้ค่าบน Vercel ต้อง Redeploy ใหม่

## การ release

Release owner ของ repo ดูที่ [.github/CODEOWNERS](.github/CODEOWNERS)

- **รูปแบบเวอร์ชัน:** tag เป็น `vMAJOR.MINOR.PATCH` (เช่น `v0.1.0`) — MAJOR เมื่อมี breaking change, MINOR เมื่อเพิ่มฟีเจอร์, PATCH เมื่อแก้บั๊ก/ปรับปรุงเล็กน้อย
- **Label ของ Pull Request:** `breaking-change`, `feature`, `improvement`, `bug` (ใส่ 1 อัน) และ `ignore-for-release` สำหรับ PR ที่ไม่ต้องขึ้นใน release notes (เช่น แก้เอกสารภายใน) หมวดของ release notes ตั้งไว้ใน [.github/release.yml](.github/release.yml)

ขั้นตอน (ทำโดย release owner):

1. ตรวจว่า `main` ล่าสุดและ `npm run lint`, `npm run build`, `npm test` ผ่าน
2. ตรวจว่า PR ที่ merge หลัง release ก่อนหน้ามี label ครบ
3. บน GitHub: **Releases → Draft a new release** → สร้าง tag ใหม่ `vX.Y.Z` จาก `main`
4. กด **Generate release notes** ตรวจข้อความ แล้ว **Publish release**
5. อัปเดตเลขเวอร์ชันใน `package.json` ให้ตรงกับ tag (ถ้าต้องการ)

## เอกสารเพิ่มเติม

- [docs/adding-a-feature.md](docs/adding-a-feature.md): เพิ่มฟีเจอร์ใหม่ทีละขั้น
- [docs/future-login.md](docs/future-login.md): สถานะ Login ปัจจุบันและแนวทางต่อยอด
- [docs/user-manual.md](docs/user-manual.md): คู่มือการใช้งานระบบ อัปเดตทุกครั้งที่เลขเวอร์ชันใน package.json เปลี่ยน
- [docs/admin-password-reset.md](docs/admin-password-reset.md): คู่มือผู้ดูแลตั้งรหัสผ่านใหม่ให้ผู้ใช้ที่ลืม
- [docs/testing.md](docs/testing.md): การทดสอบและรายการตรวจด้วยมือ
- [docs/spec/](docs/spec/README.md): PRD (ภาษาธุรกิจ) และ System Design (สถาปัตยกรรม ฐานข้อมูล workflow)
- [docs/testing/](docs/testing/README.md): test case และผลการทดสอบ
- [CLAUDE.md](CLAUDE.md) และ [PROGRESS.md](PROGRESS.md): กฎของโปรเจกต์และบันทึกความคืบหน้า
