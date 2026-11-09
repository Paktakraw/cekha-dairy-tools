import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '../button/IconButton'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav className="flex items-center justify-between gap-2 text-sm text-gray-600" aria-label="แบ่งหน้า">
      <span>
        แสดง {from}–{to} จาก {total} รายการ
      </span>
      <div className="flex items-center gap-1">
        <IconButton icon={ChevronLeft} label="หน้าก่อนหน้า" disabled={page <= 1} onClick={() => onChange(page - 1)} />
        <span className="min-w-16 text-center">
          {page} / {totalPages}
        </span>
        <IconButton icon={ChevronRight} label="หน้าถัดไป" disabled={page >= totalPages} onClick={() => onChange(page + 1)} />
      </div>
    </nav>
  )
}
