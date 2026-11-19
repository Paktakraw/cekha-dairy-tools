import { NOTE_MAX_LENGTH, TAGS } from '../constants.ts'
import type { DetailResult, MoodTagId } from '../types/mood'

const TAG_ORDER = TAGS.map((t) => t.id)

/** วันที่ต้องอยู่ในรูป YYYY-MM-DD และไม่เกินวันนี้ (คืนข้อความ error หรือ null) */
export function validateEntryDate(date: string, today: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'วันที่ไม่ถูกต้อง'
  if (date > today) return 'เช็กอินล่วงหน้าไม่ได้'
  return null
}

/** ตรวจแท็ก + ข้อความ: ตัดแท็กซ้ำ/แท็กนอกชุด จัดเรียงตามชุดแท็ก, ข้อความตัดช่องว่างหัวท้าย ว่าง = null */
export function normalizeDetails(tags: string[], note: string): DetailResult {
  const trimmed = note.trim()
  if (trimmed.length > NOTE_MAX_LENGTH) return { values: null, error: `ข้อความยาวเกิน ${NOTE_MAX_LENGTH} ตัวอักษร` }
  const chosen = new Set(tags)
  const cleaned: MoodTagId[] = TAG_ORDER.filter((id) => chosen.has(id))
  return { values: { tags: cleaned, note: trimmed === '' ? null : trimmed }, error: null }
}
