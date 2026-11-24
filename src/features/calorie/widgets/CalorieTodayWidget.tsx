import { WidgetFrame, WidgetNote, WidgetValue } from '../../../shared/components/dashboard/WidgetFrame'
import { useWidgetData } from '../../../shared/hooks/useWidgetData'
import type { TodayWidgetProps } from '../../../shared/types/feature'
import type { ServiceResult } from '../../../shared/types/result'
import { todayISO } from '../../../shared/utils/formatDate'
import { BMR_PATH, FOOD_PATH } from '../constants'
import { entryService } from '../services/entryService'
import { profileService } from '../services/profileService'
import { formatKcal } from '../utils/format'
import { summarizeCalorieToday, type CalorieToday } from '../utils/todayOverview'

async function fetchCalorieToday(): Promise<ServiceResult<CalorieToday>> {
  const today = todayISO()
  const [entries, profile] = await Promise.all([entryService.listByRange(today, today), profileService.get()])
  if (entries.error !== null) return entries
  if (profile.error !== null) return profile
  return { data: summarizeCalorieToday(entries.data, profile.data?.tdee ?? null), error: null }
}

/** การ์ดภาพรวมวันนี้ของ "ผอมไปด้วยกัน": แคลอรี่ที่กินวันนี้เทียบกับ TDEE */
export default function CalorieTodayWidget(props: TodayWidgetProps) {
  const { data, loading, error, reload } = useWidgetData(fetchCalorieToday)
  // ยังไม่เคยคำนวณ TDEE และยังไม่มีบันทึก: กดการ์ดแล้วไปหน้าคำนวณ (ข้อความในการ์ดบอกให้กดก็ต่อเมื่อลิงก์ไปที่นั่นจริง)
  const goToBmr = data !== null && data.tdee === null && data.entryCount === 0

  return (
    <WidgetFrame {...props} to={goToBmr ? BMR_PATH : FOOD_PATH} loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <WidgetValue>{data.entryCount === 0 ? 'วันนี้ยังไม่ได้จดอาหาร' : `กินไปแล้ว ${formatKcal(data.total)}`}</WidgetValue>
          <WidgetNote>
            {data.tdee === null
              ? `ยังไม่ได้คำนวณ BMR/TDEE${goToBmr ? ' กดเพื่อไปคำนวณ' : ''}`
              : `เป้าหมาย TDEE ${formatKcal(data.tdee)}`}
          </WidgetNote>
        </>
      )}
    </WidgetFrame>
  )
}
