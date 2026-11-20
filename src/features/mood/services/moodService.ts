import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { DetailValues, MoodEntry, MoodScore } from '../types/mood'

const TABLE = 'mood_entries'
const COLUMNS = 'id, entry_date, mood, tags, note, created_at, updated_at'
// user_id มีค่าเริ่มต้นจาก auth.uid() จึงไม่ต้องส่ง แต่ใช้เป็นส่วนของ unique key
const CONFLICT = 'user_id,entry_date'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('moodService', action, cause)
}

export const moodService = {
  /** รายการเช็กอินในช่วงวันที่ (รวมปลายทั้งสองด้าน) เรียงตามวัน */
  async listRange(from: string, to: string): Promise<ServiceResult<MoodEntry[]>> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .gte('entry_date', from)
      .lte('entry_date', to)
      .order('entry_date')
      .overrideTypes<MoodEntry[], { merge: false }>()
    if (error) return fail('โหลดการเช็กอิน', error)
    return { data, error: null }
  },

  /** บันทึกอารมณ์ของวัน: วันที่ยังไม่มี = เพิ่มใหม่, มีแล้ว = เปลี่ยนเฉพาะอารมณ์ (แท็ก/ข้อความเดิมไม่หาย) */
  async saveMood(date: string, mood: MoodScore): Promise<ServiceResult<MoodEntry>> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ entry_date: date, mood }, { onConflict: CONFLICT })
      .select(COLUMNS)
      .single()
      .overrideTypes<MoodEntry, { merge: false }>()
    if (error) return fail('บันทึกอารมณ์', error)
    return { data, error: null }
  },

  /** บันทึกแท็กและข้อความของวัน (ส่งอารมณ์ไปด้วยเผื่อรายการยังไม่มี) */
  async saveDetails(date: string, mood: MoodScore, details: DetailValues): Promise<ServiceResult<MoodEntry>> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ entry_date: date, mood, tags: details.tags, note: details.note }, { onConflict: CONFLICT })
      .select(COLUMNS)
      .single()
      .overrideTypes<MoodEntry, { merge: false }>()
    if (error) return fail('บันทึกรายละเอียด', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบการเช็กอิน', error)
    return { data: null, error: null }
  },
}
