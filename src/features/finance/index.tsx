import { Wallet } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type { FeatureConfig } from '../../shared/types/feature'
import CategoryPage from './pages/CategoryPage'
import FinanceLayout from './pages/FinanceLayout'
import SummaryPage from './pages/SummaryPage'
import TransactionPage from './pages/TransactionPage'

export const financeFeature: FeatureConfig = {
  id: 'finance',
  name: 'รายรับ-รายจ่าย',
  description: 'บันทึกรายรับ รายจ่าย และดูสรุปภาพรวม',
  icon: Wallet,
  path: '/finance',
  routes: [
    {
      element: <FinanceLayout />,
      children: [
        { index: true, element: <Navigate to="transactions" replace /> },
        { path: 'transactions', element: <TransactionPage /> },
        { path: 'summary', element: <SummaryPage /> },
        { path: 'categories', element: <CategoryPage /> },
      ],
    },
  ],
}
