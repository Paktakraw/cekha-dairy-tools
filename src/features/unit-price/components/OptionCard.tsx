import { Trash2 } from 'lucide-react'
import { IconButton, Input, Select } from '../../../shared/components/ui'
import { GROUP_LABELS, NAME_MAX_LENGTH } from '../constants'
import type { OptionInput, OptionValidation } from '../types/unitPrice'
import { UNIT_GROUP_ORDER, UNITS, unitsOfGroup } from '../utils/units'

interface OptionCardProps {
  option: OptionInput
  index: number
  validation: OptionValidation
  canRemove: boolean
  onChange: (patch: Partial<Omit<OptionInput, 'id'>>) => void
  onRemove: () => void
}

export function OptionCard({ option, index, validation, canRemove, onChange, onRemove }: OptionCardProps) {
  const { errors } = validation
  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-4" aria-label={`ตัวเลือกที่ ${index + 1}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">ตัวเลือกที่ {index + 1}</h2>
        {canRemove && <IconButton icon={Trash2} label={`ลบตัวเลือกที่ ${index + 1}`} tone="danger" onClick={onRemove} />}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <Input
            label="ชื่อ (ไม่บังคับ)"
            placeholder="เช่น ยี่ห้อ A"
            maxLength={NAME_MAX_LENGTH}
            value={option.name}
            error={errors.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <Input
          label="ราคา (บาท)"
          inputMode="decimal"
          placeholder="0.00"
          value={option.price}
          error={errors.price}
          onChange={(e) => onChange({ price: e.target.value })}
        />
        <Input
          label="ปริมาณ"
          inputMode="decimal"
          placeholder="0"
          value={option.quantity}
          error={errors.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
        />
        <Select label="หน่วย" value={option.unit} onChange={(e) => onChange({ unit: e.target.value as OptionInput['unit'] })}>
          {UNIT_GROUP_ORDER.map((group) => (
            <optgroup key={group} label={GROUP_LABELS[group]}>
              {unitsOfGroup(group).map((unitId) => (
                <option key={unitId} value={unitId}>
                  {UNITS[unitId].label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </div>
    </section>
  )
}
