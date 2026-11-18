import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { convert } from '../src/features/size-converter/utils/converter.ts'
import { lookupRow, pickLargest, shiftRow } from '../src/features/size-converter/utils/clothing.ts'
import { formatHatFraction } from '../src/features/size-converter/utils/format.ts'
import { hatUsInches } from '../src/features/size-converter/utils/hats.ts'
import { jeansWaistInches } from '../src/features/size-converter/utils/jeans.ts'
import { circumferenceFromDiameter, convertRingSize } from '../src/features/size-converter/utils/rings.ts'
import { ambiguousRange, ceilToStep, roundToStep } from '../src/features/size-converter/utils/rounding.ts'
import { convertShoeSize } from '../src/features/size-converter/utils/shoes.ts'
import { cmToInch, inchToCm } from '../src/features/size-converter/utils/units.ts'
import { EMPTY_MEASURE_INPUT, measuresToInput, parseMeasures, validateNote, validateProfile } from '../src/features/size-converter/utils/validation.ts'
import { TOPS_CHART } from '../src/features/size-converter/data/clothingCharts.ts'
import type { ProfileFormInput } from '../src/features/size-converter/types/size'

describe('rounding', () => {
  it('roundToStep / ceilToStep', () => {
    assert.equal(roundToStep(7.74, 0.5), 7.5)
    assert.equal(roundToStep(7.76, 0.5), 8)
    assert.equal(ceilToStep(41.55, 0.5), 42)
    assert.equal(ceilToStep(41, 0.5), 41)
    // เลขลอยตัวไม่ทำให้ปัดขึ้นเกิน
    assert.equal(ceilToStep(0.1 * 3 * 10, 0.5), 3)
  })
  it('ambiguousRange คืนช่วงเมื่อตกกลาง ๆ', () => {
    assert.deepEqual(ambiguousRange(41.75, 0.5), [41.5, 42])
    assert.equal(ambiguousRange(41.55, 0.5), null)
  })
})

describe('units', () => {
  it('cm <-> inch', () => {
    assert.equal(cmToInch(25.4), 10)
    assert.equal(inchToCm(10), 25.4)
    assert.equal(inchToCm(10.2), 25.9)
  })
})

describe('shoes', () => {
  it('เท้า 26 cm', () => {
    const s = convertShoeSize(26)
    assert.equal(s.jpCm, 26)
    assert.equal(s.cnMm, 260)
    assert.equal(s.krMm, 260)
    assert.ok(s.adult)
    assert.equal(s.adult.eu, 42)
    assert.equal(s.adult.uk, 7.5)
    assert.equal(s.adult.usMen, 8.5)
    assert.equal(s.adult.usWomen, 10)
  })
  it('US หญิงห่าง US ชาย 1.5 ไซส์เสมอ', () => {
    for (const foot of [22, 24, 26.4, 28]) {
      const a = convertShoeSize(foot).adult
      assert.ok(a)
      assert.equal(a.usWomen - a.usMen, 1.5)
    }
  })
  it('เท้าเล็กกว่าช่วงผู้ใหญ่ไม่ใช้สูตร EU/UK/US', () => {
    const s = convertShoeSize(19)
    assert.equal(s.adult, null)
    assert.equal(s.jpCm, 19)
  })
  it('ขอบช่วงผู้ใหญ่: UK = 1 ที่เท้า ~20.32 cm', () => {
    assert.ok(convertShoeSize(20.4).adult)
    assert.equal(convertShoeSize(20.2).adult, null)
  })
})

describe('rings', () => {
  it('รอบนิ้ว 52 mm -> ISO 12, EU 52, US ~6', () => {
    const r = convertRingSize(52)
    assert.equal(r.iso, 12)
    assert.equal(r.euCircumference, 52)
    assert.equal(r.us, 6)
  })
  it('เส้นผ่านศูนย์กลาง 16.51 mm -> US 6', () => {
    assert.equal(convertRingSize(circumferenceFromDiameter(16.51)).us, 6)
  })
  it('JP 4 ≈ 44 mm', () => {
    assert.equal(convertRingSize(44).iso, 4)
  })
})

describe('hats', () => {
  it('58 cm -> US 7 ¼', () => {
    assert.equal(formatHatFraction(hatUsInches(58)), '7 ¼')
  })
  it('56 cm -> US 7', () => {
    assert.equal(formatHatFraction(hatUsInches(56)), '7')
  })
  it('formatHatFraction', () => {
    assert.equal(formatHatFraction(7.125), '7 ⅛')
    assert.equal(formatHatFraction(7.5), '7 ½')
  })
})

describe('jeans', () => {
  it('81 cm -> 32', () => assert.equal(jeansWaistInches(81), 32))
})

