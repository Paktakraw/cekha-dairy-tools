import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'

export interface FeatureConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  /** absolute path เช่น "/todo" */
  path: string
  /** child routes ที่อ้างอิงจาก path ของฟีเจอร์ */
  routes: RouteObject[]
}
