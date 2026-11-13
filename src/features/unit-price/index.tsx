import { Scale } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import { UnitPricePage } from './lazyPages'

export const unitPriceFeature: FeatureConfig = {
  id: 'unit-price',
  name: 'อันไหนถูกกว่า บอกมา',
  description: 'เทียบความคุ้มค่าต่อกรัม มิลลิลิตร หรือชิ้น',
  icon: Scale,
  path: '/unit-price',
  routes: [{ index: true, element: <UnitPricePage /> }],
}
