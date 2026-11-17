import { addDays, isValidISODate } from './dates.ts'

/** วันที่ที่การเตือนระดับ "ก่อนครบกำหนด N วัน" ตกอยู่ (วันครบกำหนดยังไม่ถูกต้อง = null) */
export function reminderDate(dueDate: string, daysBefore: number): string | null {
  return isValidISODate(dueDate) ? addDays(dueDate, -daysBefore) : null
}

/**
 * ระดับเตือนที่ "ถึงเกณฑ์แล้ว" และแคบที่สุด (ระดับที่น้อยที่สุดที่ยังมากกว่าหรือเท่ากับจำนวนวันที่เหลือ)
 * ไม่ถึงเกณฑ์ (หรือไม่ได้ตั้งเตือน) = null; เลยกำหนดแล้วนับว่าถึงเกณฑ์ทุกระดับ
 */
export function reminderStage(daysLeft: number, remindBeforeDays: number[]): number | null {
  const reached = remindBeforeDays.filter((level) => level >= daysLeft)
  return reached.length === 0 ? null : Math.min(...reached)
}

export function isReminding(daysLeft: number, remindBeforeDays: number[]): boolean {
  return reminderStage(daysLeft, remindBeforeDays) !== null
}
