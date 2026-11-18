import {
  BARLEYCORNS_PER_INCH,
  CM_PER_INCH,
  EU_POINTS_PER_CM,
  SHOE_ALLOWANCE_CM,
  UK_SIZE_OFFSET,
  US_MEN_OVER_UK,
  US_WOMEN_OVER_UK,
} from '../constants.ts'
import type { ConvRow } from '../types/size'
import { formatNumber } from './format.ts'
import { ambiguousRange, ceilToStep, roundToStep } from './rounding.ts'

export interface ShoeSizes {
  jpCm: number
  cnMm: number
  krMm: number
  /** null = เล็กกว่าช่วงไซส์ผู้ใหญ่ (ไม่ใช้สูตร EU/UK/US) */
  adult: {
    eu: number
    euRaw: number
    uk: number
    ukRaw: number
    usMen: number
    usWomen: number
  } | null
}

/** ความยาวเท้า (cm) -> ไซส์รองเท้าผู้ใหญ่ทุกมาตรฐาน (สูตรตาม docs/features/size-converter.md) */
export function convertShoeSize(footCm: number): ShoeSizes {
  const ukRaw = (footCm / CM_PER_INCH) * BARLEYCORNS_PER_INCH - UK_SIZE_OFFSET
  const base = {
    jpCm: roundToStep(footCm, 0.5),
    cnMm: roundToStep(footCm * 10, 5),
    krMm: roundToStep(footCm * 10, 5),
  }
  // UK ผู้ใหญ่เริ่มที่ 1
  if (ukRaw < 1 - 1e-9) return { ...base, adult: null }

  const euRaw = (footCm + SHOE_ALLOWANCE_CM) * EU_POINTS_PER_CM
  const uk = roundToStep(ukRaw, 0.5)
  return {
    ...base,
    adult: {
      eu: ceilToStep(euRaw, 0.5),
      euRaw,
      uk,
      ukRaw,
      usMen: uk + US_MEN_OVER_UK,
      usWomen: uk + US_WOMEN_OVER_UK,
    },
  }
}

function withRange(value: number, raw: number, step: number): string {
  const range = ambiguousRange(raw, step)
  return range ? `${formatNumber(range[0])}–${formatNumber(range[1])}` : formatNumber(value)
}

function rowsOf(sizes: ShoeSizes): ConvRow[] {
  const rows: ConvRow[] = [
    { label: 'JP (cm)', value: formatNumber(sizes.jpCm) },
    { label: 'CN (mm)', value: formatNumber(sizes.cnMm) },
    { label: 'KR (mm)', value: formatNumber(sizes.krMm) },
  ]
  if (sizes.adult) {
    const a = sizes.adult
    rows.push(
      { label: 'EU', value: withRange(a.eu, a.euRaw, 0.5) },
      { label: 'UK', value: withRange(a.uk, a.ukRaw, 0.5) },
      { label: 'US (ชาย)', value: withRange(a.usMen, a.ukRaw + US_MEN_OVER_UK, 0.5) },
      { label: 'US (หญิง)', value: withRange(a.usWomen, a.ukRaw + US_WOMEN_OVER_UK, 0.5) },
    )
  }
  return rows
}

/** แถวสำหรับแสดงผล: value = ตามตัวเลข, recommended = หลังเผื่อความยาวเพิ่ม (extraCm) */
export function shoeRows(footCm: number, extraCm: number): { rows: ConvRow[]; adult: boolean } {
  const base = convertShoeSize(footCm)
  const rows = rowsOf(base)
  if (extraCm > 0) {
    const adjusted = rowsOf(convertShoeSize(footCm + extraCm))
    adjusted.forEach((row, i) => {
      const own = rows[i]
      if (own && row.value !== own.value) own.recommended = row.value
    })
  }
  return { rows, adult: base.adult !== null }
}
