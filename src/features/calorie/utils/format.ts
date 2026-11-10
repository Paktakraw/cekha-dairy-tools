const numberFormatter = new Intl.NumberFormat('th-TH')

/** เช่น 1,234 kcal */
export function formatKcal(kcal: number): string {
  return `${numberFormatter.format(kcal)} kcal`
}

/** จำนวนหน่วย เช่น 1, 0.5, 2.25 (ไม่แสดงศูนย์ท้าย) */
export function formatQuantity(quantity: number): string {
  return numberFormatter.format(quantity)
}
