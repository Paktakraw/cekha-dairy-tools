import { Calculator } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Input, Select } from '../../../shared/components/ui'
import {
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_ORDER,
  AGE_MAX,
  AGE_MIN,
  HEIGHT_MAX,
  HEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from '../constants'
import type { ActivityLevel, BmrFormInput, BmrResult, BmrValues, CalorieProfile, Sex } from '../types/calorie'
import { calculateBmrResult, validateBmrInput, type BmrFieldErrors } from '../utils/bmr'

interface BmrFormProps {
  /** ค่าที่เคยบันทึกไว้ (ใช้เติมฟอร์ม) */
  profile: CalorieProfile | null
  /** คืนข้อความ error หรือ null เมื่อบันทึกสำเร็จ */
  onSubmit: (values: BmrValues, result: BmrResult) => Promise<string | null>
}

export function BmrForm({ profile, onSubmit }: BmrFormProps) {
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'female')
  const [age, setAge] = useState(profile ? String(profile.age) : '')
  const [weightKg, setWeightKg] = useState(profile ? String(profile.weight_kg) : '')
  const [heightCm, setHeightCm] = useState(profile ? String(profile.height_cm) : '')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activity_level ?? 'sedentary')
  const [errors, setErrors] = useState<BmrFieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input: BmrFormInput = { sex, age, weightKg, heightCm, activityLevel }
    const { errors: found, values } = validateBmrInput(input)
    setErrors(found)
    if (values === null) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit(values, calculateBmrResult(values))
    setSaving(false)
    if (error !== null) setFormError(error)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="เพศ" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
          <option value="female">หญิง</option>
          <option value="male">ชาย</option>
        </Select>
        <Input
          label="อายุ (ปี)"
          inputMode="numeric"
          placeholder={`${AGE_MIN}–${AGE_MAX}`}
          value={age}
          error={errors.age}
          onChange={(e) => setAge(e.target.value)}
        />
        <Input
          label="น้ำหนัก (กก.)"
          inputMode="decimal"
          placeholder={`${WEIGHT_MIN}–${WEIGHT_MAX}`}
          value={weightKg}
          error={errors.weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
        <Input
          label="ส่วนสูง (ซม.)"
          inputMode="decimal"
          placeholder={`${HEIGHT_MIN}–${HEIGHT_MAX}`}
          value={heightCm}
          error={errors.heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
      </div>
      <Select
        label="กิจกรรมประจำวัน"
        value={activityLevel}
        onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
      >
        {ACTIVITY_LEVEL_ORDER.map((level) => (
          <option key={level} value={level}>
            {ACTIVITY_LEVELS[level].label} (× {ACTIVITY_LEVELS[level].multiplier})
          </option>
        ))}
      </Select>
      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Calculator className="h-4 w-4" />
          คำนวณและบันทึก
        </Button>
      </div>
    </form>
  )
}
