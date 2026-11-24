import type { Transaction } from '../types/finance'
import { summarize } from './summary.ts'

export interface FinanceToday {
  todayExpense: number
  todayIncome: number
  todayCount: number
  /** รายจ่ายตั้งแต่วันที่ 1 ของเดือนถึงวันนี้ */
  monthExpense: number
}

/** ต้นเดือนของวันที่ (YYYY-MM-DD) */
export function monthStartOf(today: string): string {
  return `${today.slice(0, 7)}-01`
}

/**
 * สรุปสำหรับการ์ดภาพรวมวันนี้ (pure function)
 * รับรายการตั้งแต่ต้นเดือนถึงวันนี้ ใช้ summarize เดิม (รวมเป็นสตางค์) จึงไม่คลาดเคลื่อนจากทศนิยม
 */
export function summarizeFinanceToday(transactions: Transaction[], today: string): FinanceToday {
  const todays = transactions.filter((t) => t.transaction_date === today)
  const day = summarize(todays, [])
  const month = summarize(
    transactions.filter((t) => t.transaction_date >= monthStartOf(today) && t.transaction_date <= today),
    [],
  )
  return {
    todayExpense: day.totalExpense,
    todayIncome: day.totalIncome,
    todayCount: day.transactionCount,
    monthExpense: month.totalExpense,
  }
}
