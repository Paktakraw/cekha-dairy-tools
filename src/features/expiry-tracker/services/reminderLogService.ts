import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { ReminderLog } from '../types/reminder'

const COLUMNS = 'id, item_id, item_name, done_on, cost, provider_name, provider_phone, note, usage_value, created_at'

export const reminderLogService = {
  /** ประวัติของรายการ ใหม่ไปเก่า */
  async listByItem(itemId: string): Promise<ServiceResult<ReminderLog[]>> {
    const { data, error } = await supabase
      .from('reminder_logs')
      .select(COLUMNS)
      .eq('item_id', itemId)
      .order('done_on', { ascending: false })
      .order('created_at', { ascending: false })
      .overrideTypes<ReminderLog[]>()
    if (error) return serviceFail('reminderLogService', 'โหลดประวัติ', error)
    return { data, error: null }
  },
}
