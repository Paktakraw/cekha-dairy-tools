import { WEEKDAY_LABELS, moodMeta } from '../constants'
import type { MoodEntry } from '../types/mood'
import { buildMonthGrid } from '../utils/calendar'

interface MoodCalendarProps {
  month: string
  entries: MoodEntry[]
  today: string
  onPickDate: (date: string) => void
}

/** ปฏิทินอิโมจิรายเดือน (เริ่มวันอาทิตย์) กดวันที่ผ่านมาแล้วเพื่อดู/แก้ไข */
export function MoodCalendar({ month, entries, today, onPickDate }: MoodCalendarProps) {
  const byDate = new Map(entries.map((e) => [e.entry_date, e]))
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {buildMonthGrid(month).map((date, i) => {
          if (date === null) return <div key={`blank-${i}`} />
          const entry = byDate.get(date)
          const meta = entry ? moodMeta(entry.mood) : null
          const day = Number(date.slice(8))
          const future = date > today
          return (
            <button
              key={date}
              type="button"
              disabled={future}
              onClick={() => onPickDate(date)}
              aria-label={meta ? `วันที่ ${day} ${meta.label}` : `วันที่ ${day} ยังไม่ได้เช็กอิน`}
              className={`flex aspect-square min-w-0 flex-col items-center justify-center rounded-md border text-xs transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-40 ${
                meta ? `${meta.bgClass} border-transparent` : 'border-gray-200 bg-white hover:bg-gray-100'
              } ${date === today ? 'ring-2 ring-gray-900' : ''}`}
            >
              <span className="text-[10px] leading-none text-gray-600">{day}</span>
              <span className="text-lg leading-tight sm:text-2xl" aria-hidden="true">
                {meta?.emoji ?? ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
