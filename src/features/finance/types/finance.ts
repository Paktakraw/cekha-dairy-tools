export type TransactionType = 'income' | 'expense'

/** Row จากตาราง categories (ไม่ select user_id) */
export interface Category {
  id: string
  name: string
  type: TransactionType
  description: string | null
  created_at: string
  updated_at: string
}

/** ข้อมูลจาก Form หมวดหมู่ */
export interface CategoryInput {
  name: string
  type: TransactionType
  description: string
}

/** Row จากตาราง transactions (ไม่ select user_id) */
export interface Transaction {
  id: string
  /** YYYY-MM-DD */
  transaction_date: string
  type: TransactionType
  category_id: string
  amount: number
  description: string | null
  created_at: string
  updated_at: string
}

/** ข้อมูลจาก Form รายการ (amount เป็น string เพราะมาจากช่องกรอก) */
export interface TransactionInput {
  transaction_date: string
  type: TransactionType
  category_id: string
  amount: string
  description: string
}

/** ค่าว่าง ('') = ไม่กรองตามฟิลด์นั้น */
export interface TransactionFilters {
  /** YYYY-MM-DD */
  dateFrom: string
  dateTo: string
  /** YYYY-MM (ถ้าเลือก จะใช้แทนช่วงวันที่) */
  month: string
  type: '' | TransactionType
  categoryId: string
  search: string
}

export const EMPTY_FILTERS: TransactionFilters = {
  dateFrom: '',
  dateTo: '',
  month: '',
  type: '',
  categoryId: '',
  search: '',
}

export interface CategoryTotal {
  categoryId: string
  name: string
  type: TransactionType
  /** ยอดรวม (บาท) */
  total: number
  count: number
}

export interface Summary {
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
  /** เรียงจากยอดมากไปน้อย */
  byCategory: CategoryTotal[]
}
