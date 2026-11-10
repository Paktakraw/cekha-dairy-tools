# คู่มือเพิ่มฟีเจอร์ใหม่

คู่มือนี้อธิบายทีละขั้นว่าต้องทำอะไรบ้างเมื่อเพิ่มฟีเจอร์ใหม่ โดยใช้ฟีเจอร์สมมติชื่อ **"บันทึกย่อ" (notes)** เป็นตัวอย่าง (ไม่ได้ implement จริง)

> หลักการ: เพิ่มฟีเจอร์ = สร้างโฟลเดอร์ของฟีเจอร์ + ลงทะเบียนใน Registry โดย **ไม่ต้องแก้ Layout หรือฟีเจอร์อื่น** และฟีเจอร์ห้าม import โค้ดภายในของฟีเจอร์อื่นโดยตรง ของที่ใช้ร่วมกันให้อยู่ใน `src/shared/`

## ลำดับการทำงาน

### 1. เขียน spec ก่อนเขียนโค้ด
1. คัดลอก `docs/features/_template.md` เป็น `docs/features/notes.md` แล้วกรอก: ภาพรวม, Requirements, ตาราง Database, Components ที่คิดไว้, Open Questions, Out of Scope
2. เปลี่ยนสถานะของฟีเจอร์ในตาราง Feature Index ใน `CLAUDE.md` เป็น "In scope" พร้อมใส่ path ของ spec และโฟลเดอร์
3. เพิ่ม Phase ใหม่ใน `PROGRESS.md`
4. ให้เจ้าของโปรเจกต์ยืนยัน spec ก่อนเริ่มเขียนโค้ด

### 2. Migration (ฐานข้อมูล)
สร้างไฟล์ใหม่ `supabase/migrations/<วันที่เวลา>_notes.sql` (ไม่แก้ไฟล์ migration เดิม) ตามกฎ CLAUDE.md ข้อ 6:

```sql
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  title       text not null check (length(btrim(title)) > 0 and char_length(title) <= 100),
  body        text check (body is null or char_length(body) <= 2000)
);

create index notes_user_id_idx on public.notes (user_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();   -- ใช้ฟังก์ชันกลางจาก core migration

alter table public.notes enable row level security;

create policy "notes_select_own" on public.notes for select to authenticated using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes for delete to authenticated using (auth.uid() = user_id);
```

ข้อควรจำ:
- ห้ามเปิด RLS แบบ allow all และห้ามใช้ service_role key
- ค่าที่เป็นตัวเลือกจำกัดใช้ `CHECK` และกฎที่สำคัญ (ห้ามซ้ำ, ความยาว) บังคับที่ DB เช่น `create unique index ... on (user_id, lower(btrim(title)))`
- รัน migration ใน SQL Editor แล้วบันทึกลง `PROGRESS.md` ส่วน Migrations Applied

### 3. โครงโฟลเดอร์ของฟีเจอร์

```
src/features/notes/
├── components/     NoteForm, NoteItem, NoteList
├── hooks/          useNotes
├── services/       noteService
├── types/          note.ts
├── utils/          (ถ้ามี logic ล้วน ๆ ที่ทดสอบได้)
├── pages/          NotesPage
├── constants.ts    ค่าคงที่ เช่น ความยาวสูงสุด (ต้องตรงกับ CHECK ใน migration)
├── lazyPages.ts    โหลดหน้าแบบ lazy
└── index.tsx       export FeatureConfig
```

### 4. เขียนตามลำดับ Types → Service → Hook → UI

**Types** (`types/note.ts`): แยก Row จากฐานข้อมูลกับ Input จากฟอร์ม ห้ามใช้ `any`

```ts
export interface Note { id: string; title: string; body: string | null; created_at: string; updated_at: string }
export interface NoteInput { title: string; body: string }
```

**Service** (`services/noteService.ts`): เรียก Supabase และคืน `ServiceResult` เสมอ (ไม่ throw) ใช้ `serviceFail` กลางแปลง error

