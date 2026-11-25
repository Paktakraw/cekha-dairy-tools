import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { LuckyColorProfile, TaksaDay } from '../types/luckyColor'
import { isTaksaDay } from '../utils/taksa'

const TABLE = 'lucky_color_profiles'
const COLUMNS = 'id, birth_day, created_at, updated_at'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('luckyColorProfileService', action, cause)
}

export const luckyColorProfileService = {
  /** วันเกิดที่บันทึกไว้ (null = ยังไม่เคยเลือก) */
  async get(): Promise<ServiceResult<LuckyColorProfile | null>> {
    const { data, error } = await supabase.from(TABLE).select(COLUMNS).maybeSingle().overrideTypes<LuckyColorProfile>()
    if (error) return fail('โหลดวันเกิด', error)
    if (data !== null && !isTaksaDay(data.birth_day))
      return fail('โหลดวันเกิด', { message: `วันเกิดไม่ถูกต้อง: ${data.birth_day}` })
    return { data, error: null }
  },

  /** บันทึกวันเกิด (1 แถวต่อผู้ใช้ มีอยู่แล้วจะอัปเดตทับ) */
  async save(birthDay: TaksaDay): Promise<ServiceResult<LuckyColorProfile>> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ birth_day: birthDay }, { onConflict: 'user_id' })
      .select(COLUMNS)
      .single()
      .overrideTypes<LuckyColorProfile>()
    if (error) return fail('บันทึกวันเกิด', error)
    return { data, error: null }
  },
}
