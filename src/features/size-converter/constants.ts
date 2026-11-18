import type { ConverterCategory, Demographic, FitFeel, MeasureKey } from './types/size'

export const NAME_MAX_LENGTH = 50
export const BRAND_MAX_LENGTH = 50
export const PRODUCT_MAX_LENGTH = 100
export const SIZE_LABEL_MAX_LENGTH = 30
export const NOTE_MAX_LENGTH = 500
export const DUPLICATE_PROFILE_MESSAGE = 'มีโปรไฟล์ชื่อนี้อยู่แล้ว (หรือมีโปรไฟล์ “ฉัน” แล้ว) กรุณาใช้ชื่ออื่น'

export const CM_PER_INCH = 2.54
/** ส่วนเผื่อหัวรองเท้า (cm) = 2 barleycorn ใช้ค่าเดียวกับทุกมาตรฐาน */
export const SHOE_ALLOWANCE_CM = 1.7
/** Barleycorn ต่อนิ้ว (หน่วยของไซส์ UK) */
export const BARLEYCORNS_PER_INCH = 3
/** UK ผู้ใหญ่ = (เท้านิ้ว × 3) − ค่านี้ (รวมส่วนเผื่อหัวรองเท้า 2 barleycorn) */
export const UK_SIZE_OFFSET = 23
/** Paris point ต่อ cm (1 จุด = ⅔ cm) ใช้กับไซส์ EU */
export const EU_POINTS_PER_CM = 1.5
/** ส่วนต่างของ US เทียบกับ UK: ผู้ชาย +1, ผู้หญิง +2.5 (ห่างกัน 1.5 ไซส์) */
export const US_MEN_OVER_UK = 1
export const US_WOMEN_OVER_UK = 2.5
/** หน้าเท้ากว้าง: เผื่อความยาวเพิ่มราวครึ่งไซส์ (cm) */
export const WIDE_FOOT_EXTRA_CM = 0.5
/** เสื้อผ้า Oversize: ขยับขึ้นกี่ไซส์ */
export const OVERSIZE_STEPS = 1

export interface MeasureFieldDef {
  key: MeasureKey
  label: string
  /** mm = กรอกเป็นมิลลิเมตรเสมอ (รอบนิ้ว) ไม่เข้าร่วมการสลับ cm/นิ้ว */
  unit: 'length' | 'mm'
  /** ช่วงที่รับ (cm หรือ mm ตาม unit) */
  min: number
  max: number
}

export const MEASURE_FIELDS: MeasureFieldDef[] = [
  { key: 'height_cm', label: 'ความสูง', unit: 'length', min: 30, max: 250 },
  { key: 'foot_length_cm', label: 'ความยาวเท้า', unit: 'length', min: 5, max: 40 },
  { key: 'foot_width_cm', label: 'ความกว้างหน้าเท้า', unit: 'length', min: 3, max: 20 },
  { key: 'chest_cm', label: 'รอบอก', unit: 'length', min: 20, max: 250 },
  { key: 'waist_cm', label: 'รอบเอว', unit: 'length', min: 20, max: 250 },
  { key: 'hip_cm', label: 'รอบสะโพก', unit: 'length', min: 20, max: 250 },
  { key: 'head_cm', label: 'รอบศีรษะ', unit: 'length', min: 30, max: 80 },
  { key: 'finger_circumference_mm', label: 'รอบนิ้ว', unit: 'mm', min: 30, max: 100 },
]

export const MEASURE_LABELS: Record<MeasureKey, string> = Object.fromEntries(MEASURE_FIELDS.map((f) => [f.key, f.label])) as Record<
  MeasureKey,
  string
>

export interface CategoryDef {
  id: ConverterCategory
  label: string
  /** ช่องที่ต้องใช้คำนวณ */
  needs: MeasureKey[]
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'shoes', label: 'รองเท้า', needs: ['foot_length_cm'] },
  { id: 'tops', label: 'เสื้อ', needs: ['chest_cm'] },
  { id: 'bottoms', label: 'กางเกง', needs: ['waist_cm', 'hip_cm'] },
  { id: 'ring', label: 'แหวน', needs: ['finger_circumference_mm'] },
  { id: 'hat', label: 'หมวก', needs: ['head_cm'] },
]

export const DEMOGRAPHIC_LABELS: Record<Demographic, string> = { men: 'ผู้ชาย', women: 'ผู้หญิง' }
export const FIT_LABELS: Record<FitFeel, string> = { good: 'พอดี', tight: 'คับ', loose: 'หลวม' }
