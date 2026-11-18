import { CM_PER_INCH } from '../constants.ts'

/** ปัดทศนิยม 1 ตำแหน่ง (ค่าสัดส่วนเก็บ numeric(5,1)) */
export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function cmToInch(cm: number): number {
  return round1(cm / CM_PER_INCH)
}

export function inchToCm(inch: number): number {
  return round1(inch * CM_PER_INCH)
}
