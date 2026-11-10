import { serviceFail, PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { CATEGORY_IN_USE_MESSAGE, DUPLICATE_CATEGORY_MESSAGE } from '../constants'
import type { Category, CategoryInput } from '../types/finance'

const TABLE = 'categories'
const COLUMNS = 'id, name, type, description, created_at, updated_at'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('categoryService', action, cause, {
    [PG_UNIQUE_VIOLATION]: DUPLICATE_CATEGORY_MESSAGE,
    [PG_FOREIGN_KEY_VIOLATION]: CATEGORY_IN_USE_MESSAGE,
  })
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
