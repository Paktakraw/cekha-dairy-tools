import { useState } from 'react'
import { Plus } from 'lucide-react'
import { IconButton } from '../../../shared/components/ui'
import { formatDateLong, todayISO } from '../../../shared/utils/formatDate'
import { REMIND_DAYS_MAX, REMIND_LEVELS_MAX, REMIND_PRESETS } from '../constants'
import type { ReminderCategory } from '../types/reminder'
import { reminderDate } from '../utils/reminders'
import { normalizeRemindDays } from '../utils/validation'

interface RemindDaysFieldProps {
  category: ReminderCategory
  value: number[]
  /** วันครบกำหนดจากฟอร์ม (YYYY-MM-DD) ใช้คำนวณวันที่เตือนจริง */
  dueDate: string
  error?: string
  onChange: (days: number[]) => void
}

/** เลือกระดับเตือนล่วงหน้า: กดเลือกจากชุดของหมวด และ/หรือพิมพ์จำนวนวันเอง */
export function RemindDaysField({ category, value, dueDate, error, onChange }: RemindDaysFieldProps) {
  const [custom, setCustom] = useState('')
  const [customError, setCustomError] = useState<string>()

  const options = normalizeRemindDays([...REMIND_PRESETS[category], ...value])

  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : normalizeRemindDays([...value, day]))
  }

  const today = todayISO()
  const describe = (days: number): string | null => {
    const date = reminderDate(dueDate, days)
    if (date === null) return null
    return `${formatDateLong(date)}${date < today ? ' (ผ่านมาแล้ว)' : ''}`
  }
  const customDays = /^\d+$/.test(custom.trim()) && Number(custom.trim()) <= REMIND_DAYS_MAX ? Number(custom.trim()) : null
  const customPreview = customDays === null ? null : describe(customDays)

  const addCustom = () => {
    const text = custom.trim()
    if (!/^\d+$/.test(text) || Number(text) > REMIND_DAYS_MAX) {
      setCustomError(`กรอกจำนวนวันเป็นจำนวนเต็ม 0–${REMIND_DAYS_MAX}`)
      return
    }
    if (!value.includes(Number(text)) && value.length >= REMIND_LEVELS_MAX) {
      setCustomError(`ตั้งเตือนได้ไม่เกิน ${REMIND_LEVELS_MAX} ระดับ`)
      return
    }
    setCustomError(undefined)
    onChange(normalizeRemindDays([...value, Number(text)]))
    setCustom('')
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-gray-700">เตือนล่วงหน้า (วัน)</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((day) => {
          const selected = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(day)}
              className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day === 0 ? 'วันครบกำหนด' : `${day.toLocaleString('th-TH')} วัน`}
            </button>
          )
        })}
      </div>
      <div className="flex items-start gap-2">
        <input
          aria-label="จำนวนวันที่ต้องการเตือนเพิ่ม"
          inputMode="numeric"
          placeholder="พิมพ์จำนวนวันเอง"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          className="w-40 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
        />
        <IconButton icon={Plus} label="เพิ่มระดับเตือน" onClick={addCustom} />
      </div>
      {customPreview && <p className="text-xs text-gray-600">เตือนก่อน {customDays} วัน จะตรงกับวันที่ {customPreview}</p>}
      {(customError || error) && <p className="text-xs text-red-700">{customError ?? error}</p>}
      {value.length > 0 &&
        (dueDate === '' ? (
          <p className="text-xs text-gray-500">เลือกวันครบกำหนดเพื่อดูว่าแต่ละระดับเตือนตรงกับวันที่เท่าไร</p>
        ) : (
          <ul className="flex flex-col gap-0.5 rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700" aria-label="วันที่เตือนที่คำนวณได้">
            {value.map((day) => (
              <li key={day}>
                {day === 0 ? 'วันครบกำหนด' : `ก่อน ${day.toLocaleString('th-TH')} วัน`} → {describe(day) ?? '-'}
              </li>
            ))}
          </ul>
        ))}
      {value.length === 0 && <p className="text-xs text-gray-500">ยังไม่ตั้งเตือน (ยังเห็นสีสถานะบนรายการตามปกติ)</p>}
    </fieldset>
  )
}
