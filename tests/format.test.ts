import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatCurrency } from '../src/shared/utils/formatCurrency.ts'
import { formatDate, todayISO } from '../src/shared/utils/formatDate.ts'

describe('formatCurrency', () => {
  it('แสดงเป็นบาท มีคอมมาและทศนิยม 2 ตำแหน่ง', () => {
    assert.match(formatCurrency(1000), /฿\s?1,000\.00/)
    assert.match(formatCurrency(0.5), /฿\s?0\.50/)
  })

  it('ยอดติดลบแสดงเครื่องหมายลบ', () => {
    assert.match(formatCurrency(-250), /-.*250\.00/)
  })
})

describe('todayISO', () => {
  it('คืนวันที่รูปแบบ YYYY-MM-DD ตรงกับวันที่ตามเวลาท้องถิ่น', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(todayISO(), expected)
  })
})

describe('formatDate', () => {
  it('ไม่เพี้ยนวันเพราะ timezone (แสดงวันที่ตามที่ระบุเสมอ)', () => {
    assert.match(formatDate('2026-01-01'), /^1 /)
    assert.match(formatDate('2026-12-31'), /^31 /)
  })
})
