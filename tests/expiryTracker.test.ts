import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { CompleteFormInput, ItemFormInput, ReminderItem } from '../src/features/expiry-tracker/types/reminder.ts'
import { addDays, addMonths, daysBetween, isValidISODate, nextMonthRange } from '../src/features/expiry-tracker/utils/dates.ts'
import { summarizeNextMonth } from '../src/features/expiry-tracker/utils/costSummary.ts'
import { isReminding, reminderStage } from '../src/features/expiry-tracker/utils/reminders.ts'
import { addCycle, countOccurrencesInRange, nextDueAfterDone } from '../src/features/expiry-tracker/utils/schedule.ts'
import { compareItems } from '../src/features/expiry-tracker/utils/sort.ts'
import { daysLeft, daysLeftLabel, getUrgency } from '../src/features/expiry-tracker/utils/urgency.ts'
import { isUsageReached, usageRemaining } from '../src/features/expiry-tracker/utils/usage.ts'
import { validateComplete, validateItem } from '../src/features/expiry-tracker/utils/validation.ts'

const item = (patch: Partial<ReminderItem> = {}): ReminderItem => ({
  id: 'i1',
  category: 'home',
  name: 'ล้างแอร์',
  due_date: '2026-12-10',
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
  ...patch,
})

const form = (patch: Partial<ItemFormInput> = {}): ItemFormInput => ({
  category: 'home',
  name: 'ล้างแอร์',
  dueDate: '2026-12-10',
  repeatEvery: '',
  repeatUnit: 'month',
  remindBeforeDays: [],
  cost: '',
  providerName: '',
  providerPhone: '',
  note: '',
  usageEnabled: false,
  usageUnit: '',
  usageInterval: '',
  usageLastDone: '',
  usageCurrent: '',
  ...patch,
})

describe('dates', () => {
  it('ตรวจวันที่ที่มีอยู่จริง', () => {
    assert.equal(isValidISODate('2026-02-28'), true)
    assert.equal(isValidISODate('2026-02-30'), false)
    assert.equal(isValidISODate('2028-02-29'), true)
    assert.equal(isValidISODate('2026-2-3'), false)
    assert.equal(isValidISODate(''), false)
  })

  it('addDays ข้ามเดือน/ปีได้', () => {
    assert.equal(addDays('2026-12-31', 1), '2027-01-01')
    assert.equal(addDays('2026-03-01', -1), '2026-02-28')
  })

  it('addMonths ใช้วันสิ้นเดือนเมื่อวันนั้นไม่มีในเดือนปลายทาง', () => {
    assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
    assert.equal(addMonths('2028-01-31', 1), '2028-02-29')
    assert.equal(addMonths('2026-03-31', 1), '2026-04-30')
    assert.equal(addMonths('2026-11-15', 3), '2027-02-15')
    assert.equal(addMonths('2026-01-15', -2), '2025-11-15')
  })

  it('daysBetween นับตามวันปฏิทิน', () => {
    assert.equal(daysBetween('2026-11-16', '2026-11-16'), 0)
    assert.equal(daysBetween('2026-11-16', '2026-12-16'), 30)
    assert.equal(daysBetween('2026-11-16', '2026-11-10'), -6)
    assert.equal(daysBetween('2026-03-01', '2026-04-01'), 31)
  })

  it('nextMonthRange', () => {
    assert.deepEqual(nextMonthRange('2026-11-16'), { from: '2026-12-01', to: '2026-12-31' })
    assert.deepEqual(nextMonthRange('2026-12-31'), { from: '2027-01-01', to: '2027-01-31' })
    assert.deepEqual(nextMonthRange('2027-01-05'), { from: '2027-02-01', to: '2027-02-28' })
  })
})

