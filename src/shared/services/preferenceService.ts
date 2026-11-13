import { serviceFail } from '../lib/serviceError'
import { supabase } from '../lib/supabase'
import type { ServiceResult } from '../types/result'
import { resolveTheme, type Theme } from '../utils/theme'

const TABLE = 'user_preferences'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('preferenceService', action, cause)
}

export const preferenceService = {
  /** ธีมที่ผู้ใช้เลือกไว้ (null = ยังไม่เคยเลือก) */
  async getTheme(): Promise<ServiceResult<Theme | null>> {
    const { data, error } = await supabase.from(TABLE).select('theme').maybeSingle().overrideTypes<{ theme: string }>()
    if (error) return fail('โหลดธีม', error)
    return { data: data === null ? null : resolveTheme(data.theme), error: null }
  },

  /** บันทึกธีม (1 แถวต่อผู้ใช้ ถ้ามีอยู่แล้วจะอัปเดตทับ) */
  async saveTheme(theme: Theme): Promise<ServiceResult<Theme>> {
    const { error } = await supabase.from(TABLE).upsert({ theme }, { onConflict: 'user_id' })
    if (error) return fail('บันทึกธีม', error)
    return { data: theme, error: null }
  },
}
