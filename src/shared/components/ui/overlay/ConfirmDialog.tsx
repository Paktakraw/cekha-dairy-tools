import { Trash2, X, type LucideIcon } from 'lucide-react'
import { Button } from '../button/Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmIcon?: LucideIcon
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'ลบ',
  confirmIcon: ConfirmIcon = Trash2,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-gray-700">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4" />
          ยกเลิก
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          <ConfirmIcon className="h-4 w-4" />
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
