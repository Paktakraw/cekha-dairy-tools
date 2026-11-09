import { Check, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '../../../../shared/components/ui'
import { CATEGORY_DESCRIPTION_MAX_LENGTH, CATEGORY_NAME_MAX_LENGTH, DUPLICATE_CATEGORY_MESSAGE, TYPE_LABELS } from '../../constants'
import type { Category, CategoryInput, TransactionType } from '../../types/finance'

interface CategoryFormProps {
  /** ถ้ามี = โหมดแก้ไข (เปลี่ยนประเภทไม่ได้) */
  category?: Category
  /** ประเภทเริ่มต้นตอนเพิ่มใหม่ */
  defaultType?: TransactionType
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (input: CategoryInput) => Promise<string | null>
  onCancel: () => void
}

export function CategoryForm({ category, defaultType = 'expense', onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType)
  const [description, setDescription] = useState(category?.description ?? '')
  const [nameError, setNameError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() === '') {
      setNameError('กรุณากรอกชื่อหมวดหมู่')
      return
    }
    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit({ name, type, description })
    setSaving(false)
    if (error === null) onCancel()
    else if (error === DUPLICATE_CATEGORY_MESSAGE) setNameError(error)
    else setFormError(error)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="ชื่อหมวดหมู่"
        value={name}
        error={nameError}
        hint={`${name.length}/${CATEGORY_NAME_MAX_LENGTH}`}
        maxLength={CATEGORY_NAME_MAX_LENGTH}
        autoFocus
        onChange={(e) => {
          setName(e.target.value)
          setNameError(undefined)
        }}
      />
      <Select
        label={category ? 'ประเภท (เปลี่ยนไม่ได้ เพราะรายการเดิมอ้างอิงประเภทนี้)' : 'ประเภท'}
        value={type}
        disabled={category !== undefined}
        onChange={(e) => setType(e.target.value as TransactionType)}
      >
        <option value="income">{TYPE_LABELS.income}</option>
        <option value="expense">{TYPE_LABELS.expense}</option>
      </Select>
      <Textarea
        label="คำอธิบาย (ไม่บังคับ)"
        value={description}
        hint={`${description.length}/${CATEGORY_DESCRIPTION_MAX_LENGTH}`}
        maxLength={CATEGORY_DESCRIPTION_MAX_LENGTH}
        onChange={(e) => setDescription(e.target.value)}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}
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
