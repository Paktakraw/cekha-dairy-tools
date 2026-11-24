import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { differenceFromTdee, summarizeCalorieToday } from '../src/features/calorie/utils/todayOverview.ts'
import { monthStartOf, summarizeFinanceToday } from '../src/features/finance/utils/todayOverview.ts'
import { summarizeExpiryToday } from '../src/features/expiry-tracker/utils/todayOverview.ts'
import { localDayBounds } from '../src/features/todo/utils/today.ts'
import type { FoodEntry } from '../src/features/calorie/types/calorie'
import type { Transaction } from '../src/features/finance/types/finance'
import type { ReminderItem } from '../src/features/expiry-tracker/types/reminder'

const TODAY = '2026-11-24'

const tx = (date: string, type: 'income' | 'expense', amount: number): Transaction => ({
  id: `${date}-${type}-${amount}`,
  transaction_date: date,
  type,
  category_id: 'c1',
  amount,
  description: null,
  created_at: '',
  updated_at: '',
})

const item = (over: Partial<ReminderItem>): ReminderItem => ({
  id: over.name ?? 'x',
  category: 'other',
  name: 'รายการ',
  due_date: '2026-12-31',
  repeat_every: null,
  repeat_unit: null,
  remind_before_days: [],
  cost: null,
  provider_name: null,
  provider_phone: null,
  note: null,
  usage_unit: null,
  usage_interval: null,
  usage_last_done: null,
  usage_current: null,
  archived_at: null,
  created_at: '',
  updated_at: '',
  ...over,
})

const food = (kcal: number, quantity: number): FoodEntry => ({
  id: String(kcal),
  eaten_on: TODAY,
  meal: 'lunch',
  food_id: null,
  food_name: 'ข้าว',
  serving_unit: 'จาน',
  kcal_per_unit: kcal,
  quantity,
  created_at: '',
  updated_at: '',
})

describe('todo: localDayBounds', () => {
  it('ช่วงวันเป็น [00:00 วันนี้, 00:00 วันพรุ่งนี้) ตามเวลาท้องถิ่น', () => {
    const { start, end } = localDayBounds(new Date(2026, 10, 24, 15, 30))
    assert.equal(new Date(start).getTime(), new Date(2026, 10, 24).getTime())
    assert.equal(new Date(end).getTime(), new Date(2026, 10, 25).getTime())
  })
  it('ข้ามสิ้นเดือน/สิ้นปีได้', () => {
    const { end } = localDayBounds(new Date(2026, 11, 31, 23, 59))
    assert.equal(new Date(end).getTime(), new Date(2027, 0, 1).getTime())
  })
})

describe('expiry: summarizeExpiryToday', () => {
  it('ไม่มีรายการ = next เป็น null และนับเป็น 0', () => {
    assert.deepEqual(summarizeExpiryToday([], TODAY), { overdue: 0, reminding: 0, next: null })
  })
  it('นับเฉพาะรายการที่ใช้งานอยู่ (เก็บถาวรไม่นับ)', () => {
    const r = summarizeExpiryToday(
      [item({ name: 'เลย', due_date: '2026-11-20' }), item({ name: 'ถาวร', due_date: '2026-11-01', archived_at: '2026-11-02T00:00:00Z' })],
      TODAY,
    )
    assert.equal(r.overdue, 1)
  })
  it('นับถึงเกณฑ์เตือนรวมเลยกำหนด และเลือกรายการใกล้ที่สุดพร้อมสีและข้อความ', () => {
    const r = summarizeExpiryToday(
      [
        item({ name: 'ไกล', due_date: '2027-06-01', remind_before_days: [30] }),
        item({ name: 'ใกล้', due_date: '2026-11-29', remind_before_days: [7] }),
        item({ name: 'เลย', due_date: '2026-11-20', remind_before_days: [7] }),
      ],
      TODAY,
    )
    assert.equal(r.overdue, 1)
    assert.equal(r.reminding, 2)
    assert.equal(r.next?.name, 'เลย')
    assert.equal(r.next?.urgency, 'red')
    assert.equal(r.next?.label, 'เลยกำหนด 4 วัน')
  })
  it('ถึงระยะแล้วขึ้นก่อนและเป็นสีแดง', () => {
    const r = summarizeExpiryToday(
      [
        item({ name: 'วันที่', due_date: '2026-11-25' }),
        item({ name: 'ระยะ', due_date: '2027-05-01', usage_unit: 'กม.', usage_interval: 10000, usage_last_done: 0, usage_current: 10500 }),
      ],
      TODAY,
    )
    assert.equal(r.next?.name, 'ระยะ')
    assert.equal(r.next?.urgency, 'red')
    assert.equal(r.next?.label, 'ถึงระยะแล้ว')
    assert.equal(r.reminding, 1)
  })
})

describe('finance: summarizeFinanceToday', () => {
  it('แยกยอดวันนี้และเดือนนี้ และไม่นับเดือนก่อน', () => {
    const r = summarizeFinanceToday(
      [tx(TODAY, 'expense', 100.5), tx(TODAY, 'expense', 49.5), tx(TODAY, 'income', 1000), tx('2026-11-03', 'expense', 200), tx('2026-10-30', 'expense', 999)],
      TODAY,
    )
    assert.equal(r.todayExpense, 150)
    assert.equal(r.todayIncome, 1000)
    assert.equal(r.todayCount, 3)
    assert.equal(r.monthExpense, 350)
  })
  it('รวมเป็นสตางค์ ไม่คลาดเคลื่อนจากทศนิยม (0.1 + 0.2)', () => {
    const r = summarizeFinanceToday([tx(TODAY, 'expense', 0.1), tx(TODAY, 'expense', 0.2)], TODAY)
    assert.equal(r.todayExpense, 0.3)
  })
  it('ไม่มีรายการ = 0 ทั้งหมด', () => {
    assert.deepEqual(summarizeFinanceToday([], TODAY), { todayExpense: 0, todayIncome: 0, todayCount: 0, monthExpense: 0 })
  })
  it('monthStartOf ให้วันที่ 1 ของเดือน', () => {
    assert.equal(monthStartOf('2026-11-24'), '2026-11-01')
  })
})

describe('calorie: summarizeCalorieToday', () => {
  it('รวมแคลอรี่จากจำนวนหน่วย และเทียบ TDEE', () => {
    const r = summarizeCalorieToday([food(500, 1), food(100, 0.5)], 2000)
    assert.equal(r.total, 550)
    assert.equal(r.entryCount, 2)
    assert.equal(differenceFromTdee(r), -1450)
  })
  it('ยังไม่มี TDEE = ส่วนต่างเป็น null; ไม่มีรายการ = 0', () => {
    const r = summarizeCalorieToday([], null)
    assert.equal(r.total, 0)
    assert.equal(r.entryCount, 0)
    assert.equal(differenceFromTdee(r), null)
  })
})
