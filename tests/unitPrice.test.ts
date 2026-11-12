import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { OptionInput, UnitId } from '../src/features/unit-price/types/unitPrice.ts'
import { formatPercent, formatUnitPrice } from '../src/features/unit-price/utils/format.ts'
import { compareOptions, pricePerBaseUnit, pricePerResultUnit, validateOption } from '../src/features/unit-price/utils/unitPrice.ts'
import { findResultUnit } from '../src/features/unit-price/utils/units.ts'

const opt = (id: string, price: string, quantity: string, unit: UnitId = 'g', name = ''): OptionInput => ({
  id,
  name,
  price,
  quantity,
  unit,
})

describe('validateOption', () => {
  it('ช่องราคาและปริมาณว่างทั้งคู่ = ยังไม่กรอก ไม่มี error', () => {
    const r = validateOption(opt('a', '', ''))
    assert.equal(r.blank, true)
    assert.deepEqual(r.errors, {})
    assert.equal(r.values, null)
  })

  it('กรอกแค่ช่องเดียวต้องมี error ที่ช่องที่ขาด', () => {
    assert.ok(validateOption(opt('a', '50', '')).errors.quantity)
    assert.ok(validateOption(opt('a', '', '100')).errors.price)
  })

  it('ค่าถูกต้องคืนตัวเลข (รองรับคอมมาและจุดท้าย)', () => {
    assert.deepEqual(validateOption(opt('a', '1,299.50', '500')).values, { price: 1299.5, quantity: 500 })
    assert.deepEqual(validateOption(opt('a', '50.', '2.5')).values, { price: 50, quantity: 2.5 })
  })

  it('ปฏิเสธศูนย์ ติดลบ ตัวอักษร และเกินขีดจำกัด', () => {
    assert.ok(validateOption(opt('a', '0', '100')).errors.price)
    assert.ok(validateOption(opt('a', '-5', '100')).errors.price)
    assert.ok(validateOption(opt('a', 'abc', '100')).errors.price)
    assert.ok(validateOption(opt('a', '1000001', '100')).errors.price)
    assert.ok(validateOption(opt('a', '10', '0')).errors.quantity)
    assert.ok(validateOption(opt('a', '10', '1e3')).errors.quantity)
    assert.ok(validateOption(opt('a', '10', '1000001')).errors.quantity)
  })

  it('ราคาทศนิยมเกิน 2 ตำแหน่งไม่ผ่าน', () => {
    assert.ok(validateOption(opt('a', '10.123', '100')).errors.price)
  })

  it('ชื่อยาวเกิน 50 ตัวอักษรไม่ผ่าน', () => {
    const r = validateOption(opt('a', '10', '100', 'g', 'ก'.repeat(51)))
    assert.ok(r.errors.name)
    assert.equal(r.values, null)
  })
})

describe('pricePerBaseUnit', () => {
  it('แปลงหน่วยเป็นหน่วยฐานถูกต้อง', () => {
    assert.equal(pricePerBaseUnit(100, 500, 'g'), 0.2)
    assert.equal(pricePerBaseUnit(100, 1, 'kg'), 0.1)
    assert.equal(pricePerBaseUnit(100, 1, 'l'), 0.1)
    assert.equal(pricePerBaseUnit(10, 4, 'piece'), 2.5)
  })

  it('กรัมกับกิโลกรัมให้ราคาต่อกรัมเท่ากันเมื่อปริมาณเท่ากัน', () => {
    assert.equal(pricePerBaseUnit(100, 1000, 'g'), pricePerBaseUnit(100, 1, 'kg'))
    assert.ok(Math.abs(pricePerBaseUnit(100, 1_000_000, 'mg') - pricePerBaseUnit(100, 1, 'kg')) < 1e-12)
  })
})

