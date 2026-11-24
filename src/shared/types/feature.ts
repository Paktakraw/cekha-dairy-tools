import type { LucideIcon } from 'lucide-react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { RouteObject } from 'react-router-dom'

/** ข้อมูลของฟีเจอร์ที่หน้า Portal ส่งให้การ์ดภาพรวมวันนี้ (ใช้แสดงหัวการ์ดและลิงก์) */
export interface TodayWidgetProps {
  name: string
  icon: LucideIcon
  /** absolute path ของฟีเจอร์ */
  path: string
}

export interface FeatureConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  /** absolute path เช่น "/todo" */
  path: string
  /** child routes ที่อ้างอิงจาก path ของฟีเจอร์ */
  routes: RouteObject[]
  /** การ์ดสรุป "ภาพรวมวันนี้" บนหน้า Portal (ไม่บังคับ; ฟีเจอร์ที่ไม่มีข้อมูลรายวันไม่ต้องมี) */
  todayWidget?: LazyExoticComponent<ComponentType<TodayWidgetProps>>
}
