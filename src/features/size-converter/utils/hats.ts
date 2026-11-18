import { CM_PER_INCH } from '../constants.ts'
import type { ConvRow } from '../types/size'
import { formatHatFraction, formatNumber } from './format.ts'

/** US fitted = เส้นผ่านศูนย์กลาง (นิ้ว) = รอบศีรษะ ÷ 2.54 ÷ π */
export function hatUsInches(headCm: number): number {
  return headCm / CM_PER_INCH / Math.PI
}

export function hatRows(headCm: number): ConvRow[] {
  return [
    { label: 'EU / เอเชีย (cm)', value: formatNumber(Math.round(headCm)) },
    { label: 'US (fitted)', value: formatHatFraction(hatUsInches(headCm)) },
  ]
}
