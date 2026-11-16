export type ReminderCategory = 'document' | 'vehicle' | 'home' | 'subscription' | 'other'

export type RepeatUnit = 'day' | 'month' | 'year'

export type Urgency = 'red' | 'yellow' | 'green'

/** Row จากตาราง reminder_items (ไม่ select user_id) */
export interface ReminderItem {
  id: string
  category: ReminderCategory
  name: string
  /** YYYY-MM-DD */
  due_date: string
  repeat_every: number | null
  repeat_unit: RepeatUnit | null
  remind_before_days: number[]
  cost: number | null
  provider_name: string | null
  provider_phone: string | null
  note: string | null
  usage_unit: string | null
  usage_interval: number | null
  usage_last_done: number | null
  usage_current: number | null
  /** null = ใช้งานอยู่, มีค่า = เก็บถาวร */
  archived_at: string | null
  created_at: string
  updated_at: string
}

/** Row จากตาราง reminder_logs */
export interface ReminderLog {
  id: string
  item_id: string
  item_name: string
  done_on: string
  cost: number | null
  provider_name: string | null
  provider_phone: string | null
  note: string | null
  usage_value: number | null
  created_at: string
}

/** ข้อมูลจาก Form รายการ (ตัวเลขเป็น string เพราะมาจากช่องกรอก) */
export interface ItemFormInput {
  category: ReminderCategory
  name: string
  dueDate: string
  repeatEvery: string
  repeatUnit: RepeatUnit
  remindBeforeDays: number[]
  cost: string
  providerName: string
  providerPhone: string
  note: string
  /** เปิดโหมดตามระยะทาง/การใช้งาน */
  usageEnabled: boolean
  usageUnit: string
  usageInterval: string
  usageLastDone: string
  usageCurrent: string
}

/** ค่าที่ผ่านการตรวจสอบแล้ว พร้อมส่งให้ Service (คอลัมน์ตรงกับตาราง) */
export interface ItemValues {
  category: ReminderCategory
  name: string
  due_date: string
  repeat_every: number | null
  repeat_unit: RepeatUnit | null
  remind_before_days: number[]
  cost: number | null
  provider_name: string | null
  provider_phone: string | null
  note: string | null
  usage_unit: string | null
  usage_interval: number | null
  usage_last_done: number | null
  usage_current: number | null
}

export type ItemFieldErrors = Partial<Record<keyof ItemFormInput, string>>

/** ข้อมูลจาก Modal "ทำแล้ว" */
export interface CompleteFormInput {
  doneOn: string
  cost: string
  providerName: string
  providerPhone: string
  note: string
  usageValue: string
  /** วันครบกำหนดครั้งถัดไป ว่าง = เก็บถาวร */
  nextDue: string
}

export interface CompleteValues {
  done_on: string
  cost: number | null
  provider_name: string | null
  provider_phone: string | null
  note: string | null
  usage_value: number | null
  next_due: string | null
}

export type CompleteFieldErrors = Partial<Record<keyof CompleteFormInput, string>>

export interface CostSummary {
  /** วันแรก/วันสุดท้ายของเดือนปฏิทินถัดไป */
  from: string
  to: string
  total: number
  /** จำนวนรายการที่ครบกำหนดในช่วงนี้ */
  count: number
  /** จำนวนรายการในช่วงนี้ที่ไม่ได้ใส่ค่าใช้จ่าย */
  withoutCost: number
}
