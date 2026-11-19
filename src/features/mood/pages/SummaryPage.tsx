import { useState } from 'react'
import { EmptyState, ErrorState, Spinner } from '../../../shared/components/ui'
import { todayISO } from '../../../shared/utils/formatDate'
import { MonthNav } from '../components/MonthNav'
import { MonthSummaryCard } from '../components/MonthSummaryCard'
import { useMoodEntries } from '../hooks/useMoodEntries'
import { monthKeyOf, monthRange } from '../utils/calendar'

export default function SummaryPage() {
  const currentMonth = monthKeyOf(todayISO())
  const [month, setMonth] = useState(currentMonth)
  const { from, to } = monthRange(month)
  const { entries, loading, firstLoad, error, reload } = useMoodEntries(from, to)

  return (
    <div className="flex flex-col gap-4">
      <MonthNav month={month} currentMonth={currentMonth} onChange={setMonth} />
      {firstLoad && loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState title="โหลดสรุปไม่สำเร็จ" description={error} onRetry={reload} />
      ) : entries.length === 0 ? (
        <EmptyState title="เดือนนี้ยังไม่มีการเช็กอิน" description="ไปที่แท็บ “วันนี้” แล้วแตะอิโมจิเพื่อเริ่มเช็กอิน" />
      ) : (
        <MonthSummaryCard month={month} entries={entries} />
      )}
    </div>
  )
}
