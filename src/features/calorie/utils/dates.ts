/** ยูทิลิตี้วันที่แบบ "YYYY-MM-DD" ตามเวลาท้องถิ่น (ไม่ผ่าน UTC จึงไม่เพี้ยนวัน) */

function parse(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function format(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function addDays(date: string, days: number): string {
  const d = parse(date)
  d.setDate(d.getDate() + days)
  return format(d)
}

/** สัปดาห์ของวันที่ที่ระบุ เริ่มวันจันทร์ สิ้นสุดวันอาทิตย์ */
export function weekRange(date: string): { from: string; to: string } {
  const d = parse(date)
  const sinceMonday = (d.getDay() + 6) % 7
  const from = addDays(date, -sinceMonday)
  return { from, to: addDays(from, 6) }
}

/** เดือนของวันที่ที่ระบุ ตั้งแต่วันที่ 1 ถึงวันสุดท้ายของเดือน */
export function monthRange(date: string): { from: string; to: string } {
  const d = parse(date)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const prefix = date.slice(0, 7)
  return { from: `${prefix}-01`, to: `${prefix}-${String(lastDay).padStart(2, '0')}` }
}

/** เลื่อนไป n เดือน คืนวันที่ 1 ของเดือนนั้น */
export function shiftMonth(date: string, months: number): string {
  const d = parse(date)
  return format(new Date(d.getFullYear(), d.getMonth() + months, 1))
}

/** รายการวันที่ทุกวันตั้งแต่ from ถึง to (รวมทั้งสองวัน) */
export function listDates(from: string, to: string): string[] {
  const dates: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d)
  return dates
}