```ts
import { PG_UNIQUE_VIOLATION, serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'

const COLUMNS = 'id, title, body, created_at, updated_at'   // ไม่ select user_id

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('noteService', action, cause, { [PG_UNIQUE_VIOLATION]: 'มีบันทึกชื่อนี้อยู่แล้ว' })
}

export const noteService = {
  async list(): Promise<ServiceResult<Note[]>> {
    const { data, error } = await supabase.from('notes').select(COLUMNS)
      .order('created_at', { ascending: false }).overrideTypes<Note[]>()
    if (error) return fail('โหลดบันทึก', error)
    return { data, error: null }
  },
  // create / update / remove ทำเช่นเดียวกัน
}
```

**Hook** (`hooks/useNotes.ts`): เก็บ state (`notes`, `loading`, `error`) เรียก Service และแจ้งผลด้วย `useToast()` ให้ add/edit คืนข้อความ error (หรือ `null` เมื่อสำเร็จ) เพื่อให้ฟอร์มแสดงใต้ช่องได้ ดูตัวอย่างจริงที่ `src/features/todo/hooks/useTasks.ts`

**UI**: ใช้ component กลางจาก `src/shared/components/ui` (Button, IconButton, Input, Textarea, Select, Modal, ConfirmDialog, EmptyState, ErrorState, Spinner, Pagination, CollapsibleSection, FormActions) ทุกหน้าต้องมี:
- Loading (`Spinner`), Error (`ErrorState` พร้อมปุ่มลองใหม่), Empty (`EmptyState`), Toast ผลลัพธ์
- Confirm ก่อนลบทุกครั้ง (`ConfirmDialog`)
- ปุ่ม Action เป็นไอคอนพร้อม tooltip และ aria-label (`IconButton`) ปุ่มข้อความต้องมีไอคอนนำหน้า
- Header ของหน้าใช้ `PageHeader` (ติดอยู่กับที่ขณะเลื่อน)
- ข้อความทั้งหมดเป็นภาษาไทย

### 5. ลงทะเบียนฟีเจอร์

`src/features/notes/lazyPages.ts`
```ts
import { lazy } from 'react'
export const NotesPage = lazy(() => import('./pages/NotesPage'))
```

`src/features/notes/index.tsx`
```tsx
import { StickyNote } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import { NotesPage } from './lazyPages'

export const notesFeature: FeatureConfig = {
  id: 'notes',
  name: 'บันทึกย่อ',
  description: 'จดบันทึกสั้น ๆ',
  icon: StickyNote,
  path: '/notes',
  routes: [{ index: true, element: <NotesPage /> }],
}
```

`src/app/featureRegistry.ts` — เพิ่มบรรทัดเดียว:
```ts
export const featureRegistry: FeatureConfig[] = [todoFeature, randomizerFeature, financeFeature, notesFeature]
```
เท่านี้ Sidebar, การ์ดหน้าหลัก และ Route `/notes` จะปรากฏเอง ถ้าฟีเจอร์มีหน้าย่อยหลายหน้า (เหมือนรายรับ-รายจ่าย) ให้ใส่ `routes` เป็น Layout + children ดู `src/features/finance/index.tsx`

### 6. ทดสอบและปิดงาน
1. ถ้ามี logic ล้วน ๆ (คำนวณ สุ่ม จัดกลุ่ม) แยกเป็น pure function ใน `utils/` แล้วเขียนเทสต์ใน `tests/` ดู [testing.md](testing.md)
2. รัน `npm run lint && npm run build && npm test`
3. ทดสอบ CRUD และ Edge Cases ในเบราว์เซอร์ทั้งมือถือและคอม
4. อัปเดต `PROGRESS.md` และ spec ถ้ามีการตัดสินใจที่กระทบ requirement

## เช็กลิสต์ก่อนส่งงาน

- [ ] มี spec ใน `docs/features/` และอัปเดต Feature Index แล้ว
- [ ] Migration เป็นไฟล์ใหม่ มี RLS ครบ 4 policy, index และ trigger `updated_at`
- [ ] ค่าความยาวใน `constants.ts` ตรงกับ CHECK ใน migration
- [ ] Component ไม่เรียก Supabase ตรง (ผ่าน Hook → Service เท่านั้น)
- [ ] ไม่ import โค้ดภายในของฟีเจอร์อื่น
- [ ] ครบ Loading / Error / Empty / Toast / Confirm ลบ
- [ ] ข้อความเป็นภาษาไทยทั้งหมด และใช้งานได้บนมือถือ
- [ ] `npm run lint`, `npm run build`, `npm test` ผ่าน
