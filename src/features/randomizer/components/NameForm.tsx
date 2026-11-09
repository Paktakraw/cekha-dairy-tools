import { Check, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Input } from '../../../shared/components/ui'

interface NameFormProps {
  label: string
  initialValue?: string
  maxLength: number
  emptyMessage: string
  /** คืนข้อความ error (แสดงใต้ช่อง) หรือ null เมื่อสำเร็จ */
  onSubmit: (value: string) => Promise<string | null>
  onCancel: () => void
}

/** Form ช่องเดียว ใช้ร่วมกันระหว่างชื่อกลุ่ม (GroupForm) และ label ของรายการ (ItemForm) */
export function NameForm({ label, initialValue = '', maxLength, emptyMessage, onSubmit, onCancel }: NameFormProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (value.trim() === '') {
      setError(emptyMessage)
      return
    }
    setSaving(true)
    const result = await onSubmit(value)
    setSaving(false)
    if (result === null) onCancel()
    else setError(result)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={label}
        value={value}
        error={error}
        hint={`${value.length}/${maxLength}`}
        maxLength={maxLength}
        autoFocus
        onChange={(e) => {
          setValue(e.target.value)
          setError(undefined)
        }}
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4" />
          ยกเลิก
        </Button>
        <Button type="submit" disabled={saving}>
          <Check className="h-4 w-4" />
          บันทึก
        </Button>
      </div>
    </form>
  )
}
