import { Select } from '../../../shared/components/ui'
import { DAY_NAMES } from '../constants'
import type { TaksaDay } from '../types/luckyColor'

interface BirthDayPickerProps {
  value: TaksaDay | null
  onChange: (day: TaksaDay) => void
  /** แสดงคำอธิบายพุธกลางวัน/กลางคืน (ใช้ตอนเลือกครั้งแรก) */
  showHelp?: boolean
}

// เรียงตามสัปดาห์ให้ผู้ใช้หาวันเกิดง่าย (ต่างจากลำดับบนวงล้อ)
const PICKER_ORDER: TaksaDay[] = ['sun', 'mon', 'tue', 'wed_day', 'wed_night', 'thu', 'fri', 'sat']

export function BirthDayPicker({ value, onChange, showHelp = false }: BirthDayPickerProps) {
  const days = PICKER_ORDER
  // เลือกวันเกิดแล้ว: แสดงเป็นรายการดรอปดาวน์ เปลี่ยนได้ทันที
  if (value !== null) {
    return (
      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Select label="วันเกิดของคุณ" value={value} onChange={(e) => onChange(e.target.value as TaksaDay)}>
          {days.map((day) => (
            <option key={day} value={day}>
              {DAY_NAMES[day]}
            </option>
          ))}
        </Select>
      </section>
    )
  }
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-sm font-medium text-gray-900">วันเกิดของคุณ</h2>
      <div role="radiogroup" aria-label="วันเกิด" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {days.map((day) => {
          const checked = day === value
          return (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(day)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                checked
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-800 hover:border-gray-500'
              }`}
            >
              {DAY_NAMES[day]}
            </button>
          )
        })}
      </div>
      {showHelp && (
        <p className="text-xs text-gray-500">
          วันพุธแบ่งเป็น 2 แบบ: <strong>พุธกลางวัน</strong> เกิดตั้งแต่ 06:00 ถึง 17:59 น. และ <strong>พุธกลางคืน (ราหู)</strong>{' '}
          เกิดตั้งแต่ 18:00 น. ถึงก่อนรุ่งเช้า 06:00 น. ของวันพฤหัสบดี
        </p>
      )}
    </section>
  )
}
