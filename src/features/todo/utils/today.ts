export interface DayBounds {
  /** เวลาเริ่มวัน (00:00 ตามเวลาท้องถิ่น) เป็น ISO UTC สำหรับกรอง timestamptz */
  start: string
  /** เวลาเริ่มของวันถัดไป (ช่วงเป็น [start, end)) */
  end: string
}

/** ขอบเขตของ "วันนี้" ตามเวลาท้องถิ่นของผู้ใช้ (ไม่ใช่ UTC) */
export function localDayBounds(now: Date): DayBounds {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export interface TodoToday {
  /** งานที่ยังไม่เสร็จ (รอดำเนินการ + กำลังทำ) */
  open: number
  /** งานที่ทำเสร็จวันนี้ */
  doneToday: number
}