describe('clothing lookup', () => {
  const chart = TOPS_CHART.men
  it('ขอบช่วงเป็น half-open [min, max)', () => {
    const a = lookupRow(chart, 96)
    assert.ok(a.kind === 'found')
    assert.equal(a.row.size, 'M')
    const b = lookupRow(chart, 95.9)
    assert.ok(b.kind === 'found')
    assert.equal(b.row.size, 'S')
  })
  it('นอกตาราง', () => {
    assert.equal(lookupRow(chart, 70).kind, 'below')
    assert.equal(lookupRow(chart, 130).kind, 'above')
  })
  it('pickLargest เลือกไซส์ใหญ่กว่าและบอกเหตุผล', () => {
    const r = pickLargest([
      { name: 'รอบเอว', value: 75, rows: TOPS_CHART.men }, // ต่ำกว่าช่วง -> below ไม่นับ
      { name: 'รอบอก', value: 100, rows: TOPS_CHART.men },
      { name: 'รอบสะโพก', value: 105, rows: TOPS_CHART.men },
    ])
    assert.ok(r.kind === 'ok')
    assert.equal(r.picked.row.size, 'L')
    assert.ok(r.picked.reason?.includes('รอบสะโพก'))
  })
  it('shiftRow ไม่เกินปลายตาราง', () => {
    assert.equal(shiftRow(chart, chart.length - 1, 1)?.index, chart.length - 1)
    assert.equal(shiftRow(chart, 0, 1)?.index, 1)
  })
})

describe('convert', () => {
  const base = { demographic: 'men' as const, wideFoot: false, oversize: false }
  it('ขาดข้อมูล -> บอกช่องที่ขาด', () => {
    assert.deepEqual(convert('shoes', {}, base).missing, ['foot_length_cm'])
    assert.deepEqual(convert('bottoms', {}, base).missing, ['waist_cm', 'hip_cm'])
  })
  it('รองเท้าหน้าเท้ากว้างมี recommended ที่ใหญ่กว่า', () => {
    const r = convert('shoes', { foot_length_cm: 26 }, { ...base, wideFoot: true })
    const uk = r.rows.find((row) => row.label === 'UK')
    assert.ok(uk?.recommended)
    assert.notEqual(uk.recommended, uk.value)
  })
  it('เสื้อ Oversize ขยับขึ้น 1 ไซส์', () => {
    const r = convert('tops', { chest_cm: 100 }, { ...base, oversize: true })
    const size = r.rows.find((row) => row.label === 'ไซส์ตัวอักษร')
    assert.equal(size?.value, 'M')
    assert.equal(size?.recommended, 'L')
  })
  it('เสื้อรอบอกนอกตาราง ไม่เดา', () => {
    const r = convert('tops', { chest_cm: 200 }, base)
    assert.equal(r.rows.length, 0)
    assert.ok(r.notes.length > 0)
  })
  it('กางเกงมีแถวยีนส์และตามเอว/สะโพกที่ใหญ่กว่า', () => {
    const r = convert('bottoms', { waist_cm: 81, hip_cm: 106 }, base)
    assert.equal(r.rows.find((row) => row.label === 'ไซส์ตัวอักษร')?.value, 'L')
    assert.equal(r.rows.find((row) => row.label === 'ยีนส์ (นิ้ว)')?.value, '32')
  })
})

describe('validation', () => {
  it('parseMeasures: ช่องว่าง = ไม่ทราบ, นิ้วแปลงเป็น cm', () => {
    const { errors, values } = parseMeasures({ ...EMPTY_MEASURE_INPUT, foot_length_cm: '10.2', height_cm: '' }, 'inch')
    assert.deepEqual(errors, {})
    assert.equal(values?.foot_length_cm, 25.9)
    assert.equal(values?.height_cm, null)
  })
  it('parseMeasures: ปฏิเสธนอกช่วง/ไม่ใช่ตัวเลข', () => {
    const { errors, values } = parseMeasures({ ...EMPTY_MEASURE_INPUT, foot_length_cm: '60', head_cm: 'abc', finger_circumference_mm: '20' }, 'cm')
    assert.equal(values, null)
    assert.ok(errors.foot_length_cm && errors.head_cm && errors.finger_circumference_mm)
  })
  it('measuresToInput แล้ว parse กลับได้ค่าเดิม', () => {
    const measures = { ...parseMeasures({ ...EMPTY_MEASURE_INPUT, chest_cm: '92.5' }, 'cm').values! }
    const input = measuresToInput(measures, 'cm')
    assert.equal(parseMeasures(input, 'cm').values?.chest_cm, 92.5)
  })
  it('validateProfile', () => {
    const input: ProfileFormInput = { name: '  แฟน ', demographic: 'women', unit: 'cm', measures: { ...EMPTY_MEASURE_INPUT, foot_length_cm: '24' } }
    const ok = validateProfile(input)
    assert.equal(ok.values?.name, 'แฟน')
    assert.equal(ok.values?.foot_length_cm, 24)
    assert.ok(validateProfile({ ...input, name: ' ' }).errors.name)
    assert.ok(validateProfile({ ...input, name: 'x'.repeat(51) }).errors.name)
  })
  it('validateNote', () => {
    const ok = validateNote({ brand: ' Nike ', product: '', sizeLabel: 'US 9', fit: 'good', note: '' }, 'p1')
    assert.equal(ok.values?.brand, 'Nike')
    assert.equal(ok.values?.product, null)
    assert.equal(ok.values?.profile_id, 'p1')
    const bad = validateNote({ brand: '', product: '', sizeLabel: '', fit: 'good', note: 'x'.repeat(501) }, 'p1')
    assert.ok(bad.errors.brand && bad.errors.sizeLabel && bad.errors.note)
  })
})
