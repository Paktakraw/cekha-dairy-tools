import type { RandomItem } from '../types/random'

/** รวมรายการของทุกกลุ่มที่เลือกเป็น Pool เดียว (อ้างอิงด้วย id จึงนับรายการชื่อซ้ำต่างกลุ่มเป็นคนละรายการ) */
export function buildPool(items: RandomItem[], selectedGroupIds: string[]): RandomItem[] {
  const selected = new Set(selectedGroupIds)
  return items.filter((item) => selected.has(item.group_id))
}

/**
 * แยก Pool เป็น Current (ยังสุ่มได้) กับ Excluded (สุ่มไปแล้ว เรียงตามลำดับที่สุ่ม)
 * excludedIds ที่ไม่อยู่ใน pool แล้ว (เช่น รายการถูกลบ) จะถูกข้ามไปเอง
 */
export function splitPool(pool: RandomItem[], excludedIds: string[]): { current: RandomItem[]; excluded: RandomItem[] } {
  const excludedSet = new Set(excludedIds)
  const byId = new Map(pool.map((item) => [item.id, item]))
  const excluded = excludedIds.flatMap((id) => byId.get(id) ?? [])
  const current = pool.filter((item) => !excludedSet.has(item.id))
  return { current, excluded }
}

/** สุ่ม 1 รายการ คืน null ถ้า pool ว่าง (ส่ง random เข้ามาเพื่อให้ทดสอบได้) */
export function pickRandomItem(current: RandomItem[], random: () => number = Math.random): RandomItem | null {
  if (current.length === 0) return null
  const index = Math.min(current.length - 1, Math.floor(random() * current.length))
  return current[index]
}
