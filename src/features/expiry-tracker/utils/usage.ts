import type { ReminderItem } from '../types/reminder'

type UsageFields = Pick<ReminderItem, 'usage_unit' | 'usage_interval' | 'usage_last_done' | 'usage_current'>

/** ระยะที่เหลือก่อนครบกำหนด (ติดลบ = เกินระยะแล้ว) ไม่ได้ตั้งตามระยะ = null */
export function usageRemaining(item: UsageFields): number | null {
  if (item.usage_unit === null || item.usage_interval === null || item.usage_last_done === null || item.usage_current === null) {
    return null
  }
  // ปัดทศนิยม 1 ตำแหน่งกันค่าลอยตัวเพี้ยน (เช่น 0.1 + 0.2)
  return Math.round((item.usage_last_done + item.usage_interval - item.usage_current) * 10) / 10
}

export function isUsageReached(item: UsageFields): boolean {
  const remaining = usageRemaining(item)
  return remaining !== null && remaining <= 0
}
