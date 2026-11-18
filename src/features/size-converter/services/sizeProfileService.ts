import { PG_UNIQUE_VIOLATION, serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { DUPLICATE_PROFILE_MESSAGE } from '../constants'
import type { ProfileValues, SizeProfile } from '../types/size'

const TABLE = 'size_profiles'
const COLUMNS =
  'id, name, demographic, is_self, unit_pref, height_cm, foot_length_cm, foot_width_cm, chest_cm, waist_cm, hip_cm, head_cm, finger_circumference_mm, created_at, updated_at'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('sizeProfileService', action, cause, { [PG_UNIQUE_VIOLATION]: DUPLICATE_PROFILE_MESSAGE })
}

export const sizeProfileService = {
  async list(): Promise<ServiceResult<SizeProfile[]>> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .order('is_self', { ascending: false })
      .order('created_at')
      .order('id')
      .overrideTypes<SizeProfile[], { merge: false }>()
    if (error) return fail('โหลดโปรไฟล์', error)
    return { data, error: null }
  },

  /** isSelf = ตั้งเป็นโปรไฟล์ "ฉัน" (ฐานข้อมูลอนุญาตได้ 1 อันต่อผู้ใช้) */
  async create(values: ProfileValues, isSelf: boolean): Promise<ServiceResult<SizeProfile>> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...values, is_self: isSelf })
      .select(COLUMNS)
      .single()
      .overrideTypes<SizeProfile, { merge: false }>()
    if (error) return fail('เพิ่มโปรไฟล์', error)
    return { data, error: null }
  },

  async update(id: string, values: ProfileValues): Promise<ServiceResult<SizeProfile>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(values)
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<SizeProfile, { merge: false }>()
    if (error) return fail('แก้ไขโปรไฟล์', error)
    return { data, error: null }
  },

  /** ลบโปรไฟล์ (บันทึกไซส์ของโปรไฟล์นี้ถูกลบตามด้วย cascade) */
  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบโปรไฟล์', error)
    return { data: null, error: null }
  },
}
