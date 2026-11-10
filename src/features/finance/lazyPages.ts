import { lazy } from 'react'

// โหลดหน้าเมื่อเปิดใช้งานจริง (แบ่ง bundle ตามหน้า)
export const FinanceLayout = lazy(() => import('./pages/FinanceLayout'))
export const TransactionPage = lazy(() => import('./pages/TransactionPage'))
export const SummaryPage = lazy(() => import('./pages/SummaryPage'))
export const CategoryPage = lazy(() => import('./pages/CategoryPage'))
