import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { CATEGORY_IN_USE_MESSAGE, DUPLICATE_CATEGORY_MESSAGE } from '../constants'
import type { Category, CategoryInput } from '../types/finance'

const TABLE = 'categories'
const COLUMNS = 'id, name, type, description, created_at, updated_at'
const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  if (cause.code === UNIQUE_VIOLATION) return { data: null, error: DUPLICATE_CATEGORY_MESSAGE }
  if (cause.code === FOREIGN_KEY_VIOLATION) return { data: null, error: CATEGORY_IN_USE_MESSAGE }
  console.error(`[categoryService] ${action}:`, cause.message)
  return { data: null, error: `${action}ไม่สำเร็จ กรุณาลองใหม่` }
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

async function list(): Promise<ServiceResult<Category[]>> {
  const { data, error } = await supabase.from(TABLE).select(COLUMNS).order('created_at').overrideTypes<Category[]>()
  if (error) return fail('โหลดหมวดหมู่', error)
  return { data, error: null }
}

export const categoryService = {
  list,

  /** โหลดหมวดหมู่ ถ้ายังไม่มีเลยให้ seed หมวดหมู่เริ่มต้น (RPC idempotent) แล้วโหลดใหม่ */
  async listWithSeed(): Promise<ServiceResult<Category[]>> {
    const first = await list()
    if (first.error !== null || first.data.length > 0) return first

    const { error } = await supabase.rpc('seed_default_categories')
    if (error) return fail('สร้างหมวดหมู่เริ่มต้น', error)
    return list()
  },

  async create(input: CategoryInput): Promise<ServiceResult<Category>> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ name: input.name.trim(), type: input.type, description: emptyToNull(input.description) })
      .select(COLUMNS)
      .single()
      .overrideTypes<Category>()
    if (error) return fail('เพิ่มหมวดหมู่', error)
    return { data, error: null }
  },

  /** แก้ชื่อ/คำอธิบาย (ไม่แก้ type เพราะ Transaction เดิมอ้างอิง type ของหมวดหมู่) */
  async update(id: string, input: CategoryInput): Promise<ServiceResult<Category>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ name: input.name.trim(), description: emptyToNull(input.description) })
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<Category>()
    if (error) return fail('แก้ไขหมวดหมู่', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบหมวดหมู่', error)
    return { data: null, error: null }
  },
}
