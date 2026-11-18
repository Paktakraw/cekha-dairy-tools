import { Footprints, Gem, GraduationCap, Shirt } from 'lucide-react'
import type { ComponentType } from 'react'
import { PantsIcon } from './PantsIcon'
import type { ConverterCategory } from '../types/size'

type IconComponent = ComponentType<{ className?: string }>

export const CATEGORY_ICONS: Record<ConverterCategory, IconComponent> = {
  shoes: Footprints,
  tops: Shirt,
  bottoms: PantsIcon,
  ring: Gem,
  hat: GraduationCap,
}