describe('schedule', () => {
  it('addCycle', () => {
    assert.equal(addCycle('2026-11-16', 10, 'day'), '2026-11-26')
    assert.equal(addCycle('2026-11-16', 6, 'month'), '2027-05-16')
    assert.equal(addCycle('2028-02-29', 1, 'year'), '2029-02-28')
  })

  it('nextDueAfterDone: วันที่ทำ + รอบ, ไม่มีรอบ = null', () => {
    assert.equal(nextDueAfterDone(item({ repeat_every: 6, repeat_unit: 'month' }), '2026-11-20'), '2027-05-20')
    assert.equal(nextDueAfterDone(item(), '2026-11-20'), null)
  })

  it('countOccurrencesInRange: ไม่ซ้ำ', () => {
    assert.equal(countOccurrencesInRange(item({ due_date: '2026-12-10' }), '2026-12-01', '2026-12-31'), 1)
    assert.equal(countOccurrencesInRange(item({ due_date: '2027-01-01' }), '2026-12-01', '2026-12-31'), 0)
    assert.equal(countOccurrencesInRange(item({ due_date: '2026-12-31' }), '2026-12-01', '2026-12-31'), 1)
  })

  it('countOccurrencesInRange: ซ้ำ นับทุกรอบที่ตกในช่วง', () => {
    // ทุก 10 วัน เริ่ม 1 ธ.ค. -> 1, 11, 21, 31
    assert.equal(countOccurrencesInRange(item({ due_date: '2026-12-01', repeat_every: 10, repeat_unit: 'day' }), '2026-12-01', '2026-12-31'), 4)
    // รายเดือน เริ่มก่อนช่วง -> ตกในช่วงครั้งเดียว
    assert.equal(countOccurrencesInRange(item({ due_date: '2026-10-15', repeat_every: 1, repeat_unit: 'month' }), '2026-12-01', '2026-12-31'), 1)
    // รายปี ที่ยังไม่ถึงช่วง
    assert.equal(countOccurrencesInRange(item({ due_date: '2027-06-01', repeat_every: 1, repeat_unit: 'year' }), '2026-12-01', '2026-12-31'), 0)
  })

  it('countOccurrencesInRange: สิ้นเดือนไม่เพี้ยนสะสม', () => {
    // 31 ม.ค. ทุกเดือน: ก.พ. = 28 มี.ค. ต้องกลับมาเป็น 31 (ไม่ใช่ 28)
    const it31 = item({ due_date: '2026-01-31', repeat_every: 1, repeat_unit: 'month' })
    assert.equal(countOccurrencesInRange(it31, '2026-03-31', '2026-03-31'), 1)
    assert.equal(countOccurrencesInRange(it31, '2026-02-28', '2026-02-28'), 1)
  })
})

describe('urgency', () => {
  it('daysLeft และข้อความ', () => {
    assert.equal(daysLeft('2026-11-20', '2026-11-16'), 4)
    assert.equal(daysLeftLabel(0), 'ครบกำหนดวันนี้')
    assert.equal(daysLeftLabel(5), 'เหลือ 5 วัน')
    assert.equal(daysLeftLabel(-3), 'เลยกำหนด 3 วัน')
  })

  it('ขอบเขตสี: <7 แดง, 7-30 เหลือง, >30 เขียว', () => {
    assert.equal(getUrgency(-1, false), 'red')
    assert.equal(getUrgency(0, false), 'red')
    assert.equal(getUrgency(6, false), 'red')
    assert.equal(getUrgency(7, false), 'yellow')
    assert.equal(getUrgency(30, false), 'yellow')
    assert.equal(getUrgency(31, false), 'green')
  })

  it('ถึงระยะแล้วเป็นแดงแม้วันยังอีกนาน', () => {
    assert.equal(getUrgency(200, true), 'red')
  })
})

describe('usage', () => {
  const u = (last: number, interval: number, current: number) =>
    item({ usage_unit: 'กม.', usage_interval: interval, usage_last_done: last, usage_current: current })

  it('ระยะที่เหลือ', () => {
    assert.equal(usageRemaining(u(10000, 10000, 15000)), 5000)
    assert.equal(usageRemaining(u(10000, 10000, 21000)), -1000)
    assert.equal(usageRemaining(item()), null)
  })

  it('ถึงระยะเมื่อเหลือ <= 0 และไม่เพี้ยนจากทศนิยม', () => {
    assert.equal(isUsageReached(u(10000, 10000, 20000)), true)
    assert.equal(isUsageReached(u(10000, 10000, 19999.9)), false)
    assert.equal(isUsageReached(u(0.1, 0.2, 0.3)), true)
    assert.equal(isUsageReached(item()), false)
  })
})

describe('reminders', () => {
  it('ระดับเตือนที่แคบที่สุดที่ถึงเกณฑ์', () => {
    const levels = [180, 90, 30]
    assert.equal(reminderStage(200, levels), null)
    assert.equal(reminderStage(150, levels), 180)
    assert.equal(reminderStage(60, levels), 90)
    assert.equal(reminderStage(30, levels), 30)
    assert.equal(reminderStage(5, levels), 30)
    assert.equal(reminderStage(-2, levels), 30)
  })

  it('ไม่ตั้งเตือน = ไม่เตือน', () => {
    assert.equal(isReminding(1, []), false)
    assert.equal(isReminding(3, [3, 1]), true)
    assert.equal(isReminding(4, [3, 1]), false)
  })
})

