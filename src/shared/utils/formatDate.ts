const dateTimeFormatter = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** รับ "YYYY-MM-DD" (ไม่ผ่าน timezone จึงไม่เพี้ยนวัน) */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

/** วันนี้ตามเวลาท้องถิ่น เป็น "YYYY-MM-DD" */
export function todayISO(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

const monthFormatter = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' })

/** รับ "YYYY-MM-DD" (หรือวันใดก็ได้ในเดือน) คืนชื่อเดือนและปี เช่น พฤศจิกายน 2569 */
export function formatMonth(date: string): string {
  const [year, month] = date.split('-').map(Number)
  return monthFormatter.format(new Date(year, month - 1, 1))
}
