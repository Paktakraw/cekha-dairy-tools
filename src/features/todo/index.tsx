import { ListChecks } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import TodoPage from './pages/TodoPage'

export const todoFeature: FeatureConfig = {
  id: 'todo',
  name: 'To-do List',
  description: 'จัดการรายการงานที่ต้องทำ',
  icon: ListChecks,
  path: '/todo',
  routes: [{ index: true, element: <TodoPage /> }],
}
