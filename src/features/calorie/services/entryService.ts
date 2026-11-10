import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { Food, FoodEntry, FoodEntryInput } from '../types/calorie'

const TABLE = 'food_entries'
const COLUMNS = 'id, eaten_on, meal, food_id, food_name, serving_unit, kcal_per_unit, quantity, created_at, updated_at'
/** PostgREST จำกัดผลลัพธ์ต่อคำขอ (ค่าเริ่มต้น 1000) จึงดึงเป็นก้อน ๆ */
const CHUNK_SIZE = 1000

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('entryService', action, cause)
}

function buildQuery(from: string, to: string) {
  // เรียงให้คงที่ (id เป็นตัวตัดสิน) เพื่อให้การแบ่งก้อนไม่ซ้ำ/ตกหล่น
  return supabase
    .from(TABLE)
    .select(COLUMNS)
    .gte('eaten_on', from)
    .lte('eaten_on', to)
    .order('eaten_on')
    .order('created_at')
    .order('id')
}

export const entryService = {
  /** รายการอาหารที่กินตั้งแต่วันที่ from ถึง to (YYYY-MM-DD รวมทั้งสองวัน) */
  async listByRange(from: string, to: string): Promise<ServiceResult<FoodEntry[]>> {
    const all: FoodEntry[] = []
    for (let offset = 0; ; offset += CHUNK_SIZE) {
      const { data, error } = await buildQuery(from, to)
        .range(offset, offset + CHUNK_SIZE - 1)
        .overrideTypes<FoodEntry[]>()
      if (error) return fail('โหลดรายการอาหารที่กิน', error)
      all.push(...data)
      if (data.length < CHUNK_SIZE) break
    }
    return { data: all, error: null }
  },

  /** บันทึกพร้อมสำเนาชื่อ/หน่วย/แคลอรี่ของอาหารที่เลือก ณ ตอนนี้ */
  async create(input: FoodEntryInput, food: Food): Promise<ServiceResult<FoodEntry>> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        eaten_on: input.eaten_on,
        meal: input.meal,
        quantity: Number(input.quantity),
        food_id: food.id,
        food_name: food.name,
        serving_unit: food.serving_unit,
        kcal_per_unit: food.kcal_per_unit,
      })
      .select(COLUMNS)
      .single()
      .overrideTypes<FoodEntry>()
    if (error) return fail('บันทึกอาหารที่กิน', error)
    return { data, error: null }
  },

  /** แก้ได้เฉพาะวันที่ มื้อ และจำนวนหน่วย (ชื่อ/แคลอรี่คงเดิมตามที่บันทึกไว้) */
  async update(id: string, input: FoodEntryInput): Promise<ServiceResult<FoodEntry>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ eaten_on: input.eaten_on, meal: input.meal, quantity: Number(input.quantity) })
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<FoodEntry>()
    if (error) return fail('แก้ไขรายการอาหาร', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบรายการอาหาร', error)
    return { data: null, error: null }
  },
}
