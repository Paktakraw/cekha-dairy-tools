import { CalendarClock } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import { ExpiryTodayWidget, ExpiryTrackerPage } from './lazyPages'

export const expiryTrackerFeature: FeatureConfig = {
  id: 'expiry-tracker',
  name: 'อย่าลืมฉัน',
  description: 'เตือนเอกสารใกล้หมดอายุ งานซ่อมบำรุง และค่าสมาชิก พร้อมประวัติและสรุปค่าใช้จ่าย',
  icon: CalendarClock,
  path: '/expiry-tracker',
  routes: [{ index: true, element: <ExpiryTrackerPage /> }],
  todayWidget: ExpiryTodayWidget,
}
