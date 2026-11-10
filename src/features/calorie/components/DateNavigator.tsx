import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, IconButton, Input } from '../../../shared/components/ui'
import { addDays } from '../utils/dates'

interface DateNavigatorProps {
  /** YYYY-MM-DD */
  date: string
  today: string
  onChange: (date: string) => void
}

/** เลื่อนวันก่อนหน้า/ถัดไป เลือกวันที่เอง หรือกลับมาวันนี้ (ย้อนหลังได้ทุกวัน ไปข้างหน้าได้ไม่เกินวันนี้) */
export function DateNavigator({ date, today, onChange }: DateNavigatorProps) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <IconButton icon={ChevronLeft} label="วันก่อนหน้า" onClick={() => onChange(addDays(date, -1))} />
      <div className="w-44">
        <Input
          label="วันที่"
          type="date"
          value={date}
          max={today}
          onChange={(e) => {
            if (e.target.value !== '' && e.target.value <= today) onChange(e.target.value)
          }}
        />
      </div>
      <IconButton icon={ChevronRight} label="วันถัดไป" disabled={date >= today} onClick={() => onChange(addDays(date, 1))} />
      <Button variant="secondary" disabled={date === today} onClick={() => onChange(today)}>
        <CalendarDays className="h-4 w-4" />
        วันนี้
      </Button>
    </div>
  )
}
