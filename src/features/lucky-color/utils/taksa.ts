import {
  DAY_BY_WEEKDAY,
  DAY_CHANGE_HOUR,
  DAY_NAMES,
  GOOD_POSITIONS,
  WED_NIGHT_START_HOUR,
  WHEEL_ORDER,
  WHEEL_POSITIONS,
  type WheelPosition,
} from '../constants.ts'
import type {
  AvoidColor,
  AvoidSource,
  GoodPosition,
  LuckyColorResult,
  SuperLuckyColor,
  TaksaDay,
} from '../types/luckyColor'

const HOUR_MS = 60 * 60 * 1000

/**
 * วันตามหลักโหราศาสตร์ของเวลาหนึ่ง (เวลาท้องถิ่นของเครื่อง)
 * - เปลี่ยนวันเวลา 06:00 น. (00:00–05:59 นับเป็นวันก่อนหน้า)
 * - พุธกลางคืน (ราหู) = พุธ 18:00 ถึงพฤหัสบดี 05:59
 */
export function getTaksaDay(now: Date): TaksaDay {
  // เลื่อนเวลาถอยหลังตามชั่วโมงเปลี่ยนวัน แล้วอ่านวัน/ชั่วโมงจากเวลาที่เลื่อน
  const shifted = new Date(now.getTime() - DAY_CHANGE_HOUR * HOUR_MS)
  const dow = shifted.getDay()
  if (dow === 3) return shifted.getHours() >= WED_NIGHT_START_HOUR - DAY_CHANGE_HOUR ? 'wed_night' : 'wed_day'
  return DAY_BY_WEEKDAY[dow]
}

/** วงล้อทักษา: หมุนอาเรย์ 8 ช่องให้ start อยู่ตำแหน่ง "บริวาร" แล้วไล่ตำแหน่งตามลำดับ */
export function buildWheel(start: TaksaDay): Record<WheelPosition, TaksaDay> {
  const offset = WHEEL_ORDER.indexOf(start)
  const wheel = {} as Record<WheelPosition, TaksaDay>
  WHEEL_POSITIONS.forEach((position, i) => {
    wheel[position] = WHEEL_ORDER[(offset + i) % WHEEL_ORDER.length]
  })
  return wheel
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

/** หาตำแหน่งที่ดีของวันหนึ่งในวงล้อ (วงล้อเป็น permutation จึงมีตำแหน่งเดียว) */
function goodPositionOf(wheel: Record<WheelPosition, TaksaDay>, day: TaksaDay): GoodPosition | null {
  return GOOD_POSITIONS.find((position) => wheel[position] === day) ?? null
}

/** กรอง 2 ชั้น: วงล้อวันเกิด × วงล้อวันปัจจุบัน → สีปังคูณสอง, สีเสริมรายหมวด, สีต้องห้าม */
export function computeLuckyColors(birthDay: TaksaDay, now: Date): LuckyColorResult {
  const today = getTaksaDay(now)
  const birthWheel = buildWheel(birthDay)
  const todayWheel = buildWheel(today)

  // Exclusion: กาลกิณีของทั้งสองชั้น (แยกที่มา)
  const avoidSources = new Map<TaksaDay, AvoidSource[]>()
  const addAvoid = (day: TaksaDay, source: AvoidSource) =>
    avoidSources.set(day, [...(avoidSources.get(day) ?? []), source])
  addAvoid(birthWheel.kalakini, 'birth')
  addAvoid(todayWheel.kalakini, 'today')
  const avoid: AvoidColor[] = [...avoidSources].map(([day, sources]) => ({
    day,
    sources,
  }))

  // Intersection: สีที่อยู่ในกลุ่มดีทั้งสองวงล้อ และไม่ถูกตัด
  const superLucky: SuperLuckyColor[] = []
  for (const day of WHEEL_ORDER) {
    if (avoidSources.has(day)) continue
    const birthPosition = goodPositionOf(birthWheel, day)
    const todayPosition = goodPositionOf(todayWheel, day)
    if (birthPosition !== null && todayPosition !== null) superLucky.push({ day, birthPosition, todayPosition })
  }

  const boost = {} as Record<GoodPosition, TaksaDay[]>
  for (const position of GOOD_POSITIONS) {
    boost[position] = unique([birthWheel[position], todayWheel[position]]).filter((day) => !avoidSources.has(day))
  }

  return { birthDay, today, superLucky, boost, avoid }
}

/** คำทักทายตามวัน/ช่วงเวลาปัจจุบัน เช่น "วันพุธ" หรือ "คืนวันพุธ (ราหู)" */
export function todayLabel(today: TaksaDay): string {
  if (today === 'wed_night') return 'คืนวันพุธ (ราหู)'
  if (today === 'wed_day') return 'วันพุธ'
  return `วัน${DAY_NAMES[today]}`
}

/** ชื่อวันเกิดในประโยค เช่น "วันจันทร์" หรือ "วันพุธกลางคืน (ราหู)" */
export function birthLabel(birthDay: TaksaDay): string {
  return `วัน${DAY_NAMES[birthDay]}`
}

export function isTaksaDay(value: string): value is TaksaDay {
  return (WHEEL_ORDER as readonly string[]).includes(value)
}
