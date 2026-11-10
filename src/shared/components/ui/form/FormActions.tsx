import { Check, X } from 'lucide-react'
import { Button } from '../button/Button'

interface FormActionsProps {
  saving: boolean
  /** ไม่ส่ง = ไม่แสดงปุ่มยกเลิก */
  onCancel?: () => void
}

/** แถวปุ่ม ยกเลิก / บันทึก ท้ายฟอร์ม (ใช้ร่วมกันทุกฟอร์ม) */
export function FormActions({ saving, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      {onCancel && (
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4" />
          ยกเลิก
        </Button>
      )}
      <Button type="submit" disabled={saving}>
        <Check className="h-4 w-4" />
        บันทึก
      </Button>
    </div>
  )
}
