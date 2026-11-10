import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateBmr, calculateBmrResult, calculateTdee, validateBmrInput } from '../src/features/calorie/utils/bmr.ts'
import { addDays, listDates, monthRange, shiftMonth, weekRange } from '../src/features/calorie/utils/dates.ts'
import { formatKcal, formatQuantity } from '../src/features/calorie/utils/format.ts'
import { entryCalories, summarizeDay, summarizeRange } from '../src/features/calorie/utils/summary.ts'
import { formatMonth } from '../src/shared/utils/formatDate.ts'
import type { BmrFormInput, FoodEntry } from '../src/features/calorie/types/calorie.ts'

describe('calculateBmr (Mifflin-St Jeor)', () => {
  it('ชาย: 10×น้ำหนัก + 6.25×ส่วนสูง − 5×อายุ + 5', () => {
    // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
    assert.equal(calculateBmr({ sex: 'male', age: 30, weightKg: 70, heightCm: 175 }), 1649)
  })

  it('หญิง: ... − 161', () => {
    // 10*55 + 6.25*160 - 5*25 - 161 = 550 + 1000 - 125 - 161 = 1264
    assert.equal(calculateBmr({ sex: 'female', age: 25, weightKg: 55, heightCm: 160 }), 1264)
  })
})

describe('calculateTdee', () => {
  it('คูณ BMR ด้วยตัวคูณของแต่ละระดับกิจกรรมแล้วปัดเป็นจำนวนเต็ม', () => {
    assert.equal(calculateTdee(1649, 'sedentary'), 1979) // 1978.8
    assert.equal(calculateTdee(1649, 'light'), 2267) // 2267.375
    assert.equal(calculateTdee(1649, 'moderate'), 2556) // 2555.95
    assert.equal(calculateTdee(1649, 'active'), 2845) // 2844.525
    assert.equal(calculateTdee(1649, 'very_active'), 3133) // 3133.1
  })

  it('calculateBmrResult คืน BMR และ TDEE ชุดเดียวกัน', () => {
    const r = calculateBmrResult({ sex: 'female', age: 25, weightKg: 55, heightCm: 160, activityLevel: 'moderate' })
    assert.deepEqual(r, { bmr: 1264, tdee: 1959 }) // 1264 × 1.55 = 1959.2
  })
})

describe('validateBmrInput', () => {
  const valid: BmrFormInput = { sex: 'male', age: '30', weightKg: '70.5', heightCm: '175', activityLevel: 'light' }

  it('ผ่าน: แปลงเป็นตัวเลขให้', () => {
    const { errors, values } = validateBmrInput(valid)
    assert.deepEqual(errors, {})
    assert.deepEqual(values, { sex: 'male', age: 30, weightKg: 70.5, heightCm: 175, activityLevel: 'light' })
  })

  it('ค่าว่าง/ไม่ใช่ตัวเลข/ทศนิยมเกินกำหนด → error ที่ช่องนั้น และไม่คืนค่า', () => {
    const { errors, values } = validateBmrInput({ ...valid, age: '', weightKg: 'abc', heightCm: '170.55' })
    assert.deepEqual(Object.keys(errors).sort(), ['age', 'heightCm', 'weightKg'])
    assert.equal(values, null)
  })

  it('นอกช่วง: อายุ 10–100, น้ำหนัก 20–300, ส่วนสูง 100–250 (ขอบในช่วงผ่าน)', () => {
    assert.ok(validateBmrInput({ ...valid, age: '9' }).errors.age)
    assert.ok(validateBmrInput({ ...valid, age: '101' }).errors.age)
    assert.ok(validateBmrInput({ ...valid, weightKg: '19.9' }).errors.weightKg)
    assert.ok(validateBmrInput({ ...valid, weightKg: '300.1' }).errors.weightKg)
    assert.ok(validateBmrInput({ ...valid, heightCm: '99' }).errors.heightCm)
    assert.ok(validateBmrInput({ ...valid, heightCm: '251' }).errors.heightCm)
    const edges = validateBmrInput({ ...valid, age: '10', weightKg: '20', heightCm: '250' })
    assert.deepEqual(edges.errors, {})
  })
})

describe('entryCalories', () => {
  it('แคลอรี่ต่อหน่วย × จำนวนหน่วย ปัดเป็นจำนวนเต็ม', () => {
    assert.equal(entryCalories(450, 1), 450)
    assert.equal(entryCalories(450, 0.5), 225)
    assert.equal(entryCalories(85, 0.5), 43) // 42.5 ปัดขึ้น
    assert.equal(entryCalories(120.5, 2), 241)
  })

  it('ทศนิยมไม่คลาดเคลื่อน (0.1 × 3 หน่วยของ 10 kcal = 3 kcal)', () => {
    assert.equal(entryCalories(10, 0.3), 3)
    assert.equal(entryCalories(0.1, 10), 1)
  })
})

