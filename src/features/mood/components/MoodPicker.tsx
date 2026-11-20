import { MOODS } from '../constants'
import type { MoodScore } from '../types/mood'

interface MoodPickerProps {
  value: MoodScore | null
  disabled?: boolean
  onPick: (score: MoodScore) => void
}

/** ปุ่มอิโมจิ 5 ระดับ แตะแล้วบันทึกทันที */
export function MoodPicker({ value, disabled, onPick }: MoodPickerProps) {
  return (
    <div role="group" aria-label="เลือกอารมณ์ของวัน" className="grid grid-cols-5 gap-2">
      {MOODS.map((mood) => {
        const selected = value === mood.score
        return (
          <button
            key={mood.score}
            type="button"
            disabled={disabled}
            title={`${mood.label} — ${mood.meaning}`}
            aria-label={mood.label}
            aria-pressed={selected}
            onClick={() => onPick(mood.score)}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${
              selected ? `border-gray-900 ${mood.bgClass}` : 'border-gray-300 bg-white hover:bg-gray-100'
            }`}
          >
            <span className="text-3xl leading-none sm:text-4xl" aria-hidden="true">
              {mood.emoji}
            </span>
            <span className="w-full text-center text-[11px] leading-tight break-words text-gray-700 sm:text-xs">{mood.label}</span>
          </button>
        )
      })}
    </div>
  )
}
