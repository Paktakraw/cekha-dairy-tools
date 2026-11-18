const EPSILON = 1e-9

/** ปัดให้ใกล้ที่สุดตามขั้น (เช่น 0.5) */
export function roundToStep(value: number, step: number): number {
  return Math.round(value / step + EPSILON) * step
}

/** ปัดขึ้นตามขั้น (มี epsilon กันเลขลอยตัว เช่น 41.0000000001) */
export function ceilToStep(value: number, step: number): number {
  return Math.ceil(value / step - EPSILON) * step
}

/**
 * ถ้าค่าดิบตกกลาง ๆ ระหว่างสองขั้น (เศษอยู่ 35–65% ของขั้น) คืนช่วง [ต่ำ, สูง] ให้แสดงเป็น "a–b"
 * ไม่เช่นนั้นคืน null
 */
export function ambiguousRange(raw: number, step: number): [number, number] | null {
  const position = raw / step
  const fraction = position - Math.floor(position)
  if (fraction < 0.35 || fraction > 0.65) return null
  return [Math.floor(position) * step, Math.ceil(position) * step]
}
