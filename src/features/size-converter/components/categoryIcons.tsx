import { Footprints, Gem, GraduationCap, Shirt } from 'lucide-react'
import type { ComponentType } from 'react'
import type { ConverterCategory } from '../types/size'

type IconComponent = ComponentType<{ className?: string }>

/** Lucide ไม่มีไอคอนกางเกง จึงวาดเองด้วยสไตล์เส้นเดียวกัน */
function PantsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12l1.5 18h-5.2L12 11.5 9.7 21H4.5L6 3Z" />
      <path d="M6.3 7h11.4" />
    </svg>
  )
}

export const CATEGORY_ICONS: Record<ConverterCategory, IconComponent> = {
  shoes: Footprints,
  tops: Shirt,
  bottoms: PantsIcon,
  ring: Gem,
  hat: GraduationCap,
}
