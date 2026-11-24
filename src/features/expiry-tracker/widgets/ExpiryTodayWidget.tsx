import { WidgetFrame, WidgetNote, WidgetValue } from '../../../shared/components/dashboard/WidgetFrame'
import { useWidgetData } from '../../../shared/hooks/useWidgetData'
import type { ServiceResult } from '../../../shared/types/result'
import type { TodayWidgetProps } from '../../../shared/types/feature'
import { todayISO } from '../../../shared/utils/formatDate'
import { UrgencyBadge } from '../components/UrgencyBadge'
import { reminderItemService } from '../services/reminderItemService'
import { summarizeExpiryToday, type ExpiryToday } from '../utils/todayOverview'

async function fetchExpiryToday(): Promise<ServiceResult<ExpiryToday>> {
  const result = await reminderItemService.list()
  if (result.error !== null) return result
  return { data: summarizeExpiryToday(result.data, todayISO()), error: null }
}

/** การ์ดภาพรวมวันนี้ของ "อย่าลืมฉัน": เลยกำหนด/ถึงเกณฑ์เตือน และรายการที่ใกล้ครบกำหนดที่สุด */
export default function ExpiryTodayWidget(props: TodayWidgetProps) {
  const { data, loading, error, reload } = useWidgetData(fetchExpiryToday)

  return (
    <WidgetFrame {...props} loading={loading} error={error} onRetry={reload}>
      {data &&
        (data.next === null ? (
          <WidgetValue>ไม่มีรายการใกล้ครบกำหนด</WidgetValue>
        ) : (
          <>
            <WidgetValue>
              เลยกำหนด {data.overdue.toLocaleString('th-TH')} · ถึงเกณฑ์เตือน {data.reminding.toLocaleString('th-TH')}
            </WidgetValue>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={data.next.urgency} label={data.next.label} />
              <span className="min-w-0 break-words text-sm text-gray-700">{data.next.name}</span>
            </div>
            <WidgetNote>รายการที่ใกล้ครบกำหนดที่สุด</WidgetNote>
          </>
        ))}
    </WidgetFrame>
  )
}
