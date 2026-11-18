import type { ChartRow } from '../data/clothingCharts.ts'

export type RowLookup =
  | { kind: 'found'; index: number; row: ChartRow }
  | { kind: 'below' }
  | { kind: 'above' }

/** หาแถวของตารางที่ค่าตกอยู่ในช่วง [min, max) */
export function lookupRow(rows: ChartRow[], value: number): RowLookup {
  const first = rows[0]
  const last = rows[rows.length - 1]
  if (!first || !last) return { kind: 'below' }
  if (value < first.min) return { kind: 'below' }
  if (value >= last.max) return { kind: 'above' }
  const index = rows.findIndex((r) => value >= r.min && value < r.max)
  const row = rows[index]
  return row ? { kind: 'found', index, row } : { kind: 'below' }
}

export interface PickedSize {
  index: number
  row: ChartRow
  /** ข้อความอธิบายว่าเลือกจากค่าไหน */
  reason: string | null
}

export type PickResult = { kind: 'ok'; picked: PickedSize } | { kind: 'below' | 'above' }

/**
 * เลือกไซส์จากหลายค่าที่วัดได้ (เช่น เอวกับสะโพก) ถ้าชี้คนละไซส์ให้เลือกไซส์ใหญ่กว่า
 * measurements: ชื่อช่อง + ค่า + ตารางของช่องนั้น (ข้ามช่องที่ไม่มีค่า)
 */
export function pickLargest(measurements: { name: string; value: number; rows: ChartRow[] }[]): PickResult {
  const found: { name: string; index: number; row: ChartRow }[] = []
  let outside: 'below' | 'above' | null = null
  for (const m of measurements) {
    const result = lookupRow(m.rows, m.value)
    if (result.kind === 'found') found.push({ name: m.name, index: result.index, row: result.row })
    else outside = outside === 'above' || result.kind === 'above' ? 'above' : 'below'
  }
  if (found.length === 0) return { kind: outside ?? 'below' }
  if (outside === 'above') return { kind: 'above' }

  let best = found[0]
  if (!best) return { kind: 'below' }
  for (const f of found) if (f.index > best.index) best = f
  const differs = found.some((f) => f.index !== best?.index)
  return {
    kind: 'ok',
    picked: { index: best.index, row: best.row, reason: differs ? `เลือกตาม${best.name} เพราะชี้ไซส์ใหญ่กว่า` : null },
  }
}

/** ขยับขึ้น/ลงตามจำนวนขั้น (ไม่เกินปลายตาราง) คืน null ถ้าขยับไม่ได้เลย */
export function shiftRow(rows: ChartRow[], index: number, steps: number): { index: number; row: ChartRow } | null {
  const target = Math.min(Math.max(index + steps, 0), rows.length - 1)
  const row = rows[target]
  return row ? { index: target, row } : null
}