describe('costSummary', () => {
  const today = '2026-11-16'

  it('รวมเฉพาะรายการที่ครบกำหนดในเดือนถัดไป และนับรอบซ้ำ', () => {
    const s = summarizeNextMonth(
      [
        item({ id: 'a', due_date: '2026-12-05', cost: 1000 }),
        item({ id: 'b', due_date: '2026-11-20', cost: 500 }), // เดือนนี้ ไม่นับ
        item({ id: 'c', due_date: '2026-12-01', cost: 100, repeat_every: 10, repeat_unit: 'day' }), // 4 ครั้ง
        item({ id: 'd', due_date: '2026-12-20' }), // ไม่มีราคา
      ],
      today,
    )
    assert.equal(s.total, 1400)
    assert.equal(s.count, 3)
    assert.equal(s.withoutCost, 1)
    assert.equal(s.from, '2026-12-01')
    assert.equal(s.to, '2026-12-31')
  })

  it('ไม่นับรายการที่เก็บถาวร', () => {
    const s = summarizeNextMonth([item({ due_date: '2026-12-05', cost: 999, archived_at: '2026-11-01T00:00:00Z' })], today)
    assert.equal(s.total, 0)
    assert.equal(s.count, 0)
  })

  it('ปัดทศนิยมสตางค์ไม่ให้ลอย', () => {
    const s = summarizeNextMonth(
      [item({ id: 'a', due_date: '2026-12-05', cost: 0.1 }), item({ id: 'b', due_date: '2026-12-06', cost: 0.2 })],
      today,
    )
    assert.equal(s.total, 0.3)
  })
})

describe('sort', () => {
  it('ถึงระยะก่อน แล้วตามวันที่ แล้วตามชื่อ', () => {
    const reached = item({ id: 'r', due_date: '2027-05-01', usage_unit: 'กม.', usage_interval: 1, usage_last_done: 0, usage_current: 5 })
    const soon = item({ id: 's', due_date: '2026-11-20' })
    const late = item({ id: 'l', due_date: '2026-12-20' })
    const sorted = [late, soon, reached].sort(compareItems)
    assert.deepEqual(sorted.map((i) => i.id), ['r', 's', 'l'])
  })
})

