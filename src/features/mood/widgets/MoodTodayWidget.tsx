import { WidgetFrame, WidgetNote, WidgetValue } from '../../../shared/components/dashboard/WidgetFrame'
import { useWidgetData } from '../../../shared/hooks/useWidgetData'
import type { TodayWidgetProps } from '../../../shared/types/feature'
import type { ServiceResult } from '../../../shared/types/result'
import { todayISO } from '../../../shared/utils/formatDate'
import { moodMeta, TODAY_PATH } from '../constants'
import { moodService } from '../services/moodService'
import type { MoodEntry } from '../types/mood'

async function fetchMoodToday(): Promise<ServiceResult<MoodEntry | null>> {
  const today = todayISO()
  const result = await moodService.listRange(today, today)
  if (result.error !== null) return result
  return { data: result.data[0] ?? null, error: null }
}

/** การ์ดภาพรวมวันนี้ของ "ตัวฉันวันนี้": แสดงเฉพาะอิโมจิและชื่ออารมณ์ ไม่แสดงแท็ก/ข้อความ และไม่มีข้อความปลอบใจ */
export default function MoodTodayWidget(props: TodayWidgetProps) {
  const { data, loading, error, reload } = useWidgetData(fetchMoodToday)
  const meta = data ? moodMeta(data.mood) : null

  return (
    <WidgetFrame {...props} to={TODAY_PATH} loading={loading} error={error} onRetry={reload}>
      {meta ? (
        <>
          <WidgetValue>
            <span aria-hidden="true">{meta.emoji}</span> {meta.label}
          </WidgetValue>
          <WidgetNote>เช็กอินวันนี้แล้ว</WidgetNote>
        </>
      ) : (
        <>
          <WidgetValue>วันนี้ยังไม่ได้เช็กอิน</WidgetValue>
          <WidgetNote>แตะเพื่อเลือกอารมณ์ของวันนี้</WidgetNote>
        </>
      )}
    </WidgetFrame>
  )
}
