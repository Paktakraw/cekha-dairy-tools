import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const TodoPage = lazy(() => import('./pages/TodoPage'))
export const TodoTodayWidget = lazy(() => import('./widgets/TodoTodayWidget'))