describe('validateItem', () => {
  it('ค่าถูกต้องคืน values (ตัดช่องว่าง เรียงระดับเตือน ตัดซ้ำ)', () => {
    const r = validateItem(form({ name: '  ล้างแอร์  ', remindBeforeDays: [1, 7, 7, 30], cost: '1,200.50', providerPhone: ' 081 ' }))
    assert.deepEqual(r.errors, {})
    assert.equal(r.values?.name, 'ล้างแอร์')
    assert.deepEqual(r.values?.remind_before_days, [30, 7, 1])
    assert.equal(r.values?.cost, 1200.5)
    assert.equal(r.values?.provider_phone, '081')
    assert.equal(r.values?.repeat_every, null)
    assert.equal(r.values?.repeat_unit, null)
    assert.equal(r.values?.usage_unit, null)
  })

  it('ชื่อว่าง/ยาวเกิน และวันที่ไม่ถูกต้อง', () => {
    assert.ok(validateItem(form({ name: '   ' })).errors.name)
    assert.ok(validateItem(form({ name: 'ก'.repeat(101) })).errors.name)
    assert.ok(validateItem(form({ dueDate: '' })).errors.dueDate)
    assert.ok(validateItem(form({ dueDate: '2026-02-30' })).errors.dueDate)
  })

  it('รอบทำซ้ำ: ต้องเป็นจำนวนเต็มบวก; ไม่กรอก = ไม่ซ้ำ', () => {
    const ok = validateItem(form({ repeatEvery: '6', repeatUnit: 'month' }))
    assert.equal(ok.values?.repeat_every, 6)
    assert.equal(ok.values?.repeat_unit, 'month')
    assert.ok(validateItem(form({ repeatEvery: '0' })).errors.repeatEvery)
    assert.ok(validateItem(form({ repeatEvery: '1.5' })).errors.repeatEvery)
    assert.ok(validateItem(form({ repeatEvery: '1001' })).errors.repeatEvery)
  })

  it('ค่าใช้จ่าย: ปฏิเสธติดลบ ตัวอักษร ทศนิยมเกิน 2 และเกินขีดจำกัด', () => {
    assert.ok(validateItem(form({ cost: '-1' })).errors.cost)
    assert.ok(validateItem(form({ cost: 'abc' })).errors.cost)
    assert.ok(validateItem(form({ cost: '1.234' })).errors.cost)
    assert.ok(validateItem(form({ cost: '100000001' })).errors.cost)
    assert.equal(validateItem(form({ cost: '0' })).values?.cost, 0)
  })

  it('ระดับเตือน: 0–730 และไม่เกิน 10 ระดับ', () => {
    assert.ok(validateItem(form({ remindBeforeDays: [731] })).errors.remindBeforeDays)
    assert.ok(validateItem(form({ remindBeforeDays: [-1] })).errors.remindBeforeDays)
    assert.ok(validateItem(form({ remindBeforeDays: [1.5] })).errors.remindBeforeDays)
    assert.ok(validateItem(form({ remindBeforeDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })).errors.remindBeforeDays)
    assert.equal(validateItem(form({ remindBeforeDays: [0, 730] })).errors.remindBeforeDays, undefined)
  })

  it('ตามระยะ: ต้องกรอกครบชุด และค่าปัจจุบันไม่น้อยกว่าที่ทำล่าสุด', () => {
    const missing = validateItem(form({ usageEnabled: true }))
    assert.ok(missing.errors.usageUnit && missing.errors.usageInterval && missing.errors.usageLastDone && missing.errors.usageCurrent)

    const ok = validateItem(form({ usageEnabled: true, usageUnit: 'กม.', usageInterval: '10000', usageLastDone: '50000', usageCurrent: '52000.5' }))
    assert.equal(ok.values?.usage_unit, 'กม.')
    assert.equal(ok.values?.usage_interval, 10000)
    assert.equal(ok.values?.usage_current, 52000.5)

    const backwards = validateItem(form({ usageEnabled: true, usageUnit: 'กม.', usageInterval: '10000', usageLastDone: '50000', usageCurrent: '49000' }))
    assert.ok(backwards.errors.usageCurrent)
    assert.ok(validateItem(form({ usageEnabled: true, usageUnit: 'กม.', usageInterval: '0', usageLastDone: '0', usageCurrent: '0' })).errors.usageInterval)
  })

  it('ปิดโหมดตามระยะ = ไม่ส่งค่าระยะแม้ช่องยังมีข้อความค้าง', () => {
    const r = validateItem(form({ usageEnabled: false, usageUnit: 'กม.', usageInterval: 'abc' }))
    assert.deepEqual(r.errors, {})
    assert.equal(r.values?.usage_unit, null)
    assert.equal(r.values?.usage_interval, null)
  })
})

describe('validateComplete', () => {
  const cf = (patch: Partial<CompleteFormInput> = {}): CompleteFormInput => ({
    doneOn: '2026-11-16',
    cost: '',
    providerName: '',
    providerPhone: '',
    note: '',
    usageValue: '',
    nextDue: '',
    ...patch,
  })

  it('เว้นวันครบกำหนดถัดไป = null (เก็บถาวร)', () => {
    const r = validateComplete(cf(), item())
    assert.equal(r.values?.next_due, null)
  })

  it('วันครบกำหนดถัดไปต้องอยู่หลังวันที่ทำ', () => {
    assert.ok(validateComplete(cf({ nextDue: '2026-11-16' }), item()).errors.nextDue)
    assert.ok(validateComplete(cf({ nextDue: '2026-11-01' }), item()).errors.nextDue)
    assert.equal(validateComplete(cf({ nextDue: '2027-05-16' }), item()).values?.next_due, '2027-05-16')
    assert.ok(validateComplete(cf({ nextDue: '2027-02-30' }), item()).errors.nextDue)
  })

  it('ค่าระยะว่างใช้ค่าปัจจุบัน; รายการไม่ตั้งตามระยะไม่มีค่าระยะ', () => {
    const usageItem = item({ usage_unit: 'กม.', usage_interval: 10000, usage_last_done: 0, usage_current: 12345 })
    assert.equal(validateComplete(cf(), usageItem).values?.usage_value, 12345)
    assert.equal(validateComplete(cf({ usageValue: '13000' }), usageItem).values?.usage_value, 13000)
    assert.ok(validateComplete(cf({ usageValue: 'x' }), usageItem).errors.usageValue)
    assert.equal(validateComplete(cf({ usageValue: '999' }), item()).values?.usage_value, null)
  })

  it('วันที่ทำไม่ถูกต้องและค่าใช้จ่ายผิดรูปแบบ', () => {
    assert.ok(validateComplete(cf({ doneOn: '' }), item()).errors.doneOn)
    assert.ok(validateComplete(cf({ cost: '-5' }), item()).errors.cost)
    assert.equal(validateComplete(cf({ cost: '350' }), item()).values?.cost, 350)
  })
})
