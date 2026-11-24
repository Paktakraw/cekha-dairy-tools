import type { FoodEntry } from '../types/calorie'
import { summarizeDay } from './summary.ts'

export interface CalorieToday {
  /** แคลอรี่ที่กินวันนี้ (kcal) */
  total: number
  entryCount: number
  /** TDEE ที่บันทึกไว้ (null = ยังไม่เคยคำนวณ) */
  tdee: number | null
}

/** สรุปสำหรับการ์ดภาพรวมวันนี้ (pure function) ใช้ summarizeDay เดิม */
export function summarizeCalorieToday(entries: FoodEntry[], tdee: number | null): CalorieToday {
  return { total: summarizeDay(entries).total, entryCount: entries.length, tdee }
}

/** ส่วนต่างจาก TDEE: บวก = กินเกิน, ลบ = ยังเหลือ (ไม่มี TDEE = null) */
export function differenceFromTdee({ total, tdee }: Pick<CalorieToday, 'total' | 'tdee'>): number | null {
  return tdee === null ? null : total - tdee
}
