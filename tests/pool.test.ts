import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildPool, pickRandomItem, splitPool } from '../src/features/randomizer/utils/pool.ts'

const item = (id: string, group_id: string, label = id) => ({
  id,
  group_id,
  label,
  created_at: '',
  updated_at: '',
})

const items = [item('a', 'g1', 'พิซซ่า'), item('b', 'g1'), item('c', 'g2', 'พิซซ่า'), item('d', 'g3')]

describe('buildPool', () => {
  it('รวมรายการของทุกกลุ่มที่เลือกเป็นกองเดียว', () => {
    assert.deepEqual(buildPool(items, ['g1', 'g2']).map((i) => i.id), ['a', 'b', 'c'])
  })

  it('ไม่เลือกกลุ่มเลย = กองว่าง', () => {
    assert.deepEqual(buildPool(items, []), [])
  })

  it('รายการชื่อซ้ำต่างกลุ่มนับเป็นคนละรายการ (อ้างอิงด้วย id)', () => {
    const pool = buildPool(items, ['g1', 'g2'])
    assert.equal(pool.filter((i) => i.label === 'พิซซ่า').length, 2)
  })
})

describe('splitPool', () => {
  const pool = buildPool(items, ['g1', 'g2'])

  it('แยก Current / Excluded และเรียง Excluded ตามลำดับที่สุ่ม', () => {
    const { current, excluded } = splitPool(pool, ['c', 'a'])
    assert.deepEqual(excluded.map((i) => i.id), ['c', 'a'])
    assert.deepEqual(current.map((i) => i.id), ['b'])
  })

  it('ข้าม id ที่ไม่อยู่ใน pool แล้ว (เช่น รายการถูกลบ)', () => {
    const { current, excluded } = splitPool(pool, ['ถูกลบไปแล้ว', 'a'])
    assert.deepEqual(excluded.map((i) => i.id), ['a'])
    assert.deepEqual(current.map((i) => i.id), ['b', 'c'])
  })

  it('Reset (excludedIds ว่าง) คืนรายการทั้งหมดกลับ Current', () => {
    const { current, excluded } = splitPool(pool, [])
    assert.equal(current.length, 3)
    assert.equal(excluded.length, 0)
  })
})

describe('pickRandomItem', () => {
  const pool = buildPool(items, ['g1', 'g2'])

  it('กองว่างคืน null', () => {
    assert.equal(pickRandomItem([]), null)
  })

  it('เลือกตามค่า random ที่ส่งเข้ามา และไม่เกินขอบ', () => {
    assert.equal(pickRandomItem(pool, () => 0)?.id, 'a')
    assert.equal(pickRandomItem(pool, () => 0.5)?.id, 'b')
    assert.equal(pickRandomItem(pool, () => 0.9999999)?.id, 'c')
    assert.equal(pickRandomItem(pool, () => 1)?.id, 'c')
  })

  it('สุ่มต่อเนื่องจนหมดโดยไม่ซ้ำ แล้วได้ null', () => {
    const excludedIds: string[] = []
    const picked: string[] = []
    for (;;) {
      const { current } = splitPool(pool, excludedIds)
      const next = pickRandomItem(current)
      if (!next) break
      picked.push(next.id)
      excludedIds.push(next.id)
    }
    assert.deepEqual([...picked].sort(), ['a', 'b', 'c'])
  })
})
