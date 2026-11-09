import { Check, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Input, Select } from '../../../../shared/components/ui'
import { todayISO } from '../../../../shared/utils/formatDate'
import { AMOUNT_MAX, TRANSACTION_DESCRIPTION_MAX_LENGTH, TYPE_LABELS } from '../../constants'
import type { Category, Transaction, TransactionInput, TransactionType } from '../../types/finance'

interface TransactionFormProps {
  categories: Category[]
  /** ถ้ามี = โหมดแก้ไข */
  transaction?: Transaction
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (input: TransactionInput) => Promise<string | null>
  /** แสดงปุ่มยกเลิก (ใช้ใน Modal แก้ไข) และถูกเรียกเมื่อบันทึกสำเร็จ */
  onCancel?: () => void
  /** Reset Form หลังบันทึกสำเร็จ (ใช้ตอนเพิ่มรายการใหม่) */
  resetOnSuccess?: boolean
}

interface FieldErrors {
  date?: string
  category?: string
  amount?: string
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

export function TransactionForm({ categories, transaction, onSubmit, onCancel, resetOnSuccess = false }: TransactionFormProps) {
  const [date, setDate] = useState(transaction?.transaction_date ?? todayISO())
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? '')
  const [amount, setAmount] = useState(transaction ? transaction.amount.toFixed(2) : '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const typeCategories = categories.filter((c) => c.type === type)

  const validate = (): FieldErrors => {
    const result: FieldErrors = {}
    if (date === '') result.date = 'กรุณาเลือกวันที่'
    else if (date > todayISO()) result.date = 'ห้ามเลือกวันที่ในอนาคต'
    if (categoryId === '') result.category = 'กรุณาเลือกหมวดหมู่'
    if (!AMOUNT_PATTERN.test(amount.trim())) result.amount = 'กรอกจำนวนเงินเป็นตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง'
    else if (Number(amount) <= 0) result.amount = 'จำนวนเงินต้องมากกว่า 0'
    else if (Number(amount) > AMOUNT_MAX) result.amount = 'จำนวนเงินมากเกินไป'
    return result
  }

  const resetForm = () => {
    setDate(todayISO())
    setType('expense')
    setCategoryId('')
    setAmount('')
    setDescription('')
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit({
      transaction_date: date,
      type,
      category_id: categoryId,
      amount: amount.trim(),
      description,
    })
    setSaving(false)

    if (error !== null) {
      setFormError(error)
      return
    }
    if (resetOnSuccess) resetForm()
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="วันที่"
          type="date"
          value={date}
          max={todayISO()}
          error={errors.date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select
          label="ประเภท"
          value={type}
          onChange={(e) => {
            setType(e.target.value as TransactionType)
            // หมวดหมู่ต้องตรงกับประเภท จึงล้างค่าเมื่อเปลี่ยนประเภท
            setCategoryId('')
          }}
        >
          <option value="expense">{TYPE_LABELS.expense}</option>
          <option value="income">{TYPE_LABELS.income}</option>
        </Select>
        <Select
          label="หมวดหมู่"
          value={categoryId}
          error={errors.category}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">เลือกหมวดหมู่</option>
          {typeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="จำนวนเงิน (บาท)"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          error={errors.amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Input
        label="รายละเอียด (ไม่บังคับ)"
        value={description}
        hint={`${description.length}/${TRANSACTION_DESCRIPTION_MAX_LENGTH}`}
        maxLength={TRANSACTION_DESCRIPTION_MAX_LENGTH}
        onChange={(e) => setDescription(e.target.value)}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}
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
    </form>
  )
}
