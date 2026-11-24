import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const ExpiryTrackerPage = lazy(() => import('./pages/ExpiryTrackerPage'))
export const ExpiryTodayWidget = lazy(() => import('./widgets/ExpiryTodayWidget'))
