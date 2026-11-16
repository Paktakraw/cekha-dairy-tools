import { Phone } from 'lucide-react'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { EmptyState, ErrorState, Spinner } from '../../../shared/components/ui'
import { useReminderLogs } from '../hooks/useReminderLogs'
import type { ReminderItem } from '../types/reminder'

/** ประวัติการทำของรายการ (โหลดเมื่อเปิด) */
export function HistoryList({ item }: { item: ReminderItem }) {
  const { logs, loading, error, reload } = useReminderLogs(item.id)

  if (loading) return <Spinner />
  if (error) return <ErrorState title="โหลดประวัติไม่สำเร็จ" description={error} onRetry={reload} />
  if (logs.length === 0) return <EmptyState title="ยังไม่มีประวัติ" description="เมื่อกด “ทำแล้ว” ระบบจะบันทึกประวัติไว้ที่นี่" />

  return (
    <ul className="flex flex-col gap-2">
      {logs.map((log) => (
        <li key={log.id} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-900">{formatDate(log.done_on)}</p>
          <p className="text-gray-700">
            {log.cost !== null ? formatCurrency(log.cost) : 'ไม่ระบุค่าใช้จ่าย'}
            {log.usage_value !== null && item.usage_unit !== null && (
              <span className="text-gray-500">
                {' '}
                · {log.usage_value.toLocaleString('th-TH')} {item.usage_unit}
              </span>
            )}
          </p>
          {(log.provider_name || log.provider_phone) && (
            <p className="flex flex-wrap items-center gap-x-2 text-gray-600">
              {log.provider_name}
              {log.provider_phone && (
                <a href={`tel:${log.provider_phone}`} className="inline-flex items-center gap-1 underline">
                  <Phone className="h-3.5 w-3.5" />
                  {log.provider_phone}
                </a>
              )}
            </p>
          )}
          {log.note && <p className="mt-1 whitespace-pre-line break-words text-gray-500">{log.note}</p>}
        </li>
      ))}
    </ul>
  )
}
