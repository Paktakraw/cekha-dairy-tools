import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const RandomizerPage = lazy(() => import('./pages/RandomizerPage'))
