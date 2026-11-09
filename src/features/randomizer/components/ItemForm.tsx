import { ITEM_LABEL_MAX_LENGTH } from '../constants'
import type { RandomItem } from '../types/random'
import { NameForm } from './NameForm'

interface ItemFormProps {
  /** ถ้ามี = โหมดแก้ไข */
  item?: RandomItem
  onSubmit: (label: string) => Promise<string | null>
  onCancel: () => void
}

export function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  return (
    <NameForm
      label="ชื่อรายการ"
      initialValue={item?.label}
      maxLength={ITEM_LABEL_MAX_LENGTH}
      emptyMessage="กรุณากรอกชื่อรายการ"
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  )
}
