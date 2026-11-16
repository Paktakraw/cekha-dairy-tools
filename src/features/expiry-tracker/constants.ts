import type { ReminderCategory, RepeatUnit } from './types/reminder'

export const NAME_MAX_LENGTH = 100
export const NOTE_MAX_LENGTH = 500
export const PROVIDER_NAME_MAX_LENGTH = 100
export const PROVIDER_PHONE_MAX_LENGTH = 30
export const USAGE_UNIT_MAX_LENGTH = 20
export const REPEAT_EVERY_MAX = 1000
export const COST_MAX = 100_000_000
export const USAGE_MAX = 99_999_999
export const REMIND_DAYS_MAX = 730
export const REMIND_LEVELS_MAX = 10

/** ขอบเขตสถานะสี: เหลือน้อยกว่า RED_BELOW_DAYS = แดง, ไม่เกิน YELLOW_UP_TO_DAYS = เหลือง, เกินกว่านั้น = เขียว */
export const RED_BELOW_DAYS = 7
export const YELLOW_UP_TO_DAYS = 30

export const CATEGORIES: { id: ReminderCategory; label: string; examples: string }[] = [
  { id: 'document', label: 'เอกสารราชการ', examples: 'บัตรประชาชน พาสปอร์ต ใบขับขี่' },
  { id: 'vehicle', label: 'ยานพาหนะ', examples: 'พรบ. ประกัน ถ่ายน้ำมันเครื่อง' },
  { id: 'home', label: 'ของใช้ในบ้าน', examples: 'ล้างแอร์ ไส้กรองน้ำ ยาสามัญ' },
  { id: 'medical', label: 'รักษาพยาบาล', examples: 'นัดหมอ วัคซีน ตรวจสุขภาพ ประกันสุขภาพ' },
  { id: 'subscription', label: 'สมาชิก/ค่าบริการ', examples: 'แอปสตรีมมิง คลาวด์' },
  { id: 'other', label: 'อื่น ๆ', examples: '' },
]

export const CATEGORY_LABELS: Record<ReminderCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<ReminderCategory, string>

/** ชุดจำนวนวันเตือนล่วงหน้าสำเร็จรูปตามหมวด (เรียงมากไปน้อย) */
export const REMIND_PRESETS: Record<ReminderCategory, number[]> = {
  document: [180, 90, 30],
  vehicle: [30, 7],
  home: [7, 1],
  medical: [30, 7, 1],
  subscription: [3, 1],
  other: [7, 1],
}

export const REPEAT_UNIT_LABELS: Record<RepeatUnit, string> = {
  day: 'วัน',
  month: 'เดือน',
  year: 'ปี',
}

/** ช่องเฉพาะหมวด: ช่องตามระยะทาง/การใช้งาน และช่องช่าง/ผู้ให้บริการ */
export function categoryFields(category: ReminderCategory): { usage: boolean; provider: boolean } {
  // ช่าง/ผู้ให้บริการ (รวมโรงพยาบาล/แพทย์) ใช้กับทุกหมวดที่มีผู้ให้บริการ; ตามระยะใช้เฉพาะของที่นับการใช้งานได้
  const usage = category === 'vehicle' || category === 'home' || category === 'other'
  const provider = usage || category === 'medical'
  return { usage, provider }
}
