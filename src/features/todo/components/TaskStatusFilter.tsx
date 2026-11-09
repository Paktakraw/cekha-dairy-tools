import { X } from 'lucide-react'
import { STATUS_COLORS, STATUS_ICONS, STATUS_LABELS, STATUS_ORDER } from '../constants'
import type { TaskStatus } from '../types/task'

interface TaskStatusFilterProps {
  selected: TaskStatus[]
  onToggle: (status: TaskStatus) => void
  onClear: () => void
}

/** Toggle แยกตามสถานะ เลือกได้หลายค่า ถ้าไม่เลือกเลย = แสดงทุกสถานะ */
export function TaskStatusFilter({ selected, onToggle, onClear }: TaskStatusFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="กรองตามสถานะ">
      {STATUS_ORDER.map((status) => {
        const active = selected.includes(status)
        const Icon = STATUS_ICONS[status]
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(status)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
              active
                ? `${STATUS_COLORS[status].badge} font-medium ring-1 ring-current`
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className={`h-4 w-4 ${STATUS_COLORS[status].icon}`} aria-hidden="true" />
            {STATUS_LABELS[status]}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <X className="h-3.5 w-3.5" />
          ล้างตัวกรอง
        </button>
      )}
    </div>
  )
}
