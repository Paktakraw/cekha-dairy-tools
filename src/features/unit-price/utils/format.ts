/** ราคาต่อหน่วย: เลขน้อยแสดงทศนิยมเพิ่มให้เห็นความต่าง เช่น 0.0123 -> "฿0.0123" */
export function formatUnitPrice(value: number): string {
  const maxDigits = value >= 1 ? 2 : value >= 0.01 ? 4 : 6
  const text = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: maxDigits }).format(value)
  return `฿${text}`
}

/** 12.345 -> "12.3", น้อยกว่า 0.1 -> "<0.1" (ไม่ให้แสดง 0% ทั้งที่ยังแพงกว่าอยู่) */
export function formatPercent(value: number): string {
  if (value < 0.1) return '<0.1'
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)
}
