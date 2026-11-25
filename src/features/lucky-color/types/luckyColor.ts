/** วัน 8 แบบของวงล้อทักษา (พุธแยกกลางวัน/กลางคืน = ราหู) */
export type TaksaDay = 'sun' | 'mon' | 'tue' | 'wed_day' | 'wed_night' | 'thu' | 'fri' | 'sat'

/** ตำแหน่งที่เป็นคุณ 3 ตำแหน่ง: เดช = การงาน, ศรี = การเงิน/โชคลาภ, มนตรี = ผู้ใหญ่อุปถัมภ์ */
export type GoodPosition = 'dech' | 'sri' | 'montri'

/** Row จากตาราง lucky_color_profiles (ไม่ select user_id) */
export interface LuckyColorProfile {
  id: string
  birth_day: TaksaDay
  created_at: string
  updated_at: string
}

export interface SuperLuckyColor {
  day: TaksaDay
  /** ตำแหน่งที่สีนี้อยู่ในวงล้อวันเกิด / วงล้อวันนี้ */
  birthPosition: GoodPosition
  todayPosition: GoodPosition
}

export type AvoidSource = 'birth' | 'today'

export interface AvoidColor {
  day: TaksaDay
  /** มาจากกาลกิณีของวันเกิด วันนี้ หรือทั้งคู่ (ไม่ซ้ำกัน) */
  sources: AvoidSource[]
}

export interface LuckyColorResult {
  birthDay: TaksaDay
  today: TaksaDay
  superLucky: SuperLuckyColor[]
  /** สีเสริมแยกหมวด (วันเกิดก่อน แล้วตามด้วยวันนี้ ไม่ซ้ำ หักสีต้องห้ามแล้ว) */
  boost: Record<GoodPosition, TaksaDay[]>
  avoid: AvoidColor[]
}
