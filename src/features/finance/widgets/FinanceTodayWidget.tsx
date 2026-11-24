import { WidgetFrame, WidgetNote, WidgetValue } from '../../../shared/components/dashboard/WidgetFrame'
import { useWidgetData } from '../../../shared/hooks/useWidgetData'
import type { TodayWidgetProps } from '../../../shared/types/feature'
import type { ServiceResult } from '../../../shared/types/result'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { todayISO } from '../../../shared/utils/formatDate'
import { TRANSACTIONS_PATH } from '../constants'
import { transactionService } from '../services/transactionService'
import { EMPTY_FILTERS } from '../types/finance'
import { monthStartOf, summarizeFinanceToday, type FinanceToday } from '../utils/todayOverview'

async function fetchFinanceToday(): Promise<ServiceResult<FinanceToday>> {
  const today = todayISO()
  const result = await transactionService.list({ ...EMPTY_FILTERS, dateFrom: monthStartOf(today), dateTo: today })
  if (result.error !== null) return result
  return { data: summarizeFinanceToday(result.data, today), error: null }
}

/** การ์ดภาพรวมวันนี้ของ "เงินฉันไปไหน": รายจ่ายวันนี้และเดือนนี้ (แสดงรายรับวันนี้เมื่อมี) ไม่แสดงคำอธิบายรายการ */
export default function FinanceTodayWidget(props: TodayWidgetProps) {
  const { data, loading, error, reload } = useWidgetData(fetchFinanceToday)

  return (
    <WidgetFrame {...props} to={TRANSACTIONS_PATH} loading={loading} error={error} onRetry={reload}>
      {data && (
        <>
          <WidgetValue>
            {data.todayCount === 0 ? 'วันนี้ยังไม่ได้จดรายการ' : `รายจ่ายวันนี้ ${formatCurrency(data.todayExpense)}`}
          </WidgetValue>
          {data.todayIncome > 0 && <WidgetNote>รายรับวันนี้ {formatCurrency(data.todayIncome)}</WidgetNote>}
          <WidgetNote>รายจ่ายเดือนนี้ {formatCurrency(data.monthExpense)}</WidgetNote>
        </>
      )}
    </WidgetFrame>
  )
}
