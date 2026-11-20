import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const MoodLayout = lazy(() => import('./pages/MoodLayout'))
export const TodayPage = lazy(() => import('./pages/TodayPage'))
export const CalendarPage = lazy(() => import('./pages/CalendarPage'))
export const SettingsPage = lazy(() => import('./pages/SettingsPage'))
export const SummaryPage = lazy(() => import('./pages/SummaryPage'))
