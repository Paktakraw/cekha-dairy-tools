import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { summarize } from '../src/features/finance/utils/summary.ts'
import type { Category, Transaction } from '../src/features/finance/types/finance.ts'

const categories: Category[] = [
  { id: 'c1', name: 'เงินเดือน', type: 'income', description: null, created_at: '', updated_at: '' },
  { id: 'c2', name: 'อาหาร', type: 'expense', description: null, created_at: '', updated_at: '' },
  { id: 'c3', name: 'ช้อปปิ้ง', type: 'expense', description: null, created_at: '', updated_at: '' },
]

let seq = 0
const tx = (category_id: string, type: Transaction['type'], amount: number): Transaction => ({
  id: String(seq++),
  transaction_date: '2026-11-01',
  type,
  category_id,
  amount,
  description: null,
  created_at: '',
  updated_at: '',
})

describe('summarize', () => {
  it('รวมรายรับ รายจ่าย และจำนวนรายการ', () => {
    const s = summarize([tx('c1', 'income', 30000), tx('c2', 'expense', 120), tx('c3', 'expense', 500)], categories)
    assert.equal(s.totalIncome, 30000)
    assert.equal(s.totalExpense, 620)
    assert.equal(s.transactionCount, 3)
  })

  it('ทศนิยมไม่คลาดเคลื่อน (0.1 + 0.2 = 0.3 พอดี)', () => {
    const s = summarize([tx('c2', 'expense', 0.1), tx('c2', 'expense', 0.2)], categories)
    assert.equal(s.totalExpense, 0.3)
  })

  it('สรุปตามหมวดหมู่ เรียงจากยอดมากไปน้อย พร้อมจำนวนรายการ', () => {
    const s = summarize(
      [tx('c2', 'expense', 100), tx('c2', 'expense', 50), tx('c3', 'expense', 500.5), tx('c1', 'income', 30000)],
      categories,
    )
    assert.deepEqual(
      s.byCategory.map((c) => [c.name, c.total, c.count]),
      [
        ['เงินเดือน', 30000, 1],
        ['ช้อปปิ้ง', 500.5, 1],
        ['อาหาร', 150, 2],
      ],
    )
  })

  it('ไม่มีรายการ = ทุกค่าเป็น 0 และไม่มีหมวดหมู่', () => {
    const s = summarize([], categories)
    assert.deepEqual(
      [s.totalIncome, s.totalExpense, s.transactionCount, s.byCategory.length],
      [0, 0, 0, 0],
    )
  })

  it('หมวดหมู่ที่ไม่พบแสดงเป็น "ไม่ทราบหมวดหมู่"', () => {
    const s = summarize([tx('ไม่มีอยู่จริง', 'expense', 1)], categories)
    assert.equal(s.byCategory[0].name, 'ไม่ทราบหมวดหมู่')
  })
})
