import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { NoteValues, SizeNote } from '../types/size'

const TABLE = 'size_notes'
const COLUMNS = 'id, profile_id, brand, product, size_label, fit, note, created_at, updated_at'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('sizeNoteService', action, cause)
}

export const sizeNoteService = {
  /** บันทึกทั้งหมดของผู้ใช้ (ล่าสุดก่อน) หน้าจอกรองตามโปรไฟล์/แบรนด์เอง */
  async list(): Promise<ServiceResult<SizeNote[]>> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false })
      .order('id')
      .overrideTypes<SizeNote[], { merge: false }>()
    if (error) return fail('โหลดบันทึกไซส์', error)
    return { data, error: null }
  },

  async create(values: NoteValues): Promise<ServiceResult<SizeNote>> {
    const { data, error } = await supabase.from(TABLE).insert(values).select(COLUMNS).single().overrideTypes<SizeNote, { merge: false }>()
    if (error) return fail('เพิ่มบันทึกไซส์', error)
    return { data, error: null }
  },

  async update(id: string, values: NoteValues): Promise<ServiceResult<SizeNote>> {
    const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select(COLUMNS).single().overrideTypes<SizeNote, { merge: false }>()
    if (error) return fail('แก้ไขบันทึกไซส์', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบบันทึกไซส์', error)
    return { data: null, error: null }
  },
}
