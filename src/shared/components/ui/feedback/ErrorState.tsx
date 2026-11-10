import { RefreshCw } from 'lucide-react'
import { Button } from '../button/Button'
import { EmptyState } from './EmptyState'

interface ErrorStateProps {
  title: string
  description?: string
  onRetry: () => void
}

/** สถานะ Error มาตรฐาน: ข้อความ + ปุ่มลองใหม่ */
export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          ลองใหม่
        </Button>
      }
    />
  )
}
