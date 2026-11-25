import type { GoodPosition, TaksaDay } from './types/luckyColor'

/** ลำดับวันบนวงล้อทักษา (วนกลับต้นเมื่อสุดทาง) */
export const WHEEL_ORDER: readonly TaksaDay[] = ['sun', 'mon', 'tue', 'wed_day', 'sat', 'thu', 'wed_night', 'fri']

/** ตำแหน่งทักษา 8 ตำแหน่งตามลำดับที่เรียงจากวันตั้งต้น */
export const WHEEL_POSITIONS = ['servant', 'life', 'dech', 'sri', 'mula', 'effort', 'montri', 'kalakini'] as const
export type WheelPosition = (typeof WHEEL_POSITIONS)[number]

export const GOOD_POSITIONS: readonly GoodPosition[] = ['dech', 'sri', 'montri']

export const POSITION_LABELS: Record<GoodPosition, string> = {
  dech: 'การงาน (เดช)',
  sri: 'การเงินและโชคลาภ (ศรี)',
  montri: 'ผู้ใหญ่อุปถัมภ์ (มนตรี)',
}

/** ชื่อวันในตัวเลือกวันเกิด */
export const DAY_NAMES: Record<TaksaDay, string> = {
  sun: 'อาทิตย์',
  mon: 'จันทร์',
  tue: 'อังคาร',
  wed_day: 'พุธกลางวัน',
  wed_night: 'พุธกลางคืน (ราหู)',
  thu: 'พฤหัสบดี',
  fri: 'ศุกร์',
  sat: 'เสาร์',
}

export interface DayColor {
  /** ชื่อสีที่แสดง (วันหนึ่งมีได้หลายชื่อ) */
  names: string[]
  /** สีของชิป (โทนหม่น ใช้ได้ทั้งโหมดสว่าง/มืด เพราะชิปมีขอบ) */
  swatches: string[]
}

export const DAY_COLORS: Record<TaksaDay, DayColor> = {
  sun: { names: ['แดง'], swatches: ['#d64545'] },
  mon: { names: ['เหลือง'], swatches: ['#e8c547'] },
  tue: { names: ['ชมพู'], swatches: ['#ec9fbd'] },
  wed_day: { names: ['เขียว'], swatches: ['#4f9d69'] },
  wed_night: { names: ['ดำ', 'เทา'], swatches: ['#1f2937', '#9ca3af'] },
  thu: { names: ['ส้ม'], swatches: ['#ee8f3a'] },
  fri: { names: ['ฟ้า', 'น้ำเงิน'], swatches: ['#5aa9e6', '#2f4fa3'] },
  sat: { names: ['ม่วง'], swatches: ['#8b5cc7'] },
}

/** วันเปลี่ยนเวลา 06:00 น. และพุธกลางคืนเริ่ม 18:00 น. (ชั่วโมงตามเวลาเครื่อง) */
export const DAY_CHANGE_HOUR = 6
export const WED_NIGHT_START_HOUR = 18

export const DISCLAIMER = 'เพื่อความบันเทิงและความสบายใจ ไม่ใช่คำทำนาย'

/** วันในสัปดาห์ (0=อาทิตย์) → วันทักษา ยกเว้นวันพุธ (3) ที่ต้องดูเวลาเพื่อแยกกลางวัน/กลางคืน */
export const DAY_BY_WEEKDAY: Record<number, TaksaDay> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}
