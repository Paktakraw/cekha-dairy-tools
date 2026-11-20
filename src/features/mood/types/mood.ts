/** คะแนนอารมณ์ 1 (ดิ่ง) – 5 (ปังสุด) ตรงกับคอลัมน์ mood */
export type MoodScore = 1 | 2 | 3 | 4 | 5

/** กลุ่มของแท็ก: เรื่องราว / กิจกรรม */
export type MoodTagGroup = 'story' | 'activity'

/** แท็กของผู้ใช้ (ตาราง mood_tags) */
export interface MoodTag {
  id: string
  group_kind: MoodTagGroup
  name: string
  sort_order: number
}

/** แถวจากตาราง mood_entries (ฟิลด์ที่ใช้) */
export interface MoodEntry {
  id: string
  entry_date: string
  mood: MoodScore
  /** id ของ MoodTag */
  tags: string[]
  note: string | null
  created_at: string
  updated_at: string
}

/** ค่าที่ผ่านการตรวจแล้ว พร้อมบันทึกรายละเอียด (แท็ก + ข้อความ) */
export interface DetailValues {
  tags: string[]
  note: string | null
}

export interface DetailResult {
  values: DetailValues | null
  error: string | null
}

/** สัดส่วนของอารมณ์หนึ่งระดับในเดือน */
export interface MoodShare {
  score: MoodScore
  count: number
  percent: number
}
