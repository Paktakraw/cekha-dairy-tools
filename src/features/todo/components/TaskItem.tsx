import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { IconButton } from '../../../shared/components/ui'
import { formatDateTime } from '../../../shared/utils/formatDate'
import { STATUS_COLORS, STATUS_ICONS, STATUS_LABELS, STATUS_ORDER } from '../constants'
import type { Task, TaskStatus } from '../types/task'

interface TaskItemProps {
  task: Task
  onStatusChange: (task: Task, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({ task, onStatusChange, onEdit, onDelete }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const done = task.status === 'done'
  const StatusIcon = STATUS_ICONS[task.status]

  return (
    <li className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <p className={`font-medium break-words ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className={`mt-1 text-sm break-words whitespace-pre-wrap text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
            {task.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">สร้างเมื่อ {formatDateTime(task.created_at)}</p>
        {done && task.completed_at && (
          <p className="text-xs text-gray-500">เสร็จเมื่อ {formatDateTime(task.completed_at)}</p>
        )}
      </button>
      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
        <div className="relative">
          <StatusIcon
            className={`pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 ${STATUS_COLORS[task.status].icon}`}
            aria-hidden="true"
          />
          <select
            aria-label={`สถานะของ ${task.title}`}
            title="เปลี่ยนสถานะ"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            className={`rounded-md border py-1.5 pr-2 pl-7 text-sm font-medium focus:outline-2 focus:outline-offset-1 focus:outline-gray-900 ${STATUS_COLORS[task.status].badge}`}
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex">
          <IconButton icon={Pencil} label="แก้ไข" onClick={() => onEdit(task)} />
          <IconButton icon={Trash2} label="ลบ" tone="danger" onClick={() => onDelete(task)} />
        </div>
      </div>
    </li>
  )
}
