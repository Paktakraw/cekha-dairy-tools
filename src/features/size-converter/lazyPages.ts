import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const SizeConverterLayout = lazy(() => import('./pages/SizeConverterLayout'))
export const ConverterPage = lazy(() => import('./pages/ConverterPage'))
export const ProfilesPage = lazy(() => import('./pages/ProfilesPage'))
export const NotesPage = lazy(() => import('./pages/NotesPage'))
