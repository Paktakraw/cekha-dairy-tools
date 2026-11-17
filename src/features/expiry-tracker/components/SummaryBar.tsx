import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatMonth } from '../../../shared/utils/formatDate'
import type { CostSummary } from '../types/reminder'

interface SummaryBarProps {
  overdueCount: number
  remindingCount: number
  cost: CostSummary
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function SummaryBar({ overdueCount, remindingCount, cost }: SummaryBarProps) {
  const costSub =
    cost.count === 0
      ? 'ไม่มีรายการครบกำหนด'
      : `${cost.count.toLocaleString('th-TH')} รายการ${cost.withoutCost > 0 ? ` (ไม่ระบุราคา ${cost.withoutCost.toLocaleString('th-TH')})` : ''}`
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
      <Tile label="เลยกำหนดแล้ว" value={`${overdueCount.toLocaleString('th-TH')} รายการ`} />
      <Tile label="ถึงเกณฑ์เตือน" value={`${remindingCount.toLocaleString('th-TH')} รายการ`} />
      <div className="col-span-2 sm:col-span-1">
        <Tile label={`ค่าใช้จ่าย ${formatMonth(cost.from)}`} value={formatCurrency(cost.total)} sub={costSub} />
      </div>
    </div>
  )
}
