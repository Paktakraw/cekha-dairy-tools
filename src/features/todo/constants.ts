import { Circle, CircleCheck, Clock, type LucideIcon } from 'lucide-react'
import type { TaskStatus } from './types/task'

// ต้องตรงกับ CHECK constraint ใน supabase/migrations/*_todo_status_unique_limits.sql
export const TITLE_MAX_LENGTH = 100
export const DESCRIPTION_MAX_LENGTH = 1000

export const PAGE_SIZE = 10

export const DUPLICATE_TITLE_MESSAGE = 'มีงานชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น'

export const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'done']

/** สีของสถานะ: รอดำเนินการ=แดง, กำลังทำ=เหลือง, เสร็จแล้ว=เขียว (เขียนเป็น string เต็มเพื่อให้ Tailwind ตรวจเจอ) */
export const STATUS_COLORS: Record<TaskStatus, { badge: string; icon: string }> = {
  pending: { badge: 'border-red-300 bg-red-50 text-red-800', icon: 'text-red-600' },
  in_progress: { badge: 'border-amber-300 bg-amber-50 text-amber-800', icon: 'text-amber-600' },
  done: { badge: 'border-emerald-300 bg-emerald-50 text-emerald-800', icon: 'text-emerald-600' },
}

export const STATUS_ICONS: Record<TaskStatus, LucideIcon> = {
  pending: Circle,
  in_progress: Clock,
  done: CircleCheck,
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังทำ',
  done: 'เสร็จแล้ว',
}
