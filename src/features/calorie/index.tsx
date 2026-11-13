import { Flame } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type { FeatureConfig } from '../../shared/types/feature'
import { BmrPage, CalorieLayout, FoodListPage, FoodPage, SummaryPage } from './lazyPages'

export const calorieFeature: FeatureConfig = {
  id: 'calorie',
  name: 'ผอมไปด้วยกัน',
  description: 'คำนวณ BMR/TDEE และบันทึกแคลอรี่จากอาหารที่กิน',
  icon: Flame,
  path: '/calorie',
  routes: [
    {
      element: <CalorieLayout />,
      children: [
        { index: true, element: <Navigate to="food" replace /> },
        { path: 'food', element: <FoodPage /> },
        { path: 'summary', element: <SummaryPage /> },
        { path: 'foods', element: <FoodListPage /> },
        { path: 'bmr', element: <BmrPage /> },
      ],
    },
  ],
}
