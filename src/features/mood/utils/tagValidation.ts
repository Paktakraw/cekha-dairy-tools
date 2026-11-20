import { MAX_TAGS, TAG_NAME_MAX_LENGTH } from '../constants.ts'
import type { MoodTag, MoodTagGroup } from '../types/mood'

export interface TagNameResult {
  name: string | null
  error: string | null
}

/** รูปแบบชื่อเพื่อเทียบซ้ำ: ตัดช่องว่างหัวท้าย ไม่สนตัวพิมพ์ (ตรงกับ unique index ใน DB) */
const normalizeKey = (name: string): string => name.trim().toLowerCase()

/**
 * ตรวจชื่อแท็ก: ไม่ว่าง ≤ TAG_NAME_MAX_LENGTH และไม่ซ้ำในกลุ่มเดียวกัน
 * แก้ชื่อให้ส่ง ignoreId = แท็กที่กำลังแก้ (ชื่อเดิมของตัวเองไม่นับว่าซ้ำ)
 */
export function validateTagName(raw: string, group: MoodTagGroup, existing: MoodTag[], ignoreId?: string): TagNameResult {
  const name = raw.trim()
  if (name === '') return { name: null, error: 'กรอกชื่อแท็ก' }
  if (name.length > TAG_NAME_MAX_LENGTH) return { name: null, error: `ชื่อแท็กยาวเกิน ${TAG_NAME_MAX_LENGTH} ตัวอักษร` }
  const duplicate = existing.some((t) => t.group_kind === group && t.id !== ignoreId && normalizeKey(t.name) === normalizeKey(name))
  if (duplicate) return { name: null, error: 'มีแท็กชื่อนี้ในกลุ่มนี้แล้ว' }
  return { name, error: null }
}

/** เพิ่มแท็กใหม่ได้อีกหรือไม่ (รวมทุกกลุ่มไม่เกิน MAX_TAGS) */
export function canAddTag(existing: MoodTag[]): boolean {
  return existing.length < MAX_TAGS
}
