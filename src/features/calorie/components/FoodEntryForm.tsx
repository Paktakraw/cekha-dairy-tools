import { useState, type FormEvent } from 'react'
import { FormActions, Input, Select } from '../../../shared/components/ui'
import { todayISO } from '../../../shared/utils/formatDate'
import { ESTIMATE_LABEL, MEAL_LABELS, MEAL_ORDER, QUANTITY_MAX } from '../constants'
import type { Food, FoodEntry, FoodEntryInput, MealType } from '../types/calorie'
import { formatKcal } from '../utils/format'
import { entryCalories } from '../utils/summary'
import { FoodPicker } from './FoodPicker'

interface FoodEntryFormProps {
  /** รายการอาหารให้เลือก (โหมดเพิ่ม) */
  foods: Food[]
  /** ถ้ามี = โหมดแก้ไข (เปลี่ยนอาหารไม่ได้ แก้ได้แค่วันที่/มื้อ/จำนวนหน่วย) */
  entry?: FoodEntry
  /** วันที่เริ่มต้นตอนเพิ่มใหม่ */
  defaultDate: string
  /** food เป็น null ในโหมดแก้ไข; คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (input: FoodEntryInput, food: Food | null) => Promise<string | null>
  /** ถูกเรียกเมื่อกดยกเลิก และเมื่อบันทึกสำเร็จ */
  onCancel: () => void
}

interface FieldErrors {
  food?: string
  date?: string
  quantity?: string
}

const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/

/** มื้อเริ่มต้นตามช่วงเวลาของวัน */
function defaultMeal(): MealType {
  const hour = new Date().getHours()
  if (hour < 10) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 21) return 'dinner'
  return 'snack'
}

export function FoodEntryForm({ foods, entry, defaultDate, onSubmit, onCancel }: FoodEntryFormProps) {
  const [food, setFood] = useState<Food | null>(null)
  const [date, setDate] = useState(entry?.eaten_on ?? defaultDate)
  const [meal, setMeal] = useState<MealType>(entry?.meal ?? defaultMeal())
  const [quantity, setQuantity] = useState(entry ? String(entry.quantity) : '1')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const name = entry?.food_name ?? food?.name
  const unit = entry?.serving_unit ?? food?.serving_unit
  const kcalPerUnit = entry?.kcal_per_unit ?? food?.kcal_per_unit
  const quantityValid = QUANTITY_PATTERN.test(quantity.trim()) && Number(quantity) > 0 && Number(quantity) <= QUANTITY_MAX
  const preview = kcalPerUnit !== undefined && quantityValid ? entryCalories(kcalPerUnit, Number(quantity)) : null

  const validate = (): FieldErrors => {
    const result: FieldErrors = {}
    if (!entry && !food) result.food = 'กรุณาเลือกอาหาร'
    if (date === '') result.date = 'กรุณาเลือกวันที่'
    else if (date > todayISO()) result.date = 'ห้ามเลือกวันที่ในอนาคต'
    if (!QUANTITY_PATTERN.test(quantity.trim())) result.quantity = 'กรอกจำนวนเป็นตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง'
    else if (Number(quantity) <= 0) result.quantity = 'จำนวนต้องมากกว่า 0'
    else if (Number(quantity) > QUANTITY_MAX) result.quantity = `จำนวนต้องไม่เกิน ${QUANTITY_MAX}`
    return result
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit({ eaten_on: date, meal, quantity: quantity.trim() }, entry ? null : food)
    setSaving(false)

    if (error !== null) setFormError(error)
    else onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {entry ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <p className="font-medium break-words text-gray-900">{name}</p>
          <p className="text-xs text-gray-600">
            {formatKcal(entry.kcal_per_unit)} / {entry.serving_unit} (ตามที่บันทึกไว้)
          </p>
        </div>
      ) : (
        <FoodPicker
          foods={foods}
          selectedId={food?.id ?? null}
          error={errors.food}
          onSelect={(picked) => {
            setFood(picked)
            setErrors((prev) => ({ ...prev, food: undefined }))
          }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="วันที่"
          type="date"
          value={date}
          max={todayISO()}
          error={errors.date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select label="มื้อ" value={meal} onChange={(e) => setMeal(e.target.value as MealType)}>
          {MEAL_ORDER.map((m) => (
            <option key={m} value={m}>
              {MEAL_LABELS[m]}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label={unit ? `จำนวน (${unit})` : 'จำนวนหน่วย'}
        inputMode="decimal"
        value={quantity}
        error={errors.quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm" aria-live="polite">
        {preview === null ? (
          <span className="text-gray-500">เลือกอาหารและกรอกจำนวนเพื่อดูแคลอรี่</span>
        ) : (
          <>
            <span className="text-gray-600">แคลอรี่ที่ได้: </span>
            <span className="font-semibold text-gray-900">{formatKcal(preview)}</span>
            {!entry && food?.source === 'seed' && <span className="ml-2 text-xs text-gray-500">({ESTIMATE_LABEL})</span>}
          </>
        )}
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
