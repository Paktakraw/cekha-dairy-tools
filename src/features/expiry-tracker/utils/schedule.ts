import type { ReminderItem, RepeatUnit } from '../types/reminder'
import { addDays, addMonths } from './dates.ts'

/** บวกรอบเวลา (วัน/เดือน/ปี) เข้ากับวันที่ */
export function addCycle(date: string, every: number, unit: RepeatUnit): string {
  if (unit === 'day') return addDays(date, every)
  if (unit === 'month') return addMonths(date, every)
  return addMonths(date, every * 12)
}

/** วันครบกำหนดครั้งถัดไปหลังทำเมื่อ doneOn: วันที่ทำ + รอบ (ไม่มีรอบ = null) */
export function nextDueAfterDone(item: Pick<ReminderItem, 'repeat_every' | 'repeat_unit'>, doneOn: string): string | null {
  if (item.repeat_every === null || item.repeat_unit === null) return null
  return addCycle(doneOn, item.repeat_every, item.repeat_unit)
}

/** กันลูปไม่รู้จบเมื่อรอบสั้นมากและวันครบกำหนดอยู่ไกลในอดีต */
const MAX_OCCURRENCES_SCANNED = 20_000

/**
 * จำนวนครั้งที่รายการครบกำหนดในช่วง from–to (รวมทั้งสองวัน)
 * รายการไม่ซ้ำนับ 0 หรือ 1; รายการซ้ำนับทุกรอบที่ตกในช่วง โดยนับจากวันครบกำหนดปัจจุบันไปข้างหน้า
 */
export function countOccurrencesInRange(
  item: Pick<ReminderItem, 'due_date' | 'repeat_every' | 'repeat_unit'>,
  from: string,
  to: string,
): number {
  if (item.repeat_every === null || item.repeat_unit === null) {
    return item.due_date >= from && item.due_date <= to ? 1 : 0
  }
  let count = 0
  for (let k = 0; k < MAX_OCCURRENCES_SCANNED; k++) {
    // คำนวณจากวันตั้งต้นทุกครั้ง (ไม่บวกต่อกัน) เพื่อไม่ให้วันสิ้นเดือนเพี้ยนสะสม
    const date = addCycle(item.due_date, item.repeat_every * k, item.repeat_unit)
    if (date > to) break
    if (date >= from) count++
  }
  return count
}
