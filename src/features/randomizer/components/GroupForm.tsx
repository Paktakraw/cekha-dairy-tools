import { GROUP_NAME_MAX_LENGTH } from '../constants'
import type { RandomGroup } from '../types/random'
import { NameForm } from './NameForm'

interface GroupFormProps {
  /** ถ้ามี = โหมดแก้ไข */
  group?: RandomGroup
  onSubmit: (name: string) => Promise<string | null>
  onCancel: () => void
}

export function GroupForm({ group, onSubmit, onCancel }: GroupFormProps) {
  return (
    <NameForm
      label="ชื่อกลุ่ม"
      initialValue={group?.name}
      maxLength={GROUP_NAME_MAX_LENGTH}
      emptyMessage="กรุณากรอกชื่อกลุ่ม"
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  )
}
