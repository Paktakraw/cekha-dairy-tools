import type { UnitGroup } from './types/unitPrice'

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 3

export const NAME_MAX_LENGTH = 50
export const PRICE_MAX = 1_000_000
export const QUANTITY_MAX = 1_000_000

/** ราคาต่อหน่วยที่ต่างกันไม่เกินสัดส่วนนี้ ถือว่าเท่ากัน (กันความคลาดเคลื่อนทศนิยม) */
export const TIE_TOLERANCE = 1e-9

export const GROUP_LABELS: Record<UnitGroup, string> = {
  weight: 'น้ำหนัก',
  volume: 'ปริมาตร',
  count: 'นับจำนวน',
}
