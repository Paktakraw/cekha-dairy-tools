export type Demographic = 'men' | 'women'
export type UnitPref = 'cm' | 'inch'
export type FitFeel = 'good' | 'tight' | 'loose'

/** คีย์ช่องสัดส่วน (ตรงกับคอลัมน์ใน size_profiles) */
export type MeasureKey =
  | 'height_cm'
  | 'foot_length_cm'
  | 'foot_width_cm'
  | 'chest_cm'
  | 'waist_cm'
  | 'hip_cm'
  | 'head_cm'
  | 'finger_circumference_mm'

/** สัดส่วนที่เก็บแล้ว (cm / mm) ช่องที่ไม่รู้ = null */
export type Measurements = Record<MeasureKey, number | null>

/** ค่าที่ผู้ใช้กรอก (ข้อความ ตามหน่วยที่เลือก) */
export type MeasureInput = Record<MeasureKey, string>
export type MeasureErrors = Partial<Record<MeasureKey, string>>

export interface SizeProfile extends Measurements {
  id: string
  name: string
  demographic: Demographic
  is_self: boolean
  unit_pref: UnitPref
  created_at: string
  updated_at: string
}

export interface ProfileFormInput {
  name: string
  demographic: Demographic
  unit: UnitPref
  measures: MeasureInput
}

export interface ProfileFieldErrors extends MeasureErrors {
  name?: string
}

/** ค่าที่พร้อมบันทึก (insert/update) */
export interface ProfileValues extends Measurements {
  name: string
  demographic: Demographic
  unit_pref: UnitPref
}

export interface SizeNote {
  id: string
  profile_id: string
  brand: string
  product: string | null
  size_label: string
  fit: FitFeel
  note: string | null
  created_at: string
  updated_at: string
}

export interface NoteFormInput {
  brand: string
  product: string
  sizeLabel: string
  fit: FitFeel
  note: string
}

export interface NoteFieldErrors {
  brand?: string
  product?: string
  sizeLabel?: string
  note?: string
}

export interface NoteValues {
  profile_id: string
  brand: string
  product: string | null
  size_label: string
  fit: FitFeel
  note: string | null
}

export type ConverterCategory = 'shoes' | 'tops' | 'bottoms' | 'ring' | 'hat'

export interface ConvRow {
  label: string
  value: string
  /** ค่าที่แนะนำหลังคิดการเผื่อไซส์ (แสดงเมื่อต่างจาก value) */
  recommended?: string
}

export interface ConvResult {
  rows: ConvRow[]
  /** ช่องที่ยังขาดและจำเป็นต่อหมวดนี้ */
  missing: MeasureKey[]
  notes: string[]
}
