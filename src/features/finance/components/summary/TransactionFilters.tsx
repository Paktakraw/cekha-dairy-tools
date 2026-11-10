import { Filter, RotateCcw } from 'lucide-react'
import { Button, CollapsibleSection, Input, Select } from '../../../../shared/components/ui'
import { TYPE_LABELS } from '../../constants'
import type { Category, TransactionFilters as Filters } from '../../types/finance'

interface TransactionFiltersProps {
  filters: Filters
  searchInput: string
  categories: Category[]
  invalidRange: boolean
  isFiltered: boolean
  onChange: (patch: Partial<Omit<Filters, 'search'>>) => void
  onSearchChange: (value: string) => void
  onReset: () => void
}

export function TransactionFilters({
  filters,
  searchInput,
  categories,
  invalidRange,
  isFiltered,
  onChange,
  onSearchChange,
  onReset,
}: TransactionFiltersProps) {
  const categoryOptions = filters.type ? categories.filter((c) => c.type === filters.type) : categories
  const rangeDisabled = filters.month !== ''

  return (
    <CollapsibleSection
      title="ตัวกรอง"
      icon={Filter}
      hint={isFiltered ? 'กำลังกรองอยู่' : undefined}
      defaultOpen={false}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="เดือน/ปี" type="month" value={filters.month} onChange={(e) => onChange({ month: e.target.value })} />
        <Input
          label="ตั้งแต่วันที่"
          type="date"
          value={filters.dateFrom}
          disabled={rangeDisabled}
          max={filters.dateTo || undefined}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
        />
        <Input
          label="ถึงวันที่"
          type="date"
          value={filters.dateTo}
          disabled={rangeDisabled}
          min={filters.dateFrom || undefined}
          error={invalidRange ? 'วันที่เริ่มต้องไม่เกินวันที่สิ้นสุด' : undefined}
          onChange={(e) => onChange({ dateTo: e.target.value })}
        />
        <Select
          label="ประเภท"
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value as Filters['type'], categoryId: '' })}
        >
          <option value="">ทั้งหมด</option>
          <option value="income">{TYPE_LABELS.income}</option>
          <option value="expense">{TYPE_LABELS.expense}</option>
        </Select>
        <Select label="หมวดหมู่" value={filters.categoryId} onChange={(e) => onChange({ categoryId: e.target.value })}>
          <option value="">ทั้งหมด</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {filters.type ? c.name : `${c.name} (${TYPE_LABELS[c.type]})`}
            </option>
          ))}
        </Select>
        <Input
          label="ค้นหาจากรายละเอียด"
          type="search"
          value={searchInput}
          placeholder="พิมพ์คำที่ต้องการค้นหา"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="secondary" onClick={onReset} disabled={!isFiltered}>
          <RotateCcw className="h-4 w-4" />
          ล้างตัวกรอง
        </Button>
      </div>
    </CollapsibleSection>
  )
}
