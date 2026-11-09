import { Shuffle } from 'lucide-react'
import type { FeatureConfig } from '../../shared/types/feature'
import RandomizerPage from './pages/RandomizerPage'

export const randomizerFeature: FeatureConfig = {
  id: 'randomizer',
  name: 'Randomizer',
  description: 'สุ่มรายการจากหลายกลุ่มโดยไม่ซ้ำ',
  icon: Shuffle,
  path: '/randomizer',
  routes: [{ index: true, element: <RandomizerPage /> }],
}
