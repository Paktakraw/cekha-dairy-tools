import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, EmptyState, ErrorState, IconButton, Spinner } from '../../../shared/components/ui'
import { formatDate, formatMonth, todayISO } from '../../../shared/utils/formatDate'
import { CalorieBar } from '../components/CalorieBar'
import { MEAL_LABELS } from '../constants'
import { useBmrProfile } from '../hooks/useBmrProfile'
import { useFoodEntries } from '../hooks/useFoodEntries'
import type { SummaryPeriod } from '../types/calorie'
import { addDays, monthRange, shiftMonth, weekRange } from '../utils/dates'
import { formatKcal } from '../utils/format'
import { summarizeRange } from '../utils/summary'

function Card({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold break-words text-gray-900">{value}</p>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
    </div>
  )
}

export default function SummaryPage() {
  const today = todayISO()
  const [period, setPeriod] = useState<SummaryPeriod>('week')
  /** วันใดก็ได้ในช่วงที่กำลังดู */
  const [anchor, setAnchor] = useState(today)
  const profile = useBmrProfile()

  const range = period === 'week' ? weekRange(anchor) : monthRange(anchor)
  const log = useFoodEntries(range.from, range.to)
  const summary = useMemo(
    () => summarizeRange(log.entries, range.from, range.to, today),
    [log.entries, range.from, range.to, today],
  )

  const target = profile.profile?.tdee ?? null
  const isCurrentPeriod = range.to >= today
  const label = period === 'week' ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatMonth(range.from)

  const shift = (direction: -1 | 1) =>
    setAnchor(period === 'week' ? addDays(range.from, direction * 7) : shiftMonth(range.from, direction))

  const mealTotal = summary.byMeal.reduce((sum, m) => sum + m.total, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="ช่วงเวลาสรุป">
          <Button
            variant={period === 'week' ? 'primary' : 'secondary'}
            aria-pressed={period === 'week'}
            onClick={() => setPeriod('week')}
          >
            <CalendarRange className="h-4 w-4" />
            รายสัปดาห์
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'secondary'}
            aria-pressed={period === 'month'}
            onClick={() => setPeriod('month')}
          >
            <CalendarDays className="h-4 w-4" />
            รายเดือน
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <IconButton icon={ChevronLeft} label={period === 'week' ? 'สัปดาห์ก่อนหน้า' : 'เดือนก่อนหน้า'} onClick={() => shift(-1)} />
          <span className="min-w-40 text-center text-sm font-medium text-gray-900">{label}</span>
          <IconButton
            icon={ChevronRight}
            label={period === 'week' ? 'สัปดาห์ถัดไป' : 'เดือนถัดไป'}
            disabled={isCurrentPeriod}
            onClick={() => shift(1)}
          />
        </div>
      </div>

      {log.firstLoad && <Spinner />}

      {!log.firstLoad && log.error && (
        <ErrorState title="โหลดข้อมูลสรุปไม่สำเร็จ" description={log.error} onRetry={log.reload} />
      )}

      {!log.firstLoad && !log.error && summary.loggedDays === 0 && (
        <EmptyState
          title={period === 'week' ? 'ไม่มีบันทึกอาหารในสัปดาห์นี้' : 'ไม่มีบันทึกอาหารในเดือนนี้'}
          description="ไปที่ “บันทึกอาหาร” เพื่อเพิ่มรายการ หรือเลื่อนไปดูช่วงอื่น"
        />
      )}

      {!log.firstLoad && !log.error && summary.loggedDays > 0 && (
        <div className={`flex flex-col gap-6 ${log.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card label="แคลอรี่รวม" value={formatKcal(summary.total)} />
            <Card
              label="เฉลี่ยต่อวัน"
              value={summary.averagePerLoggedDay === null ? '-' : formatKcal(summary.averagePerLoggedDay)}
              note="เฉพาะวันที่มีบันทึก"
            />
            <Card label="วันที่บันทึก" value={`${summary.loggedDays} จาก ${summary.days.length} วัน`} />
            <Card
              label="เป้าหมาย (TDEE)"
              value={target === null ? 'ยังไม่ได้คำนวณ' : formatKcal(target)}
              note={
                target !== null && summary.averagePerLoggedDay !== null
                  ? summary.averagePerLoggedDay <= target
                    ? `เฉลี่ยต่ำกว่า ${formatKcal(target - summary.averagePerLoggedDay)}`
                    : `เฉลี่ยเกิน ${formatKcal(summary.averagePerLoggedDay - target)}`
                  : undefined
              }
            />
          </div>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">รายวัน</h2>
            <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
              {summary.days.map((day) => (
                <li key={day.date} className="flex flex-col gap-1 px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-gray-700">{formatDate(day.date)}</span>
                    <span className={day.total === 0 ? 'text-gray-400' : 'font-medium text-gray-900'}>
                      {day.total === 0 ? 'ไม่มีบันทึก' : formatKcal(day.total)}
                    </span>
                  </div>
                  {day.total > 0 && (
                    <CalorieBar total={day.total} target={target} label={`แคลอรี่ของ ${formatDate(day.date)} เทียบกับเป้าหมาย`} />
                  )}
                </li>
              ))}
            </ul>
            {target === null && (
              <p className="mt-2 text-xs text-gray-500">คำนวณ BMR/TDEE ที่หน้า “BMR / TDEE” เพื่อดูแถบเทียบกับเป้าหมาย</p>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">แยกตามมื้อ</h2>
            <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
              {summary.byMeal.map(({ meal, total }) => (
                <li key={meal} className="flex items-baseline justify-between gap-2 px-3 py-2 text-sm">
                  <span className="text-gray-700">{MEAL_LABELS[meal]}</span>
                  <span className="text-gray-900">
                    {formatKcal(total)}
                    {mealTotal > 0 && <span className="ml-2 text-xs text-gray-500">({Math.round((total / mealTotal) * 100)}%)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
