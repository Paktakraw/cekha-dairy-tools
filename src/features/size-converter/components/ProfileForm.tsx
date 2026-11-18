import { useState, type FormEvent } from 'react'
import { FormActions, Input, Select } from '../../../shared/components/ui'
import { DEMOGRAPHIC_LABELS, MEASURE_FIELDS, NAME_MAX_LENGTH } from '../constants'
import type { Demographic, MeasureKey, ProfileFieldErrors, ProfileFormInput, ProfileValues, SizeProfile, UnitPref } from '../types/size'
import { EMPTY_MEASURE_INPUT, measuresToInput, parseMeasures, profileToFormInput, validateProfile } from '../utils/validation'
import { MeasureFields } from './MeasureFields'

interface ProfileFormProps {
  /** ถ้ามี = โหมดแก้ไข */
  profile?: SizeProfile
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (values: ProfileValues) => Promise<string | null>
  onCancel: () => void
}

const ALL_KEYS = MEASURE_FIELDS.map((f) => f.key)

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const [input, setInput] = useState<ProfileFormInput>(() =>
    profile ? profileToFormInput(profile) : { name: '', demographic: 'men', unit: 'cm', measures: { ...EMPTY_MEASURE_INPUT } },
  )
  const [errors, setErrors] = useState<ProfileFieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const changeMeasure = (key: MeasureKey, value: string) => setInput((prev) => ({ ...prev, measures: { ...prev.measures, [key]: value } }))

  // สลับหน่วย: แปลงค่าที่กรอกไว้ให้ตามหน่วยใหม่ (ช่องที่ยังกรอกไม่ถูกต้องคงเดิม)
  const changeUnit = (unit: UnitPref) => {
    setInput((prev) => {
      const parsed = parseMeasures(prev.measures, prev.unit)
      return { ...prev, unit, measures: parsed.values ? measuresToInput(parsed.values, unit) : prev.measures }
    })
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { errors: found, values } = validateProfile(input)
    setErrors(found)
    if (values === null) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit(values)
    setSaving(false)

    if (error === null) onCancel()
    else setFormError(error)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="ชื่อโปรไฟล์"
        value={input.name}
        error={errors.name}
        hint={`${input.name.length}/${NAME_MAX_LENGTH}`}
        maxLength={NAME_MAX_LENGTH}
        autoFocus
        onChange={(e) => setInput((prev) => ({ ...prev, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="ตารางไซส์ที่ใช้"
          value={input.demographic}
          onChange={(e) => setInput((prev) => ({ ...prev, demographic: e.target.value as Demographic }))}
        >
          {(Object.keys(DEMOGRAPHIC_LABELS) as Demographic[]).map((d) => (
            <option key={d} value={d}>
              {DEMOGRAPHIC_LABELS[d]}
            </option>
          ))}
        </Select>
        <Select label="หน่วยที่กรอก" value={input.unit} onChange={(e) => changeUnit(e.target.value as UnitPref)}>
          <option value="cm">เซนติเมตร (cm)</option>
          <option value="inch">นิ้ว (inch)</option>
        </Select>
      </div>
      <MeasureFields keys={ALL_KEYS} unit={input.unit} values={input.measures} errors={errors} onChange={changeMeasure} />
      <p className="text-xs text-gray-500">กรอกเท่าที่ทราบ ช่องที่ว่างจะไม่ถูกนำไปคำนวณ</p>
      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
