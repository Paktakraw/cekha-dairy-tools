import { WidgetFrame, WidgetNote, WidgetValue } from '../../../shared/components/dashboard/WidgetFrame'
import { useWidgetData } from '../../../shared/hooks/useWidgetData'
import type { TodayWidgetProps } from '../../../shared/types/feature'
import type { ServiceResult } from '../../../shared/types/result'
import { DAY_COLORS } from '../constants'
import { luckyColorProfileService } from '../services/luckyColorProfileService'
import type { LuckyColorResult, TaksaDay } from '../types/luckyColor'
import { computeLuckyColors } from '../utils/taksa'

const colorNames = (days: TaksaDay[]) => days.map((day) => DAY_COLORS[day].names.join('/')).join(', ')

interface LuckyToday {
  /** null = ยังไม่ได้เลือกวันเกิด */
  result: LuckyColorResult | null
}

async function fetchLuckyToday(): Promise<ServiceResult<LuckyToday>> {
  const profile = await luckyColorProfileService.get()
  if (profile.error !== null) return profile
  return {
    data: {
      result: profile.data ? computeLuckyColors(profile.data.birth_day, new Date()) : null,
    },
    error: null,
  }
}

/** การ์ดภาพรวมวันนี้ของ "สีที่ใช่": สีปังคูณสอง (หรือสีเสริมการงานถ้าไม่มี) และสีต้องห้าม */
export default function LuckyColorTodayWidget(props: TodayWidgetProps) {
  const { data, loading, error, reload } = useWidgetData(fetchLuckyToday)
  const result = data?.result ?? null
  const hasSuperLucky = result !== null && result.superLucky.length > 0
  const boostColors = result !== null && result.boost.dech.length > 0 ? colorNames(result.boost.dech) : 'ไม่มีสีเด่น'

  return (
    <WidgetFrame {...props} loading={loading} error={error} onRetry={reload}>
      {data && result === null && (
        <>
          <WidgetValue>ยังไม่ได้เลือกวันเกิด</WidgetValue>
          <WidgetNote>แตะเพื่อเลือกวันเกิดแล้วดูสีที่ใช่</WidgetNote>
        </>
      )}
      {result && (
        <>
          <WidgetValue>
            {hasSuperLucky ? colorNames(result.superLucky.map((s) => s.day)) : `เสริมการงาน: ${boostColors}`}
          </WidgetValue>
          <WidgetNote>
            {hasSuperLucky ? 'สีปังคูณสอง' : 'วันนี้ไม่มีสีปังคูณสอง'} · เลี่ยง {colorNames(result.avoid.map((a) => a.day))}
          </WidgetNote>
        </>
      )}
    </WidgetFrame>
  )
}
