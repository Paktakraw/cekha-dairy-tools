/** แสดงเลขไซส์: ตัดทศนิยมที่ไม่จำเป็น (41 / 41.5) */
export function formatNumber(value: number, maxDecimals = 2): string {
  return String(Number(value.toFixed(maxDecimals)))
}

const EIGHTHS = ['', ' ⅛', ' ¼', ' ⅜', ' ½', ' ⅝', ' ¾', ' ⅞']

/** ไซส์หมวก US เป็นเศษส่วน 1/8 นิ้ว เช่น 7.25 -> "7 ¼" */
export function formatHatFraction(inches: number): string {
  const eighths = Math.round(inches * 8)
  return `${Math.floor(eighths / 8)}${EIGHTHS[eighths % 8]}`
}
