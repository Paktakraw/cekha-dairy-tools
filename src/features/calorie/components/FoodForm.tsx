import { useState, type FormEvent } from 'react'
import { FormActions, Input } from '../../../shared/components/ui'
import { DUPLICATE_FOOD_MESSAGE, FOOD_NAME_MAX_LENGTH, FOOD_UNIT_MAX_LENGTH, KCAL_MAX } from '../constants'
import type { Food, FoodInput } from '../types/calorie'

interface FoodFormProps {
  /** ถ้ามี = โหมดแก้ไข */
  food?: Food
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (input: FoodInput) => Promise<string | null>
  onCancel: () => void
}

interface FieldErrors {
  name?: string
  unit?: string
  kcal?: string
}

const KCAL_PATTERN = /^\d+(\.\d)?$/

export function FoodForm({ food, onSubmit, onCancel }: FoodFormProps) {
  const [name, setName] = useState(food?.name ?? '')
  const [unit, setUnit] = useState(food?.serving_unit ?? 'จาน')
  const [kcal, setKcal] = useState(food ? String(food.kcal_per_unit) : '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const validate = (): FieldErrors => {
    const result: FieldErrors = {}
    if (name.trim() === '') result.name = 'กรุณากรอกชื่ออาหาร'
    if (unit.trim() === '') result.unit = 'กรุณากรอกหน่วย เช่น จาน ถ้วย ชิ้น'
    if (!KCAL_PATTERN.test(kcal.trim())) result.kcal = 'กรอกแคลอรี่เป็นตัวเลข ทศนิยมไม่เกิน 1 ตำแหน่ง'
    else if (Number(kcal) > KCAL_MAX) result.kcal = `แคลอรี่ต้องไม่เกิน ${KCAL_MAX.toLocaleString('th-TH')}`
    return result
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit({ name, serving_unit: unit, kcal_per_unit: kcal.trim() })
    setSaving(false)

    if (error === null) onCancel()
    else if (error === DUPLICATE_FOOD_MESSAGE) setErrors({ name: error })
    else setFormError(error)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="ชื่ออาหาร"
        value={name}
        error={errors.name}
        hint={`${name.length}/${FOOD_NAME_MAX_LENGTH}`}
        maxLength={FOOD_NAME_MAX_LENGTH}
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="หน่วย (เช่น จาน ถ้วย ชิ้น)"
          value={unit}
          error={errors.unit}
          hint={`${unit.length}/${FOOD_UNIT_MAX_LENGTH}`}
          maxLength={FOOD_UNIT_MAX_LENGTH}
          onChange={(e) => setUnit(e.target.value)}
        />
        <Input
          label="แคลอรี่ต่อ 1 หน่วย (kcal)"
          inputMode="decimal"
          placeholder="0"
          value={kcal}
          error={errors.kcal}
          onChange={(e) => setKcal(e.target.value)}
        />
      </div>
      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
