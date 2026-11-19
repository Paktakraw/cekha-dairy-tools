/** เครื่องมือวันที่แบบข้อความ "YYYY-MM-DD" / "YYYY-MM" (ไม่ผ่าน timezone จึงไม่เพี้ยนวัน) */

const pad = (n: number): string => String(n).padStart(2, '0')

export function monthKeyOf(date: string): string {
  return date.slice(0, 7)
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** วันแรก-วันสุดท้ายของเดือน */
export function monthRange(key: string): { from: string; to: string } {
  const { year, month } = parseMonthKey(key)
  return { from: `${key}-01`, to: `${year}-${pad(month)}-${pad(daysInMonth(year, month))}` }
}

export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key)
  const index = year * 12 + (month - 1) + delta
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`
}

/** ตารางปฏิทินของเดือน เริ่มสัปดาห์วันอาทิตย์ ช่องว่าง = null (เติมให้ครบสัปดาห์) */
export function buildMonthGrid(key: string): (string | null)[] {
  const { year, month } = parseMonthKey(key)
  const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const total = daysInMonth(year, month)
  const cells: (string | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= total; day++) cells.push(`${key}-${pad(day)}`)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/** เลื่อนวันที่ไปกี่วัน (ลบ = ย้อนหลัง) */
export function addDays(date: string, delta: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day + delta))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
