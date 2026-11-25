import { DAY_COLORS } from '../constants'
import type { TaksaDay } from '../types/luckyColor'

/** ชิปสี + ชื่อสีภาษาไทย (ไม่พึ่งสีอย่างเดียว เพื่อคนตาบอดสี) */
export function LuckyColorChip({ day }: { day: TaksaDay }) {
  const { names, swatches } = DAY_COLORS[day]
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900">
      <span className="flex -space-x-1" aria-hidden="true">
        {swatches.map((color) => (
          <span
            key={color}
            className="h-4 w-4 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      {names.join(' / ')}
    </span>
  )
}
