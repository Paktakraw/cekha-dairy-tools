import type { ConvRow } from '../types/size'
import { formatNumber } from './format.ts'
import { roundToStep } from './rounding.ts'

export function circumferenceFromDiameter(diameterMm: number): number {
  return diameterMm * Math.PI
}

export function diameterFromCircumference(circumferenceMm: number): number {
  return circumferenceMm / Math.PI
}

export interface RingSizes {
  /** ISO 8653 / JP = เส้นรอบวง − 40 */
  iso: number
  /** EU แบบเส้นรอบวงตรง ๆ (mm) */
  euCircumference: number
  /** US ปัดทีละ 0.25 */
  us: number
}

export function convertRingSize(circumferenceMm: number): RingSizes {
  const diameter = diameterFromCircumference(circumferenceMm)
  return {
    iso: Math.round(circumferenceMm - 40),
    euCircumference: Math.round(circumferenceMm),
    us: roundToStep((diameter - 11.63) / 0.8128, 0.25),
  }
}

export function ringRows(circumferenceMm: number): ConvRow[] {
  const sizes = convertRingSize(circumferenceMm)
  return [
    { label: 'ISO 8653 / JP', value: formatNumber(sizes.iso) },
    { label: 'EU (เส้นรอบวง mm)', value: formatNumber(sizes.euCircumference) },
    { label: 'US', value: formatNumber(sizes.us) },
  ]
}
