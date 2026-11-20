import { PG_UNIQUE_VIOLATION, serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { MoodTag, MoodTagGroup } from '../types/mood'

const TABLE = 'mood_tags'
const COLUMNS = 'id, group_kind, name, sort_order'
/** รหัส error ของ check_violation (ชื่อ/ครบ 30 แท็ก ที่ผ่านด่านฝั่ง UI มาได้) */
const PG_CHECK_VIOLATION = '23514'

const KNOWN: Record<string, string> = {
  [PG_UNIQUE_VIOLATION]: 'มีแท็กชื่อนี้ในกลุ่มนี้แล้ว',
  [PG_CHECK_VIOLATION]: 'บันทึกแท็กไม่ได้ (ชื่อไม่ถูกต้อง หรือมีแท็กครบ 30 อันแล้ว)',
}

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('moodTagService', action, cause, KNOWN)
}

export const moodTagService = {
  /** แท็กทั้งหมดของผู้ใช้ เรียงตามกลุ่มแล้วตามลำดับที่เพิ่ม */
  async list(): Promise<ServiceResult<MoodTag[]>> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('sort_order')
      .order('id')
      .overrideTypes<MoodTag[], { merge: false }>()
    if (error) return fail('โหลดแท็ก', error)
    return { data, error: null }
  },

  /** ใส่แท็กเริ่มต้นให้ถ้าผู้ใช้ยังไม่มีแท็กเลย (idempotent) */
  async seedDefaults(): Promise<ServiceResult<null>> {
    const { error } = await supabase.rpc('seed_default_mood_tags')
    if (error) return fail('เตรียมแท็กเริ่มต้น', error)
    return { data: null, error: null }
  },

  async create(group: MoodTagGroup, name: string): Promise<ServiceResult<MoodTag>> {
    const { data, error } = await supabase.from(TABLE).insert({ group_kind: group, name }).select(COLUMNS).single().overrideTypes<MoodTag, { merge: false }>()
    if (error) return fail('เพิ่มแท็ก', error)
    return { data, error: null }
  },

  async rename(id: string, name: string): Promise<ServiceResult<MoodTag>> {
    const { data, error } = await supabase.from(TABLE).update({ name }).eq('id', id).select(COLUMNS).single().overrideTypes<MoodTag, { merge: false }>()
    if (error) return fail('แก้ไขแท็ก', error)
    return { data, error: null }
  },

  /** ลบแท็ก (ฐานข้อมูลถอดออกจากรายการเช็กอินเก่าให้เอง) */
  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบแท็ก', error)
    return { data: null, error: null }
  },
}
