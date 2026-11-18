import { useState } from 'react'
import { Input } from '../../../shared/components/ui'
import { MEASURE_FIELDS } from '../constants'
import type { MeasureErrors, MeasureInput, MeasureKey, UnitPref } from '../types/size'
import { circumferenceFromDiameter, diameterFromCircumference } from '../utils/rings'
import { round1 } from '../utils/units'

interface MeasureFieldsProps {
  keys: MeasureKey[]
  unit: UnitPref
  values: MeasureInput
  errors: MeasureErrors
  onChange: (key: MeasureKey, value: string) => void
}

/** ช่องกรอกสัดส่วน (ใช้ทั้งในฟอร์มโปรไฟล์และโหมดกรอกเองของตัวแปลง) */
export function MeasureFields({ keys, unit, values, errors, onChange }: MeasureFieldsProps) {
  const [diameter, setDiameter] = useState('')
  const [diameterError, setDiameterError] = useState<string>()

  const changeDiameter = (raw: string) => {
    setDiameter(raw)
    const text = raw.trim()
    if (text === '') {
      setDiameterError(undefined)
      return
    }
    const value = Number(text)
    if (!/^\d+(\.\d+)?$/.test(text) || value <= 0) {
      setDiameterError('กรอกเป็นตัวเลขมากกว่า 0')
      return
    }
    setDiameterError(undefined)
    onChange('finger_circumference_mm', String(round1(circumferenceFromDiameter(value))))
  }

  const changeCircumference = (raw: string) => {
    onChange('finger_circumference_mm', raw)
    const value = Number(raw.trim())
    setDiameterError(undefined)
    setDiameter(raw.trim() !== '' && Number.isFinite(value) && value > 0 ? String(round1(diameterFromCircumference(value))) : '')
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {MEASURE_FIELDS.filter((f) => keys.includes(f.key)).map((field) => {
        const unitLabel = field.unit === 'mm' ? 'mm' : unit === 'inch' ? 'นิ้ว' : 'cm'
        const isFinger = field.key === 'finger_circumference_mm'
        return (
          <div key={field.key} className="contents">
            <Input
              label={`${field.label} (${unitLabel})`}
              inputMode="decimal"
              placeholder="ไม่ทราบก็เว้นว่าง"
              value={values[field.key]}
              error={errors[field.key]}
              onChange={(e) => (isFinger ? changeCircumference(e.target.value) : onChange(field.key, e.target.value))}
            />
            {isFinger && (
              <Input
                label="หรือเส้นผ่านศูนย์กลางด้านใน (mm)"
                inputMode="decimal"
                placeholder="เช่น 16.5"
                value={diameter}
                error={diameterError}
                onChange={(e) => changeDiameter(e.target.value)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
