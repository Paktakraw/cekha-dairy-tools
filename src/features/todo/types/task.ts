export type TaskStatus = 'pending' | 'in_progress' | 'done'

/** Row จากตาราง tasks (ไม่ select user_id) */
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  /** ตั้งโดย Database trigger เมื่อสถานะเป็น done, เป็น null เมื่อไม่ใช่ */
  completed_at: string | null
  created_at: string
  updated_at: string
}

/** ข้อมูลจาก Form */
export interface TaskInput {
  title: string
  description: string
}

export interface TaskPage {
  tasks: Task[]
  /** จำนวนงานทั้งหมดที่ตรงกับ filter (ไม่ใช่เฉพาะหน้านี้) */
  total: number
}
