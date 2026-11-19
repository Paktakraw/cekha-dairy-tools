import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { addDays, buildMonthGrid, daysInMonth, monthRange, shiftMonth } from '../src/features/mood/utils/calendar.ts'
import { BOOST_MESSAGES, ENCOURAGEMENTS, pickMessage } from '../src/features/mood/utils/messages.ts'
import { consecutiveDaysWithMood, dominantMood, moodShares, topTags } from '../src/features/mood/utils/stats.ts'
import { normalizeDetails, validateEntryDate } from '../src/features/mood/utils/validation.ts'
import type { MoodEntry, MoodScore, MoodTagId } from '../src/features/mood/types/mood'

const entry = (date: string, mood: MoodScore, tags: MoodTagId[] = []): MoodEntry => ({
  id: date,
  entry_date: date,
  mood,
  tags,
  note: null,
  created_at: '',
  updated_at: '',
})

describe('mood calendar', () => {
  it('daysInMonth รวมกุมภาพันธ์ปีอธิกสุรทิน', () => {
    assert.equal(daysInMonth(2028, 2), 29)
    assert.equal(daysInMonth(2027, 2), 28)
    assert.equal(daysInMonth(2026, 11), 30)
  })
  it('monthRange / shiftMonth ข้ามปี', () => {
    assert.deepEqual(monthRange('2026-11'), { from: '2026-11-01', to: '2026-11-30' })
    assert.equal(shiftMonth('2026-01', -1), '2025-12')
    assert.equal(shiftMonth('2026-12', 1), '2027-01')
  })
  it('buildMonthGrid เริ่มวันอาทิตย์และเติมครบสัปดาห์', () => {
    // 1 พ.ย. 2026 เป็นวันอาทิตย์ -> ไม่มีช่องว่างนำหน้า, 30 วัน = 5 สัปดาห์ (35 ช่อง)
    const nov = buildMonthGrid('2026-11')
    assert.equal(nov[0], '2026-11-01')
    assert.equal(nov.length, 35)
    assert.equal(nov[29], '2026-11-30')
    // 1 ธ.ค. 2026 เป็นวันอังคาร -> ช่องว่างนำหน้า 2 ช่อง
    const dec = buildMonthGrid('2026-12')
    assert.deepEqual(dec.slice(0, 3), [null, null, '2026-12-01'])
    assert.equal(dec.length % 7, 0)
  })
  it('addDays ข้ามเดือน/ปี', () => {
    assert.equal(addDays('2026-03-01', -1), '2026-02-28')
    assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  })
})

describe('mood stats', () => {
  it('moodShares รวมกัน 100 และเรียงจากดีไปไม่ดี', () => {
    const shares = moodShares([entry('a', 5), entry('b', 4), entry('c', 3)])
    assert.deepEqual(shares.map((s) => s.score), [5, 4, 3, 2, 1])
    assert.equal(shares.reduce((a, s) => a + s.percent, 0), 100)
    assert.deepEqual(shares.map((s) => s.percent), [34, 33, 33, 0, 0])
  })
  it('moodShares ไม่มีข้อมูล = 0 ทั้งหมด', () => {
    assert.ok(moodShares([]).every((s) => s.percent === 0 && s.count === 0))
  })
  it('moodShares ระดับที่ไม่มีข้อมูลไม่ได้เศษปัด', () => {
    const shares = moodShares([entry('a', 5), entry('b', 5), entry('c', 1)])
    assert.deepEqual(shares.map((s) => s.percent), [67, 0, 0, 0, 33])
  })
  it('dominantMood เท่ากันเลือกระดับที่ดีกว่า / ไม่มีข้อมูล = null', () => {
    assert.equal(dominantMood(moodShares([entry('a', 2), entry('b', 4)])), 4)
    assert.equal(dominantMood(moodShares([entry('a', 2), entry('b', 2), entry('c', 4)])), 2)
    assert.equal(dominantMood(moodShares([])), null)
  })
  it('topTags เรียงตามจำนวน เท่ากันตามลำดับชุดแท็ก', () => {
    const order: MoodTagId[] = ['study', 'money', 'friends', 'love']
    const top = topTags([entry('a', 3, ['money', 'study']), entry('b', 3, ['money']), entry('c', 3, ['love'])], 3, order)
    assert.deepEqual(top, [
      { tag: 'money', count: 2 },
      { tag: 'study', count: 1 },
      { tag: 'love', count: 1 },
    ])
  })
  it('consecutiveDaysWithMood นับถอยหลัง วันที่ขาดตัดสาย', () => {
    const list = [entry('2026-11-17', 1), entry('2026-11-18', 1), entry('2026-11-19', 1)]
    assert.equal(consecutiveDaysWithMood(list, 1, '2026-11-19'), 3)
    assert.equal(consecutiveDaysWithMood([entry('2026-11-17', 1), entry('2026-11-19', 1)], 1, '2026-11-19'), 1)
    assert.equal(consecutiveDaysWithMood([entry('2026-11-18', 1)], 1, '2026-11-19'), 0)
    assert.equal(consecutiveDaysWithMood([entry('2026-11-19', 2)], 1, '2026-11-19'), 0)
  })
})

describe('mood messages', () => {
  it('pickMessage วนตามเลขและไม่ error เมื่อรายการว่าง', () => {
    assert.equal(pickMessage(['a', 'b'], 3), 'b')
    assert.equal(pickMessage(['a', 'b'], -1), 'b')
    assert.equal(pickMessage([], 5), '')
  })
  it('มีข้อความครบทุกระดับ', () => {
    for (const score of [1, 2, 3, 4, 5] as const) assert.ok(ENCOURAGEMENTS[score].length >= 3)
    assert.ok(BOOST_MESSAGES[1].length >= 5 && BOOST_MESSAGES[2].length >= 5)
  })
})

describe('mood validation', () => {
  it('validateEntryDate', () => {
    assert.equal(validateEntryDate('2026-11-19', '2026-11-19'), null)
    assert.equal(validateEntryDate('2026-11-18', '2026-11-19'), null)
    assert.ok(validateEntryDate('2026-11-20', '2026-11-19'))
    assert.ok(validateEntryDate('19/11/2026', '2026-11-19'))
  })
  it('normalizeDetails ตัดแท็กซ้ำ/นอกชุด จัดเรียง และข้อความว่าง = null', () => {
    const r = normalizeDetails(['money', 'study', 'money', 'bogus'], '   ')
    assert.deepEqual(r, { values: { tags: ['study', 'money'], note: null }, error: null })
  })
  it('normalizeDetails ข้อความยาวเกิน 100 ตัวอักษร', () => {
    assert.ok(normalizeDetails([], 'ก'.repeat(101)).error)
    assert.equal(normalizeDetails([], ' ' + 'ก'.repeat(100) + ' ').values?.note?.length, 100)
  })
})
