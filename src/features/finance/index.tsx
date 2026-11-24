import { Wallet } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type { FeatureConfig } from '../../shared/types/feature'
import { FinanceLayout, FinanceTodayWidget, TransactionPage, SummaryPage, CategoryPage } from './lazyPages'

export const financeFeature: FeatureConfig = {
  id: 'finance',
  name: 'เงินฉันไปไหน',
  description: 'บันทึกรายรับ รายจ่าย และดูสรุปภาพรวม',
  icon: Wallet,
  path: '/finance',
  todayWidget: FinanceTodayWidget,
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
