import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const CalorieLayout = lazy(() => import('./pages/CalorieLayout'))
export const FoodPage = lazy(() => import('./pages/FoodPage'))
export const SummaryPage = lazy(() => import('./pages/SummaryPage'))
export const FoodListPage = lazy(() => import('./pages/FoodListPage'))
export const BmrPage = lazy(() => import('./pages/BmrPage'))
