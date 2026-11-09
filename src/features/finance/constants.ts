import type { TransactionType } from './types/finance'

// ต้องตรงกับ CHECK constraint ใน supabase/migrations/*_finance.sql
export const CATEGORY_NAME_MAX_LENGTH = 50
export const CATEGORY_DESCRIPTION_MAX_LENGTH = 200
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 200
/** numeric(12,2) */
export const AMOUNT_MAX = 9_999_999_999.99

export const PAGE_SIZE = 10
/** จำนวนรายการล่าสุดที่แสดงในหน้า Transactions */
export const RECENT_LIMIT = 10

export const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'รายรับ',
  expense: 'รายจ่าย',
}

export const DUPLICATE_CATEGORY_MESSAGE = 'มีหมวดหมู่ชื่อนี้ในประเภทเดียวกันอยู่แล้ว กรุณาใช้ชื่ออื่น'
export const CATEGORY_IN_USE_MESSAGE =
  'ลบไม่ได้ เพราะมีรายการรายรับ-รายจ่ายใช้หมวดหมู่นี้อยู่ กรุณาลบหรือย้ายรายการเหล่านั้นไปหมวดอื่นก่อน'
