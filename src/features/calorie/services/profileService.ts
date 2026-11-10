import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { BmrResult, BmrValues, CalorieProfile } from '../types/calorie'

const TABLE = 'calorie_profiles'
const COLUMNS = 'id, sex, age, weight_kg, height_cm, activity_level, bmr, tdee, created_at, updated_at'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('profileService', action, cause)
}

export const profileService = {
  /** โปรไฟล์ของผู้ใช้ (null = ยังไม่เคยคำนวณ) */
  async get(): Promise<ServiceResult<CalorieProfile | null>> {
    const { data, error } = await supabase.from(TABLE).select(COLUMNS).maybeSingle().overrideTypes<CalorieProfile>()
    if (error) return fail('โหลดข้อมูล BMR', error)
    return { data, error: null }
  },

  /** บันทึกผลคำนวณ (1 แถวต่อผู้ใช้ ถ้ามีอยู่แล้วจะอัปเดตทับ) */
  async save(values: BmrValues, result: BmrResult): Promise<ServiceResult<CalorieProfile>> {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert(
        {
          sex: values.sex,
          age: values.age,
          weight_kg: values.weightKg,
          height_cm: values.heightCm,
          activity_level: values.activityLevel,
          bmr: result.bmr,
          tdee: result.tdee,
        },
        { onConflict: 'user_id' },
      )
      .select(COLUMNS)
      .single()
      .overrideTypes<CalorieProfile>()
    if (error) return fail('บันทึกผล BMR', error)
    return { data, error: null }
  },
}
