import { RED_BELOW_DAYS, YELLOW_UP_TO_DAYS } from '../constants.ts'
import type { Urgency } from '../types/reminder'
import { daysBetween } from './dates.ts'

/** จำนวนวันที่เหลือถึงวันครบกำหนด (ติดลบ = เลยกำหนด) */
export function daysLeft(dueDate: string, today: string): number {
  return daysBetween(today, dueDate)
}

/** แดง: เลยกำหนด/เหลือน้อยกว่า 7 วัน/ถึงระยะแล้ว; เหลือง: 7–30 วัน; เขียว: มากกว่า 30 วัน */
export function getUrgency(days: number, usageReached: boolean): Urgency {
  if (usageReached || days < RED_BELOW_DAYS) return 'red'
  if (days <= YELLOW_UP_TO_DAYS) return 'yellow'
  return 'green'
}

export function daysLeftLabel(days: number): string {
  if (days < 0) return `เลยกำหนด ${Math.abs(days).toLocaleString('th-TH')} วัน`
  if (days === 0) return 'ครบกำหนดวันนี้'
  return `เหลือ ${days.toLocaleString('th-TH')} วัน`
}
