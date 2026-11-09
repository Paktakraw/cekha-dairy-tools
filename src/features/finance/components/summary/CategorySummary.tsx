import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { TYPE_LABELS } from '../../constants'
import type { CategoryTotal, Summary, TransactionType } from '../../types/finance'

function TypeSection({ type, rows, typeTotal }: { type: TransactionType; rows: CategoryTotal[]; typeTotal: number }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-gray-700">
        {type === 'expense' ? 'รายจ่ายแยกตามหมวดหมู่ (มากไปน้อย)' : 'รายรับแยกตามหมวดหมู่ (มากไปน้อย)'}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">ไม่มี{TYPE_LABELS[type]}ในช่วงที่เลือก</p>
      ) : (
        <ul className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3">
          {rows.map((row) => {
            const percent = typeTotal > 0 ? (row.total / typeTotal) * 100 : 0
            return (
              <li key={row.categoryId}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="min-w-0 break-words text-gray-900">
                    {row.name} <span className="text-xs text-gray-400">({row.count} รายการ)</span>
                  </span>
                  <span className="shrink-0 text-gray-700">
                    {formatCurrency(row.total)} <span className="text-xs text-gray-400">{percent.toFixed(1)}%</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100" role="presentation">
                  <div
                    className={`h-1.5 rounded-full ${type === 'expense' ? 'bg-red-700/70' : 'bg-emerald-700/70'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function CategorySummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <TypeSection
        type="expense"
        rows={summary.byCategory.filter((c) => c.type === 'expense')}
        typeTotal={summary.totalExpense}
      />
      <TypeSection
        type="income"
        rows={summary.byCategory.filter((c) => c.type === 'income')}
        typeTotal={summary.totalIncome}
      />
    </div>
  )
}
