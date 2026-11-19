import type { MoodScore, MoodTagId } from './types/mood'

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
  { score: 5, id: 'hype', emoji: '🤩', label: 'ตัวท็อป / ปังสุด', meaning: 'วันที่อะไรก็เป็นใจ เจอเรื่องดี ๆ', bgClass: 'bg-[var(--mood-5)]' },
  { score: 4, id: 'chill', emoji: '😊', label: 'เรื่อย ๆ / ชิลล์', meaning: 'สบายใจ ไม่เครียด สุขเล็ก ๆ', bgClass: 'bg-[var(--mood-4)]' },
  { score: 3, id: 'meh', emoji: '😐', label: 'เฉย ๆ / เนือย', meaning: 'วันปกติ แค่ผ่านไปอีกวัน', bgClass: 'bg-[var(--mood-3)]' },
  { score: 2, id: 'drained', emoji: '😩', label: 'เหนื่อย / หมดแบต', meaning: 'เรียนหนัก งานเยอะ นอนน้อย หมดพลัง', bgClass: 'bg-[var(--mood-2)]' },
  { score: 1, id: 'overwhelmed', emoji: '😭', label: 'ดิ่ง / ไม่ไหว', meaning: 'เครียดจัด เศร้า กดดัน อยากพักจากทุกอย่าง', bgClass: 'bg-[var(--mood-1)]' },
]

/** อารมณ์ฝั่งลบที่ต้องมีการ์ดปลอบใจ */
export type LowMoodScore = typeof OVERWHELMED_SCORE | typeof DRAINED_SCORE

export function isLowMood(score: MoodScore): score is LowMoodScore {
  return score === OVERWHELMED_SCORE || score === DRAINED_SCORE
}

export function moodMeta(score: MoodScore): MoodMeta {
  return MOODS.find((m) => m.score === score) ?? MOODS[2]
}

export interface TagMeta {
  id: MoodTagId
  label: string
  group: 'story' | 'activity'
}

export const TAGS: TagMeta[] = [
  { id: 'study', label: 'การเรียน/สอบ', group: 'story' },
  { id: 'money', label: 'การเงิน', group: 'story' },
  { id: 'friends', label: 'เพื่อน', group: 'story' },
  { id: 'love', label: 'ความรัก', group: 'story' },
  { id: 'family', label: 'ครอบครัว', group: 'story' },
  { id: 'health', label: 'สุขภาพ/การนอน', group: 'story' },
  { id: 'food', label: 'กินของอร่อย', group: 'activity' },
  { id: 'music', label: 'ฟังเพลง', group: 'activity' },
  { id: 'watch', label: 'ดูหนัง/ซีรีส์', group: 'activity' },
  { id: 'workout', label: 'ออกกำลังกาย', group: 'activity' },
  { id: 'shopping', label: 'ช้อปปิ้ง', group: 'activity' },
]

export const TAG_GROUP_LABELS: Record<TagMeta['group'], string> = { story: 'เรื่องราว', activity: 'กิจกรรม' }

export function tagLabel(id: MoodTagId): string {
  return TAGS.find((t) => t.id === id)?.label ?? id
}

export const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
