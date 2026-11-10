import { serviceFail, PG_UNIQUE_VIOLATION } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { DUPLICATE_FOOD_MESSAGE } from '../constants'
import type { Food, FoodInput } from '../types/calorie'

const TABLE = 'foods'
const COLUMNS = 'id, name, serving_unit, kcal_per_unit, source, created_at, updated_at'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('foodService', action, cause, { [PG_UNIQUE_VIOLATION]: DUPLICATE_FOOD_MESSAGE })
}

function toRow(input: FoodInput) {
  return {
    name: input.name.trim(),
    serving_unit: input.serving_unit.trim(),
    kcal_per_unit: Number(input.kcal_per_unit),
  }
}

async function list(): Promise<ServiceResult<Food[]>> {
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).order('name').overrideTypes<Food[]>()
  if (error) return fail('โหลดรายการอาหาร', error)
  return { data, error: null }
}

export const foodService = {
  list,

  /** โหลดรายการอาหาร ถ้ายังไม่มีเลยให้ seed ข้อมูลตั้งต้น (RPC idempotent) แล้วโหลดใหม่ */
  async listWithSeed(): Promise<ServiceResult<Food[]>> {
    const first = await list()
    if (first.error !== null || first.data.length > 0) return first

    const { error } = await supabase.rpc('seed_default_foods')
    if (error) return fail('สร้างรายการอาหารตั้งต้น', error)
    return list()
  },

  async create(input: FoodInput): Promise<ServiceResult<Food>> {
    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select(COLUMNS).single().overrideTypes<Food>()
    if (error) return fail('เพิ่มอาหาร', error)
    return { data, error: null }
  },

  async update(id: string, input: FoodInput): Promise<ServiceResult<Food>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toRow(input))
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<Food>()
    if (error) return fail('แก้ไขอาหาร', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบอาหาร', error)
    return { data: null, error: null }
  },
}
