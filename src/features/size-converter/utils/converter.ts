import { MEASURE_LABELS, OVERSIZE_STEPS, WIDE_FOOT_EXTRA_CM } from '../constants.ts'
import { HIP_CHART, TOPS_CHART, WAIST_CHART, type ChartRow } from '../data/clothingCharts.ts'
import type { ConvResult, ConvRow, ConverterCategory, Demographic, MeasureKey, Measurements } from '../types/size'
import { pickLargest, shiftRow } from './clothing.ts'
import { hatRows } from './hats.ts'
import { jeansWaistInches } from './jeans.ts'
import { ringRows } from './rings.ts'
import { shoeRows } from './shoes.ts'

export interface ConvertOptions {
  demographic: Demographic
  /** รองเท้า: หน้าเท้ากว้าง */
  wideFoot: boolean
  /** เสื้อผ้า: Oversize */
  oversize: boolean
}

export type PartialMeasurements = Partial<Measurements>

export const APPROX_NOTE = 'ทุกค่าเป็นค่าประมาณจากมาตรฐานกลาง ไซส์จริงของแบรนด์อาจต่างไป ±0.5 ไซส์'

const empty = (missing: MeasureKey[]): ConvResult => ({ rows: [], missing, notes: [] })

function chartRows(row: ChartRow): ConvRow[] {
  return [
    { label: 'ไซส์ตัวอักษร', value: row.size },
    { label: 'EU', value: row.eu },
    { label: 'US', value: row.us },
    { label: 'JP', value: row.jp },
  ]
}

function applyOversize(rows: ChartRow[], index: number, picked: ChartRow, notes: string[], oversize: boolean): ConvRow[] {
  const base = chartRows(picked)
  if (!oversize) return base
  const shifted = shiftRow(rows, index, OVERSIZE_STEPS)
  if (!shifted || shifted.index === index) {
    notes.push('ไซส์นี้อยู่ปลายตารางแล้ว ขยับขึ้นต่อไม่ได้ ลองดูตารางไซส์ของแบรนด์ที่จะสั่ง')
    return base
  }
  const bigger = chartRows(shifted.row)
  return base.map((row, i) => {
    const alt = bigger[i]
    return alt && alt.value !== row.value ? { ...row, recommended: alt.value } : row
  })
}

function outOfRange(kind: 'below' | 'above', what: string): ConvResult {
  return {
    rows: [],
    missing: [],
    notes: [kind === 'below' ? `${what}เล็กกว่าช่วงในตาราง` : `${what}ใหญ่กว่าช่วงในตาราง`, 'ลองดูตารางไซส์ของแบรนด์ที่จะสั่งโดยตรง'],
  }
}

export function convert(category: ConverterCategory, m: PartialMeasurements, options: ConvertOptions): ConvResult {
  switch (category) {
    case 'shoes': {
      if (m.foot_length_cm == null) return empty(['foot_length_cm'])
      const { rows, adult } = shoeRows(m.foot_length_cm, options.wideFoot ? WIDE_FOOT_EXTRA_CM : 0)
      const notes: string[] = []
      if (!adult) notes.push('เท้าเล็กกว่าช่วงไซส์ผู้ใหญ่ แสดงเฉพาะ JP/CN/KR ที่อิงความยาวเท้า สำหรับ EU/UK/US ใช้ตารางไซส์เด็กของแบรนด์')
      if (options.wideFoot) notes.push('หน้าเท้ากว้าง: ไซส์ที่แนะนำเผื่อความยาวเพิ่มราวครึ่งไซส์')
      return { rows, missing: [], notes }
    }
    case 'ring': {
      if (m.finger_circumference_mm == null) return empty(['finger_circumference_mm'])
      return {
        rows: ringRows(m.finger_circumference_mm),
        missing: [],
        notes: ['ร้านยุโรปบางร้านใช้เส้นรอบวงตรง ๆ เป็นเบอร์ ตรวจให้ตรงกับที่ร้านระบุ'],
      }
    }
    case 'hat': {
      if (m.head_cm == null) return empty(['head_cm'])
      return { rows: hatRows(m.head_cm), missing: [], notes: ['วัดรอบศีรษะเหนือคิ้วราว 1 นิ้ว'] }
    }
    case 'tops': {
      if (m.chest_cm == null) return empty(['chest_cm'])
      const chart = TOPS_CHART[options.demographic]
      const result = pickLargest([{ name: MEASURE_LABELS.chest_cm, value: m.chest_cm, rows: chart }])
      if (result.kind !== 'ok') return outOfRange(result.kind, 'รอบอก')
      const notes: string[] = []
      const rows = applyOversize(chart, result.picked.index, result.picked.row, notes, options.oversize)
      if (options.oversize) notes.push('Oversize: ไซส์ที่แนะนำขยับขึ้น 1 ไซส์')
      return { rows, missing: [], notes }
    }
    case 'bottoms': {
      if (m.waist_cm == null && m.hip_cm == null) return empty(['waist_cm', 'hip_cm'])
      const waist = WAIST_CHART[options.demographic]
      const hip = HIP_CHART[options.demographic]
      const inputs = []
      if (m.waist_cm != null) inputs.push({ name: MEASURE_LABELS.waist_cm, value: m.waist_cm, rows: waist })
      if (m.hip_cm != null) inputs.push({ name: MEASURE_LABELS.hip_cm, value: m.hip_cm, rows: hip })
      const result = pickLargest(inputs)
      if (result.kind !== 'ok') return outOfRange(result.kind, 'รอบเอวหรือรอบสะโพก')
      const notes: string[] = []
      if (result.picked.reason) notes.push(result.picked.reason)
      const rows = applyOversize(waist, result.picked.index, result.picked.row, notes, options.oversize)
      if (options.oversize) notes.push('ทรงหลวม: ไซส์ที่แนะนำขยับขึ้น 1 ไซส์')
      if (m.waist_cm != null) {
        rows.push({ label: 'ยีนส์ (นิ้ว)', value: String(jeansWaistInches(m.waist_cm)) })
        notes.push('ไซส์ยีนส์คำนวณจากรอบเอว ป้ายไซส์จริงของกางเกงมักไม่ตรงขนาดจริง (vanity sizing)')
      }
      return { rows, missing: [], notes }
    }
  }
}