describe('compareOptions', () => {
  it('ยังกรอกครบไม่ถึง 2 ตัว = ยังเทียบไม่ได้', () => {
    assert.deepEqual(compareOptions([opt('a', '50', '100'), opt('b', '', '')]), { status: 'not-enough', validCount: 1 })
    assert.deepEqual(compareOptions([opt('a', '50', '100'), opt('b', 'x', '100')]), { status: 'not-enough', validCount: 1 })
  })

  it('หาตัวที่ถูกที่สุดต่อหน่วย และ % ที่แพงกว่า', () => {
    // A: 100 บาท / 500 ก. = 0.2/ก.   B: 150 บาท / 1 กก. = 0.15/ก. (ถูกกว่า)
    const r = compareOptions([opt('a', '100', '500'), opt('b', '150', '1', 'kg')])
    assert.equal(r.status, 'ok')
    if (r.status !== 'ok') return
    const a = r.items.find((i) => i.id === 'a')!
    const b = r.items.find((i) => i.id === 'b')!
    assert.equal(b.isCheapest, true)
    assert.equal(a.isCheapest, false)
    assert.ok(Math.abs(a.percentMore - (0.2 / 0.15 - 1) * 100) < 1e-9)
    assert.equal(b.percentMore, 0)
    assert.equal(r.allEqual, false)
    assert.equal(r.group, 'weight')
  })

  it('ราคาต่อหน่วยเท่ากัน = ทุกตัวถูกที่สุดและ allEqual', () => {
    const r = compareOptions([opt('a', '100', '500'), opt('b', '200', '1', 'kg'), opt('c', '0.2', '1')])
    assert.equal(r.status, 'ok')
    if (r.status !== 'ok') return
    assert.equal(r.allEqual, true)
    assert.ok(r.items.every((i) => i.isCheapest && i.percentMore === 0))
  })

  it('สองตัวเท่ากันและถูกสุด ตัวที่สามแพงกว่า', () => {
    const r = compareOptions([opt('a', '10', '100'), opt('b', '20', '200'), opt('c', '30', '200')])
    assert.equal(r.status, 'ok')
    if (r.status !== 'ok') return
    assert.deepEqual(r.items.map((i) => i.isCheapest), [true, true, false])
    assert.equal(r.allEqual, false)
  })

  it('คนละกลุ่มหน่วยเทียบไม่ได้', () => {
    assert.deepEqual(compareOptions([opt('a', '50', '100', 'g'), opt('b', '50', '100', 'ml')]), { status: 'mixed-groups' })
  })

  it('ตัวเลือกที่ไม่ถูกต้องถูกข้าม ไม่ทำให้กลุ่มหน่วยปนกัน', () => {
    const r = compareOptions([opt('a', '50', '100', 'g'), opt('b', '60', '100', 'g'), opt('c', 'x', '100', 'ml')])
    assert.equal(r.status, 'ok')
    if (r.status === 'ok') assert.equal(r.items.length, 2)
  })

  it('นับจำนวนเป็นชิ้น', () => {
    const r = compareOptions([opt('a', '60', '12', 'piece'), opt('b', '35', '6', 'piece')])
    assert.equal(r.status, 'ok')
    if (r.status !== 'ok') return
    assert.equal(r.items.find((i) => i.isCheapest)?.id, 'a')
  })
})

describe('pricePerResultUnit / findResultUnit', () => {
  it('คูณขนาดหน่วยผลลัพธ์', () => {
    assert.ok(Math.abs(pricePerResultUnit(0.2, findResultUnit('weight', 'per-100g')) - 20) < 1e-9)
    assert.ok(Math.abs(pricePerResultUnit(0.2, findResultUnit('weight', 'per-1kg')) - 200) < 1e-9)
  })

  it('id ที่ไม่รู้จักใช้ค่าเริ่มต้นของกลุ่ม', () => {
    assert.equal(findResultUnit('volume', 'nope').id, 'per-100ml')
  })
})

describe('format', () => {
  it('ราคาต่อหน่วยเลขน้อยแสดงทศนิยมเพิ่ม', () => {
    assert.equal(formatUnitPrice(20), '฿20.00')
    assert.equal(formatUnitPrice(0.0123), '฿0.0123')
    assert.equal(formatUnitPrice(0.00012), '฿0.00012')
  })

  it('เปอร์เซ็นต์ปัดทศนิยม 1 ตำแหน่ง และไม่แสดง 0% เมื่อยังแพงกว่า', () => {
    assert.equal(formatPercent(33.333), '33.3')
    assert.equal(formatPercent(0.04), '<0.1')
  })
})
