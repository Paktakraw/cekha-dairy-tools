import { Palette } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import { LuckyColorPage, LuckyColorTodayWidget } from './lazyPages'

export const luckyColorFeature: FeatureConfig = {
  id: 'lucky-color',
  name: 'สีที่ใช่',
  description: 'สีมงคลของวันนี้ที่เหมาะกับวันเกิดของคุณ ตัดสีกาลกิณีให้อัตโนมัติ',
  icon: Palette,
  path: '/lucky-color',
  todayWidget: LuckyColorTodayWidget,
  routes: [{ index: true, element: <LuckyColorPage /> }],
}
