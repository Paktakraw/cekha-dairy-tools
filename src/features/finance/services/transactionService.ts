import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import type { Transaction, TransactionFilters, TransactionInput } from '../types/finance'

const TABLE = 'transactions'
const COLUMNS = 'id, transaction_date, type, category_id, amount, description, created_at, updated_at'
/** PostgREST จำกัดผลลัพธ์ต่อคำขอ (ค่าเริ่มต้น 1000) จึงดึงเป็นก้อน ๆ */
const CHUNK_SIZE = 1000

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('transactionService', action, cause, {})
}

function toRow(input: TransactionInput) {
  const description = input.description.trim()
  return {
    transaction_date: input.transaction_date,
    type: input.type,
    category_id: input.category_id,
    amount: Number(input.amount),
    description: description === '' ? null : description,
  }
}

/** ถ้าเลือกเดือน/ปี ใช้ต้นเดือน–สิ้นเดือน มิฉะนั้นใช้ช่วงวันที่ที่กรอก */
function resolveDateRange({ month, dateFrom, dateTo }: TransactionFilters): { from: string; to: string } {
  if (month) {
    const [year, mon] = month.split('-').map(Number)
    const lastDay = new Date(year, mon, 0).getDate()
    return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` }
  }
  return { from: dateFrom, to: dateTo }
}

/** escape อักขระพิเศษของ LIKE เพื่อให้ค้นหาตามตัวอักษรจริง */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, '\\$&')
}

function buildQuery(filters: TransactionFilters) {
  let query = supabase.from(TABLE).select(COLUMNS)
  const { from, to } = resolveDateRange(filters)
  if (from) query = query.gte('transaction_date', from)
  if (to) query = query.lte('transaction_date', to)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  const term = filters.search.trim()
  if (term) query = query.ilike('description', `%${escapeLike(term)}%`)
  // เรียงวันที่ล่าสุดก่อน และใช้ id เป็นตัวตัดสินเพื่อให้การแบ่งก้อนคงที่
  return query
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id')
}

export const transactionService = {
  /** limit: จำกัดจำนวน (ใช้กับรายการล่าสุด) ถ้าไม่ระบุจะดึงทั้งหมดที่ตรงกับ filter */
  async list(filters: TransactionFilters, limit?: number): Promise<ServiceResult<Transaction[]>> {
    if (limit !== undefined) {
      const { data, error } = await buildQuery(filters).limit(limit).overrideTypes<Transaction[]>()
      if (error) return fail('โหลดรายการ', error)
      return { data, error: null }
    }

    const all: Transaction[] = []
    for (let from = 0; ; from += CHUNK_SIZE) {
      const { data, error } = await buildQuery(filters)
        .range(from, from + CHUNK_SIZE - 1)
        .overrideTypes<Transaction[]>()
      if (error) return fail('โหลดรายการ', error)
      all.push(...data)
      if (data.length < CHUNK_SIZE) break
    }
    return { data: all, error: null }
  },

  async create(input: TransactionInput): Promise<ServiceResult<Transaction>> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(toRow(input))
      .select(COLUMNS)
      .single()
      .overrideTypes<Transaction>()
    if (error) return fail('เพิ่มรายการ', error)
    return { data, error: null }
  },

  async update(id: string, input: TransactionInput): Promise<ServiceResult<Transaction>> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(toRow(input))
      .eq('id', id)
      .select(COLUMNS)
      .single()
      .overrideTypes<Transaction>()
    if (error) return fail('แก้ไขรายการ', error)
    return { data, error: null }
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) return fail('ลบรายการ', error)
    return { data: null, error: null }
  },
}
