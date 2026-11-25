import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const LuckyColorPage = lazy(() => import('./pages/LuckyColorPage'))
export const LuckyColorTodayWidget = lazy(() => import('./widgets/LuckyColorTodayWidget'))
