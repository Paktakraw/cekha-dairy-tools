import { CM_PER_INCH } from '../constants.ts'

/** ไซส์ยีนส์ (นิ้ว) = รอบเอว cm ÷ 2.54 ปัดเป็นจำนวนเต็ม (ค่าประมาณ ป้ายจริงอาจต่าง) */
export function jeansWaistInches(waistCm: number): number {
  return Math.round(waistCm / CM_PER_INCH)
}