let seq = 0
const entry = (eaten_on: string, meal: FoodEntry['meal'], kcal_per_unit: number, quantity = 1): FoodEntry => ({
  id: String(seq++),
  eaten_on,
  meal,
  food_id: null,
  food_name: 'อาหาร',
  serving_unit: 'จาน',
  kcal_per_unit,
  quantity,
  created_at: '',
  updated_at: '',
})

describe('summarizeDay', () => {
  it('รวมรายมื้อและรวมทั้งวัน เรียงเช้า→กลางวัน→เย็น→ของว่าง และมีครบทุกมื้อ', () => {
    const s = summarizeDay([
      entry('2026-11-10', 'dinner', 500),
      entry('2026-11-10', 'breakfast', 300),
      entry('2026-11-10', 'breakfast', 100, 2),
      entry('2026-11-10', 'snack', 85, 0.5),
    ])
    assert.deepEqual(
      s.meals.map((m) => [m.meal, m.total, m.entries.length]),
      [
        ['breakfast', 500, 2],
        ['lunch', 0, 0],
        ['dinner', 500, 1],
        ['snack', 43, 1],
      ],
    )
    assert.equal(s.total, 1043)
  })

  it('ไม่มีรายการ = 0', () => {
    assert.equal(summarizeDay([]).total, 0)
  })
})

describe('summarizeRange', () => {
  const entries = [
    entry('2026-11-09', 'lunch', 600),
    entry('2026-11-09', 'dinner', 400),
    entry('2026-11-11', 'breakfast', 500),
    entry('2026-11-12', 'snack', 100),
  ]

  it('รวมทั้งช่วง ค่าเฉลี่ยคิดเฉพาะวันที่มีบันทึก และไม่รวมวันที่ยังมาไม่ถึง', () => {
    const s = summarizeRange(entries, '2026-11-09', '2026-11-15', '2026-11-11')
    assert.deepEqual(s.days, [
      { date: '2026-11-09', total: 1000 },
      { date: '2026-11-10', total: 0 },
      { date: '2026-11-11', total: 500 },
    ])
    assert.equal(s.total, 1500)
    assert.equal(s.loggedDays, 2)
    assert.equal(s.averagePerLoggedDay, 750)
  })

  it('แยกยอดตามมื้อ', () => {
    const s = summarizeRange(entries, '2026-11-09', '2026-11-15', '2026-11-30')
    assert.deepEqual(
      s.byMeal.map((m) => [m.meal, m.total]),
      [
        ['breakfast', 500],
        ['lunch', 600],
        ['dinner', 400],
        ['snack', 100],
      ],
    )
  })

  it('ไม่มีบันทึกเลย → ค่าเฉลี่ยเป็น null', () => {
    const s = summarizeRange([], '2026-11-09', '2026-11-15', '2026-11-30')
    assert.equal(s.averagePerLoggedDay, null)
    assert.equal(s.total, 0)
    assert.equal(s.days.length, 7)
  })
})

describe('dates', () => {
  it('addDays ข้ามเดือน/ปีได้ถูกต้อง', () => {
    assert.equal(addDays('2026-11-30', 1), '2026-12-01')
    assert.equal(addDays('2026-01-01', -1), '2025-12-31')
    assert.equal(addDays('2028-02-28', 1), '2028-02-29')
  })

  it('weekRange: จันทร์–อาทิตย์', () => {
    // 2026-11-10 เป็นวันอังคาร
    assert.deepEqual(weekRange('2026-11-10'), { from: '2026-11-09', to: '2026-11-15' })
    // วันจันทร์และวันอาทิตย์ อยู่สัปดาห์เดียวกัน
    assert.deepEqual(weekRange('2026-11-09'), { from: '2026-11-09', to: '2026-11-15' })
    assert.deepEqual(weekRange('2026-11-15'), { from: '2026-11-09', to: '2026-11-15' })
  })

  it('monthRange / shiftMonth', () => {
    assert.deepEqual(monthRange('2026-11-10'), { from: '2026-11-01', to: '2026-11-30' })
    assert.deepEqual(monthRange('2028-02-10'), { from: '2028-02-01', to: '2028-02-29' })
    assert.equal(shiftMonth('2026-01-15', -1), '2025-12-01')
    assert.equal(shiftMonth('2026-12-31', 1), '2027-01-01')
  })

  it('listDates รวมทั้งสองวัน', () => {
    assert.deepEqual(listDates('2026-11-29', '2026-12-01'), ['2026-11-29', '2026-11-30', '2026-12-01'])
  })
})

describe('format', () => {
  it('formatKcal ใส่คอมมาและหน่วย', () => {
    assert.match(formatKcal(1234), /^1,234 kcal$/)
    assert.equal(formatKcal(0), '0 kcal')
  })

  it('formatQuantity ไม่แสดงศูนย์ท้าย', () => {
    assert.equal(formatQuantity(1), '1')
    assert.equal(formatQuantity(0.5), '0.5')
    assert.equal(formatQuantity(2.25), '2.25')
  })

  it('formatMonth แสดงเดือนและปี พ.ศ.', () => {
    assert.match(formatMonth('2026-11-10'), /พฤศจิกายน 2569/)
  })
})
