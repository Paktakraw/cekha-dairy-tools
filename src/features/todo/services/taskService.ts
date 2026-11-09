import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { DUPLICATE_TITLE_MESSAGE, PAGE_SIZE } from '../constants'
import type { Task, TaskInput, TaskPage, TaskStatus } from '../types/task'

const TABLE = 'tasks'
const COLUMNS = 'id, title, description, status, completed_at, created_at, updated_at'
const UNIQUE_VIOLATION = '23505'

function toPayload({ title, description }: TaskInput) {
  const trimmedDescription = description.trim()
  return { title: title.trim(), description: trimmedDescription === '' ? null : trimmedDescription }
}

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  if (cause.code === UNIQUE_VIOLATION) return { data: null, error: DUPLICATE_TITLE_MESSAGE }
  console.error(`[taskService] ${action}:`, cause.message)
  return { data: null, error: `${action}ไม่สำเร็จ กรุณาลองใหม่` }
}

export const taskService = {
  /** statuses ว่าง = ทุกสถานะ, page เริ่มที่ 1 */
  async list(statuses: TaskStatus[], page: number): Promise<ServiceResult<TaskPage>> {
    const from = (page - 1) * PAGE_SIZE
    let query = supabase
      .from(TABLE)
      .select(COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (statuses.length > 0) query = query.in('status', statuses)

    const { data, error, count } = await query.overrideTypes<Task[]>()
    if (error) return fail('โหลดรายการงาน', error)
    return { data: { tasks: data, total: count ?? 0 }, error: null }
  },

  async create(input: TaskInput): Promise<ServiceResult<Task>> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(toPayload(input))
      .select(COLUMNS)
      .single()
      .overrideTypes<Task>()
    if (error) return fail('เพิ่มงาน', error)
    return { data, error: null }
  },

  async update(id: string, input: TaskInput): Promise<ServiceResult<Task>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toPayload(input))
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<Task>()
    if (error) return fail('แก้ไขงาน', error)
    return { data, error: null }
  },

  async setStatus(id: string, status: TaskStatus): Promise<ServiceResult<Task>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status })
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<Task>()
    if (error) return fail('เปลี่ยนสถานะงาน', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบงาน', error)
    return { data: null, error: null }
  },
}
