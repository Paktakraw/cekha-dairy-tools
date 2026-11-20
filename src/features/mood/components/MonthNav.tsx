import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '../../../shared/components/ui'
import { formatMonth } from '../../../shared/utils/formatDate'
import { shiftMonth } from '../utils/calendar'

interface MonthNavProps {
  month: string
  /** เดือนปัจจุบัน (ห้ามเลื่อนไปเกินนี้) */
  currentMonth: string
  onChange: (month: string) => void
}

export function MonthNav({ month, currentMonth, onChange }: MonthNavProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <IconButton icon={ChevronLeft} label="เดือนก่อนหน้า" onClick={() => onChange(shiftMonth(month, -1))} />
      <h2 className="text-base font-medium text-gray-900">{formatMonth(`${month}-01`)}</h2>
      <IconButton icon={ChevronRight} label="เดือนถัดไป" disabled={month >= currentMonth} onClick={() => onChange(shiftMonth(month, 1))} />
    </div>
  )
}
