import type { ReminderItem, Urgency } from '../types/reminder'
import { compareItems } from './sort.ts'
import { isReminding } from './reminders.ts'
import { daysLeft, daysLeftLabel, getUrgency } from './urgency.ts'
import { isUsageReached } from './usage.ts'

export interface NextItem {
  name: string
  urgency: Urgency
  /** ข้อความบอกเวลาที่เหลือ เช่น "เหลือ 5 วัน" หรือ "ถึงระยะแล้ว" */
  label: string
}

export interface ExpiryToday {
  overdue: number
  reminding: number
  /** รายการใช้งานอยู่ที่ใกล้ครบกำหนดที่สุด (ไม่มีรายการ = null) */
  next: NextItem | null
}

/**
 * สรุปสำหรับการ์ดภาพรวมวันนี้ (pure function) นับเฉพาะรายการที่ใช้งานอยู่
 * ใช้กฎเดียวกับหน้า "อย่าลืมฉัน": เลยกำหนด, ถึงเกณฑ์เตือน (หรือถึงระยะ), เรียงด้วย compareItems
 */
export function summarizeExpiryToday(items: ReminderItem[], today: string): ExpiryToday {
  const active = items.filter((i) => i.archived_at === null)
  const overdue = active.filter((i) => daysLeft(i.due_date, today) < 0).length
  const reminding = active.filter(
    (i) => isUsageReached(i) || isReminding(daysLeft(i.due_date, today), i.remind_before_days),
  ).length

  const first = [...active].sort(compareItems)[0]
  if (!first) return { overdue, reminding, next: null }

  const days = daysLeft(first.due_date, today)
  const reached = isUsageReached(first)
  return {
    overdue,
    reminding,
    next: { name: first.name, urgency: getUrgency(days, reached), label: reached ? 'ถึงระยะแล้ว' : daysLeftLabel(days) },
  }
}
