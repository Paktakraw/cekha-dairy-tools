import { Smile } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type { FeatureConfig } from '../../shared/types/feature'
import { CalendarPage, MoodLayout, SettingsPage, SummaryPage, TodayPage } from './lazyPages'

export const moodFeature: FeatureConfig = {
  id: 'mood',
  name: 'ตัวฉันวันนี้',
  description: 'เช็กอารมณ์ประจำวันด้วยอิโมจิ ดูปฏิทินและสรุปรายเดือน',
  icon: Smile,
  path: '/mood',
  routes: [
    {
      element: <MoodLayout />,
      children: [
        { index: true, element: <Navigate to="today" replace /> },
        { path: 'today', element: <TodayPage /> },
        { path: 'calendar', element: <CalendarPage /> },
        { path: 'summary', element: <SummaryPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
}
