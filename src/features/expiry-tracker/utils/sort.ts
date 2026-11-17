import type { ReminderItem } from '../types/reminder'
import { isUsageReached } from './usage.ts'

/** เรียงรายการ: ถึงระยะแล้วขึ้นก่อน แล้วตามวันครบกำหนดใกล้สุด แล้วตามชื่อ */
export function compareItems(a: ReminderItem, b: ReminderItem): number {
  const reachedA = isUsageReached(a) ? 0 : 1
  const reachedB = isUsageReached(b) ? 0 : 1
  if (reachedA !== reachedB) return reachedA - reachedB
  if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1
  return a.name.localeCompare(b.name, 'th')
}
