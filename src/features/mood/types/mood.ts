/** คะแนนอารมณ์ 1 (ดิ่ง) – 5 (ปังสุด) ตรงกับคอลัมน์ mood */
export type MoodScore = 1 | 2 | 3 | 4 | 5

export type MoodTagId = 'study' | 'money' | 'friends' | 'love' | 'family' | 'health' | 'food' | 'music' | 'watch' | 'workout' | 'shopping'

/** แถวจากตาราง mood_entries (ฟิลด์ที่ใช้) */
export interface MoodEntry {
  id: string
  entry_date: string
  mood: MoodScore
  tags: MoodTagId[]
  note: string | null
  created_at: string
  updated_at: string
}

/** ค่าที่ผ่านการตรวจแล้ว พร้อมบันทึกรายละเอียด (แท็ก + ข้อความ) */
export interface DetailValues {
  tags: MoodTagId[]
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
