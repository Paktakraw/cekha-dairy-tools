import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../shared/components/ui'

export default function NotFoundPage() {
  return (
    <EmptyState
      title="ไม่พบหน้าที่ต้องการ"
      description="ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว"
      action={
        <Link to="/" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-gray-900 underline">
          <Home className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      }
    />
  )
}
