import { ListChecks } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import { TodoPage } from './lazyPages'


export const todoFeature: FeatureConfig = {
  id: 'todo',
  name: 'วันนี้ทำอะไรดี',
  description: 'จัดการรายการงานที่ต้องทำ',
  icon: ListChecks,
  path: '/todo',
  routes: [{ index: true, element: <TodoPage /> }],
}
