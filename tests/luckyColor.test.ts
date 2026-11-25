import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { WHEEL_ORDER } from '../src/features/lucky-color/constants.ts'
import { birthLabel, buildWheel, computeLuckyColors, getTaksaDay, isTaksaDay, todayLabel } from '../src/features/lucky-color/utils/taksa.ts'
import type { TaksaDay } from '../src/features/lucky-color/types/luckyColor'

// 2026-11-25 เป็นวันพุธ (เวลาท้องถิ่น)
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute)

describe('วงล้อทักษา (buildWheel)', () => {
  it('หมุนให้วันตั้งต้นอยู่ตำแหน่งบริวาร แล้วไล่ตำแหน่งตามวงล้อ', () => {
    const w = buildWheel('mon')
    assert.deepEqual(w, {
      servant: 'mon',
      life: 'tue',
      dech: 'wed_day',
      sri: 'sat',
      mula: 'thu',
      effort: 'wed_night',
      montri: 'fri',
      kalakini: 'sun',
    })
  })

  it('ตำแหน่งสุดท้ายวนกลับต้นอาเรย์ (ศุกร์ → อาทิตย์)', () => {
    assert.equal(buildWheel('fri').life, 'sun')
  })

  it('กาลกิณีของทั้ง 8 วันเกิดตรงตามตำรา', () => {
    const expected: Record<TaksaDay, TaksaDay> = {
      sun: 'fri',
      mon: 'sun',
      tue: 'mon',
      wed_day: 'tue',
      sat: 'wed_day',
      thu: 'sat',
      wed_night: 'thu',
      fri: 'wed_night',
    }
    for (const day of WHEEL_ORDER) assert.equal(buildWheel(day).kalakini, expected[day], day)
  })

  it('ทุกวงล้อใช้ครบ 8 วัน ไม่ซ้ำ', () => {
    for (const day of WHEEL_ORDER) assert.equal(new Set(Object.values(buildWheel(day))).size, 8)
  })
})

describe('วันตามหลักโหราศาสตร์ (getTaksaDay)', () => {
  it('เปลี่ยนวันเวลา 06:00 น.', () => {
    assert.equal(getTaksaDay(at(25, 5, 59)), 'tue')
    assert.equal(getTaksaDay(at(25, 6, 0)), 'wed_day')
    assert.equal(getTaksaDay(at(25, 0, 0)), 'tue')
  })

  it('พุธกลางวัน 06:00–17:59 พุธกลางคืน 18:00 ถึงพฤหัสฯ 05:59', () => {
    assert.equal(getTaksaDay(at(25, 17, 59)), 'wed_day')
    assert.equal(getTaksaDay(at(25, 18, 0)), 'wed_night')
    assert.equal(getTaksaDay(at(25, 23, 59)), 'wed_night')
    assert.equal(getTaksaDay(at(26, 0, 0)), 'wed_night')
    assert.equal(getTaksaDay(at(26, 5, 59)), 'wed_night')
    assert.equal(getTaksaDay(at(26, 6, 0)), 'thu')
  })

  it('ข้ามเที่ยงคืนของวันอื่นนับเป็นวันก่อนหน้าจนถึง 06:00 (อาทิตย์ 00:00 = เสาร์)', () => {
    assert.equal(getTaksaDay(at(29, 0, 0)), 'sat')
    assert.equal(getTaksaDay(at(29, 6, 0)), 'sun')
  })

  it('ครบทั้ง 7 วันของสัปดาห์', () => {
    const days = [29, 30, 1, 2, 3, 4, 5].map((d, i) => getTaksaDay(i < 2 ? at(d, 12) : new Date(2026, 11, d, 12)))
    assert.deepEqual(days, ['sun', 'mon', 'tue', 'wed_day', 'thu', 'fri', 'sat'])
  })
})

describe('กรอง 2 ชั้น (computeLuckyColors)', () => {
  it('เกิดจันทร์ × พุธกลางวัน: ต้องห้ามคือแดง(วันเกิด)+ชมพู(วันนี้) ปังคูณสองว่าง', () => {
    const r = computeLuckyColors('mon', at(25, 10))
    assert.equal(r.today, 'wed_day')
    assert.deepEqual(r.avoid, [
      { day: 'sun', sources: ['birth'] },
      { day: 'tue', sources: ['today'] },
    ])
    assert.deepEqual(r.superLucky, [])
    assert.deepEqual(r.boost, { dech: ['wed_day', 'thu'], sri: ['sat', 'wed_night'], montri: ['fri', 'mon'] })
  })

  it('กาลกิณีวันเดียวกันทั้งสองชั้น รวมเป็นรายการเดียวและบอกที่มาทั้งคู่', () => {
    const hit = WHEEL_ORDER.flatMap((birth) =>
      [at(25, 10), at(25, 20), at(26, 10), at(27, 10), at(28, 10), at(29, 10), at(30, 10)].map((now) => computeLuckyColors(birth, now)),
    ).find((r) => r.avoid.length === 1)
    assert.ok(hit, 'ต้องมีอย่างน้อยหนึ่งคู่ที่กาลกิณีตรงกัน')
    assert.deepEqual(hit.avoid[0].sources, ['birth', 'today'])
  })

  it('ทุกคู่ (8 วันเกิด × 8 วัน): สีต้องห้ามไม่หลุดไปปังคูณสองหรือสีเสริม และปังคูณสองดีทั้งสองชั้น', () => {
    const nows = [at(25, 10), at(25, 20), at(26, 10), at(27, 10), at(28, 10), at(29, 10), at(30, 10), at(24, 10)]
    const seenToday = new Set<TaksaDay>()
    for (const birth of WHEEL_ORDER) {
      for (const now of nows) {
        const r = computeLuckyColors(birth, now)
        seenToday.add(r.today)
        const avoidDays = new Set(r.avoid.map((a) => a.day))
        for (const s of r.superLucky) {
          assert.ok(!avoidDays.has(s.day), `${birth}/${r.today}: ปังคูณสองมีสีต้องห้าม`)
          assert.equal(buildWheel(birth)[s.birthPosition], s.day)
          assert.equal(buildWheel(r.today)[s.todayPosition], s.day)
        }
        for (const days of Object.values(r.boost)) for (const d of days) assert.ok(!avoidDays.has(d), `${birth}/${r.today}: สีเสริมมีสีต้องห้าม`)
      }
    }
    assert.equal(seenToday.size, 8, 'ทดสอบครบทั้ง 8 วันปัจจุบัน')
  })

  it('มีบางคู่ที่ปังคูณสองไม่ว่าง (ฟีเจอร์ไม่ว่างเปล่าทุกวัน)', () => {
    const any = WHEEL_ORDER.some((birth) => computeLuckyColors(birth, at(25, 10)).superLucky.length > 0)
    assert.ok(any)
  })
})

describe('ข้อความและตัวช่วย', () => {
  it('ป้ายวันปัจจุบันและวันเกิด', () => {
    assert.equal(todayLabel('wed_day'), 'วันพุธ')
    assert.equal(todayLabel('wed_night'), 'คืนวันพุธ (ราหู)')
    assert.equal(todayLabel('mon'), 'วันจันทร์')
    assert.equal(birthLabel('wed_night'), 'วันพุธกลางคืน (ราหู)')
  })

  it('isTaksaDay ตรวจค่าที่อนุญาต', () => {
    assert.equal(isTaksaDay('wed_night'), true)
    assert.equal(isTaksaDay('wed'), false)
  })
})
