import { List, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { TYPE_LABELS } from '../../constants'
import type { TransactionFilters } from '../../types/finance'

type TypeValue = TransactionFilters['type']

interface TransactionTypeFilterProps {
  value: TypeValue
  onChange: (value: TypeValue) => void
}

const OPTIONS: { value: TypeValue; label: string; icon: LucideIcon }[] = [
  { value: '', label: 'ทั้งหมด', icon: List },
  { value: 'income', label: TYPE_LABELS.income, icon: TrendingUp },
  { value: 'expense', label: TYPE_LABELS.expense, icon: TrendingDown },
]

/** Toggle กรองตามประเภท (ทั้งหมด / รายรับ / รายจ่าย) */
export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="กรองตามประเภท">
      {OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
              active
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <option.icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
