import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import type { Summary } from '../../types/finance'

function Card({ label, value, tone = 'text-gray-900' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold break-words ${tone}`}>{value}</p>
    </div>
  )
}

/** คำนวณตาม Filter ที่เลือก */
export function SummaryCards({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card label="รายรับรวม" value={formatCurrency(summary.totalIncome)} tone="text-emerald-700" />
      <Card label="รายจ่ายรวม" value={formatCurrency(summary.totalExpense)} tone="text-red-700" />
      <Card label="จำนวนรายการ" value={summary.transactionCount.toLocaleString('th-TH')} />
    </div>
  )
}
