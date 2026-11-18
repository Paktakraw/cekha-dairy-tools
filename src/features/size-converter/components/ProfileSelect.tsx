import { Select } from '../../../shared/components/ui'
import type { SizeProfile } from '../types/size'

interface ProfileSelectProps {
  profiles: SizeProfile[]
  value: string
  onChange: (value: string) => void
  /** เพิ่มตัวเลือก "กรอกเอง (ไม่บันทึก)" */
  allowManual?: boolean
}

export const MANUAL_VALUE = 'manual'

export function ProfileSelect({ profiles, value, onChange, allowManual = false }: ProfileSelectProps) {
  return (
    <Select label="โปรไฟล์" value={value} onChange={(e) => onChange(e.target.value)}>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
      {allowManual && <option value={MANUAL_VALUE}>กรอกเอง (ไม่บันทึก)</option>}
    </Select>
  )
}
