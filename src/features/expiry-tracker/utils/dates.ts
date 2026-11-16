/** ยูทิลิตี้วันที่แบบ "YYYY-MM-DD" ตามเวลาท้องถิ่น (ไม่ผ่าน UTC จึงไม่เพี้ยนวัน) */

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** ตรวจว่าเป็นวันที่ที่มีอยู่จริง เช่น 2026-02-30 ไม่ผ่าน */
export function isValidISODate(value: string): boolean {
  const match = ISO_PATTERN.exec(value)
  if (!match) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const d = new Date(year, month - 1, day)
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day
}

function parse(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

function format(year: number, month: number, day: number): string {
  const d = new Date(year, month - 1, day)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${String(d.getFullYear()).padStart(4, '0')}-${mm}-${dd}`
}

export function addDays(date: string, days: number): string {
  const { year, month, day } = parse(date)
  return format(year, month, day + days)
}

/** บวกเดือน ถ้าวันนั้นไม่มีในเดือนปลายทางใช้วันสุดท้ายของเดือน (31 ม.ค. + 1 เดือน = 28/29 ก.พ.) */
export function addMonths(date: string, months: number): string {
  const { year, month, day } = parse(date)
  const target = new Date(year, month - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return format(target.getFullYear(), target.getMonth() + 1, Math.min(day, lastDay))
}

/** จำนวนวันจาก from ถึง to (ติดลบถ้า to อยู่ก่อน from) นับตามวันปฏิทิน ไม่เพี้ยนจากเวลาออมแสง */
export function daysBetween(from: string, to: string): number {
  const a = parse(from)
  const b = parse(to)
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000)
}

/** เดือนปฏิทินถัดจากเดือนของวันที่ที่ระบุ: วันที่ 1 ถึงวันสุดท้าย */
export function nextMonthRange(date: string): { from: string; to: string } {
  const { year, month } = parse(date)
  return { from: format(year, month + 1, 1), to: format(year, month + 2, 0) }
}
