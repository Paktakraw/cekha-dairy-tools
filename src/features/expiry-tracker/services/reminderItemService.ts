import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { CompleteValues, ItemValues, ReminderItem } from '../types/reminder'

const TABLE = 'reminder_items'
const COLUMNS =
  'id, category, name, due_date, repeat_every, repeat_unit, remind_before_days, cost, provider_name, provider_phone, note, usage_unit, usage_interval, usage_last_done, usage_current, archived_at, created_at, updated_at'
/** PostgREST จำกัดผลลัพธ์ต่อคำขอ (ค่าเริ่มต้น 1000) จึงดึงเป็นก้อน ๆ */
const CHUNK_SIZE = 1000

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('reminderItemService', action, cause)
}

export const reminderItemService = {
  /** รายการทั้งหมดของผู้ใช้ (ทั้งใช้งานอยู่และเก็บถาวร) */
  async list(): Promise<ServiceResult<ReminderItem[]>> {
    const all: ReminderItem[] = []
    for (let offset = 0; ; offset += CHUNK_SIZE) {
      // เรียงให้คงที่ (id เป็นตัวตัดสิน) เพื่อให้การแบ่งก้อนไม่ซ้ำ/ตกหล่น
      const { data, error } = await supabase
        .from(TABLE)
        .select(COLUMNS)
        .order('due_date')
        .order('id')
        .range(offset, offset + CHUNK_SIZE - 1)
        .overrideTypes<ReminderItem[], { merge: false }>()
      if (error) return fail('โหลดรายการ', error)
      all.push(...data)
      if (data.length < CHUNK_SIZE) break
    }
    return { data: all, error: null }
  },

  async create(values: ItemValues): Promise<ServiceResult<ReminderItem>> {
    const { data, error } = await supabase.from(TABLE).insert(values).select(COLUMNS).single().overrideTypes<ReminderItem, { merge: false }>()
    if (error) return fail('เพิ่มรายการ', error)
    return { data, error: null }
  },

  async update(id: string, values: ItemValues): Promise<ServiceResult<ReminderItem>> {
    const { data, error } = await supabase.from(TABLE).update(values).eq('id', id).select(COLUMNS).single().overrideTypes<ReminderItem, { merge: false }>()
    if (error) return fail('แก้ไขรายการ', error)
    return { data, error: null }
  },

  /** ลบรายการ (ประวัติของรายการถูกลบตามด้วย cascade) */
  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบรายการ', error)
    return { data: null, error: null }
  },

  /** บันทึก "ทำแล้ว": เพิ่มประวัติ + เลื่อนวันครบกำหนด/เก็บถาวร ในธุรกรรมเดียว (RPC) next_due null = เก็บถาวร */
  async complete(itemId: string, values: CompleteValues): Promise<ServiceResult<null>> {
    const { error } = await supabase.rpc('complete_reminder', {
      p_item_id: itemId,
      p_done_on: values.done_on,
      p_cost: values.cost,
      p_provider_name: values.provider_name,
      p_provider_phone: values.provider_phone,
      p_note: values.note,
      p_usage_value: values.usage_value,
      p_next_due: values.next_due,
      p_archive: values.next_due === null,
    })
    if (error) return fail('บันทึกว่าทำแล้ว', error)
    return { data: null, error: null }
  },
}
