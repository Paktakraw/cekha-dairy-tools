import type { MoodScore, MoodTagGroup } from './types/mood'

export const NOTE_MAX_LENGTH = 100
/** คะแนนของอารมณ์ "ดิ่ง" และ "เหนื่อย" (ระดับที่แสดงการ์ดปลอบใจ) */
export const OVERWHELMED_SCORE = 1
export const DRAINED_SCORE = 2
/** เช็กอิน 😭 ติดต่อกันกี่วันถึงแสดงข้อความดูแลใจเพิ่ม */
export const LOW_STREAK_DAYS = 3
/** เดือนที่เช็กอินน้อยกว่านี้ การ์ดสรุปขึ้นหมายเหตุว่าข้อมูลยังน้อย */
export const MIN_DAYS_FOR_SUMMARY = 5
export const TOP_TAGS_COUNT = 3
/** กรมสุขภาพจิต โทรฟรี 24 ชม. */
export const HOTLINE_NUMBER = '1323'
/** ลิงก์ไปฟีเจอร์ที่มีอยู่แล้ว (เป็นเพียง path ไม่ import โค้ดข้ามฟีเจอร์) */
export const RANDOMIZER_PATH = '/randomizer'
/** หน้าปฏิทินของฟีเจอร์เอง (ไปที่นี่หลังบันทึกจากหน้า "วันนี้") */
export const CALENDAR_PATH = '/mood/calendar'
export const SETTINGS_PATH = '/mood/settings'

export interface MoodMeta {
  score: MoodScore
  id: string
  emoji: string
  label: string
  meaning: string
  /** สีพื้นหลังโทนหม่น (ตัวแปรสีใน index.css รองรับโหมดมืด) */
  bgClass: string
}

/** เรียงจากดีไปไม่ดี */
export const MOODS: MoodMeta[] = [
  { score: 5, id: 'hype', emoji: '🤩', label: 'เยี่ยมยอด', meaning: 'วันที่อะไรก็เป็นใจ เจอเรื่องดี ๆ', bgClass: 'bg-[var(--mood-5)]' },
  { score: 4, id: 'chill', emoji: '😊', label: 'สวยงาม', meaning: 'สบายใจ ไม่เครียด สุขเล็ก ๆ', bgClass: 'bg-[var(--mood-4)]' },
  { score: 3, id: 'meh', emoji: '😐', label: 'เฉย ๆ', meaning: 'วันปกติ แค่ผ่านไปอีกวัน', bgClass: 'bg-[var(--mood-3)]' },
  { score: 2, id: 'drained', emoji: '😩', label: 'แบตหมด', meaning: 'เรียนหนัก งานเยอะ นอนน้อย หมดพลัง', bgClass: 'bg-[var(--mood-2)]' },
  { score: 1, id: 'overwhelmed', emoji: '😭', label: 'ลงเหว', meaning: 'เครียดจัด เศร้า กดดัน อยากพักจากทุกอย่าง', bgClass: 'bg-[var(--mood-1)]' },
]

/** อารมณ์ฝั่งลบที่ต้องมีการ์ดปลอบใจ */
export type LowMoodScore = typeof OVERWHELMED_SCORE | typeof DRAINED_SCORE

export function isLowMood(score: MoodScore): score is LowMoodScore {
  return score === OVERWHELMED_SCORE || score === DRAINED_SCORE
}

export function moodMeta(score: MoodScore): MoodMeta {
  return MOODS.find((m) => m.score === score) ?? MOODS[2]
}

export const TAG_GROUPS: MoodTagGroup[] = ['story', 'activity']
export const TAG_GROUP_LABELS: Record<MoodTagGroup, string> = { story: 'เรื่องราว', activity: 'กิจกรรม' }
export const TAG_NAME_MAX_LENGTH = 20
/** จำนวนแท็กสูงสุดต่อผู้ใช้ (ตรงกับ trigger ใน migration `mood_custom_tags`) */
export const MAX_TAGS = 30

export const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
