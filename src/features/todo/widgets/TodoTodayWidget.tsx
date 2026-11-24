import { useCallback } from 'react'
import { WidgetFrame, WidgetNote, WidgetValue } from '../../../shared/components/dashboard/WidgetFrame'
import { useWidgetData } from '../../../shared/hooks/useWidgetData'
import type { TodayWidgetProps } from '../../../shared/types/feature'
import { taskService } from '../services/taskService'
import { localDayBounds } from '../utils/today'

/** การ์ดภาพรวมวันนี้ของ "วันนี้ทำอะไรดี": งานค้าง และงานที่เสร็จวันนี้ */
export default function TodoTodayWidget(props: TodayWidgetProps) {
  const fetcher = useCallback(() => taskService.countToday(localDayBounds(new Date())), [])
  const { data, loading, error, reload } = useWidgetData(fetcher)

  return (
    <WidgetFrame {...props} loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <WidgetValue>{data.open === 0 ? 'ยังไม่มีงานค้าง' : `งานค้าง ${data.open.toLocaleString('th-TH')} งาน`}</WidgetValue>
          <WidgetNote>เสร็จวันนี้ {data.doneToday.toLocaleString('th-TH')} งาน</WidgetNote>
        </>
      )}
    </WidgetFrame>
  )
}
