import type { CostSummary, ReminderItem } from '../types/reminder'
import { nextMonthRange } from './dates.ts'
import { countOccurrencesInRange } from './schedule.ts'

/** ค่าใช้จ่ายที่จะครบกำหนดในเดือนปฏิทินถัดไป (ไม่นับรายการที่เก็บถาวร; รายการซ้ำนับทุกรอบที่ตกในเดือนนั้น) */
export function summarizeNextMonth(items: ReminderItem[], today: string): CostSummary {
  const { from, to } = nextMonthRange(today)
  let total = 0
  let count = 0
  let withoutCost = 0
  for (const item of items) {
    if (item.archived_at !== null) continue
    const occurrences = countOccurrencesInRange(item, from, to)
    if (occurrences === 0) continue
    count++
    if (item.cost === null) withoutCost++
    else total += item.cost * occurrences
  }
  // ปัดเป็นสตางค์ กันทศนิยมลอยตัวเมื่อบวกหลายรายการ
  return { from, to, total: Math.round(total * 100) / 100, count, withoutCost }
}
