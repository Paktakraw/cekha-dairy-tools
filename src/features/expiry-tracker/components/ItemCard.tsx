import { Check, History, Pencil, Phone, Trash2 } from 'lucide-react'
import { IconButton } from '../../../shared/components/ui'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CATEGORY_LABELS, REPEAT_UNIT_LABELS } from '../constants'
import type { ReminderItem } from '../types/reminder'
import { reminderStage } from '../utils/reminders'
import { daysLeft, daysLeftLabel, getUrgency } from '../utils/urgency'
import { isUsageReached, usageRemaining } from '../utils/usage'
import { UrgencyBadge } from './UrgencyBadge'

interface ItemCardProps {
  item: ReminderItem
  today: string
  onComplete: (item: ReminderItem) => void
  onHistory: (item: ReminderItem) => void
  onEdit: (item: ReminderItem) => void
  onDelete: (item: ReminderItem) => void
}

export function ItemCard({ item, today, onComplete, onHistory, onEdit, onDelete }: ItemCardProps) {
  const archived = item.archived_at !== null
  const days = daysLeft(item.due_date, today)
  const usageReached = isUsageReached(item)
  const remaining = usageRemaining(item)
  const stage = archived ? null : reminderStage(days, item.remind_before_days)
  const fmt = (n: number) => n.toLocaleString('th-TH')

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.category]}</p>
        </div>
        <div className="flex shrink-0 items-center">
          {!archived && <IconButton icon={Check} label="ทำแล้ว" onClick={() => onComplete(item)} />}
          <IconButton icon={History} label="ประวัติ" onClick={() => onHistory(item)} />
          {!archived && <IconButton icon={Pencil} label="แก้ไข" onClick={() => onEdit(item)} />}
          <IconButton icon={Trash2} label="ลบ" tone="danger" onClick={() => onDelete(item)} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
        {archived ? (
          <span className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600">เก็บถาวร</span>
        ) : (
          <UrgencyBadge urgency={getUrgency(days, usageReached)} label={usageReached ? 'ถึงระยะแล้ว' : daysLeftLabel(days)} />
        )}
        <span>{archived ? `ครบกำหนดล่าสุด ${formatDate(item.due_date)}` : `ครบกำหนด ${formatDate(item.due_date)}`}</span>
        {item.repeat_every !== null && item.repeat_unit !== null && (
          <span className="text-gray-500">
            ทุก {fmt(item.repeat_every)} {REPEAT_UNIT_LABELS[item.repeat_unit]}
          </span>
        )}
        {item.cost !== null && <span className="text-gray-500">{formatCurrency(item.cost)}</span>}
      </div>

      {remaining !== null && item.usage_unit !== null && !archived && (
        <p className="mt-1 text-sm text-gray-700">
          {remaining > 0 ? `อีก ${fmt(remaining)} ${item.usage_unit} ถึงรอบ` : `เกินระยะ ${fmt(Math.abs(remaining))} ${item.usage_unit}`}
          <span className="text-gray-500">
            {' '}
            (ตอนนี้ {fmt(item.usage_current ?? 0)} {item.usage_unit})
          </span>
        </p>
      )}

      {stage !== null && <p className="mt-1 text-xs text-gray-600">ถึงเกณฑ์เตือนแล้ว (ตั้งเตือนล่วงหน้า {fmt(stage)} วัน)</p>}

      {(item.provider_name || item.provider_phone) && (
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
          {item.provider_name}
          {item.provider_phone && (
            <a href={`tel:${item.provider_phone}`} className="inline-flex items-center gap-1 underline">
              <Phone className="h-3.5 w-3.5" />
              {item.provider_phone}
            </a>
          )}
        </p>
      )}
      {item.note && <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-500">{item.note}</p>}
    </li>
  )
}
