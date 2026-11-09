import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { DUPLICATE_GROUP_MESSAGE } from '../constants'
import type { RandomData, RandomGroup, RandomItem } from '../types/random'

const GROUPS = 'random_groups'
const ITEMS = 'random_items'
const GROUP_COLUMNS = 'id, name, created_at, updated_at'
const ITEM_COLUMNS = 'id, group_id, label, created_at, updated_at'
const UNIQUE_VIOLATION = '23505'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  if (cause.code === UNIQUE_VIOLATION) return { data: null, error: DUPLICATE_GROUP_MESSAGE }
  console.error(`[randomService] ${action}:`, cause.message)
  return { data: null, error: `${action}ไม่สำเร็จ กรุณาลองใหม่` }
}

export const randomService = {
  /** โหลดกลุ่มและรายการทั้งหมดของผู้ใช้ (ข้อมูลส่วนบุคคลขนาดเล็ก โหลดครั้งเดียวแล้วจัดการใน client) */
  async listAll(): Promise<ServiceResult<RandomData>> {
    const [groupsRes, itemsRes] = await Promise.all([
      supabase.from(GROUPS).select(GROUP_COLUMNS).order('created_at').overrideTypes<RandomGroup[]>(),
      supabase.from(ITEMS).select(ITEM_COLUMNS).order('created_at').overrideTypes<RandomItem[]>(),
    ])
    if (groupsRes.error) return fail('โหลดกลุ่ม', groupsRes.error)
    if (itemsRes.error) return fail('โหลดรายการ', itemsRes.error)
    return { data: { groups: groupsRes.data, items: itemsRes.data }, error: null }
  },

  async createGroup(name: string): Promise<ServiceResult<RandomGroup>> {
    const { data, error } = await supabase
      .from(GROUPS)
      .insert({ name: name.trim() })
      .select(GROUP_COLUMNS)
      .single()
      .overrideTypes<RandomGroup>()
    if (error) return fail('เพิ่มกลุ่ม', error)
    return { data, error: null }
  },

  async updateGroup(id: string, name: string): Promise<ServiceResult<RandomGroup>> {
    const { data, error } = await supabase
      .from(GROUPS)
      .update({ name: name.trim() })
      .eq('id', id)
      .select(GROUP_COLUMNS)
      .single()
      .overrideTypes<RandomGroup>()
    if (error) return fail('แก้ไขกลุ่ม', error)
    return { data, error: null }
  },

  /** ลบกลุ่ม: รายการในกลุ่มถูกลบตาม (ON DELETE CASCADE) */
  async deleteGroup(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(GROUPS).delete().eq('id', id)
    if (error) return fail('ลบกลุ่ม', error)
    return { data: null, error: null }
  },

  async createItem(groupId: string, label: string): Promise<ServiceResult<RandomItem>> {
    const { data, error } = await supabase
      .from(ITEMS)
      .insert({ group_id: groupId, label: label.trim() })
      .select(ITEM_COLUMNS)
      .single()
      .overrideTypes<RandomItem>()
    if (error) return fail('เพิ่มรายการ', error)
    return { data, error: null }
  },

  async updateItem(id: string, label: string): Promise<ServiceResult<RandomItem>> {
    const { data, error } = await supabase
      .from(ITEMS)
      .update({ label: label.trim() })
      .eq('id', id)
      .select(ITEM_COLUMNS)
      .single()
      .overrideTypes<RandomItem>()
    if (error) return fail('แก้ไขรายการ', error)
    return { data, error: null }
  },

  async deleteItem(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(ITEMS).delete().eq('id', id)
    if (error) return fail('ลบรายการ', error)
    return { data: null, error: null }
  },
}
